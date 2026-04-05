from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import db
from app.core.security import decode_token
from app.models.prediction import (
    PredictionRequest
)
from app.services.predict import run_prediction
from app.services.chat import generate_narrative, chat_with_context

router = APIRouter(prefix="/api", tags=["UCRIS"])
bearer = HTTPBearer()


# ── Auth dependency (validates JWT issued by Next.js auth) ────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer)
):
    token   = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await db.user.find_unique(where={"id": payload["sub"]})
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user


# ── POST /api/predict ─────────────────────────────────────────────────────────

@router.post("/predict", status_code=201)
async def predict(
    body: PredictionRequest,
    request: Request,
    current_user=Depends(get_current_user)
):
    """
    Full UCRIS ML pipeline:
    RF + XGBoost + Hybrid joint model + SHAP + Gemini narrative
    """
    try:
        customer = await db.customer.find_unique(
            where={"id": body.customer_id},
            include={"features": True}
        )
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        if not customer.features:
            raise HTTPException(status_code=400, detail="Customer features not computed")

        customer_data = {
            "limit_bal":          customer.limit_bal,
            "sex":                customer.sex,
            "education":          customer.education,
            "marriage":           customer.marriage,
            "age":                customer.age,
            "avg_utilization":    customer.features.avg_utilization,
            "util_change":        customer.features.util_change,
            "pay_delay_trend":    customer.features.pay_delay_trend,
            "avg_pay_delay":      customer.features.avg_pay_delay,
            "consecutive_delays": customer.features.consecutive_delays,
            "avg_repay_ratio":    customer.features.avg_repay_ratio,
            "spending_volatility": customer.features.spending_volatility,
            "pay_amt_trend":      customer.features.pay_amt_trend,
        }

        result = run_prediction(customer_data)

        try:
            narrative = await generate_narrative(
                result, {"customer_ref": customer.customer_ref}
            )
        except Exception:
            narrative = (
                f"Customer shows {result['stress_label']} stress. "
                f"Recommended action: {result['recommended_action']}."
            )

        from app.generated.prisma import Json
        prediction = await db.prediction.create(data={
            "customer":           {"connect": {"id": body.customer_id}},
            "requester":          {"connect": {"id": current_user.id}},
            "stress_level":       result["stress_level"],
            "stress_label":       result["stress_label"],
            "stress_prob_low":    result["stress_prob_low"],
            "stress_prob_med":    result["stress_prob_med"],
            "stress_prob_high":   result["stress_prob_high"],
            "escalation_flag":    result["escalation_flag"],
            "escalation_prob":    result["escalation_prob"],
            "recommended_action": result["recommended_action"],
            "confidence":         result["confidence"],
            "shap_factors":       Json(result["shap_factors"]),
            "gemini_narrative":   narrative,
            "model_version":      result["model_version"],
        })

        await db.auditlog.create(data={
            "user_id":       current_user.id,
            "action":        "RUN_PREDICTION",
            "resource_id":   prediction.id,
            "resource_type": "prediction",
            "ip_address":    request.client.host if request.client else None,
        })

        return prediction
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_msg = f"Inference Error: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)


# ── GET /api/predictions/{customer_id} ───────────────────────────────────────

@router.get("/predictions/{customer_id}")
async def get_customer_predictions(
    customer_id: str,
    limit: int = 10,
    current_user=Depends(get_current_user)
):
    """Prediction history for a customer — called by Next.js dashboard."""
    predictions = await db.prediction.find_many(
        where={"customer_id": customer_id},
        order={"predicted_at": "desc"},
        take=limit
    )
    return predictions


# ── GET /api/analytics ────────────────────────────────────────────────────────

@router.get("/analytics")
async def get_analytics(current_user=Depends(get_current_user)):
    """Portfolio analytics for the dashboard overview page."""
    total       = await db.prediction.count()
    high        = await db.prediction.count(where={"stress_label":       "High"})
    medium      = await db.prediction.count(where={"stress_label":       "Medium"})
    low         = await db.prediction.count(where={"stress_label":       "Low"})
    escalating  = await db.prediction.count(where={"escalation_flag":    1})
    restructure = await db.prediction.count(where={"recommended_action": "Restructure"})
    alert       = await db.prediction.count(where={"recommended_action": "Alert"})
    monitor     = await db.prediction.count(where={"recommended_action": "Monitor"})
    customers   = await db.customer.count()

    return {
        "total_customers":   customers,
        "total_predictions": total,
        "stress_distribution": {
            "High":   high,
            "Medium": medium,
            "Low":    low,
        },
        "escalation": {
            "escalating": escalating,
            "stable":     total - escalating,
            "rate":       round(escalating / total * 100, 1) if total else 0,
        },
        "recommendations": {
            "Restructure": restructure,
            "Alert":       alert,
            "Monitor":     monitor,
        }
    }


# ── GET /api/rate-limit ───────────────────────────────────────────────────────

@router.get("/rate-limit", tags=["Monitoring"])
async def get_rate_limit_status(current_user=Depends(get_current_user)):
    """Check current Gemini API usage vs limits."""
    from app.core.rate_limiter import gemini_limiter
    return gemini_limiter.status
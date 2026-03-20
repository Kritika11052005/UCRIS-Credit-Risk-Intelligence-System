"""
UCRIS — Recommendation Engine
================================
Maps stress level + escalation prediction to
a concrete preventive action recommendation.

The recommendation is linked to SHAP explanations
so credit officers receive both the action and
the reasoning behind it.

Usage:
    from src.recommendation import (
        get_recommendation,
        generate_customer_profile
    )
"""


# ── Action definitions ────────────────────────────────
ACTIONS = {
    'MONITOR'     : {
        'label'      : 'Monitor',
        'description': 'Continue standard observation. '
                       'Flag for next review cycle.',
        'urgency'    : 'Low',
        'color'      : 'green'
    },
    'ALERT'       : {
        'label'      : 'Alert',
        'description': 'Trigger proactive outreach. '
                       'Schedule relationship manager call.',
        'urgency'    : 'Medium',
        'color'      : 'orange'
    },
    'RESTRUCTURE' : {
        'label'      : 'Restructure',
        'description': 'Formal intervention required. '
                       'Offer loan restructuring or '
                       'hardship program enrollment.',
        'urgency'    : 'High',
        'color'      : 'red'
    }
}

STRESS_MAP = {0: 'Low', 1: 'Medium', 2: 'High'}
ESC_MAP    = {0: 'Stable', 1: 'Escalating'}


def get_recommendation(
    stress_level: int,
    escalation_flag: int,
    escalation_prob: float
) -> dict:
    """
    Determine recommended action based on risk signals.

    Decision matrix:
    ┌─────────┬──────────────┬─────────────┐
    │ Stress  │ Escalation   │ Action      │
    ├─────────┼──────────────┼─────────────┤
    │ Low     │ Stable       │ Monitor     │
    │ Low     │ Escalating   │ Alert       │
    │ Medium  │ Stable       │ Alert       │
    │ Medium  │ Escalating   │ Alert       │
    │ High    │ Stable       │ Alert       │
    │ High    │ Escalating   │ Restructure │
    └─────────┴──────────────┴─────────────┘

    Parameters
    ----------
    stress_level    : int   — 0 (Low), 1 (Medium), 2 (High)
    escalation_flag : int   — 0 (Stable), 1 (Escalating)
    escalation_prob : float — escalation probability (0-1)

    Returns
    -------
    dict : action details including label, description,
           urgency, and confidence
    """
    # Determine action
    if stress_level == 2 and escalation_flag == 1:
        action_key = 'RESTRUCTURE'
    elif stress_level == 0 and escalation_flag == 0:
        action_key = 'MONITOR'
    else:
        action_key = 'ALERT'

    action = ACTIONS[action_key].copy()
    action['action_key']      = action_key
    action['stress_level']    = STRESS_MAP[stress_level]
    action['escalation']      = ESC_MAP[escalation_flag]
    action['escalation_prob'] = round(
        float(escalation_prob), 4
    )
    action['confidence'] = _get_confidence(
        stress_level, escalation_flag, escalation_prob
    )

    return action


def _get_confidence(
    stress_level: int,
    escalation_flag: int,
    escalation_prob: float
) -> str:
    """
    Compute confidence level of recommendation.

    High confidence: strong signals on both tasks
    Medium confidence: mixed signals
    Low confidence: borderline cases
    """
    if stress_level == 2 and escalation_prob > 0.85:
        return 'High'
    elif stress_level == 0 and escalation_prob < 0.15:
        return 'High'
    elif stress_level == 1 or (
        0.35 < escalation_prob < 0.65
    ):
        return 'Medium'
    else:
        return 'High'


def generate_customer_profile(
    customer_id,
    stress_level: int,
    stress_probs: list,
    escalation_flag: int,
    escalation_prob: float,
    top_shap_features: list = None
) -> dict:
    """
    Generate the complete 4-part customer risk profile.

    This is the final output of the UCRIS system for
    each customer processed.

    Parameters
    ----------
    customer_id        : any — customer identifier
    stress_level       : int — 0/1/2
    stress_probs       : list — [p_low, p_med, p_high]
    escalation_flag    : int — 0/1
    escalation_prob    : float — escalation probability
    top_shap_features  : list — top contributing features
                         e.g. [('avg_utilization', 0.34),
                               ('consecutive_delays', 0.27)]

    Returns
    -------
    dict : complete customer risk profile with 4 parts:
           stress_level, risk_prediction,
           recommended_action, explanation
    """
    recommendation = get_recommendation(
        stress_level, escalation_flag, escalation_prob
    )

    profile = {
        # Part 1: Stress level
        'stress_level'      : {
            'label'       : STRESS_MAP[stress_level],
            'code'        : stress_level,
            'probabilities': {
                'Low'    : round(float(stress_probs[0]), 4),
                'Medium' : round(float(stress_probs[1]), 4),
                'High'   : round(float(stress_probs[2]), 4)
            }
        },
        # Part 2: Risk prediction
        'risk_prediction'   : {
            'escalating'  : bool(escalation_flag),
            'label'       : ESC_MAP[escalation_flag],
            'probability' : round(float(escalation_prob), 4)
        },
        # Part 3: Recommended action
        'recommended_action': recommendation,
        # Part 4: Explanation
        'explanation'       : {
            'top_factors' : top_shap_features or [],
            'summary'     : _build_explanation_summary(
                stress_level,
                escalation_flag,
                top_shap_features
            )
        },
        'customer_id'       : customer_id
    }

    return profile


def _build_explanation_summary(
    stress_level: int,
    escalation_flag: int,
    top_features: list = None
) -> str:
    """Build a human-readable explanation string."""
    stress_str = STRESS_MAP[stress_level].lower()
    esc_str    = 'escalating' if escalation_flag == 1 \
                 else 'stable'

    summary = (
        f"Customer classified as {stress_str} stress "
        f"with {esc_str} risk trajectory."
    )

    if top_features:
        feat_str = ', '.join([
            f"{f[0]} ({f[1]:+.3f})"
            for f in top_features[:3]
        ])
        summary += f" Key drivers: {feat_str}."

    return summary


def print_profile(profile: dict) -> None:
    """Pretty print a customer risk profile."""
    cid    = profile['customer_id']
    stress = profile['stress_level']
    risk   = profile['risk_prediction']
    action = profile['recommended_action']
    expl   = profile['explanation']

    print(f"""
╔══════════════════════════════════════════════════╗
║  CUSTOMER RISK PROFILE — ID: {cid}
╠══════════════════════════════════════════════════╣
║  STRESS LEVEL   : {stress['label']}
║  Probabilities  : Low={stress['probabilities']['Low']:.3f}
║                   Medium={stress['probabilities']['Medium']:.3f}
║                   High={stress['probabilities']['High']:.3f}
╠══════════════════════════════════════════════════╣
║  RISK ESCALATING: {risk['label']}
║  Probability    : {risk['probability']:.4f}
╠══════════════════════════════════════════════════╣
║  RECOMMENDED    : {action['label']}
║  Urgency        : {action['urgency']}
║  Confidence     : {action['confidence']}
║  Action         : {action['description']}
╠══════════════════════════════════════════════════╣
║  EXPLANATION
║  {expl['summary']}
╚══════════════════════════════════════════════════╝
""")
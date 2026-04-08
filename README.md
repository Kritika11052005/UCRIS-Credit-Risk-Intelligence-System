# 🔥 UCRIS — Unified Customer Risk Intelligence System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.8-EE4C2C?style=for-the-badge&logo=pytorch)](https://pytorch.org/)
[![PostgreSQL](https://img.shields.io/badge/NeonDB-PostgreSQL-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Hugging Face](https://img.shields.io/badge/HuggingFace-Model%20Server-FFD21E?style=for-the-badge&logo=huggingface)](https://huggingface.co/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> Post-loan behavioral credit risk monitoring that detects financial stress and predicts risk escalation **before default occurs** — using a patent-pending Hybrid Tree-Neural Stacking Architecture with Explainable AI.

![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![Combined Score](https://img.shields.io/badge/Combined%20Score-0.9920-brightgreen?style=for-the-badge)
![Recall](https://img.shields.io/badge/Task%20B%20Recall-0.9989-brightgreen?style=for-the-badge)

---

## 🌐 Live Deployment

| Service | URL |
|---|---|
| 🖥️ Frontend (Next.js) | [ucris-credit-risk-intelligence-syst.vercel.app](https://ucris-credit-risk-intelligence-syst.vercel.app/) |
| ⚡ Backend (FastAPI) | [ucris-credit-risk-intelligence-system.onrender.com](https://ucris-credit-risk-intelligence-system.onrender.com) |
| 🤗 Model Server (Hugging Face) | [kritzzz11-ucris-model-server.hf.space/predict](https://kritzzz11-ucris-model-server.hf.space/predict) |

---

## 📑 Table of Contents

- [Overview](#-overview)
- [What Makes UCRIS Different](#-what-makes-ucris-different)
- [System Architecture](#-system-architecture)
- [The ML Pipeline](#-the-ml-pipeline)
- [Model Performance](#-model-performance)
- [API Endpoints](#-api-endpoints)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Research & Patent](#-research--patent)
- [Contributing](#-contributing)
- [License](#-license)
- [Team](#-team)

---

## 🎯 Overview

**UCRIS** (Unified Customer Risk Intelligence System) is a research-grade machine learning platform for post-loan behavioral monitoring of credit card customers. Traditional credit risk systems evaluate customers **once** at loan approval and go silent — only reacting after a default event has already occurred.

UCRIS flips this model entirely. It continuously monitors 6 months of customer payment behavior, simultaneously detecting:

- **Task A — Financial Stress Level**: Low / Medium / High classification based on utilization patterns and payment delays
- **Task B — Risk Escalation**: Whether the customer's risk trajectory is Stable or Escalating

The core contribution is a **Hybrid Tree-Neural Stacking Architecture** — Random Forest and XGBoost serve as Stage-1 encoders whose probability outputs feed a shared neural encoder that jointly refines both predictions in a single inference pass. SHAP-based cross-task explainability and Gemini 2.5 Flash narrative generation complete the system into a full four-part customer risk profile.

### The Problem We Solve

By the time a customer misses a payment, the probability of full recovery has already diminished substantially. UCRIS catches the behavioral drift **before the first missed payment** — giving financial institutions time to intervene with restructuring conversations, alerts, or monitoring — before the damage is done.

---

## ✨ What Makes UCRIS Different

### 1. Post-Loan Behavioral Monitoring
Every published credit risk system scores customers at loan origination. UCRIS monitors behavior **continuously after disbursement** — the first ML system to formally address this gap at the individual customer level.

### 2. Dual-Task Simultaneous Prediction
Not one question but two genuinely different questions solved jointly in a single forward pass:
- *"How stressed is this customer right now?"* (stress level)
- *"Is their situation getting worse?"* (escalation trajectory)

### 3. Hybrid Tree-Neural Stacking Architecture
Tree model probability outputs become inputs to a shared neural encoder. The encoder develops cross-task behavioral representations that neither Random Forest nor XGBoost can capture independently — proven empirically through bidirectional SHAP cross-task analysis.

### 4. Explainable AI with LLM Narratives
SHAP feature attribution identifies the top behavioral drivers. Gemini 2.5 Flash converts SHAP values into plain-English narratives a credit officer can act on immediately — no ML knowledge required.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                     │
│   Landing · Auth · Dashboard · Analytics · RAG Chatbot      │
│   next-auth · Prisma SSR · Framer Motion · GSAP · Three.js  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
┌─────────────────┐       ┌─────────────────────────────────┐
│  NeonDB          │       │     FastAPI Backend (Render)     │
│  (PostgreSQL)    │       │                                 │
│                 │       │  POST /api/predict               │
│  Auth (SSR)     │◄──────│  POST /api/chat (RAG + Gemini)   │
│  Customers      │       │  GET  /api/analytics             │
│  Predictions    │       │  GET  /api/predictions/{id}      │
│  Audit Logs     │       │                                  │
└─────────────────┘       └──────────────┬──────────────────┘
                                          │
                                          ▼
                          ┌───────────────────────────────┐
                          │  Hugging Face Model Server     │
                          │  (Docker Container)            │
                          │                               │
                          │  Random Forest (Task A)        │
                          │  XGBoost (Task B)              │
                          │  Hybrid Joint Neural Model     │
                          │  SHAP Explainer               │
                          └───────────────────────────────┘
```

### Inference Flow

```
Customer Data (6 months behavioral history)
           ↓
  Feature Engineering (15 behavioral velocity features)
           ↓
  ┌────────────────────────────────────┐
  │  Stage 1: Tree Models              │
  │  Random Forest → 3 stress probs    │
  │  XGBoost      → 1 escalation prob  │
  └────────────────┬───────────────────┘
                   ↓
  19-dim Hybrid Input (15 raw + 3 RF + 1 XGB)
                   ↓
  ┌────────────────────────────────────┐
  │  Stage 2: Shared Neural Encoder    │
  │  [128 → 64 → 32] + BN + ReLU      │
  │  Head A → Stress (3-class)         │
  │  Head B → Escalation (binary)      │
  └────────────────┬───────────────────┘
                   ↓
  SHAP Explainer → Top 3 behavioral drivers
                   ↓
  Gemini 2.5 Flash → Natural language narrative
                   ↓
  Recommendation Engine → Monitor / Alert / Restructure
                   ↓
  Four-Part Customer Risk Profile
```

---

## 🧠 The ML Pipeline

### Behavioral Velocity Features (15 dimensions)

Raw monthly bank statements are transformed into directional behavioral signals:

| Feature | What It Captures |
|---|---|
| `avg_utilization` | Mean credit utilization over 6 months |
| `util_change` | Utilization trend (recent vs early months) |
| `pay_delay_trend` | OLS slope of payment delays over time |
| `avg_pay_delay` | Average months of payment delay |
| `consecutive_delays` | Count of months with any delay |
| `avg_repay_ratio` | Mean (payment / bill amount) ratio |
| `spending_volatility` | log(1 + σ(bill amounts)) |
| `pay_amt_trend` | Signed log slope of payment amounts |
| `LIMIT_BAL` | Credit limit (raw) |
| + 6 encoded categoricals | SEX, EDUCATION, MARRIAGE |

### The Five Models

| Model | Task | Metric | Score | Role |
|---|---|---|---|---|
| Logistic Regression | A | Weighted F1 | 0.8677 | Baseline — proves non-linear structure |
| Random Forest | A | Weighted F1 | 0.9852 | Stage-1 stress encoder |
| XGBoost | B | Recall | 0.9944 | Stage-1 escalation encoder |
| Separate RF + XGB | A + B | Combined | 0.9907 | Ablation target |
| **UCRIS Hybrid Joint** | **A + B** | **Combined** | **0.9920** | **Core novel architecture** |

### Combined Loss Function

```
L = 0.45 × CrossEntropy(stress, weights=[0.653, 1.287, 1.448])
  + 0.55 × BCEWithLogits(escalation, pos_weight=1.874)
```

Higher weight on Task B ensures the system prioritizes recall — missing an escalating customer is worse than a false alarm.

---

## 📊 Model Performance

### Final Results

```
╔══════════════════════════════════════════════════════╗
║       UCRIS HYBRID JOINT MODEL — FINAL RESULTS       ║
╠══════════════════════════════════════════════════════╣
║  Task A Weighted F1  : 0.9852  (RF baseline: 0.9852) ║
║  Task B Recall       : 0.9989  (XGB baseline: 0.9944)║
║  Combined Score      : 0.9920  (Ablation: 0.9907)    ║
╠══════════════════════════════════════════════════════╣
║  Missed escalations  : 3 out of 2,705 (0.11%)        ║
║  Total test errors   : 89 out of 6,000               ║
║  AUC-ROC (Task B)    : 0.9996                        ║
╠══════════════════════════════════════════════════════╣
║  Parameters          : 4,676 (lightweight)           ║
║  Training epochs     : 44 (early stopped)            ║
║  Dataset             : 30,000 customers (UCI)        ║
╚══════════════════════════════════════════════════════╝
```

### SHAP Cross-Task Finding

The most significant explainability result: `XGB_esc_prob` ranks 7th in the stress SHAP importance chart despite being an escalation-task feature. Simultaneously, `RF_prob_low` and `RF_prob_medium` appear in the escalation SHAP chart. This bidirectional cross-task information flow proves genuine joint representation learning — not two parallel independent predictors running side by side.

---

## 🔌 API Endpoints

### FastAPI Backend (`/api`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/predict` | Full UCRIS ML pipeline — RF + XGB + Hybrid + SHAP + Gemini |
| `GET` | `/api/predictions/{customer_id}` | Prediction history for a customer |
| `GET` | `/api/analytics` | Portfolio-level risk analytics |
| `POST` | `/api/chat` | RAG chatbot — LangChain + Gemini 2.5 Flash |
| `GET` | `/api/rate-limit` | Current Gemini API usage vs limits |
| `GET` | `/health` | Health check |

### Hugging Face Model Server

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/predict` | Direct model inference endpoint |

#### Sample Prediction Request

```json
POST /api/predict
Authorization: Bearer <jwt_token>

{
  "customer_id": "uuid-here"
}
```

#### Sample Prediction Response

```json
{
  "id": "prediction-uuid",
  "stress_level": 2,
  "stress_label": "High",
  "stress_prob_low": 0.02,
  "stress_prob_med": 0.08,
  "stress_prob_high": 0.90,
  "escalation_flag": 1,
  "escalation_prob": 0.94,
  "recommended_action": "Restructure",
  "confidence": "High",
  "shap_factors": [
    { "feature": "avg_utilization", "value": 0.87, "shap_value": 0.340 },
    { "feature": "consecutive_delays", "value": 4, "shap_value": 0.270 },
    { "feature": "pay_delay_trend", "value": 1.2, "shap_value": 0.190 }
  ],
  "gemini_narrative": "This customer has been using 87% of their credit limit for the past 6 months, with payment delays in 4 consecutive months and a sharply rising delay trend. The combination of near-maxed utilization and worsening payment behavior indicates significant financial pressure. Immediate restructuring conversation is recommended.",
  "model_version": "hybrid_joint_v1.0"
}
```

#### Sample Chat Request

```json
POST /api/chat
Authorization: Bearer <jwt_token>

{
  "message": "Why is customer C-001 flagged as High stress?",
  "customer_id": "uuid-here"
}
```

---

## 🛠 Tech Stack

### ML Pipeline

| Library | Version | Purpose |
|---|---|---|
| Python | 3.11 | Core language |
| PyTorch | 2.8.0 | Hybrid joint neural network |
| scikit-learn | 1.5.2 | Random Forest, StandardScaler, metrics |
| XGBoost | 2.1.1 | Escalation prediction model |
| SHAP | 0.46.0 | Feature attribution and cross-task analysis |
| pandas | 2.2.3 | Data processing and feature engineering |
| numpy | 1.26.4 | Numerical operations |
| joblib | 1.4.2 | Model serialization |

### Backend

| Library | Version | Purpose |
|---|---|---|
| FastAPI | 0.115.0 | Web framework — 4 core endpoints |
| Prisma (Python) | 0.13.1 | ORM for NeonDB |
| python-jose | 3.3.0 | JWT authentication |
| passlib + bcrypt | 1.7.4 | Password hashing |
| LangChain | 0.3.7 | RAG pipeline orchestration |
| langchain-google-genai | 4.2.1 | Gemini 2.5 Flash integration |
| pydantic-settings | 2.5.2 | Environment variable management |
| uvicorn | 0.30.6 | ASGI server |

### Frontend

| Library | Version | Purpose |
|---|---|---|
| Next.js | 15 | App Router, SSR, Server Actions |
| React | 19 | UI framework |
| TypeScript | 5.0 | Type safety |
| Tailwind CSS | v4 | Styling |
| shadcn/ui | latest | UI component library |
| GSAP 3 + ScrollTrigger | 3.x | Scroll animations |
| Three.js | r128 | 3D auth page background |
| Framer Motion | latest | Page transitions |
| next-auth | v5 | JWT authentication |

### Infrastructure

| Service | Purpose |
|---|---|
| NeonDB (PostgreSQL) | Primary database — serverless, auto-scaling |
| Render | FastAPI backend hosting |
| Vercel | Next.js frontend hosting |
| Hugging Face Spaces | ML model serving (Docker container) |

---

## 🗄 Database Schema

Seven tables in NeonDB (PostgreSQL), managed with Prisma:

```
users              — Credit officers and admins
refresh_tokens     — JWT refresh token management
customers          — Customer records
customer_features  — 15 computed behavioral velocity features
predictions        — Full prediction history with SHAP and narratives
model_registry     — Trained model versions and metrics
audit_logs         — Regulatory compliance logging
```

All auth and CRUD operations run as Next.js Server Actions directly to NeonDB — no extra FastAPI network hop. FastAPI handles only the heavy ML compute: prediction and RAG chat.

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm
- Git
- NeonDB account
- Gemini API key

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/Kritika11052005/UCRIS-Credit-Risk-Intelligence-System.git
cd "Unified Cutomer risk prediction System/backend"

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Generate Prisma client
python -m prisma generate

# Push schema to NeonDB
npx prisma db push --schema=prisma/schema.prisma

# Run the server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Hugging Face Model Server

The model server is deployed as a Docker container on Hugging Face Spaces. The `hf_deploy/` folder contains:
- `Dockerfile` — container definition
- `main.py` — model serving script
- `requirements.txt` — HF-specific dependencies

---

## 📁 Project Structure

```
Unified Customer Risk Prediction System/
│
├── 📂 backend/                    # FastAPI Backend Service
│   ├── 📂 app/
│   │   ├── 📂 core/
│   │   │   ├── config.py          # Environment variables
│   │   │   ├── security.py        # JWT auth
│   │   │   └── rate_limiter.py    # Gemini API rate limiting
│   │   ├── 📂 models/
│   │   │   └── prediction.py      # Pydantic schemas
│   │   ├── 📂 routes/
│   │   │   └── predictions.py     # All 4 API endpoints
│   │   ├── 📂 services/
│   │   │   ├── predict.py         # Full ML inference pipeline
│   │   │   └── chat.py            # LangChain RAG + Gemini
│   │   ├── database.py            # Prisma connection
│   │   └── main.py                # FastAPI entry point
│   ├── 📂 prisma/
│   │   └── schema.prisma          # 7-table database schema
│   ├── 📂 models/                 # Saved ML model files
│   │   ├── random_forest/
│   │   ├── xgboost/
│   │   ├── hybrid_joint/
│   │   └── separate_rf_xgboost/
│   ├── .env                       # Environment configuration
│   ├── requirements.txt           # Python dependencies
│   └── generate_test_token.py     # Dev utility
│
├── 📂 frontend/                   # Next.js Frontend
│   ├── 📂 src/
│   │   ├── 📂 app/
│   │   │   ├── 📂 (landing)/      # Landing page
│   │   │   ├── 📂 auth/           # Login & Register
│   │   │   └── 📂 dashboard/      # Dashboard, Analytics, Chat
│   │   ├── 📂 components/         # UI components
│   │   └── 📂 lib/                # Utils, API clients, Prisma
│   ├── 📂 prisma/                 # Same schema as backend
│   ├── package.json
│   └── tsconfig.json
│
├── 📂 hf_deploy/                  # Hugging Face Spaces deployment
│   ├── Dockerfile
│   ├── main.py                    # Model serving script
│   └── requirements.txt
│
├── 📂 notebooks/                  # ML Research notebooks
│   ├── logistic_regression.ipynb
│   ├── random_forest.ipynb
│   ├── xgboost.ipynb
│   ├── separate_rf_xgboost.ipynb
│   └── multitask_joint_model.ipynb
│
├── credit_default.csv             # UCI dataset
└── example_customers.csv          # Test samples
```

---

## 🔐 Environment Variables

### Backend `.env`

```env
# Database
DATABASE_URL=postgresql://user:pass@host/neondb?sslmode=require

# JWT Auth
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# App
DEBUG=False
ALLOWED_ORIGINS=["https://your-frontend.vercel.app"]
MODELS_DIR=./models
```

### Frontend `.env.local`

```env
DATABASE_URL=postgresql://user:pass@host/neondb?sslmode=require
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-app.vercel.app
FASTAPI_URL=https://your-backend.onrender.com
```

### Required API Keys

| Key | Where to Get |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/) |
| `DATABASE_URL` | [Neon Console](https://console.neon.tech/) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |

### Gemini Rate Limits Applied

UCRIS applies a sliding window rate limiter on all Gemini API calls:
- **8 requests per minute** (free tier: 10 RPM)
- **400 requests per day** (free tier: 500 RPD)

---

## 📖 Research & Patent

### Research Paper

| Property | Detail |
|---|---|
| Title | UCRIS: A Hybrid Tree-Neural Stacking Architecture for Simultaneous Post-Loan Credit Stress Detection and Risk Escalation Prediction with Explainable AI |
| Authors | Kritika Benjwal, Gauri Sharma |
| Guide | Dr. Gireesh Kumar Kaushik, Associate Professor, Dept. of CSE, MUJ |
| Format | IEEE Two-Column Conference Format |
| Status | Submitted |
| Target Venues | Expert Systems with Applications · IEEE TNNLS · ECML-PKDD |

### Novel Contributions

1. **Dual-task post-loan monitoring formulation** — first formal framing of simultaneous stress classification and escalation prediction for post-loan behavioral monitoring
2. **Behavioral velocity feature set** — 15 temporal features capturing direction and rate of change in payment behavior
3. **Hybrid Tree-Neural Stacking Architecture** — shared neural encoder over tree probability outputs with joint training
4. **Cross-task SHAP analysis** — bidirectional feature importance flow as empirical proof of joint representation learning

### Provisional Patent

A provisional patent application has been filed with the Indian Patent Office (IPO) under Section 9 of the Patents Act, 1970, covering the Hybrid Tree-Neural Stacking Architecture method for simultaneous dual-task credit risk monitoring.

---

## 🤝 Contributing

We welcome contributions. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

### Development Commands

```bash
# Backend
uvicorn app.main:app --reload       # Run dev server
python generate_test_token.py       # Generate test JWT

# Frontend
npm run dev                         # Run dev server
npm run build                       # Production build
npm run lint                        # Run ESLint

# Database
npx prisma db push --schema=prisma/schema.prisma    # Push schema
python -m prisma generate                            # Regenerate client
```

### Coding Standards

- Follow PEP 8 for Python
- Follow TypeScript strict mode
- Write meaningful commit messages
- Never commit `.env` files
- Always use `venv\Scripts\activate` before running Python

---

## 🔮 Future Enhancements

- [ ] OOF (Out-of-Fold) stacking for scientifically rigorous hybrid input construction
- [ ] Cross-dataset validation on German Credit and Give Me Some Credit datasets
- [ ] Complete Next.js frontend with Carbon Risk theme
- [ ] Live Indian banking data integration
- [ ] LSTM or Transformer encoder replacing the MLP encoder
- [ ] Macroeconomic context features in label engineering
- [ ] Multiple random seed experiments with confidence intervals
- [ ] PCT international patent filing
- [ ] Mobile app version
- [ ] Real-time customer behavioral drift alerts

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License
Copyright (c) 2025 Kritika Benjwal & Gauri Sharma
```

---

## 👥 Team

<div align="center">

### Made with ❤️ by Kritika Benjwal & Gauri Sharma

*B.Tech CSE · Manipal University Jaipur · Batch 2023–2027*

</div>

<table align="center">
  <tr>
    <td align="center">
      <img src="https://github.com/Kritika11052005.png" width="150px" alt="Kritika Benjwal"/>
      <br />
      <sub><b>Kritika Benjwal</b></sub>
      <br />
      <sub>23FE10CSE00516</sub>
      <br /><br />
      <a href="https://github.com/Kritika11052005">
        <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
      </a>
      <br />
      <a href="mailto:ananya.benjwal@gmail.com">
        <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/>
      </a>
      <br />
      <a href="https://www.linkedin.com/in/kritika-benjwal/">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
      </a>
    </td>
    <td align="center">
      <img src="https://github.com/gauri-sharma9.png" width="150px" alt="Gauri Sharma"/>
      <br />
      <sub><b>Gauri Sharma</b></sub>
      <br />
      <sub>23FE10CSE00717</sub>
      <br /><br />
      <a href="https://github.com/gauri-sharma9">
        <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
      </a>
      <br />
      <a href="mailto:gaurisharma9104@gmail.com">
        <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/>
      </a>
      <br />
      <a href="https://www.linkedin.com/in/gauri-sharma-7a48a6332/">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
      </a>
    </td>
  </tr>
</table>

---

## 🙏 Acknowledgments

- **Dr. Gireesh Kumar Kaushik** — Research guide, Department of CSE, Manipal University Jaipur
- **UCI Machine Learning Repository** — Credit Card Default dataset
- **PyTorch Team** — Deep learning framework
- **Hugging Face** — Model hosting infrastructure
- **Google Gemini** — LLM narrative generation and RAG chatbot
- **LangChain** — RAG pipeline orchestration
- **NeonDB** — Serverless PostgreSQL
- **Vercel & Render** — Deployment infrastructure
- **The open-source ML community** — SHAP, scikit-learn, XGBoost

---

<div align="center">

### Built with PyTorch · FastAPI · Next.js 15 🚀

![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Hugging Face](https://img.shields.io/badge/🤗%20Hugging%20Face-FFD21E?style=for-the-badge)

⭐ **Star this repo if you find it helpful!**

[🖥️ Live Demo](https://ucris-credit-risk-intelligence-syst.vercel.app/) · [⚡ API](https://ucris-credit-risk-intelligence-system.onrender.com) · [🤗 Model Server](https://kritzzz11-ucris-model-server.hf.space/predict) · [📧 Contact](mailto:ananya.benjwal@gmail.com)

---

© 2025 UCRIS. All rights reserved.

*Detecting financial stress before it becomes default — one behavioral signal at a time.*

</div>

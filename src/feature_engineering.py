"""
UCRIS — Feature Engineering Module
===================================
Temporal feature engineering pipeline for the
Unified Customer Risk Intelligence System.

All features are derived from 6-month behavioral
history in the UCI Credit Card dataset.

Usage:
    from src.feature_engineering import engineer_features
    df_features = engineer_features(df_clean)
"""

import numpy as np
import pandas as pd


# ── Column definitions ────────────────────────────────
BILL_COLS    = ['BILL_AMT1','BILL_AMT2','BILL_AMT3',
                'BILL_AMT4','BILL_AMT5','BILL_AMT6']

PAY_COLS     = ['PAY_0','PAY_2','PAY_3',
                'PAY_4','PAY_5','PAY_6']

PAY_AMT_COLS = ['PAY_AMT1','PAY_AMT2','PAY_AMT3',
                'PAY_AMT4','PAY_AMT5','PAY_AMT6']

# Final feature set used in all models
FEATURE_COLUMNS = [
    'avg_utilization',
    'util_change',
    'avg_pay_delay',
    'consecutive_delays',
    'avg_repay_ratio',
    'spending_volatility',
    'pay_delay_trend',
    'pay_amt_trend',
    'LIMIT_BAL',
    'SEX_2',
    'EDUCATION_2',
    'EDUCATION_3',
    'EDUCATION_4',
    'MARRIAGE_2',
    'MARRIAGE_3'
]


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Engineer all temporal features from cleaned dataset.

    Parameters
    ----------
    df : pd.DataFrame
        Cleaned dataframe with original UCI columns.
        Must contain BILL_AMT, PAY, PAY_AMT, LIMIT_BAL.

    Returns
    -------
    pd.DataFrame
        Original dataframe with all temporal features added.

    Features Created
    ----------------
    Utilization:
        UTIL_1 to UTIL_6    : monthly credit utilization
        avg_utilization     : mean utilization over 6 months
        util_recent         : mean of months 1-2
        util_early          : mean of months 5-6
        util_change         : util_recent - util_early

    Payment delay:
        pay_delay_trend     : slope of PAY over 6 months
        avg_pay_delay       : mean PAY status
        consecutive_delays  : count of months with delay > 0

    Repayment:
        REPAY_RATIO_1 to 6  : monthly repayment ratio
        avg_repay_ratio     : mean repayment ratio

    Volatility:
        spending_volatility : log1p of std of BILL_AMT
        pay_amt_trend       : signed log of PAY_AMT slope
    """
    df = df.copy()
    x  = np.arange(6)

    # ── Monthly utilization ───────────────────────────
    for i, col in enumerate(BILL_COLS, 1):
        df[f'UTIL_{i}'] = (
            df[col] / df['LIMIT_BAL'].replace(0, np.nan)
        ).clip(0, 1).fillna(0)

    util_cols = [f'UTIL_{i}' for i in range(1, 7)]

    # ── Utilization aggregates ────────────────────────
    df['avg_utilization'] = df[util_cols].mean(axis=1)
    df['util_recent']     = df[['UTIL_1',
                                 'UTIL_2']].mean(axis=1)
    df['util_early']      = df[['UTIL_5',
                                 'UTIL_6']].mean(axis=1)
    df['util_change']     = (df['util_recent']
                             - df['util_early'])

    # ── Payment delay trend ───────────────────────────
    pay_matrix = df[PAY_COLS].values.astype(float)
    df['pay_delay_trend'] = np.array([
        np.polyfit(x, row, 1)[0]
        for row in pay_matrix
    ])
    df['avg_pay_delay']      = df[PAY_COLS].mean(axis=1)
    df['consecutive_delays'] = (
        df[PAY_COLS].gt(0).sum(axis=1)
    )

    # ── Repayment ratios ──────────────────────────────
    for i, (p, b) in enumerate(
            zip(PAY_AMT_COLS, BILL_COLS), 1):
        df[f'REPAY_RATIO_{i}'] = np.where(
            df[b] > 0,
            (df[p] / df[b]).clip(0, 1),
            1.0
        )

    repay_cols = [f'REPAY_RATIO_{i}' for i in range(1, 7)]
    df['avg_repay_ratio'] = df[repay_cols].mean(axis=1)

    # ── Spending volatility ───────────────────────────
    df['spending_volatility'] = np.log1p(
        df[BILL_COLS].std(axis=1)
    )

    # ── Payment amount trend ──────────────────────────
    pay_amt_matrix = df[PAY_AMT_COLS].values.astype(float)
    slopes = np.array([
        np.polyfit(x, row, 1)[0]
        for row in pay_amt_matrix
    ])
    df['pay_amt_trend'] = (
        np.sign(slopes) * np.log1p(np.abs(slopes))
    )

    return df


def get_feature_columns() -> list:
    """Return the final feature column list used in models."""
    return FEATURE_COLUMNS.copy()


def encode_categoricals(df: pd.DataFrame) -> pd.DataFrame:
    """
    One-hot encode categorical features.
    Drops first category to avoid multicollinearity.

    Parameters
    ----------
    df : pd.DataFrame
        DataFrame containing SEX, EDUCATION, MARRIAGE.

    Returns
    -------
    pd.DataFrame
        DataFrame with encoded categorical columns.
    """
    categorical_features = ['SEX', 'EDUCATION', 'MARRIAGE']
    df = pd.get_dummies(
        df,
        columns=categorical_features,
        drop_first=True
    )
    return df
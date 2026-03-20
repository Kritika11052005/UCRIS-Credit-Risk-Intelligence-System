"""
UCRIS — Label Engineering Module
==================================
Derives stress and escalation labels from raw UCI data.

Both labels are engineered since UCI only provides
a binary default label. The methodology is documented
here for reproducibility and paper citation.

Usage:
    from src.label_engineering import (
        assign_stress_label,
        assign_escalation_label,
        engineer_labels
    )
"""

import pandas as pd


# ── Label mappings ────────────────────────────────────
STRESS_MAP = {0: 'Low', 1: 'Medium', 2: 'High'}
ESC_MAP    = {0: 'Stable', 1: 'Escalating'}


def assign_stress_label(row: pd.Series) -> int:
    """
    Assign stress label to a single customer row.

    Rules (in priority order):
        High   : PAY_0 >= 2 OR avg_utilization > 0.80
        Medium : PAY_0 == 1 OR 0.50 < avg_utilization <= 0.80
        Low    : all other cases

    Parameters
    ----------
    row : pd.Series
        Single customer row with PAY_0 and avg_utilization.

    Returns
    -------
    int : 0 (Low), 1 (Medium), 2 (High)
    """
    if row['PAY_0'] >= 2 or row['avg_utilization'] > 0.80:
        return 2
    elif (row['PAY_0'] == 1 or
          (0.50 < row['avg_utilization'] <= 0.80)):
        return 1
    else:
        return 0


def assign_escalation_label(row: pd.Series) -> int:
    """
    Assign escalation label to a single customer row.

    A customer is escalating if:
        - Recent payment delays > early payment delays, OR
        - Utilization increased by more than 15%

    Parameters
    ----------
    row : pd.Series
        Single customer row with PAY and util_change cols.

    Returns
    -------
    int : 0 (Stable), 1 (Escalating)
    """
    pay_recent       = (row['PAY_0'] + row['PAY_2']) / 2
    pay_early        = (row['PAY_5'] + row['PAY_6']) / 2
    delay_escalating = pay_recent > pay_early
    util_escalating  = row['util_change'] > 0.15
    return 1 if (delay_escalating or util_escalating) else 0


def engineer_labels(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply both label engineering functions to a dataframe.

    Parameters
    ----------
    df : pd.DataFrame
        DataFrame with engineered features already applied.
        Must contain PAY_0, PAY_2, PAY_5, PAY_6,
        avg_utilization, util_change.

    Returns
    -------
    pd.DataFrame
        DataFrame with stress_label and escalation_label added.
    """
    df = df.copy()
    df['stress_label'] = df.apply(
        assign_stress_label, axis=1
    )
    df['escalation_label'] = df.apply(
        assign_escalation_label, axis=1
    )
    return df


def get_label_distributions(df: pd.DataFrame) -> dict:
    """
    Return distribution summary for both labels.

    Parameters
    ----------
    df : pd.DataFrame
        DataFrame with stress_label and escalation_label.

    Returns
    -------
    dict : distributions for both labels
    """
    stress_dist = df['stress_label'].value_counts(
        normalize=True
    ).sort_index().mul(100).round(1).to_dict()

    esc_dist = df['escalation_label'].value_counts(
        normalize=True
    ).sort_index().mul(100).round(1).to_dict()

    return {
        'stress'    : {
            STRESS_MAP[k]: f"{v}%"
            for k, v in stress_dist.items()
        },
        'escalation': {
            ESC_MAP[k]: f"{v}%"
            for k, v in esc_dist.items()
        }
    }
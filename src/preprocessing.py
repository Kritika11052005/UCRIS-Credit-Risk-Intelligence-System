"""
UCRIS — Preprocessing Module
==============================
Data cleaning and scaling pipeline for UCRIS.

Handles all data quality issues identified during EDA:
- Undocumented categorical values
- PAY_AMT outliers
- Feature scaling for neural network

Usage:
    from src.preprocessing import clean_data, scale_features
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean the raw UCI Credit Card dataset.

    Steps:
        1. Drop ID column
        2. Rename target column
        3. Remap undocumented EDUCATION values (0,5,6 → 4)
        4. Remap undocumented MARRIAGE values (0 → 3)
        5. Cap PAY_AMT outliers at 99th percentile

    Parameters
    ----------
    df : pd.DataFrame
        Raw loaded dataframe from UCI dataset.

    Returns
    -------
    pd.DataFrame
        Cleaned dataframe ready for feature engineering.
    """
    df = df.copy()

    # Drop ID
    if 'ID' in df.columns:
        df = df.drop('ID', axis=1)

    # Rename target
    if 'default payment next month' in df.columns:
        df = df.rename(
            columns={
                'default payment next month': 'default'
            }
        )

    # Fix EDUCATION undocumented values
    df['EDUCATION'] = df['EDUCATION'].replace(
        {0: 4, 5: 4, 6: 4}
    )

    # Fix MARRIAGE undocumented values
    df['MARRIAGE'] = df['MARRIAGE'].replace({0: 3})

    # Cap PAY_AMT outliers at 99th percentile
    pay_amt_cols = ['PAY_AMT1','PAY_AMT2','PAY_AMT3',
                    'PAY_AMT4','PAY_AMT5','PAY_AMT6']
    for col in pay_amt_cols:
        cap      = df[col].quantile(0.99)
        df[col]  = df[col].clip(upper=cap)

    return df


def scale_features(
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    scaler: StandardScaler = None
) -> tuple:
    """
    Fit and apply StandardScaler to features.

    Fits ONLY on training data to prevent data leakage.
    Applies the fitted scaler to test data.

    Parameters
    ----------
    X_train : pd.DataFrame
        Training features.
    X_test : pd.DataFrame
        Test features.
    scaler : StandardScaler, optional
        Pre-fitted scaler. If None, a new one is fitted.

    Returns
    -------
    tuple : (X_train_scaled, X_test_scaled, scaler)
        Scaled arrays and the fitted scaler object.
    """
    if scaler is None:
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
    else:
        X_train_scaled = scaler.transform(X_train)

    X_test_scaled = scaler.transform(X_test)

    return X_train_scaled, X_test_scaled, scaler


def load_dataset(filepath: str) -> pd.DataFrame:
    """
    Load the UCI Credit Card dataset.

    Handles the XLS binary format despite .csv extension.

    Parameters
    ----------
    filepath : str
        Path to the credit_default.csv file.

    Returns
    -------
    pd.DataFrame
        Raw loaded dataframe.
    """
    return pd.read_excel(
        filepath,
        header=1,
        engine='xlrd'
    )
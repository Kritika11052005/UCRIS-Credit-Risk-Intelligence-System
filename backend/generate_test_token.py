"""
Quick script to generate a test JWT token for Swagger testing.

Usage:
    cd backend
    venv\Scripts\activate
    python generate_test_token.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.security import create_access_token
from datetime import timedelta

# Uses the test user we inserted in NeonDB
token = create_access_token(
    data={
        "sub":   "test-user-001",
        "email": "test@ucris.com"
    },
    expires_delta=timedelta(hours=24)  # 24 hour token for testing
)

print("\n" + "=" * 60)
print("  TEST JWT TOKEN (valid 24 hours)")
print("=" * 60)
print(f"\n{token}\n")
print("=" * 60)
print("\nSteps to use in Swagger:")
print("1. Go to http://127.0.0.1:8000/docs")
print("2. Click the 'Authorize' button (top right)")
print("3. Paste the token above into the 'Value' field")
print("4. Click 'Authorize' then 'Close'")
print("5. Now test any endpoint\n")
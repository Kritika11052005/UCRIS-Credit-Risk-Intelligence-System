from app.generated.prisma import Prisma
from app.core.config import settings

# Single shared Prisma client instance
db = Prisma()


async def connect_db():
    """Connect to NeonDB on app startup."""
    await db.connect()
    print("[OK] Connected to NeonDB")


async def disconnect_db():
    """Disconnect from NeonDB on app shutdown."""
    if db.is_connected():
        await db.disconnect()
        print("[OK] Disconnected from NeonDB")
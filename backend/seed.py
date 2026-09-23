from database import SessionLocal
from models import Transaction
import asyncio
from simulator import run_scenario

async def seed_data():
    db = SessionLocal()
    count = db.query(Transaction).count()
    if count > 0:
        print("Database already seeded.")
        db.close()
        return

    print("Seeding database with initial demo data...")
    scenarios = ["success", "timeout", "debit_without_credit", "merchant_timeout", "duplicate", "settlement_delay", "reversal", "unknown"]
    
    import random
    
    for s in scenarios:
        tx = Transaction(
            amount=round(random.uniform(100, 5000), 2),
            currency="INR",
            customer_id=f"CUST-{random.randint(100,999)}",
            merchant_id=f"MERCH-{random.randint(10,99)}",
            scenario=s
        )
        db.add(tx)
        db.commit()
        db.refresh(tx)
        print(f"Simulating scenario: {s}")
        await run_scenario(db, tx, s)
        
    print("Seeding complete.")
    db.close()

if __name__ == "__main__":
    asyncio.run(seed_data())

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables from the root .env file if present
load_dotenv(os.path.join(os.path.dirname(__dirname__), '.env'))

DB_TYPE = os.getenv("DB_TYPE", "sqlite")

if DB_TYPE == "postgres":
    POSTGRES_USER = os.getenv("POSTGRES_USER", "pbx_user")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "pbx_password")
    POSTGRES_DB = os.getenv("POSTGRES_DB", "payment_black_box")
    POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
    
    SQLALCHEMY_DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
else:
    # SQLite fallback
    SQLALCHEMY_DATABASE_URL = "sqlite:///./pbx.db"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

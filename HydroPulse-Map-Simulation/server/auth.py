"""
HydroPulse Authentication Module
SQLite database + bcrypt password hashing + JWT token management
"""

import os
import datetime
from pathlib import Path
from typing import Optional

import jwt
import bcrypt
from sqlalchemy import create_engine, Column, Integer, String, DateTime, func
from sqlalchemy.orm import sessionmaker, declarative_base

# ---------- Database Setup ----------

DB_PATH = Path(__file__).resolve().parent / "hydropulse_users.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# JWT Configuration
JWT_SECRET = os.environ.get("HYDROPULSE_JWT_SECRET", "hydropulse-secret-key-change-in-production-2024")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72  # 3 days


# ---------- Models ----------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class DispatchLog(Base):
    __tablename__ = "dispatch_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    log_code = Column(String(50), nullable=False)
    origin = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    storm_intensity = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False, default="COMPLETED")
    status_label = Column(String(100), nullable=False, default="OPTIMAL // 100% CLEAR")
    hazards_bypassed = Column(Integer, nullable=False, default=0)
    est_time = Column(String(50), nullable=False, default="24 MIN")
    elevation_clearance = Column(String(50), nullable=False, default="+6.2m AMSL")
    route_sector = Column(String(100), nullable=False, default="MUMBAI ARTERIAL")
    created_at = Column(DateTime, server_default=func.now())


# Create tables on import
Base.metadata.create_all(bind=engine)


# ---------- Password Hashing ----------

def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its bcrypt hash."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


# ---------- JWT Token Management ----------

def create_access_token(user_id: int, email: str) -> str:
    """Create a JWT access token for an authenticated user."""
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": datetime.datetime.now(datetime.timezone.utc),
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT token. Returns payload dict or None if invalid."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


# ---------- User CRUD Operations ----------

def create_user(name: str, email: str, password: str) -> dict:
    """
    Create a new user account.
    Returns dict with user info and token on success.
    Raises ValueError if email already exists.
    """
    db = SessionLocal()
    try:
        # Check if email already exists
        existing = db.query(User).filter(User.email == email.lower().strip()).first()
        if existing:
            raise ValueError("Email already registered")

        # Create user
        user = User(
            name=name.strip(),
            email=email.lower().strip(),
            hashed_password=hash_password(password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Generate token
        token = create_access_token(user.id, user.email)

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "token": token,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
    finally:
        db.close()


def authenticate_user(email: str, password: str) -> dict:
    """
    Authenticate an existing user with email and password.
    Returns dict with user info and token on success.
    Raises ValueError if credentials are invalid.
    """
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email.lower().strip()).first()
        if not user:
            raise ValueError("Invalid email or password")

        if not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")

        # Generate token
        token = create_access_token(user.id, user.email)

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "token": token,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
    finally:
        db.close()


def get_user_from_token(token: str) -> Optional[dict]:
    """
    Retrieve user info from a valid JWT token.
    Returns user dict or None if token is invalid/expired.
    """
    payload = decode_access_token(token)
    if not payload:
        return None

    db = SessionLocal()
    try:
        user_id = int(payload["sub"])
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
    finally:
        db.close()


def update_user_profile(user_id: int, name: str) -> dict:
    """
    Update a user's display name.
    """
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        user.name = name.strip()
        db.commit()
        db.refresh(user)

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
    finally:
        db.close()


def change_user_password(user_id: int, old_password: str, new_password: str) -> bool:
    """
    Change user password after verifying current password.
    """
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        if not verify_password(old_password, user.hashed_password):
            raise ValueError("Current password is incorrect")

        user.hashed_password = hash_password(new_password)
        db.commit()
        return True
    finally:
        db.close()


def record_dispatch_log(
    user_id: int,
    origin: str,
    destination: str,
    storm_intensity: int,
    status: str = "COMPLETED",
    status_label: str = "OPTIMAL // 100% CLEAR",
    hazards_bypassed: int = 0,
    est_time: str = "24 MIN",
    elevation_clearance: str = "+6.2m AMSL",
    route_sector: str = "MUMBAI ARTERIAL",
) -> dict:
    """
    Record a new dispatch log entry for a specific user.
    """
    db = SessionLocal()
    try:
        count = db.query(DispatchLog).filter(DispatchLog.user_id == user_id).count()
        log_code = f"DISP-{user_id:03d}-{(count + 1):02d}"

        log = DispatchLog(
            user_id=user_id,
            log_code=log_code,
            origin=origin,
            destination=destination,
            storm_intensity=int(storm_intensity),
            status=status,
            status_label=status_label,
            hazards_bypassed=int(hazards_bypassed),
            est_time=est_time,
            elevation_clearance=elevation_clearance,
            route_sector=route_sector,
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        # Format timestamp like "09 SEP 2026 // 19:30 IST"
        now = log.created_at or datetime.datetime.now()
        formatted_time = now.strftime("%d %b %Y // %H:%M IST").upper()

        return {
            "id": log.log_code,
            "timestamp": formatted_time,
            "origin": log.origin,
            "destination": log.destination,
            "stormIntensity": log.storm_intensity,
            "status": log.status,
            "statusLabel": log.status_label,
            "hazardsBypassed": log.hazards_bypassed,
            "estTime": log.est_time,
            "elevationClearance": log.elevation_clearance,
            "routeSector": log.route_sector,
            "createdAt": log.created_at.isoformat() if log.created_at else None,
        }
    finally:
        db.close()


def get_user_dispatch_logs(user_id: int) -> list[dict]:
    """
    Retrieve all recorded dispatch logs for a user, sorted newest first.
    """
    db = SessionLocal()
    try:
        logs = (
            db.query(DispatchLog)
            .filter(DispatchLog.user_id == user_id)
            .order_by(DispatchLog.id.desc())
            .all()
        )

        results = []
        for log in logs:
            now = log.created_at or datetime.datetime.now()
            formatted_time = now.strftime("%d %b %Y // %H:%M IST").upper()
            results.append({
                "id": log.log_code,
                "timestamp": formatted_time,
                "origin": log.origin,
                "destination": log.destination,
                "stormIntensity": log.storm_intensity,
                "status": log.status,
                "statusLabel": log.status_label,
                "hazardsBypassed": log.hazards_bypassed,
                "estTime": log.est_time,
                "elevationClearance": log.elevation_clearance,
                "routeSector": log.route_sector,
                "createdAt": log.created_at.isoformat() if log.created_at else None,
            })
        return results
    finally:
        db.close()



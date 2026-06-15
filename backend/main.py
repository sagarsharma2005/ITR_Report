from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import JWTError, jwt
from datetime import datetime, timedelta
import hashlib
import sqlite3
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "datalens-secret-key-2024"
ALGORITHM = "HS256"
TOKEN_EXPIRE = 60
DB_PATH = "datalens.db"

# ── Database Setup ────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            name     TEXT NOT NULL,
            email    TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created  TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS uploads (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            filename   TEXT NOT NULL,
            row_count  INTEGER,
            uploaded   TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    # Default users
    for email, name, pwd in [
        ("demo@datalens.in",  "Demo User",  "demo123"),
        ("admin@datalens.in", "Admin User", "admin123"),
    ]:
        try:
            conn.execute(
                "INSERT INTO users (name, email, password) VALUES (?,?,?)",
                (name, email, hash_password(pwd))
            )
        except:
            pass
    conn.commit()
    conn.close()
    print("✅ Database ready →", DB_PATH)

# ── Helpers ───────────────────────────────────────────────
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(email: str):
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE)
    return jwt.encode({"sub": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

oauth2 = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        conn = get_db()
        user = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        conn.close()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"email": user["email"], "name": user["name"]}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ── Models ────────────────────────────────────────────────
class RegisterModel(BaseModel):
    name: str
    email: str
    password: str

# ── Routes ────────────────────────────────────────────────
@app.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email=?", (form.username,)).fetchone()
    conn.close()
    if not user or user["password"] != hash_password(form.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    token = create_token(form.username)
    return {"access_token": token, "token_type": "bearer", "name": user["name"]}

@app.post("/register")
def register(data: RegisterModel):
    conn = get_db()
    existing = conn.execute("SELECT * FROM users WHERE email=?", (data.email,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    conn.execute(
        "INSERT INTO users (name, email, password) VALUES (?,?,?)",
        (data.name, data.email, hash_password(data.password))
    )
    conn.commit()
    conn.close()
    token = create_token(data.email)
    return {"access_token": token, "token_type": "bearer", "name": data.name}

@app.get("/me")
def me(user=Depends(get_current_user)):
    return user

@app.get("/users")
def get_users(user=Depends(get_current_user)):
    conn = get_db()
    users = conn.execute("SELECT id, name, email, created FROM users").fetchall()
    conn.close()
    return [dict(u) for u in users]

@app.get("/stats")
def get_stats(user=Depends(get_current_user)):
    conn = get_db()
    total_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    total_uploads = conn.execute("SELECT COUNT(*) FROM uploads WHERE user_email=?", (user["email"],)).fetchone()[0]
    conn.close()
    return {"total_users": total_users, "total_uploads": total_uploads}

@app.get("/")
def root():
    return {"status": "DataLens API running!", "db": DB_PATH}

# ── Start ─────────────────────────────────────────────────
init_db()
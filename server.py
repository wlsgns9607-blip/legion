from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import hashlib
import os

app = FastAPI(title="Legion Game Server", version="1.0.0")

# CORS 설정 (Vite 프론트엔드 포트 등 모든 오리진 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Vercel 서버리스 환경에서는 /tmp 만 쓰기 가능
if os.environ.get("VERCEL"):
    DB_PATH = "/tmp/legion.db"
else:
    DB_PATH = os.path.join(os.path.dirname(__file__), "legion.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        nickname TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        exp INTEGER DEFAULT 0,
        hp INTEGER DEFAULT 200,
        mp INTEGER DEFAULT 200,
        job_tier INTEGER DEFAULT 1,
        kills INTEGER DEFAULT 0,
        quest_status TEXT DEFAULT 'NOT_STARTED',
        quest_kills INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    conn.close()

init_db()

def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

class RegisterRequest(BaseModel):
    username: str
    password: str
    name: str
    nickname: str

class LoginRequest(BaseModel):
    username: str
    password: str

class SaveDataRequest(BaseModel):
    username: str
    level: int
    exp: int
    hp: int
    mp: int
    job_tier: int
    kills: int
    quest_status: str
    quest_kills: int

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Legion Game DB Server Running"}

@app.post("/api/register")
def register(req: RegisterRequest):
    username = req.username.strip()
    password = req.password.strip()
    name = req.name.strip()
    nickname = req.nickname.strip()

    if not username or not password or not name or not nickname:
        raise HTTPException(status_code=400, detail="모든 항목(아이디, 비밀번호, 이름, 닉네임)을 입력해주세요.")

    conn = get_db()
    cursor = conn.cursor()

    # 아이디 중복 검사
    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="이미 존재하는 아이디입니다.")

    hashed = hash_pw(password)
    cursor.execute("""
        INSERT INTO users (username, password, name, nickname, level, exp, hp, mp, job_tier, kills, quest_status, quest_kills)
        VALUES (?, ?, ?, ?, 1, 0, 200, 200, 1, 0, 'NOT_STARTED', 0)
    """, (username, hashed, name, nickname))
    conn.commit()

    cursor.execute("SELECT id, username, name, nickname, level, exp, hp, mp, job_tier, kills, quest_status, quest_kills FROM users WHERE username = ?", (username,))
    user = dict(cursor.fetchone())
    conn.close()

    return {"status": "success", "message": "회원가입이 완료되었습니다!", "user": user}

@app.post("/api/login")
def login(req: LoginRequest):
    username = req.username.strip()
    password = req.password.strip()

    if not username or not password:
        raise HTTPException(status_code=400, detail="아이디와 비밀번호를 입력해주세요.")

    conn = get_db()
    cursor = conn.cursor()
    hashed = hash_pw(password)

    cursor.execute("""
        SELECT id, username, name, nickname, level, exp, hp, mp, job_tier, kills, quest_status, quest_kills
        FROM users
        WHERE username = ? AND password = ?
    """, (username, hashed))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 일치하지 않습니다.")

    user = dict(row)
    return {"status": "success", "message": f"{user['nickname']}님 환영합니다!", "user": user}

@app.post("/api/save")
def save_data(req: SaveDataRequest):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE users
        SET level = ?, exp = ?, hp = ?, mp = ?, job_tier = ?, kills = ?, quest_status = ?, quest_kills = ?, updated_at = CURRENT_TIMESTAMP
        WHERE username = ?
    """, (req.level, req.exp, req.hp, req.mp, req.job_tier, req.kills, req.quest_status, req.quest_kills, req.username))
    conn.commit()
    conn.close()

    return {"status": "success", "message": "데이터가 성공적으로 저장되었습니다."}

@app.get("/api/user/{username}")
def get_user(username: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, username, name, nickname, level, exp, hp, mp, job_tier, kills, quest_status, quest_kills, created_at, updated_at
        FROM users WHERE username = ?
    """, (username,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없습니다.")

    return {"status": "success", "user": dict(row)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

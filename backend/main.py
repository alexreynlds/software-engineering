import datetime
import sqlite3

import jwt
from flask import Flask
from flask_cors import CORS
from flask import jsonify, request, session
from flask_bcrypt import Bcrypt

app = Flask(__name__)
CORS(app, supports_credentials=True)
JWT_SECRET = "super-duper-secret-key"
JWT_EXP_DELTA_SECONDS = 30 * 24 * 3600  # 7 days
bcrypt = Bcrypt(app)



# Initialize a connection to the db
def get_db():
    conn = sqlite3.connect("app.db")
    conn.row_factory = sqlite3.Row
    return conn


def create_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow()
        + datetime.timedelta(seconds=JWT_EXP_DELTA_SECONDS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def verify_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload["user_id"]
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


# Initialize the database and create tables if they dont exist
@app.before_first_request
def init_db():
    db = get_db()

    # Create user_settings table
    db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    # Create user_settings table
    db.execute("""
        CREATE TABLE IF NOT EXISTS user_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            dark_mode BOOLEAN DEFAULT 1,
            username TEXT DEFAULT '',
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # Create search_history table
    db.execute("""
        CREATE TABLE IF NOT EXISTS search_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            query TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # Create favourited images table
    db.execute("""
        CREATE TABLE IF NOT EXISTS favourites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        image_id TEXT NOT NULL,
        UNIQUE(user_id, image_id),
        FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    db.commit()

    # Create a register endpoint


# Allowing the user to register with email and password
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data["email"]
    password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO users (email, password) VALUES (?, ?)", (email, password)
        )
        user_id = cursor.lastrowid

        # Create default settings row
        cursor.execute("INSERT INTO user_settings (user_id) VALUES (?)", (user_id,))
        db.commit()

        return jsonify({"message": "User registered"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists"}), 409


@app.route("/api/register", methods=["DELETE"])
def delete_user():
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return jsonify({"error": "No token"}), 401

    token = auth_header.split(" ")[1]
    user_id = verify_token(token)
    if not user_id:
        return jsonify({"error": "Invalid or expired token"}), 401

    db = get_db()
    db.execute("DELETE FROM users WHERE id = ?", (user_id,))
    db.execute("DELETE FROM user_settings WHERE user_id = ?", (user_id,))
    db.execute("DELETE FROM search_history WHERE user_id = ?", (user_id,))
    db.execute("DELETE FROM favourites WHERE user_id = ?", (user_id,))
    db.commit()

    session.clear()
    return jsonify({"message": "User deleted"}), 200


# Create a login endpoint
# Allowing the user to login with email and password
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data["email"]
    password = data["password"]

    db = get_db()
    user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

    if user and bcrypt.check_password_hash(user["password"], password):
        token = create_token(user["id"])
        return jsonify({"token": token, "email": user["email"]})
    return jsonify({"error": "Invalid credentials"}), 401


@app.route("/api/user", methods=["GET"])
def get_user():
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return jsonify({"error": "No token"}), 401

    token = auth_header.split(" ")[1]
    user_id = verify_token(token)
    if not user_id:
        return jsonify({"error": "Invalid or expired token"}), 401

    db = get_db()
    user = db.execute("SELECT email FROM users WHERE id = ?", (user_id,)).fetchone()
    return jsonify({"email": user["email"]}) if user else ("", 404)


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5050)

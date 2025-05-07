import datetime
import sqlite3
from datetime import datetime, timedelta, timezone

import jwt
from flask import Flask, jsonify, request, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True, origins="*")
app.secret_key = "super-secret-key"
JWT_SECRET = "super-duper-secret-key"
JWT_EXP_DELTA_SECONDS = 30 * 24 * 3600  # Currently 30 days
bcrypt = Bcrypt(app)


# Initialize a connection to the db
def get_db():
    conn = sqlite3.connect("app.db")
    conn.row_factory = sqlite3.Row
    return conn


# Create a JWT token for the user
def create_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(seconds=JWT_EXP_DELTA_SECONDS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


# Verify a provided JWT token
def verify_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload["user_id"]
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


# Function to check if the user is authenticated
def check_authentication():
    token = request.cookies.get("token")
    if not token:
        return None, jsonify({"error": "No token"}), 401

    user_id = verify_token(token)
    if not user_id:
        return None, jsonify({"error": "Invalid or expired token"}), 401
    return user_id, None, None


# Initialize the database and create tables if they dont exist
def init_db():
    db = get_db()

    # Create user table
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

        cursor.execute("INSERT INTO user_settings (user_id) VALUES (?)", (user_id,))
        db.commit()

        return jsonify({"message": "User registered"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists"}), 409


# Allowing the user to delete their account
@app.route("/api/register", methods=["DELETE"])
def delete_user():
    user_id, error_response, status = check_authentication()
    if error_response:
        return error_response, status

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
        response = jsonify({"message": "Logged in", "email": user["email"]})
        response.set_cookie(
            "token",
            token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=JWT_EXP_DELTA_SECONDS,
        )
        return response

    return jsonify({"error": "Invalid credentials"}), 401


# Allows the retrieval of the user's email
@app.route("/api/user", methods=["GET"])
def get_user():
    user_id, error_response, status = check_authentication()
    if error_response:
        return error_response, status

    db = get_db()
    user = db.execute("SELECT email FROM users WHERE id = ?", (user_id,)).fetchone()
    return jsonify({"email": user["email"]}) if user else ("", 404)


# Allows the user to log out
@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    response = jsonify({"message": "Logged out"})
    response.set_cookie("token", "", expires=0)
    return response


# API route to get user settings
@app.route("/api/settings", methods=["GET"])
def get_settings():
    user_id, error_response, status = check_authentication()
    if error_response:
        return error_response, status

    db = get_db()
    settings = db.execute(
        """
        SELECT dark_mode, username FROM user_settings WHERE user_id = ?
        """,
        (user_id,),
    ).fetchone()

    if settings:
        return jsonify(dict(settings))
    return jsonify({"error": "Settings not found"}), 404


# API route to update user settings
@app.route("/api/settings", methods=["POST"])
def update_settings():
    user_id, error_response, status = check_authentication()
    if error_response:
        return error_response, status

    data = request.get_json()
    dark_mode = data.get("dark_mode")
    username = data.get("username")

    db = get_db()
    db.execute(
        """
        UPDATE user_settings
        SET dark_mode = ?, username = ?
        WHERE user_id = ?
        """,
        (int(dark_mode), username, user_id),
    )
    db.commit()

    return jsonify({"message": "Settings updated"})


# API route to add an image to favourites
@app.route("/api/favourites", methods=["POST"])
def add_favourite():
    user_id, error_response, status = check_authentication()
    if error_response:
        return error_response, status

    try:
        data = request.get_json()
        image_id = data.get("imageId")
        if not image_id:
            return jsonify({"error": "No image ID provided"}), 400

        db = get_db()
        exists = db.execute(
            "SELECT 1 FROM favourites WHERE user_id = ? AND image_id = ?",
            (user_id, image_id),
        ).fetchone()

        if exists:
            return jsonify({"error": "Already favourited"}), 409

        db.execute(
            "INSERT INTO favourites (user_id, image_id) VALUES (?, ?)",
            (user_id, image_id),
        )
        db.commit()
        return jsonify({"message": "Favourite added"}), 201

    except Exception as e:
        print("Error in /api/favourites [POST]:", e)
        return jsonify({"error": "Internal server error"}), 500


# API route to remove a favourite from a users account
@app.route("/api/favourites", methods=["DELETE"])
def remove_favourite():
    user_id, error_response, status = check_authentication()
    if error_response:
        return error_response, status

    try:
        data = request.get_json()
        image_id = data.get("imageId")
        if not image_id:
            return jsonify({"error": "No image ID provided"}), 400

        db = get_db()
        db.execute(
            "DELETE FROM favourites WHERE user_id = ? AND image_id = ?",
            (user_id, image_id),
        )
        db.commit()

        return jsonify({"message": "Favourite removed"}), 200

    except Exception as e:
        print("Error in /api/favourites [DELETE]:", e)
        return jsonify({"error": "Internal server error"}), 500


# API route to get all favourites for a given user
@app.route("/api/favourites", methods=["GET"])
def get_favourites():
    user_id, error_response, status = check_authentication()
    if error_response:
        return error_response, status

    db = get_db()
    favourites = db.execute(
        "SELECT image_id FROM favourites WHERE user_id = ?", (user_id,)
    ).fetchall()

    return jsonify([dict(fav) for fav in favourites]), 200


# Start the flask app and put it on port 5050
if __name__ == "__main__":
    init_db()
    app.run(debug=True, host="0.0.0.0", port=5050)

from flask import Flask, jsonify, send_from_directory
import random
import os

app = Flask(__name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/style.css")
def css():
    return send_from_directory(FRONTEND_DIR, "style.css")

@app.route("/game.js")
def js():
    return send_from_directory(FRONTEND_DIR, "game.js")

@app.route("/sounds/<path:filename>")
def sounds(filename):
    return send_from_directory(os.path.join(FRONTEND_DIR, "sounds"), filename)

@app.route("/spawn")
def spawn():
    return jsonify({
        "x": random.randint(50, 450),
        "y": random.randint(50, 350)
    })

if __name__ == "__main__":
    app.run(debug=True)

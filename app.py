import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = Flask(__name__)
client = genai.Client(api_key=os.environ.get("API_KEY"))

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/about")
def about():
    return "This is about page"

@app.route("/contact")
def contact():
    return "Contact page"

@app.route("/api/generate", methods=["POST"])
def generate():
    data = request.json
    notes = data.get("notes", "")
    action = data.get("action", "")

    if not notes:
        return jsonify({"error": "Please provide some notes."}), 400

    prompts = {
        "summary": "Summarize the following notes concisely:\n\n",
        "quiz": "Create a short multiple-choice quiz based on the following notes:\n\n",
        "flashcards": "Create 5 flashcards (front/back) based on the following notes:\n\n"
    }

    prompt = prompts.get(action, "Process the following notes:\n\n") + notes

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return jsonify({"result": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

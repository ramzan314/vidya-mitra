import os
import PyPDF2
from io import BytesIO
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = Flask(__name__)
client = genai.Client(api_key=os.environ.get("API_KEY"))

def extract_text_from_file(file):
    filename = file.filename.lower()
    if filename.endswith('.txt'):
        return file.read().decode('utf-8', errors='ignore')
    elif filename.endswith('.pdf'):
        try:
            pdf_reader = PyPDF2.PdfReader(BytesIO(file.read()))
            text = ""
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text
        except Exception as e:
            print(f"PDF Extraction Error: {e}")
            return ""
    else:
        # Fallback to trying to decode as text
        return file.read().decode('utf-8', errors='ignore')

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
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        notes = request.form.get("notes", "")
        action = request.form.get("action", "")
        file = request.files.get("file")
        if file:
            extracted_text = extract_text_from_file(file)
            if extracted_text:
                notes += "\n\n" + extracted_text
    else:
        data = request.json or {}
        notes = data.get("notes", "")
        action = data.get("action", "")

    if not notes.strip():
        return jsonify({"error": "Please provide some notes or upload a file."}), 400

    prompts = {
        "summary": "Summarize the following notes concisely:\n\n",
        "quiz": "Create a short 5-question multiple-choice quiz based on the following notes. Return ONLY a valid JSON array of objects, where each object has 'question' (string), 'options' (array of 4 strings), and 'answer' (the exact string of the correct option). Do not include markdown formatting like ```json.\n\n",
        "flashcards": "Create 5 flashcards based on the following notes. Return ONLY a valid JSON array of objects, with each object having 'front' and 'back' properties. Example: [{\"front\": \"Q1\", \"back\": \"A1\"}]. Do not include markdown formatting like ```json.\n\n"
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

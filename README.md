# 📘 AI Study Assistant

An intelligent, interactive web application built with Flask and powered by Google's Gemini API. This tool helps students and professionals accelerate their learning by automatically generating summaries, interactive quizzes, and flippable flashcards from their notes or uploaded documents.

## ✨ Features

- **Document Parsing:** Upload `.txt` or `.pdf` files, or simply paste your notes into the text area. The app automatically extracts and processes the text.
- **Smart Summarization:** Instantly generate concise summaries of large texts.
- **🔊 Read Aloud:** Includes a built-in Text-to-Speech feature utilizing the Web Speech API to read summaries out loud to you.
- **Interactive Quizzes:** Dynamically generates a 5-question multiple-choice quiz. It evaluates your answers in real-time, highlights correct/incorrect options, and provides a final score.
- **3D Flashcards:** Generates interactive study flashcards with a sleek 3D flipping animation.
- **API Key Rotation:** Built-in failover logic that supports multiple Gemini API keys. If one key hits a rate limit or expires, the application automatically retries with the next available key.
- **Modern UI:** A highly aesthetic, responsive user interface featuring smooth animations, soft drop shadows, and modern typography.

## 🛠️ Tech Stack

- **Backend:** Python, Flask, PyPDF2 (for PDF parsing)
- **AI Integration:** Google GenAI SDK (`gemini-2.5-flash`)
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Deployment Ready:** Includes a `Procfile` for deploying to platforms like Render or Heroku.

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- [Google Gemini API Keys](https://aistudio.google.com/)

### Installation

1. **Clone the repository and navigate to the project directory:**
   ```bash
   cd Hackathon
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your Gemini API keys separated by commas (this enables the rotation feature to bypass rate limits):
   ```env
   API_KEYS=your_first_key_here,your_second_key_here,your_third_key_here
   ```

4. **Run the application:**
   ```bash
   python app.py
   ```

5. **Open your browser:**
   Navigate to `http://127.0.0.1:5000` to start studying!

## ☁️ Deployment

This project is configured to be easily deployed to Render, Heroku, or any WSGI-compatible cloud provider. 
Just ensure you set the `API_KEYS` environment variable in your host's dashboard!

## 📜 License

This project is open-source and available under the MIT License.

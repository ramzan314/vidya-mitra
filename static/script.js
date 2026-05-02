let currentQuiz = [];
let currentQuestionIndex = 0;
let userScore = 0;

async function callAI(action) {
  const notes = document.getElementById("notes").value;
  const fileInput = document.getElementById("fileUpload");
  const outputDiv = document.getElementById("output");
  outputDiv.innerText = "Thinking...";

  const file = fileInput ? fileInput.files[0] : null;

  try {
    let response;
    if (file) {
      const formData = new FormData();
      formData.append("notes", notes);
      formData.append("action", action);
      formData.append("file", file);

      response = await fetch('/api/generate', {
        method: 'POST',
        body: formData
      });
    } else {
      response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, action })
      });
    }
    
    const data = await response.json();
    
    if (action === 'flashcards' && !data.error) {
      try {
        let jsonStr = data.result.trim();
        if (jsonStr.startsWith("```json")) {
          jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }
        const flashcards = JSON.parse(jsonStr);
        renderFlashcards(flashcards, outputDiv);
      } catch (e) {
        console.error("JSON parse error:", e);
        outputDiv.innerText = data.result;
      }
    } else if (action === 'quiz' && !data.error) {
      try {
        let jsonStr = data.result.trim();
        if (jsonStr.startsWith("```json")) {
          jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }
        currentQuiz = JSON.parse(jsonStr);
        currentQuestionIndex = 0;
        userScore = 0;
        renderQuizQuestion(outputDiv);
      } catch (e) {
        console.error("JSON parse error:", e);
        outputDiv.innerText = data.result;
      }
    } else {
      outputDiv.innerHTML = '';
      const textDiv = document.createElement('div');
      textDiv.innerText = data.result || data.error;
      outputDiv.appendChild(textDiv);

      if (action === 'summary' && !data.error && data.result) {
        const readBtn = document.createElement('button');
        readBtn.className = 'btn-read fade-in';
        readBtn.innerText = '🔊 Read Aloud';
        
        readBtn.onclick = () => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            readBtn.innerText = '🔊 Read Aloud';
            readBtn.classList.remove('stop');
          } else {
            const utterance = new SpeechSynthesisUtterance(data.result);
            utterance.onend = () => {
              readBtn.innerText = '🔊 Read Aloud';
              readBtn.classList.remove('stop');
            };
            window.speechSynthesis.speak(utterance);
            readBtn.innerText = '⏹ Stop Reading';
            readBtn.classList.add('stop');
          }
        };
        outputDiv.appendChild(readBtn);
      }
    }
  } catch (err) {
    outputDiv.innerText = "Error connecting to server.";
  }
}

function renderFlashcards(flashcards, container) {
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'flashcard-grid';

  flashcards.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = 'flashcard';
    cardEl.onclick = () => cardEl.classList.toggle('flipped');

    const inner = document.createElement('div');
    inner.className = 'flashcard-inner';

    const front = document.createElement('div');
    front.className = 'flashcard-front';
    front.innerText = card.front;

    const back = document.createElement('div');
    back.className = 'flashcard-back';
    back.innerText = card.back;

    inner.appendChild(front);
    inner.appendChild(back);
    cardEl.appendChild(inner);
    grid.appendChild(cardEl);
  });

  container.appendChild(grid);
}

function renderQuizQuestion(container) {
  container.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'fade-in';
  
  if (currentQuestionIndex >= currentQuiz.length) {
    const scoreDiv = document.createElement('div');
    scoreDiv.style.textAlign = 'center';
    scoreDiv.innerHTML = `<h2>Quiz Complete! 🎉</h2><p style="font-size: 1.2rem; margin-top:10px;">Your score: ${userScore} / ${currentQuiz.length}</p>`;
    wrapper.appendChild(scoreDiv);
    container.appendChild(wrapper);
    return;
  }

  const qData = currentQuiz[currentQuestionIndex];
  
  const questionEl = document.createElement('h3');
  questionEl.className = 'quiz-question';
  questionEl.innerText = `Q${currentQuestionIndex + 1}. ${qData.question}`;
  wrapper.appendChild(questionEl);

  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'quiz-options';

  qData.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.innerText = opt;
    
    btn.onclick = () => {
      if (opt === qData.answer) {
        btn.classList.add('correct');
        userScore++;
      } else {
        btn.classList.add('wrong');
        Array.from(optionsContainer.children).forEach(child => {
          if (child.innerText === qData.answer) {
            child.classList.add('correct');
          }
        });
      }
      
      Array.from(optionsContainer.children).forEach(child => {
          if (child.tagName === 'BUTTON') child.disabled = true;
      });
      
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn-next fade-in';
      nextBtn.innerText = 'Next Question';
      nextBtn.onclick = () => {
        currentQuestionIndex++;
        renderQuizQuestion(container);
      };
      wrapper.appendChild(nextBtn);
    };
    optionsContainer.appendChild(btn);
  });
  
  wrapper.appendChild(optionsContainer);
  container.appendChild(wrapper);
}

// Map your existing buttons to call the function
function generateSummary() { callAI('summary'); }
function generateQuiz() { callAI('quiz'); }
function generateFlashcards() { callAI('flashcards'); }

// Dark mode logic
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  updateDarkModeButton(isDark);
}

function updateDarkModeButton(isDark) {
  const btn = document.getElementById('darkModeToggle');
  if (btn) {
    btn.innerText = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
  }
}

// Initialize dark mode on load
document.addEventListener('DOMContentLoaded', () => {
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) {
    document.body.classList.add('dark-mode');
  }
  updateDarkModeButton(isDark);
});

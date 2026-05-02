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
        readBtn.innerText = '🔊 Read Aloud';
        readBtn.style.marginTop = '15px';
        readBtn.style.backgroundColor = '#2196F3';
        readBtn.style.color = 'white';
        readBtn.style.border = 'none';
        readBtn.style.borderRadius = '5px';
        readBtn.style.padding = '8px 12px';
        
        readBtn.onclick = () => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            readBtn.innerText = '🔊 Read Aloud';
            readBtn.style.backgroundColor = '#2196F3';
          } else {
            const utterance = new SpeechSynthesisUtterance(data.result);
            utterance.onend = () => {
              readBtn.innerText = '🔊 Read Aloud';
              readBtn.style.backgroundColor = '#2196F3';
            };
            window.speechSynthesis.speak(utterance);
            readBtn.innerText = '⏹ Stop Reading';
            readBtn.style.backgroundColor = '#f44336';
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
  if (currentQuestionIndex >= currentQuiz.length) {
    const scoreDiv = document.createElement('div');
    scoreDiv.style.textAlign = 'center';
    scoreDiv.style.padding = '20px';
    scoreDiv.innerHTML = `<h2>Quiz Complete!</h2><p>Your score: ${userScore} / ${currentQuiz.length}</p>`;
    container.appendChild(scoreDiv);
    return;
  }

  const qData = currentQuiz[currentQuestionIndex];
  
  const questionEl = document.createElement('h3');
  questionEl.innerText = `Q${currentQuestionIndex + 1}. ${qData.question}`;
  container.appendChild(questionEl);

  const optionsContainer = document.createElement('div');
  optionsContainer.style.display = 'flex';
  optionsContainer.style.flexDirection = 'column';
  optionsContainer.style.gap = '10px';

  qData.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.innerText = opt;
    btn.style.padding = '10px';
    btn.style.textAlign = 'left';
    btn.style.backgroundColor = '#f0f0f0';
    btn.style.border = '1px solid #ccc';
    btn.style.borderRadius = '5px';
    btn.style.cursor = 'pointer';
    
    btn.onclick = () => {
      if (opt === qData.answer) {
        btn.style.backgroundColor = '#4CAF50';
        btn.style.color = 'white';
        userScore++;
      } else {
        btn.style.backgroundColor = '#f44336';
        btn.style.color = 'white';
        Array.from(optionsContainer.children).forEach(child => {
          if (child.innerText === qData.answer) {
            child.style.backgroundColor = '#4CAF50';
            child.style.color = 'white';
          }
        });
      }
      
      Array.from(optionsContainer.children).forEach(child => {
          if (child.tagName === 'BUTTON') child.disabled = true;
      });
      
      const nextBtn = document.createElement('button');
      nextBtn.innerText = 'Next Question';
      nextBtn.style.marginTop = '15px';
      nextBtn.style.padding = '10px';
      nextBtn.style.backgroundColor = '#2196F3';
      nextBtn.style.color = 'white';
      nextBtn.style.border = 'none';
      nextBtn.style.borderRadius = '5px';
      nextBtn.onclick = () => {
        currentQuestionIndex++;
        renderQuizQuestion(container);
      };
      container.appendChild(nextBtn);
    };
    optionsContainer.appendChild(btn);
  });
  
  container.appendChild(optionsContainer);
}

// Map your existing buttons to call the function
function generateSummary() { callAI('summary'); }
function generateQuiz() { callAI('quiz'); }
function generateFlashcards() { callAI('flashcards'); }

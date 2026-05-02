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

// Map your existing buttons to call the function
function generateSummary() { callAI('summary'); }
function generateQuiz() { callAI('quiz'); }
function generateFlashcards() { callAI('flashcards'); }

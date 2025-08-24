let questions = [];
let currentQuestionIndex = 0;
let currentLesson = 1;

async function loadData() {
  const params = new URLSearchParams(window.location.search);
  currentLesson = parseInt(params.get("lesson")) || 1;

  const res = await fetch("data.json");
  const data = await res.json();

  // Mỗi bài = 20 câu
  const start = (currentLesson - 1) * 20;
  const end = start + 20;
  questions = data.slice(start, end);

  loadQuestion();
}

function loadQuestion() {
  if (currentQuestionIndex >= questions.length) {
    document.getElementById("question-title").innerText = "🎉 Bạn đã hoàn thành bài này!";
    document.getElementById("options").innerHTML = "";
    document.getElementById("next-btn").style.display = "none";
    return;
  }

  const q = questions[currentQuestionIndex];

  document.getElementById("question-title").innerText = `(${currentQuestionIndex+1}) ${q.kanji}`;
  document.getElementById("result").innerText = "";
  document.getElementById("full-info").innerHTML = "";

  // tạo 4 đáp án
  let options = [q.hiragana];
  while (options.length < 4) {
    let random = questions[Math.floor(Math.random() * questions.length)].hiragana;
    if (!options.includes(random)) {
      options.push(random);
    }
  }
  options.sort(() => Math.random() - 0.5);

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "option-btn";
    btn.onclick = () => checkAnswer(opt, q);
    optionsDiv.appendChild(btn);
  });
}

function checkAnswer(answer, q) {
  const result = document.getElementById("result");
  if (answer === q.hiragana) {
    result.innerText = "✅ Đúng rồi!";
    result.style.color = "green";
  } else {
    result.innerText = "❌ Sai rồi!";
    result.style.color = "red";
  }

  document.getElementById("full-info").innerHTML = `
    <p><b>Kanji:</b> ${q.kanji}</p>
    <p><b>Hiragana:</b> ${q.hiragana}</p>
    <p><b>Hán Việt:</b> ${q.hanviet}</p>
    <p><b>Nghĩa:</b> ${q.nghia}</p>
  `;
}

function nextQuestion() {
  currentQuestionIndex++;
  loadQuestion();
}

function goHome() {
  window.location.href = "index.html";
}

// Chỉ load khi ở quiz.html
if (window.location.pathname.endsWith("quiz.html")) {
  loadData();
}

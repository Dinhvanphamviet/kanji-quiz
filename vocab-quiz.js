/* =========================
   DỮ LIỆU QUIZ - vocab-quiz.js
========================= */

let vocabQuestions = [];
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let answered = false;
let mode = "kanji-meaning"; // mặc định

// Hàm trộn mảng
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Load quiz
async function loadVocabQuiz() {
  const params = new URLSearchParams(window.location.search);
  const unit = parseInt(params.get("unit"));
  const start = parseInt(params.get("start")) || 0;
  const end = parseInt(params.get("end")) || 20;
  mode = params.get("mode") || "kanji-meaning";

  try {
    const res = await fetch("vocab.json");
    const data = await res.json();

    // Lọc câu hỏi theo unit và khoảng start-end
    vocabQuestions = data.filter(q => q.unit === unit).slice(start, end);
    shuffleArray(vocabQuestions);

    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;

    loadVocabQuestion();
  } catch (err) {
    console.error("Lỗi load vocab.json:", err);
    document.getElementById("vocab-question-title").innerText = "❌ Lỗi tải dữ liệu!";
  }
}

// Hiển thị câu hỏi
function loadVocabQuestion() {
  const qTitle = document.getElementById("vocab-question-title");
  const optionsDiv = document.getElementById("vocab-options");
  const resultDiv = document.getElementById("vocab-result");
  const fullInfo = document.getElementById("vocab-full-info");
  const nextBtn = document.getElementById("vocab-next-btn");

  if (currentIndex >= vocabQuestions.length) {
    qTitle.innerText = "🎉 Chúc mừng! Bạn đã hoàn thành Unit này!";
    optionsDiv.style.display = "none";
    nextBtn.style.display = "none";
    fullInfo.style.display = "none";
    resultDiv.innerText = `✅ Đúng: ${correctCount} | ❌ Sai: ${wrongCount}`;
    resultDiv.style.color = "#2c3e50";
    return;
  }

  const q = vocabQuestions[currentIndex];

  // Xác định câu hỏi hiển thị theo mode
  let questionText = "";
  if (mode === "kanji-meaning") questionText = q.kanji;
  else if (mode === "hiragana-meaning") questionText = q.hiragana;
  else if (mode === "kanji-hiragana") questionText = q.kanji;

  qTitle.innerText = `(${currentIndex + 1}) ${questionText}`;
  resultDiv.innerText = "";
  fullInfo.style.display = "none";
  fullInfo.innerHTML = "";
  nextBtn.style.display = "none";
  answered = false;

  // Tạo 4 đáp án
  let correctAnswer = "";
  if (mode === "kanji-meaning" || mode === "hiragana-meaning") correctAnswer = q.meaning;
  else if (mode === "kanji-hiragana") correctAnswer = q.hiragana;

  let options = [correctAnswer];
  while (options.length < 4) {
    let rand = vocabQuestions[Math.floor(Math.random() * vocabQuestions.length)];
    let candidate =
      mode === "kanji-meaning" || mode === "hiragana-meaning" ? rand.meaning : rand.hiragana;

    if (!options.includes(candidate)) options.push(candidate);
  }
  shuffleArray(options);

  // Tạo button đáp án
  optionsDiv.innerHTML = "";
  optionsDiv.style.display = "grid";
  optionsDiv.style.gridTemplateColumns = window.innerWidth < 640 ? "1fr" : "repeat(2, 1fr)";
  optionsDiv.style.gap = "12px";

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "option-btn px-4 py-2 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 transition text-xl font-semibold";
    btn.onclick = () => checkVocabAnswer(opt, q);
    optionsDiv.appendChild(btn);
  });
}

// Kiểm tra đáp án
function checkVocabAnswer(answer, q) {
  const resultDiv = document.getElementById("vocab-result");
  const fullInfo = document.getElementById("vocab-full-info");
  const nextBtn = document.getElementById("vocab-next-btn");

  let correctAnswer = mode === "kanji-meaning" || mode === "hiragana-meaning" ? q.meaning : q.hiragana;

  if (!answered) {
    if (answer === correctAnswer) {
      correctCount++;
      resultDiv.innerText = "✅ Chính xác!";
      resultDiv.style.color = "green";
    } else {
      wrongCount++;
      resultDiv.innerText = "❌ Sai rồi!";
      resultDiv.style.color = "red";
    }
    answered = true;
  }

  fullInfo.innerHTML = `
    <p><b>Kanji:</b> ${q.kanji}</p>
    <p><b>Hiragana:</b> ${q.hiragana}</p>
    <p><b>Hán Tự:</b> ${q.hanTu}</p>
    <p><b>Nghĩa:</b> ${q.meaning}</p>
  `;
  fullInfo.style.display = "block";
  nextBtn.style.display = "block";
}

// Câu tiếp theo
function nextVocabQuestion() {
  currentIndex++;
  loadVocabQuestion();
}

function goVocabBack() {
  if (currentIndex === 0) {
    // Câu đầu tiên → về trang Unit
    window.location.href = "vocab.html";
  } else {
    // Các câu sau → quay lại câu trước
    currentIndex--;
    loadVocabQuestion();
  }
}



// Chỉ chạy khi ở vocab-quiz.html
if (window.location.pathname.endsWith("vocab-quiz.html")) {
  loadVocabQuiz();

  // Cập nhật responsive layout khi resize
  window.addEventListener("resize", () => {
    const optionsDiv = document.getElementById("vocab-options");
    if (optionsDiv) {
      optionsDiv.style.gridTemplateColumns = window.innerWidth < 640 ? "1fr" : "repeat(2, 1fr)";
    }
  });
}

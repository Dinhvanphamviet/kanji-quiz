/* =========================
   DỮ LIỆU QUIZ - vocab-quiz.js
========================= */

let vocabQuestions = [];
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let answered = false;
let mode = "kanji-meaning"; // mặc định
let unitData = []; // lưu toàn bộ dữ liệu 1 unit

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

    // Lưu dữ liệu unit hiện tại
    unitData = data.filter(q => q.unit === unit);

    // Lọc câu hỏi theo unit và khoảng start-end
    vocabQuestions = unitData.slice(start, end);
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
    showFinalResult();
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
    btn.className =
      "option-btn px-4 py-2 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 transition text-xl font-semibold";
    btn.onclick = () => checkVocabAnswer(opt, q);
    optionsDiv.appendChild(btn);
  });
}

// Kiểm tra đáp án
function checkVocabAnswer(answer, q) {
  const resultDiv = document.getElementById("vocab-result");
  const fullInfo = document.getElementById("vocab-full-info");
  const nextBtn = document.getElementById("vocab-next-btn");

  let correctAnswer =
    mode === "kanji-meaning" || mode === "hiragana-meaning" ? q.meaning : q.hiragana;

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

  // Nếu là câu cuối cùng thì tự động show kết quả sau 4s
  if (currentIndex === vocabQuestions.length - 1) {
    setTimeout(showFinalResult, 3000);
  } else {
    nextBtn.style.display = "block";
  }
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

// Hiển thị kết quả cuối cùng
function showFinalResult() {
  const qTitle = document.getElementById("vocab-question-title");
  const optionsDiv = document.getElementById("vocab-options");
  const resultDiv = document.getElementById("vocab-result");
  const fullInfo = document.getElementById("vocab-full-info");
  const nextBtn = document.getElementById("vocab-next-btn");

  const params = new URLSearchParams(window.location.search);
  const unit = parseInt(params.get("unit"));
  const start = parseInt(params.get("start")) || 0;
  const end = parseInt(params.get("end")) || 20;
  const currentMode = params.get("mode") || "kanji-meaning";

  qTitle.innerText = "🎉 Chúc mừng! Bạn đã hoàn thành bài học!";
  optionsDiv.style.display = "none";
  nextBtn.style.display = "none";
  fullInfo.style.display = "none";
  resultDiv.innerText = `✅ Đúng: ${correctCount} | ❌ Sai: ${wrongCount}`;
  resultDiv.style.color = "#2c3e50";

  // Ẩn nav cũ
  const oldNav = document.getElementById("quiz-nav-default");
  if (oldNav) oldNav.style.display = "none";

  // Nav mới
  const navDiv = document.createElement("div");
  navDiv.className = "flex flex-wrap justify-center gap-4 w-full mt-6";

  // Nút Vocab Quiz
  const homeBtn = document.createElement("button");
  homeBtn.className =
    "px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition";
  homeBtn.textContent = "Vocab Quiz";
  homeBtn.onclick = () => (window.location.href = "vocab.html");
  navDiv.appendChild(homeBtn);

  // Xác định nút tiếp theo
  const totalQuestions = unitData.length;
  const questionsPerLesson = end - start;
  const currentLesson = Math.floor(start / questionsPerLesson) + 1;
  const totalLessons = Math.ceil(totalQuestions / questionsPerLesson);

  const nextBtnNav = document.createElement("button");
  nextBtnNav.className =
    "px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition";

  if (currentLesson < totalLessons) {
    // Còn bài tiếp theo trong unit
    nextBtnNav.textContent = "Bài tiếp theo";
    const nextStart = start + questionsPerLesson;
    const nextEnd = nextStart + questionsPerLesson;
    nextBtnNav.onclick = () => {
      window.location.href = `vocab-quiz.html?unit=${unit}&start=${nextStart}&end=${nextEnd}&mode=${currentMode}`;
    };
  } else {
    // Hết unit → sang unit tiếp theo
    nextBtnNav.textContent = "Unit tiếp theo";
    const nextUnit = unit + 1;
    nextBtnNav.onclick = () => {
      window.location.href = `vocab-quiz.html?unit=${nextUnit}&start=0&end=20&mode=${currentMode}`;
    };
  }

  navDiv.appendChild(nextBtnNav);
  resultDiv.insertAdjacentElement("afterend", navDiv);
}

// Chỉ chạy khi ở vocab-quiz.html
if (window.location.pathname.endsWith("vocab-quiz.html")) {
  loadVocabQuiz();

  // Cập nhật responsive layout khi resize
  window.addEventListener("resize", () => {
    const optionsDiv = document.getElementById("vocab-options");
    if (optionsDiv) {
      optionsDiv.style.gridTemplateColumns =
        window.innerWidth < 640 ? "1fr" : "repeat(2, 1fr)";
    }
  });
}

let kanjiQuestions = [];
let kanjiIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let answered = false;
let mode = "kanji-hiragana"; // chế độ mặc định

// Trộn mảng
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Load quiz Kanji
async function loadKanjiQuiz() {
  const params = new URLSearchParams(window.location.search);
  const unit = parseInt(params.get("unit"));
  const start = parseInt(params.get("start")) || 0;
  const end = parseInt(params.get("end")) || 20;
  mode = params.get("mode") || "kanji-hiragana";

  try {
    const res = await fetch("kanji.json");
    const data = await res.json();
    kanjiQuestions = data.filter(q => q.unit === unit).slice(start, end);
    shuffleArray(kanjiQuestions);

    kanjiIndex = 0;
    correctCount = 0;
    wrongCount = 0;

    loadKanjiQuestion();
  } catch (err) {
    console.error("Lỗi load kanji.json:", err);
    document.getElementById("kanji-question-title").innerText = "❌ Lỗi tải dữ liệu!";
  }
}

// Hiển thị câu hỏi
function loadKanjiQuestion() {
  const qTitle = document.getElementById("kanji-question-title");
  const optionsDiv = document.getElementById("kanji-options");
  const resultDiv = document.getElementById("kanji-result");
  const fullInfo = document.getElementById("kanji-full-info");
  const nextBtn = document.getElementById("kanji-next-btn");

  if (kanjiIndex >= kanjiQuestions.length) {
    qTitle.innerText = "🎉 Bạn đã hoàn thành Unit này!";
    optionsDiv.style.display = "none";
    nextBtn.style.display = "none";
    fullInfo.style.display = "none";
    resultDiv.innerText = `✅ Đúng: ${correctCount} | ❌ Sai: ${wrongCount}`;
    resultDiv.style.color = "#2c3e50";
    return;
  }

  const q = kanjiQuestions[kanjiIndex];

  // Xác định câu hỏi hiển thị theo mode
  let questionText = "";
  if (mode === "kanji-hiragana") questionText = q.kanji;
  else if (mode === "hiragana-kanji") questionText = q.hiragana;
  else if (mode === "kanji-meaning") questionText = q.kanji;

  qTitle.innerText = `(${kanjiIndex + 1}) ${questionText}`;
  resultDiv.innerText = "";
  fullInfo.style.display = "none";
  fullInfo.innerHTML = "";
  nextBtn.style.display = "none";
  answered = false;

  // Tạo 4 đáp án
  let correctAnswer = "";
  if (mode === "kanji-hiragana") correctAnswer = q.hiragana;
  else if (mode === "hiragana-kanji") correctAnswer = q.kanji;
  else if (mode === "kanji-meaning") correctAnswer = q.nghia;

  let options = [correctAnswer];
  while (options.length < 4) {
    let rand = kanjiQuestions[Math.floor(Math.random() * kanjiQuestions.length)];
    let candidate = "";
    if (mode === "kanji-hiragana") candidate = rand.hiragana;
    else if (mode === "hiragana-kanji") candidate = rand.kanji;
    else if (mode === "kanji-meaning") candidate = rand.nghia;

    if (!options.includes(candidate)) options.push(candidate);
  }
  shuffleArray(options);

  optionsDiv.innerHTML = "";
  optionsDiv.style.display = "grid";
  optionsDiv.style.gridTemplateColumns = window.innerWidth < 640 ? "1fr" : "repeat(2, 1fr)";
  optionsDiv.style.gap = "12px";

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "option-btn px-4 py-2 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 transition text-xl font-semibold";
    btn.onclick = () => checkKanjiAnswer(opt, q);
    optionsDiv.appendChild(btn);
  });
}

// Kiểm tra đáp án
function checkKanjiAnswer(answer, q) {
  const resultDiv = document.getElementById("kanji-result");
  const fullInfo = document.getElementById("kanji-full-info");
  const nextBtn = document.getElementById("kanji-next-btn");

  let correctAnswer = "";
  if (mode === "kanji-hiragana") correctAnswer = q.hiragana;
  else if (mode === "hiragana-kanji") correctAnswer = q.kanji;
  else if (mode === "kanji-meaning") correctAnswer = q.nghia;

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
    <p><b>Hán Việt:</b> ${q.hanviet}</p>
    <p><b>Nghĩa:</b> ${q.nghia}</p>
  `;
  fullInfo.style.display = "block";
  nextBtn.style.display = "block";
}

// Câu tiếp theo
function nextKanjiQuestion() {
  kanjiIndex++;
  loadKanjiQuestion();
}

// Nút điều hướng linh hoạt
function goBack() {
  if (kanjiIndex === 0) {
    window.location.href = "kanji.html";
  } else {
    kanjiIndex--;
    loadKanjiQuestion();
  }
}

// Chỉ chạy khi ở kanji-quiz.html
if (window.location.pathname.endsWith("kanji-quiz.html")) {
  loadKanjiQuiz();

  window.addEventListener("resize", () => {
    const optionsDiv = document.getElementById("kanji-options");
    if (optionsDiv) {
      optionsDiv.style.gridTemplateColumns = window.innerWidth < 640 ? "1fr" : "repeat(2, 1fr)";
    }
  });
}

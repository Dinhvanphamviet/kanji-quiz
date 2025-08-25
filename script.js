/* =========================
   DỮ LIỆU TRANG CHỦ - CHỌN BÀI
========================= */

const questionsPerLesson = 20;

// Tạo nút bài cho từng phần
function createLessonButtons(containerId, startQ, endQ) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const totalQuestions = endQ - startQ + 1;
  const totalLessons = Math.ceil(totalQuestions / questionsPerLesson);

  for (let i = 0; i < totalLessons; i++) {
    const lessonStart = startQ + i * questionsPerLesson;
    let lessonEnd = lessonStart + questionsPerLesson - 1;
    if (lessonEnd > endQ) lessonEnd = endQ;

    const btn = document.createElement("button");
    btn.textContent = `Bài ${i + 1}`;
    btn.className = "lesson-btn";

    // Lấy tab từ containerId
    const tabNumber = containerId.replace("part", "");

    btn.onclick = () => {
      window.location.href = `quiz.html?start=${lessonStart}&end=${lessonEnd}&tab=${tabNumber}`;
    };
    container.appendChild(btn);
  }
}

// Chỉ chạy trên index.html
if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
  const tabButtons = document.querySelectorAll(".tab-btn");

  // Lấy tab từ URL param, mặc định 1
  const urlParams = new URLSearchParams(window.location.search);
  const savedTab = urlParams.get("tab") || "1";

  tabButtons.forEach(btn => {
    const partId = "part" + btn.dataset.part;
    const content = document.getElementById(partId);

    if (btn.dataset.part === savedTab) {
      btn.classList.add("active");
      content.style.display = "grid";
    } else {
      btn.classList.remove("active");
      content.style.display = "none";
    }

    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none");
      content.style.display = "grid";
    });
  });

  // Tạo các bài cho từng phần
  createLessonButtons("part1", 1, 197);
  createLessonButtons("part2", 198, 295);
  createLessonButtons("part3", 296, 345);
}

/* =========================
   DỮ LIỆU QUIZ
========================= */

let questions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let answered = false; // cờ đánh dấu câu hiện tại đã trả lời chưa

// Load dữ liệu quiz
async function loadData() {
  const params = new URLSearchParams(window.location.search);
  const startSTT = parseInt(params.get("start")) || 1;
  const endSTT = parseInt(params.get("end")) || 20;

  const res = await fetch("data.json");
  const data = await res.json();

  // Lọc câu hỏi dựa trên STT
  questions = data.filter(q => q.STT >= startSTT && q.STT <= endSTT);

  currentQuestionIndex = 0;
  correctCount = 0;
  wrongCount = 0;

  loadQuestion();
}

// Hiển thị câu hỏi
function loadQuestion() {
  const questionTitle = document.getElementById("question-title");
  const optionsDiv = document.getElementById("options");
  const resultDiv = document.getElementById("result");
  const fullInfo = document.getElementById("full-info");
  const nextBtn = document.getElementById("next-btn");

  if (currentQuestionIndex >= questions.length) {
    questionTitle.innerText = "🎉 Chúc mừng! Bạn đã hoàn thành bài này!";
    optionsDiv.style.display = "none";
    nextBtn.style.display = "none";
    fullInfo.style.display = "none";
    resultDiv.innerText = `✅ Số câu đúng: ${correctCount} | ❌ Số câu sai: ${wrongCount}`;
    resultDiv.style.color = "#2c3e50";
    return;
  }

  const q = questions[currentQuestionIndex];

  questionTitle.innerText = `(${currentQuestionIndex + 1}) ${q.kanji}`;
  resultDiv.innerText = "";
  fullInfo.style.display = "none";
  fullInfo.innerHTML = "";
  nextBtn.style.display = "none";

  answered = false; // reset cờ khi load câu mới

  // tạo 4 đáp án
  let options = [q.hiragana];
  while (options.length < 4) {
    let random = questions[Math.floor(Math.random() * questions.length)].hiragana;
    if (!options.includes(random)) options.push(random);
  }
  options.sort(() => Math.random() - 0.5);

  optionsDiv.innerHTML = "";
  optionsDiv.style.display = "grid";

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "option-btn";
    btn.onclick = () => checkAnswer(opt, q);
    optionsDiv.appendChild(btn);
  });
}

// Kiểm tra đáp án
function checkAnswer(answer, q) {
  const resultDiv = document.getElementById("result");
  const fullInfo = document.getElementById("full-info");
  const nextBtn = document.getElementById("next-btn");

  // Chỉ tính số câu đúng/sai khi chưa trả lời
  if (!answered) {
    if (answer === q.hiragana) {
      correctCount++;
      resultDiv.innerText = "✅ Đúng rồi!";
      resultDiv.style.color = "green";
    } else {
      wrongCount++;
      resultDiv.innerText = "❌ Sai rồi!";
      resultDiv.style.color = "red";
    }
    answered = true; // đánh dấu đã trả lời
  } else {
    // Nếu nhấn lần 2-3, chỉ hiện thông báo mà không cộng số
    if (answer === q.hiragana) {
      resultDiv.innerText = "✅ Đúng rồi!";
      resultDiv.style.color = "green";
    } else {
      resultDiv.innerText = "❌ Sai rồi!";
      resultDiv.style.color = "red";
    }
  }

  // Hiển thị info box
  fullInfo.innerHTML = `
    <p><b>Kanji:</b> ${q.kanji}</p>
    <p><b>Hiragana:</b> ${q.hiragana}</p>
    <p><b>Hán Việt:</b> ${q.hanviet}</p>
    <p><b>Nghĩa:</b> ${q.nghia}</p>
  `;
  fullInfo.style.display = "block";

  // Hiển thị nút tiếp theo
  nextBtn.style.display = "block";
}

// Chuyển câu tiếp theo
function nextQuestion() {
  currentQuestionIndex++;
  loadQuestion();
}

// Quay về trang chủ, giữ tab hiện tại
function goHome() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab") || "1"; // mặc định tab 1
  window.location.href = `index.html?tab=${tab}`;
}

// Chỉ load quiz nếu là quiz.html
if (window.location.pathname.endsWith("quiz.html")) {
  loadData();
}

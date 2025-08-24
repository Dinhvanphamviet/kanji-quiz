let questions = [];
let currentQuestionIndex = 0;
let currentLesson = 1;
let correctCount = 0; // Số câu trả lời đúng
let wrongCount = 0;   // Số câu trả lời sai

// Load dữ liệu từ JSON
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

// Hiển thị câu hỏi
function loadQuestion() {
  // Khi hết bài
  if (currentQuestionIndex >= questions.length) {
    document.getElementById("question-title").innerText = "🎉 Chúc mừng! Bạn đã hoàn thành bài này!";

    // Ẩn khu vực đáp án, info box và nút next
    document.getElementById("options").style.display = "none";
    document.getElementById("next-btn").style.display = "none";
    document.getElementById("full-info").style.display = "none";
    document.getElementById("full-info").innerHTML = "";

    // Hiển thị thống kê số câu đúng/sai
    document.getElementById("result").innerText = `✅ Số câu đúng: ${correctCount} | ❌ Số câu sai: ${wrongCount}`;
    document.getElementById("result").style.color = "#2c3e50";
    return;
  }

  const q = questions[currentQuestionIndex];

  // Hiển thị lại options khi load câu hỏi mới
  const optionsDiv = document.getElementById("options");
  optionsDiv.style.display = "grid"; // hiển thị lại
  optionsDiv.innerHTML = "";

  document.getElementById("question-title").innerText = `(${currentQuestionIndex + 1}) ${q.kanji}`;
  document.getElementById("result").innerText = "";
  document.getElementById("full-info").style.display = "none";
  document.getElementById("full-info").innerHTML = "";
  document.getElementById("next-btn").style.display = "none";

  // tạo 4 đáp án
  let options = [q.hiragana];
  while (options.length < 4) {
    let random = questions[Math.floor(Math.random() * questions.length)].hiragana;
    if (!options.includes(random)) {
      options.push(random);
    }
  }
  options.sort(() => Math.random() - 0.5);

  // Hiển thị các nút đáp án
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
  const result = document.getElementById("result");
  const fullInfo = document.getElementById("full-info");

  if (answer === q.hiragana) {
    result.innerText = "✅ Đúng rồi!";
    result.style.color = "green";
    correctCount++;
  } else {
    result.innerText = "❌ Sai rồi!";
    result.style.color = "red";
    wrongCount++;
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
  document.getElementById("next-btn").style.display = "block";
}

// Chuyển sang câu tiếp theo
function nextQuestion() {
  currentQuestionIndex++;
  loadQuestion();
}

// Quay về trang chính
function goHome() {
  window.location.href = "index.html";
}

// Chỉ load khi ở quiz.html
if (window.location.pathname.endsWith("quiz.html")) {
  loadData();
}

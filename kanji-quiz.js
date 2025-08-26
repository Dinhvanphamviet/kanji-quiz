/* =========================
   DỮ LIỆU QUIZ - Kanji
========================= */

let kanjiQuestions = [];
let kanjiIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let answered = false;

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

  console.log("Unit:", unit, "Start:", start, "End:", end);

  try {
    const res = await fetch("kanji.json");
    const data = await res.json();
    console.log("Data loaded:", data.length);

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
  qTitle.innerText = `(${kanjiIndex + 1}) ${q.kanji}`;
  resultDiv.innerText = "";
  fullInfo.style.display = "none";
  fullInfo.innerHTML = "";
  nextBtn.style.display = "none";
  answered = false;

  // Tạo 4 đáp án (hiragana)
  let options = [q.hiragana];
  while (options.length < 4) {
    let r = kanjiQuestions[Math.floor(Math.random() * kanjiQuestions.length)].hiragana;
    if (!options.includes(r)) options.push(r);
  }
  shuffleArray(options);

  optionsDiv.innerHTML = "";
  optionsDiv.style.display = "grid";
  optionsDiv.style.gridTemplateColumns = "repeat(2, 1fr)"; // desktop 2 cột
  optionsDiv.style.gap = "12px"; // khoảng cách giữa các nút
  optionsDiv.style.marginTop = "8px";

  // Responsive: mobile < 640px thì 1 cột
  if (window.innerWidth < 640) {
    optionsDiv.style.gridTemplateColumns = "1fr";
  }

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

  if (!answered) {
    if (answer === q.hiragana) {
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
  const nextBtn = document.getElementById("kanji-next-btn");
  if (kanjiIndex === 0) {
    // Câu đầu tiên → về Unit
    window.location.href = "kanji.html";
  } else {
    // Các câu sau → quay lại câu trước
    kanjiIndex--;
    loadKanjiQuestion();
  }
}


// Chỉ chạy khi ở kanji-quiz.html
if (window.location.pathname.endsWith("kanji-quiz.html")) {
  loadKanjiQuiz();

  // Nếu resize màn hình thì update layout đáp án
  window.addEventListener("resize", () => {
    const optionsDiv = document.getElementById("kanji-options");
    if (optionsDiv) {
      optionsDiv.style.gridTemplateColumns = window.innerWidth < 640 ? "1fr" : "repeat(2, 1fr)";
    }
  });
}

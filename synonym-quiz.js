/* =========================
   SYNONYM QUIZ - synonym-quiz.js
========================= */

const synonymPerLesson = 20;

let synonymQuestions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let answered = false;
let totalLessonsInUnit = 1; // số bài trong unit hiện tại
let maxUnit = 1; // unit lớn nhất có trong file

// Lấy unit & lesson từ URL
const params = new URLSearchParams(window.location.search);
const unitId = parseInt(params.get("unit")) || 1;
const lesson = parseInt(params.get("lesson")) || 1;

async function loadSynonymQuiz() {
  try {
    const res = await fetch("synonym.json");
    const data = await res.json();

    // Tính số lượng unit tối đa (để biết unit cuối cùng)
    maxUnit = Math.max(...data.map(q => q.unit));

    // Lọc câu hỏi đúng unit
    const unitQuestions = data.filter(q => q.unit === unitId);

    // Tính tổng số bài trong unit này
    totalLessonsInUnit = Math.ceil(unitQuestions.length / synonymPerLesson);

    // Tính start & end theo lesson
    const start = (lesson - 1) * synonymPerLesson;
    const end = Math.min(start + synonymPerLesson, unitQuestions.length);

    synonymQuestions = unitQuestions.slice(start, end);

    if (synonymQuestions.length === 0) {
      document.getElementById("synonym-question-title").textContent =
        "Không có câu hỏi trong bài này.";
      return;
    }

    correctCount = 0;
    currentQuestionIndex = 0;
    showSynonymQuestion();
  } catch (err) {
    console.error("Lỗi load synonym.json:", err);
  }
}

function showSynonymQuestion() {
  const question = synonymQuestions[currentQuestionIndex];
  if (!question) return;

  answered = false;

  document.getElementById("synonym-result").textContent = "";
  document.getElementById("synonym-next-btn").classList.add("hidden");
  document.getElementById("synonym-full-info").classList.add("hidden");

  document.getElementById("synonym-question-title").innerHTML =
    `${currentQuestionIndex + 1}: ${question.question.replace(
      question.word,
      `<span class="underline font-bold text-indigo-700">${question.word}</span>`
    )}`;

  const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
  const optionsDiv = document.getElementById("synonym-options");
  optionsDiv.innerHTML = "";

  shuffledOptions.forEach(opt => {
    const btn = document.createElement("button");
    btn.className =
      "option-btn px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition";
    btn.textContent = opt;
    btn.onclick = () => checkSynonymAnswer(opt, question);
    optionsDiv.appendChild(btn);
  });

  document.getElementById("next-lesson-btn")?.classList.add("hidden");
}

function checkSynonymAnswer(selected, question) {
  if (answered) return;
  answered = true;

  const resultDiv = document.getElementById("synonym-result");

  if (selected === question.answer) {
    correctCount++;
    resultDiv.textContent = "✅ Chính xác!";
    resultDiv.className = "text-green-600 font-bold mb-4";
  } else {
    resultDiv.textContent = `❌ Sai rồi. Đáp án đúng: ${question.answer}`;
    resultDiv.className = "text-red-600 font-bold mb-4";
  }

  const infoDiv = document.getElementById("synonym-full-info");
  infoDiv.innerHTML = `
    <p><b>Từ:</b> ${question.word} (${question.hiragana})</p>
    <p><b>Hán Việt:</b> ${question.hanviet}</p>
    <p><b>Nghĩa:</b> ${question.meaning}</p>
  `;
  infoDiv.classList.remove("hidden");

  document.getElementById("synonym-next-btn").classList.remove("hidden");

  document.querySelectorAll(".option-btn").forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === question.answer) {
      btn.classList.add("bg-green-200");
    } else if (btn.textContent === selected) {
      btn.classList.add("bg-red-200");
    }
  });
}

function nextSynonymQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < synonymQuestions.length) {
    showSynonymQuestion();
  } else {
    showFinalResult();
  }
}

function showFinalResult() {
  document.getElementById("synonym-question-title").innerHTML =
    `🎉 Bạn đã hoàn thành bài ${lesson}!<br>
     ✅ Kết quả: <b>${correctCount}/${synonymQuestions.length}</b> câu đúng.`;

  document.getElementById("synonym-options").innerHTML = "";
  document.getElementById("synonym-result").textContent = "";
  document.getElementById("synonym-next-btn").classList.add("hidden");
  document.getElementById("synonym-full-info").classList.add("hidden");

  const nextLessonBtn = document.getElementById("next-lesson-btn");

  if (nextLessonBtn) {
    // Kiểm tra xem còn bài tiếp theo không
    const isLastLessonInUnit = lesson >= totalLessonsInUnit;
    const isLastUnit = unitId >= maxUnit;

    if (isLastLessonInUnit && isLastUnit) {
      nextLessonBtn.classList.add("hidden"); // không còn bài nào nữa
    } else {
      nextLessonBtn.classList.remove("hidden");
    }
  }

  const backBtn = document.getElementById("synonym-back-btn");
  if (backBtn) {
    backBtn.textContent = "🔄 Làm lại";
    backBtn.onclick = restartCurrentLesson;
  }
}

function restartCurrentLesson() {
  correctCount = 0;
  currentQuestionIndex = 0;
  showSynonymQuestion();

  const backBtn = document.getElementById("synonym-back-btn");
  if (backBtn) {
    backBtn.textContent = "⬅️ Quay lại";
    backBtn.onclick = goBack;
  }
}

function goToNextLesson() {
  const isLastLessonInUnit = lesson >= totalLessonsInUnit;
  const isLastUnit = unitId >= maxUnit;

  if (isLastLessonInUnit) {
    if (!isLastUnit) {
      // Sang bài 1 của unit tiếp theo
      window.location.href = `synonym-quiz.html?unit=${unitId + 1}&lesson=1`;
    }
  } else {
    // Sang bài tiếp theo của cùng unit
    window.location.href = `synonym-quiz.html?unit=${unitId}&lesson=${lesson + 1}`;
  }
}

function goBack() {
  if (currentQuestionIndex === 0) {
    window.location.href = "synonym.html";
  } else {
    currentQuestionIndex--;
    showSynonymQuestion();
  }
}

if (window.location.pathname.endsWith("synonym-quiz.html")) {
  loadSynonymQuiz();
}

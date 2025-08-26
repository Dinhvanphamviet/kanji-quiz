/* =========================
   TRANG CHỌN UNIT - kanji.html
========================= */

const kanjiPerLesson = 20;

async function loadKanjiUnits() {
  try {
    const res = await fetch("kanji.json");
    const data = await res.json();

    const units = {};
    data.forEach(item => {
      if (!units[item.unit]) units[item.unit] = [];
      units[item.unit].push(item);
    });

    const unitGrid = document.getElementById("kanji-unit-grid");

    Object.keys(units).forEach(unitId => {
      const kanjiList = units[unitId];
      const totalLessons = Math.ceil(kanjiList.length / kanjiPerLesson);

      const card = document.createElement("div");
      card.className = "unit-card w-full bg-white rounded-2xl shadow p-4";

      card.innerHTML = `
        <div>
          <div class="unit-title text-xl font-semibold mb-2">Unit ${unitId}</div>
          <div class="unit-info text-gray-600 mb-2">
            🈶 ${kanjiList.length} từ Kanji<br>
            📂 ${totalLessons} bài
          </div>
        </div>
        <button class="detail-btn px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Chi tiết
        </button>
        <div class="lesson-list mt-4 hidden grid gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"></div>
      `;

      const detailBtn = card.querySelector(".detail-btn");
      const lessonList = card.querySelector(".lesson-list");

      detailBtn.addEventListener("click", () => {
        // Đóng các unit khác
        document.querySelectorAll(".unit-card .lesson-list").forEach(list => {
          if (list !== lessonList) {
            list.classList.add("hidden");
            const otherBtn = list.parentElement.querySelector(".detail-btn");
            if (otherBtn) otherBtn.textContent = "Chi tiết";
          }
        });

        // Toggle unit hiện tại
        lessonList.classList.toggle("hidden");
        detailBtn.textContent = lessonList.classList.contains("hidden") ? "Chi tiết" : "Đóng";

        // Sinh bài lần đầu
        if (lessonList.innerHTML === "") {
          for (let i = 0; i < totalLessons; i++) {
            const btn = document.createElement("button");
            btn.className = "lesson-btn px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition w-full sm:w-auto text-center";
            btn.textContent = `Bài ${i + 1}`;

            const start = i * kanjiPerLesson;
            const end = Math.min(start + kanjiPerLesson, kanjiList.length);

            // Tất cả unit đều hiện popup chọn chế độ
            btn.onclick = () => showKanjiModeSelection(unitId, start, end);

            lessonList.appendChild(btn);
          }
        }
      });

      unitGrid.appendChild(card);
    });
  } catch (err) {
    console.error("Lỗi load kanji.json:", err);
  }
}

// Popup chọn mode quiz cho Kanji
function showKanjiModeSelection(unitId, start, end, defaultMode = "kanji-hiragana") {
  const overlay = document.createElement("div");
  overlay.className = "overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50";

  const box = document.createElement("div");
  box.className = "mode-box bg-white rounded-xl p-6 shadow-lg flex flex-col gap-3";

  box.innerHTML = `
    <h3 class="text-lg font-semibold mb-2">Chọn dạng Quiz</h3>
    <button class="mode-btn px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition" data-mode="kanji-hiragana">Kanji ➝ Hiragana</button>
    <button class="mode-btn px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition" data-mode="hiragana-kanji">Hiragana ➝ Kanji</button>
    <button class="mode-btn px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition" data-mode="kanji-meaning">Kanji ➝ Nghĩa</button>
    <button class="mode-cancel px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition mt-2">Hủy</button>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // Highlight nút mặc định
  const defaultBtn = box.querySelector(`.mode-btn[data-mode="${defaultMode}"]`);
  if (defaultBtn) defaultBtn.style.border = "2px solid yellow";

  box.querySelectorAll(".mode-btn").forEach(btn => {
    btn.onclick = () => {
      const mode = btn.dataset.mode;
      window.location.href = `kanji-quiz.html?unit=${unitId}&start=${start}&end=${end}&mode=${mode}`;
    };
  });

  box.querySelector(".mode-cancel").onclick = () => document.body.removeChild(overlay);
}

if (window.location.pathname.endsWith("kanji.html")) {
  loadKanjiUnits();
}

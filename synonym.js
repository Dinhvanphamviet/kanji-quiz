/* =========================
   TRANG CHỌN UNIT - synonym.html
========================= */

const synonymPerLesson = 20;

async function loadSynonymUnits() {
  try {
    const res = await fetch("synonym.json");
    const data = await res.json();

    // Gom dữ liệu theo unit
    const units = {};
    data.forEach(item => {
      if (!units[item.unit]) units[item.unit] = [];
      units[item.unit].push(item);
    });

    const unitGrid = document.getElementById("synonym-unit-grid");

    Object.keys(units).forEach(unitId => {
      const synonymList = units[unitId];
      const totalLessons = Math.ceil(synonymList.length / synonymPerLesson);

      const card = document.createElement("div");
      card.className = "unit-card w-full bg-white rounded-2xl shadow p-4";

      card.innerHTML = `
        <div>
          <div class="unit-title text-xl font-semibold mb-2">Unit ${unitId}</div>
          <div class="unit-info text-gray-600 mb-2">
            🔄 ${synonymList.length} từ Synonym<br>
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

        // Sinh danh sách bài khi mở lần đầu
        if (lessonList.innerHTML === "") {
          for (let i = 0; i < totalLessons; i++) {
            const btn = document.createElement("button");
            btn.className =
              "lesson-btn px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition w-full sm:w-auto text-center";
            btn.textContent = `Bài ${i + 1}`;

            // 👉 Chỉ truyền unit & lesson vào URL
            btn.onclick = () => {
              window.location.href = `synonym-quiz.html?unit=${unitId}&lesson=${i + 1}`;
            };

            lessonList.appendChild(btn);
          }
        }
      });

      unitGrid.appendChild(card);
    });
  } catch (err) {
    console.error("Lỗi load synonym.json:", err);
  }
}

if (window.location.pathname.endsWith("synonym.html")) {
  loadSynonymUnits();
}

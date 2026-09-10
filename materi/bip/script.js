/*==================================================
    MATERI 6: BITCOIN IMPROVEMENT PROPOSAL (BIP) — SCRIPT
==================================================*/

/*------------------------------------------------
    READING PROGRESS BAR
------------------------------------------------*/
function updateReadingProgress() {
    const fill = document.getElementById("readingProgressFill");
    if (!fill) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;

    fill.style.width = percent + "%";
}

/*------------------------------------------------
    POPUP KECIL (REUSABLE)
    Pola identik dengan materi sebelumnya — showPopup(data)
    adalah fungsi inti, openPopup(title, text) pemanggil
    sederhana untuk istilah glossary & node diagram.
------------------------------------------------*/
function showPopup(data) {
    const backdrop = document.getElementById("popupBackdrop");
    const box = document.getElementById("popupBox");
    const titleEl = document.getElementById("popupTitle");
    const textEl = document.getElementById("popupText");
    const iconWrap = document.getElementById("popupIconWrap");
    const metaEl = document.getElementById("popupMeta");
    const featuresEl = document.getElementById("popupFeatures");
    const noteEl = document.getElementById("popupNote");
    if (!backdrop || !titleEl || !textEl) return;

    titleEl.textContent = data.title || "";
    textEl.textContent = data.text || "";

    if (iconWrap) iconWrap.style.display = "none";
    if (metaEl) metaEl.style.display = "none";
    if (featuresEl) { featuresEl.style.display = "none"; featuresEl.innerHTML = ""; }
    if (noteEl) noteEl.style.display = "none";

    box.classList.remove("anim-fade-scale");
    void box.offsetWidth;
    box.classList.add("anim-fade-scale");

    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
}

function openPopup(title, text) {
    showPopup({ title, text });
}

function closePopup() {
    const backdrop = document.getElementById("popupBackdrop");
    if (backdrop) backdrop.classList.remove("open");
    document.body.style.overflow = "";
}

function closePopupOnBackdrop(event) {
    if (event.target.id === "popupBackdrop") closePopup();
}

// Istilah teknis dalam paragraf (.glossary-term[data-term]) —
// datanya diambil dari glossaryData (glossary-data.js).
function initGlossaryPopups() {
    document.querySelectorAll(".glossary-term[data-term]").forEach(el => {
        el.addEventListener("click", () => {
            const key = el.dataset.term;
            const def = (typeof glossaryData !== "undefined") ? glossaryData[key] : null;
            if (def) {
                openPopup(el.textContent, def);
            }
        });
    });
}

// Node diagram apa pun dengan data-popup-title + data-popup-text
// (dipakai di diagram alur BIP section 1).
function initDiagramPopups() {
    document.querySelectorAll("[data-popup-title][data-popup-text]").forEach(el => {
        el.addEventListener("click", () => {
            openPopup(el.dataset.popupTitle, el.dataset.popupText);
        });
    });
}

/*------------------------------------------------
    ACCORDION BIP LANDMARK (Section 2)
    Pola sama seperti Tingkatan Keamanan (materi #2) /
    4 Jenis Alamat (materi #3): header dengan
    data-bip-target di-toggle class "open" pada
    .bip-item induknya.
------------------------------------------------*/
function initBipAccordion() {
    document.querySelectorAll(".bip-header[data-bip-target]").forEach(header => {
        header.addEventListener("click", () => {
            const item = header.closest(".bip-item");
            if (!item) return;
            const willOpen = !item.classList.contains("open");
            item.classList.toggle("open", willOpen);
            header.setAttribute("aria-expanded", willOpen ? "true" : "false");
        });
    });
}

/*------------------------------------------------
    MINI-QUIZ CHECKPOINT (Section 5)
    Cuma 1 soal pilihan ganda (a/b/c) — tanpa skor/recap,
    cukup feedback benar/salah + penjelasan singkat.
------------------------------------------------*/
const BIP_QUIZ = {
    question: "Kenapa sebuah BIP yang sudah diberi nomor resmi belum tentu langsung dipakai semua orang?",
    options: [
        { id: "a", text: "Karena harus dibayar dulu oleh pengusulnya", correct: false },
        { id: "b", text: "Karena node dan wallet menerimanya secara SUKARELA, hanya kalau dianggap cukup aman dan bermanfaat — tidak ada otoritas pusat yang bisa memaksakannya", correct: true },
        { id: "c", text: "Karena harus menunggu persetujuan pemerintah dulu", correct: false }
    ],
    explain: "Persis seperti alur di Bagian 1: diberi nomor resmi cuma menandakan draft-nya terdokumentasi dengan baik. Bitcoin tidak punya otoritas pusat, jadi node dan wallet baru benar-benar mengadopsi sebuah BIP kalau pengelolanya sendiri memutuskan itu aman dan bermanfaat untuk diikuti."
};

let bipQuizAnswered = false;

function renderBipQuiz() {
    const card = document.getElementById("bipQuizCard");
    if (!card) return;

    bipQuizAnswered = false;

    const optionsHtml = BIP_QUIZ.options.map(opt =>
        '<button type="button" class="bip-quiz-option" data-option="' + opt.id + '">' +
        '<span class="bip-quiz-option-letter">' + opt.id + '</span>' +
        '<span>' + opt.text + '</span>' +
        '</button>'
    ).join("");

    card.innerHTML =
        '<p class="bip-quiz-statement">' + BIP_QUIZ.question + '</p>' +
        '<div class="bip-quiz-options">' + optionsHtml + '</div>' +
        '<p class="bip-quiz-feedback" id="bipQuizFeedback"></p>';

    card.querySelectorAll(".bip-quiz-option").forEach(btn => {
        btn.addEventListener("click", () => {
            if (bipQuizAnswered) return;
            bipQuizAnswered = true;

            const chosenId = btn.dataset.option;
            const chosenOpt = BIP_QUIZ.options.find(o => o.id === chosenId);
            const correct = !!(chosenOpt && chosenOpt.correct);

            card.querySelectorAll(".bip-quiz-option").forEach(b => {
                b.disabled = true;
                const opt = BIP_QUIZ.options.find(o => o.id === b.dataset.option);
                if (opt && opt.correct) b.classList.add("bip-quiz-option--correct");
                else if (b === btn) b.classList.add("bip-quiz-option--wrong");
            });

            const feedback = document.getElementById("bipQuizFeedback");
            if (feedback) {
                feedback.textContent = (correct ? "Tepat! " : "Kurang tepat. ") + BIP_QUIZ.explain;
                feedback.classList.add("show");
            }

            const retryBtn = document.createElement("button");
            retryBtn.type = "button";
            retryBtn.className = "bip-quiz-retry-btn";
            retryBtn.textContent = "Ulangi Soal";
            retryBtn.addEventListener("click", renderBipQuiz);
            card.appendChild(retryBtn);
        });
    });
}

function initBipQuiz() {
    if (!document.getElementById("bipQuizCard")) return;
    renderBipQuiz();
}

/*------------------------------------------------
    INIT
------------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== "undefined") lucide.createIcons();

    updateReadingProgress();
    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    window.addEventListener("resize", updateReadingProgress);
    window.addEventListener("load", updateReadingProgress);

    initGlossaryPopups();
    initDiagramPopups();
    initBipAccordion();
    initBipQuiz();
});

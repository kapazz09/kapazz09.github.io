/*==================================================
    MATERI: ON-CHAIN ANALYSIS — SCRIPT
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
    POPUP KECIL (REUSABLE — pola sama seperti materi
    sebelumnya, cukup dipakai apa adanya)
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
    if (featuresEl) {
        featuresEl.style.display = "none";
        featuresEl.innerHTML = "";
    }
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

// Elemen apa pun dengan data-popup-title + data-popup-text —
// dipakai untuk semua diagram/kartu interaktif di materi ini.
function initDiagramPopups() {
    document.querySelectorAll("[data-popup-title][data-popup-text]").forEach(el => {
        el.addEventListener("click", () => {
            openPopup(el.dataset.popupTitle, el.dataset.popupText);
        });
    });
}

/*------------------------------------------------
    SECTION 6: ANIMASI DORMANCY -> COIN DAYS DESTROYED
------------------------------------------------*/
function initDormancyAnimation() {
    const btn = document.getElementById("dormancyAnimateBtn");
    const left = document.getElementById("dormancyLeft");
    const right = document.getElementById("dormancyRight");
    const arrow = document.getElementById("dormancyArrow");
    if (!btn || !left || !right || !arrow) return;

    let playing = false;

    btn.addEventListener("click", () => {
        if (playing) return;
        playing = true;
        btn.disabled = true;
        btn.textContent = "Memutar animasi...";

        left.classList.remove("pulse");
        right.classList.remove("lit");
        arrow.classList.remove("active");

        void left.offsetWidth;
        left.classList.add("pulse");

        setTimeout(() => {
            arrow.classList.add("active");
        }, 500);

        setTimeout(() => {
            right.classList.add("lit");
        }, 900);

        setTimeout(() => {
            playing = false;
            btn.disabled = false;
            btn.textContent = "▶ Lihat Animasi";
        }, 2200);
    });
}

/*------------------------------------------------
    MINI-QUIZ CHECKPOINT — 1 SOAL PILIHAN GANDA
------------------------------------------------*/
const MINI_QUIZ_DATA = {
    statement: "Kamu melihat data on-chain menunjukkan dana whale dalam jumlah besar baru saja pindah ke sebuah exchange. Kesimpulan apa yang paling tepat?",
    options: [
        { key: "a", text: "Pasti whale itu akan menjual Bitcoin-nya sebentar lagi", correct: false },
        { key: "b", text: "Kemungkinan terkait niat jual, tapi bisa juga alasan lain seperti custodian, OTC desk, atau kebutuhan operasional — bukan kepastian", correct: true },
        { key: "c", text: "Tidak ada artinya sama sekali, data on-chain tidak berguna", correct: false }
    ],
    explain: "Aliran dana whale ke exchange sering diasosiasikan dengan potensi tekanan jual, tapi ini pola umum, bukan kepastian. Wallet besar bisa juga milik custodian, OTC desk, atau institusi yang memindahkan dana karena alasan operasional."
};

function renderMiniQuiz() {
    const card = document.getElementById("miniQuizCard");
    if (!card) return;

    let answered = false;

    card.innerHTML =
        '<p class="mini-quiz-statement">' + MINI_QUIZ_DATA.statement + '</p>' +
        '<div class="mini-quiz-options">' +
        MINI_QUIZ_DATA.options.map(opt =>
            '<button type="button" class="mini-quiz-option" data-key="' + opt.key + '">' +
            opt.key.toUpperCase() + ') ' + opt.text +
            '</button>'
        ).join("") +
        '</div>' +
        '<p class="mini-quiz-feedback" id="miniQuizFeedback"></p>';

    card.querySelectorAll(".mini-quiz-option").forEach(btn => {
        btn.addEventListener("click", () => {
            if (answered) return;
            answered = true;

            const chosenOpt = MINI_QUIZ_DATA.options.find(o => o.key === btn.dataset.key);

            card.querySelectorAll(".mini-quiz-option").forEach(b => {
                b.disabled = true;
                const opt = MINI_QUIZ_DATA.options.find(o => o.key === b.dataset.key);
                if (opt.correct) b.classList.add("mini-quiz-option--correct");
                else if (b === btn) b.classList.add("mini-quiz-option--wrong");
            });

            const feedback = document.getElementById("miniQuizFeedback");
            if (feedback) {
                feedback.textContent = (chosenOpt.correct ? "Tepat! " : "Kurang tepat. ") + MINI_QUIZ_DATA.explain;
                feedback.classList.add("show");
            }
        });
    });
}

function initMiniQuiz() {
    if (!document.getElementById("miniQuizCard")) return;
    renderMiniQuiz();
}

/*------------------------------------------------
    PENUTUP: KONFETI RINGAN DI BOX PERAYAAN
    Muncul sekali saat box perayaan masuk viewport
    (materi terakhir dari 8).
------------------------------------------------*/
function initCelebrationConfetti() {
    const box = document.getElementById("celebrationBox");
    if (!box || typeof IntersectionObserver === "undefined") return;

    const emojis = ["🎉", "✨", "🎊", "🟠"];
    let triggered = false;

    const spawnConfetti = () => {
        for (let i = 0; i < 14; i++) {
            const piece = document.createElement("span");
            piece.className = "confetti-piece";
            piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            piece.style.left = Math.random() * 96 + "%";
            piece.style.animationDelay = (Math.random() * 1.2) + "s";
            piece.style.animationDuration = (2.4 + Math.random() * 1.4) + "s";
            box.appendChild(piece);
            setTimeout(() => piece.remove(), 4200);
        }
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !triggered) {
                triggered = true;
                spawnConfetti();
                observer.disconnect();
            }
        });
    }, { threshold: 0.4 });

    observer.observe(box);
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
    initDormancyAnimation();
    initMiniQuiz();
    initCelebrationConfetti();
});

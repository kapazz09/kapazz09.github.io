/*==================================================
    KAPAZZ BITCOIN - SCRIPT MATERI
    Materi 4/8: Privasi & Keamanan dalam Bitcoin
    File ini LOKAL untuk folder materi ini saja.
==================================================*/

/* ---------- READING PROGRESS BAR ---------- */
function initReadingProgress() {
    const fill = document.getElementById('readingProgressFill');
    if (!fill) return;

    function update() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        fill.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }

    window.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    update();
}

/* ---------- POPUP UMUM (dipakai istilah & diagram) ---------- */
function showPopup(title, text) {
    const backdrop = document.getElementById('popupBackdrop');
    const titleEl = document.getElementById('popupTitle');
    const textEl = document.getElementById('popupText');
    if (!backdrop || !titleEl || !textEl) return;

    titleEl.textContent = title;
    textEl.textContent = text;
    backdrop.classList.add('open');

    const box = backdrop.querySelector('.popup-box');
    if (box) {
        box.classList.remove('anim-fade-scale');
        void box.offsetWidth;
        box.classList.add('anim-fade-scale');
    }
}

function closePopup() {
    const backdrop = document.getElementById('popupBackdrop');
    if (backdrop) backdrop.classList.remove('open');
}

function initPopupClose() {
    const backdrop = document.getElementById('popupBackdrop');
    const closeBtn = document.getElementById('popupCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    if (backdrop) {
        backdrop.addEventListener('click', function (e) {
            if (e.target === backdrop) closePopup();
        });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closePopup();
    });
}

/* ---------- POPUP ISTILAH (glossary-data.js) ---------- */
function initGlossaryPopups() {
    document.querySelectorAll('.glossary-term').forEach(function (el) {
        el.addEventListener('click', function () {
            const term = el.getAttribute('data-term');
            const key = term ? term.toLowerCase() : '';
            const def = glossaryData[key];
            if (def) {
                showPopup(term, def);
            }
        });
    });
}

/* ---------- POPUP DIAGRAM GENERIK (data-popup-title / data-popup-text) ---------- */
function initDiagramPopups() {
    document.querySelectorAll('[data-popup-title][data-popup-text]').forEach(function (el) {
        el.addEventListener('click', function () {
            showPopup(el.getAttribute('data-popup-title'), el.getAttribute('data-popup-text'));
        });
    });
}

/* ---------- ANIMASI "KENAPA BERBAHAYA" (Address Reuse) ---------- */
function initReuseHighlight() {
    const btn = document.getElementById('reuseHighlightBtn');
    if (!btn) return;

    btn.addEventListener('click', function () {
        if (btn.disabled) return;
        btn.disabled = true;

        const txBoxes = document.querySelectorAll('.reuse-column--danger .reuse-tx-box');
        const arrow = document.querySelector('.reuse-column--danger .reuse-arrow-down');
        const addressBox = document.querySelector('.reuse-column--danger .reuse-address-box');

        txBoxes.forEach(function (box) { box.classList.add('danger-pulse'); });
        if (arrow) arrow.classList.add('danger-pulse');
        if (addressBox) addressBox.classList.add('danger-pulse');

        setTimeout(function () {
            txBoxes.forEach(function (box) { box.classList.remove('danger-pulse'); });
            if (arrow) arrow.classList.remove('danger-pulse');
            if (addressBox) addressBox.classList.remove('danger-pulse');
            btn.disabled = false;
        }, 1900);
    });
}

/* ---------- ANIMASI COINJOIN (garis menyilang) ---------- */
function initCoinjoinAnimation() {
    const btn = document.getElementById('animateCoinjoinBtn');
    const lines = document.querySelectorAll('.coinjoin-line');
    if (!btn || lines.length === 0) return;

    btn.addEventListener('click', function () {
        if (btn.disabled) return;
        btn.disabled = true;

        lines.forEach(function (line, i) {
            const length = line.getTotalLength ? line.getTotalLength() : 160;
            line.style.strokeDasharray = length;
            line.style.strokeDashoffset = length;
            line.getBoundingClientRect();
            line.style.transition = 'stroke-dashoffset 0.7s ease-out';
            setTimeout(function () {
                line.style.strokeDashoffset = 0;
            }, i * 220);
        });

        setTimeout(function () {
            lines.forEach(function (line) {
                const length = line.getTotalLength ? line.getTotalLength() : 160;
                line.style.transition = 'stroke-dashoffset 0.5s ease-in';
                line.style.strokeDashoffset = length;
            });
            setTimeout(function () {
                lines.forEach(function (line) {
                    line.style.strokeDasharray = '4 3';
                    line.style.strokeDashoffset = '0';
                    line.style.transition = '';
                });
                btn.disabled = false;
            }, 550);
        }, 2600);
    });
}

/* ---------- MINI QUIZ (satu soal pilihan ganda) ---------- */
const SINGLE_QUIZ_DATA = {
    question: "Kamu menerima pesan WhatsApp mengaku dari \u201cTim Support Wallet\u201d yang bilang akunmu bermasalah dan minta kamu klik link untuk \u201cverifikasi seed phrase\u201d. Apa yang harus dilakukan?",
    options: [
        { id: 'a', text: 'Klik link dan masukkan seed phrase untuk verifikasi cepat' },
        { id: 'b', text: 'Abaikan/jangan klik link \u2014 wallet resmi TIDAK PERNAH minta seed phrase lewat chat/link' },
        { id: 'c', text: 'Klik link tapi masukkan seed phrase yang salah untuk tes' }
    ],
    correct: 'b',
    explain: 'Wallet atau exchange resmi tidak pernah meminta seed phrase lewat chat, SMS, email, atau link apa pun. Permintaan semacam ini selalu tanda phishing \u2014 abaikan dan jangan pernah klik linknya.'
};

function renderSingleQuiz() {
    const container = document.getElementById('miniQuizCard');
    if (!container) return;

    const letters = { a: 'A', b: 'B', c: 'C' };
    let html = '<p class="mini-quiz-question">' + SINGLE_QUIZ_DATA.question + '</p>';
    html += '<div class="mini-quiz-options">';
    SINGLE_QUIZ_DATA.options.forEach(function (opt) {
        html += '<button type="button" class="mini-quiz-option" data-option="' + opt.id + '">' +
            '<span class="mini-quiz-option-letter">' + letters[opt.id] + '.</span>' +
            '<span>' + opt.text + '</span></button>';
    });
    html += '</div><div class="mini-quiz-feedback" id="miniQuizFeedback" style="display:none;"></div>';

    container.innerHTML = html;

    const optionButtons = container.querySelectorAll('.mini-quiz-option');
    optionButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            optionButtons.forEach(function (b) { b.disabled = true; });

            const chosen = btn.getAttribute('data-option');
            if (chosen === SINGLE_QUIZ_DATA.correct) {
                btn.classList.add('mini-quiz-option--correct');
            } else {
                btn.classList.add('mini-quiz-option--wrong');
                optionButtons.forEach(function (b) {
                    if (b.getAttribute('data-option') === SINGLE_QUIZ_DATA.correct) {
                        b.classList.add('mini-quiz-option--correct');
                    }
                });
            }

            const feedback = document.getElementById('miniQuizFeedback');
            if (feedback) {
                feedback.style.display = 'block';
                feedback.innerHTML = '<strong>' + (chosen === SINGLE_QUIZ_DATA.correct ? 'Benar!' : 'Belum tepat.') + '</strong> ' + SINGLE_QUIZ_DATA.explain;
            }
        });
    });
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', function () {
    if (window.lucide) lucide.createIcons();

    initReadingProgress();
    initPopupClose();
    initGlossaryPopups();
    initDiagramPopups();
    initReuseHighlight();
    initCoinjoinAnimation();
    renderSingleQuiz();

    if (window.lucide) lucide.createIcons();
});

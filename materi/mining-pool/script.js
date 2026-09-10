/*==================================================
    MATERI: MINING & MINING POOL — SCRIPT KHUSUS
    LOKAL/MANDIRI untuk folder materi/mining-pool/.
    Butuh glossaryData dari glossary-data.js (file lokal
    di folder yang sama) + library lucide-icons (CDN).
==================================================*/

/* ---------- READING PROGRESS BAR ---------- */
function updateReadingProgress() {
    const fill = document.getElementById('readingProgressFill');
    if (!fill) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    fill.style.width = progress + '%';
}

/* ---------- POPUP / MODAL KECIL (reusable: istilah & detail diagram) ---------- */
function showPopup(data) {
    const backdrop = document.getElementById('popupBackdrop');
    const box = document.getElementById('popupBox');
    if (!backdrop || !box) return;

    const iconWrap = box.querySelector('.popup-icon-wrap');
    const titleEl = box.querySelector('#popupTitle');
    const textEl = box.querySelector('#popupText');
    const metaEl = box.querySelector('#popupMeta');
    const featuresEl = box.querySelector('#popupFeatures');
    const noteEl = box.querySelector('#popupNote');

    if (iconWrap) iconWrap.style.display = 'none';
    if (titleEl) titleEl.textContent = data.title || '';
    if (textEl) textEl.textContent = data.text || '';

    if (metaEl) {
        if (data.meta) {
            metaEl.textContent = data.meta;
            metaEl.style.display = 'block';
        } else {
            metaEl.style.display = 'none';
        }
    }

    if (featuresEl) {
        featuresEl.innerHTML = '';
        if (data.features && data.features.length) {
            data.features.forEach(f => {
                const li = document.createElement('li');
                li.textContent = f;
                featuresEl.appendChild(li);
            });
            featuresEl.style.display = 'block';
        } else {
            featuresEl.style.display = 'none';
        }
    }

    if (noteEl) {
        if (data.note) {
            noteEl.textContent = data.note;
            noteEl.style.display = 'block';
        } else {
            noteEl.style.display = 'none';
        }
    }

    backdrop.classList.add('open');
    box.classList.add('anim-fade-scale');
}

function openPopup(title, text) {
    showPopup({ title, text });
}

function closePopup() {
    const backdrop = document.getElementById('popupBackdrop');
    const box = document.getElementById('popupBox');
    if (backdrop) backdrop.classList.remove('open');
    if (box) box.classList.remove('anim-fade-scale');
}

function initPopupCloseHandlers() {
    const backdrop = document.getElementById('popupBackdrop');
    const closeBtn = document.getElementById('popupCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    if (backdrop) {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) closePopup();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePopup();
    });
}

/* ---------- POPUP ISTILAH GLOSSARY (dari glossary-data.js lokal) ---------- */
function initGlossaryPopups() {
    const terms = document.querySelectorAll('.glossary-term');
    terms.forEach(el => {
        el.addEventListener('click', () => {
            const key = (el.dataset.term || el.textContent).trim().toLowerCase();
            const def = glossaryData[key];
            if (def) {
                openPopup(el.textContent.trim(), def);
            }
        });
    });
}

/* ---------- POPUP GENERIK UNTUK ELEMEN DIAGRAM (data-popup-title + data-popup-text) ---------- */
function initDiagramPopups() {
    const els = document.querySelectorAll('[data-popup-title][data-popup-text]');
    els.forEach(el => {
        el.addEventListener('click', () => {
            openPopup(el.dataset.popupTitle, el.dataset.popupText);
        });
    });
}

/* ---------- SECTION 1: SIMULASI PROSES MINING (loop percobaan nonce) ---------- */
function initMiningSimulation() {
    const btn = document.getElementById('mineSimBtn');
    const nonceStep = document.getElementById('mineNonceStep');
    const hashStep = document.getElementById('mineHashStep');
    const rewardStep = document.getElementById('mineRewardStep');
    const arrowToReward = document.getElementById('mineArrowToReward');
    const loop = document.getElementById('mineLoop');

    if (!btn || !nonceStep || !hashStep || !rewardStep || !arrowToReward || !loop) return;

    let playing = false;
    const defaultLabel = btn.textContent;

    function resetVisual() {
        [nonceStep, hashStep, rewardStep].forEach(el => {
            el.classList.remove('trying', 'fail', 'success', 'celebrate');
        });
        arrowToReward.classList.remove('active');
        loop.classList.remove('active');
    }

    function attempt(remainingFails) {
        nonceStep.classList.add('trying');
        hashStep.classList.add('trying');
        hashStep.classList.remove('fail', 'success');

        setTimeout(() => {
            nonceStep.classList.remove('trying');
            hashStep.classList.remove('trying');

            if (remainingFails > 0) {
                hashStep.classList.add('fail');
                loop.classList.add('active');
                setTimeout(() => {
                    hashStep.classList.remove('fail');
                    attempt(remainingFails - 1);
                }, 380);
            } else {
                loop.classList.remove('active');
                hashStep.classList.add('success');
                arrowToReward.classList.add('active');
                setTimeout(() => {
                    rewardStep.classList.add('success', 'celebrate');
                }, 200);
                setTimeout(() => {
                    playing = false;
                    btn.disabled = false;
                    btn.textContent = defaultLabel;
                }, 1000);
            }
        }, 550);
    }

    btn.addEventListener('click', () => {
        if (playing) return;
        playing = true;
        btn.disabled = true;
        btn.textContent = 'Mensimulasikan...';
        resetVisual();
        const failCount = 3 + Math.floor(Math.random() * 3); // 3-5 kegagalan sebelum berhasil
        attempt(failCount);
    });
}

/* ---------- SECTION 9: MINI-QUIZ PILIHAN GANDA ---------- */
const QUIZ_DATA = {
    question: 'Apakah mining Bitcoin otomatis menguntungkan kalau listrik tersedia?',
    options: [
        { key: 'a', text: 'Ya, selalu untung selama ada listrik dan alat ASIC', correct: false },
        { key: 'b', text: 'Tidak — profitabilitas sangat bergantung pada harga listrik, efisiensi alat, dan harga BTC yang volatil; sebagian operator bahkan bisa impas/rugi', correct: true },
        { key: 'c', text: 'Ya, karena reward block selalu bertambah tiap tahun', correct: false }
    ],
    explain: 'Seperti dibahas di Bagian 8: minat mining tetap tinggi karena skala ekonomi, energi murah, model bisnis perusahaan publik, dan spekulasi harga — tapi itu bukan jaminan untung. Profitabilitas nyata sangat bergantung pada harga listrik, efisiensi alat, dan harga BTC yang volatil.'
};

function renderMiniQuiz() {
    const card = document.getElementById('miniQuizCard');
    if (!card) return;

    card.innerHTML = `
        <p class="mini-quiz-statement">${QUIZ_DATA.question}</p>
        <div class="mini-quiz-options mini-quiz-options--vertical" id="quizOptions"></div>
        <p class="mini-quiz-feedback" id="quizFeedback"></p>
    `;

    const optWrap = card.querySelector('#quizOptions');
    QUIZ_DATA.options.forEach(opt => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'mini-quiz-option mini-quiz-option--text';
        b.textContent = opt.key.toUpperCase() + ') ' + opt.text;
        b.dataset.key = opt.key;
        optWrap.appendChild(b);
    });

    let answered = false;
    optWrap.querySelectorAll('.mini-quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
            if (answered) return;
            answered = true;

            const chosen = QUIZ_DATA.options.find(o => o.key === btn.dataset.key);

            optWrap.querySelectorAll('.mini-quiz-option').forEach(b => {
                b.disabled = true;
                const opt = QUIZ_DATA.options.find(o => o.key === b.dataset.key);
                if (opt.correct) {
                    b.classList.add('mini-quiz-option--correct');
                } else if (b === btn) {
                    b.classList.add('mini-quiz-option--wrong');
                }
            });

            const feedback = card.querySelector('#quizFeedback');
            feedback.textContent = (chosen.correct ? 'Tepat! ' : 'Kurang tepat. ') + QUIZ_DATA.explain;
            feedback.classList.add('show');
        });
    });
}

/* ---------- INISIALISASI ---------- */
document.addEventListener('DOMContentLoaded', () => {
    updateReadingProgress();
    window.addEventListener('scroll', updateReadingProgress, { passive: true });

    initPopupCloseHandlers();
    initGlossaryPopups();
    initDiagramPopups();
    initMiningSimulation();
    renderMiniQuiz();

    if (window.lucide) {
        lucide.createIcons();
    }
});

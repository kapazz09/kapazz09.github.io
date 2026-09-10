/*==================================================
    MATERI: UTXO MANAGEMENT, COIN CONTROL & FEE TRANSAKSI — SCRIPT
==================================================*/

/*------------------------------------------------
    READING PROGRESS BAR
    Terisi sesuai persentase scroll user di halaman.
    (pola sama persis seperti materi #2)
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
    POPUP KECIL (REUSABLE — sama persis pola materi #2)
    showPopup(data) fungsi inti, openPopup(title, text)
    untuk kasus simpel (istilah glossary & detail diagram).
    Materi ini tidak punya kartu data-kaya seperti wallet
    card di materi #2, jadi cukup openPopup saja.
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

    // Materi ini tidak punya kartu ber-ikon, jadi wrapper ikon selalu disembunyikan.
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

// Kotak diagram apa pun dengan data-popup-title + data-popup-text —
// dipakai untuk 3 kotak rumus fee di Bagian 4.
function initDiagramPopups() {
    document.querySelectorAll("[data-popup-title][data-popup-text]").forEach(el => {
        el.addEventListener("click", () => {
            openPopup(el.dataset.popupTitle, el.dataset.popupText);
        });
    });
}

/*------------------------------------------------
    BAGIAN 1: DIAGRAM LINGKARAN UTXO (COIN SELECTION)
    Tiap lingkaran bisa ditoggle "dipilih", running total
    dijumlahkan dari data-value tiap lingkaran yang aktif.
------------------------------------------------*/
function initUtxoSelector() {
    const circles = document.querySelectorAll(".utxo-circle[data-value]");
    const display = document.getElementById("utxoTotalDisplay");
    if (!circles.length || !display) return;

    function updateTotal() {
        let total = 0;
        circles.forEach(c => {
            if (c.classList.contains("selected")) {
                total += parseFloat(c.dataset.value);
            }
        });
        display.textContent = "Total UTXO Terpilih: " + total.toFixed(3) + " BTC";
    }

    circles.forEach(c => {
        c.addEventListener("click", () => {
            c.classList.toggle("selected");
            updateTotal();
        });
    });

    updateTotal();
}

/*------------------------------------------------
    BAGIAN 2: ANIMASI KONSOLIDASI UTXO
    Highlight berurutan: 4 UTXO kecil -> panah -> kotak
    transaksi -> panah -> 1 UTXO besar. Pola sama seperti
    animasi alur air-gapped di materi #2.
------------------------------------------------*/
function initConsolidateAnimation() {
    const btn = document.getElementById("animateConsolidateBtn");
    const diagram = document.getElementById("consolidateDiagram");
    if (!btn || !diagram) return;

    const smallNodes = Array.from(diagram.querySelectorAll(".consolidate-node--small"));
    const txNode = diagram.querySelector(".consolidate-node--tx");
    const bigNode = diagram.querySelector(".consolidate-node--big");
    const arrows = Array.from(diagram.querySelectorAll(".flow-arrow--down"));
    const stepDelay = 700;
    let playing = false;

    function clearActive() {
        smallNodes.forEach(n => n.classList.remove("active"));
        if (txNode) txNode.classList.remove("active");
        if (bigNode) bigNode.classList.remove("active");
        arrows.forEach(a => a.classList.remove("active"));
    }

    btn.addEventListener("click", () => {
        if (playing) return;
        playing = true;
        btn.disabled = true;
        btn.textContent = "Memutar animasi...";
        clearActive();

        smallNodes.forEach((n, i) => {
            setTimeout(() => n.classList.add("active"), i * 150);
        });

        setTimeout(() => { if (arrows[0]) arrows[0].classList.add("active"); }, smallNodes.length * 150 + 200);
        setTimeout(() => { if (txNode) txNode.classList.add("active"); }, smallNodes.length * 150 + 200 + stepDelay);
        setTimeout(() => { if (arrows[1]) arrows[1].classList.add("active"); }, smallNodes.length * 150 + 200 + stepDelay * 2);
        setTimeout(() => { if (bigNode) bigNode.classList.add("active"); }, smallNodes.length * 150 + 200 + stepDelay * 3);

        setTimeout(() => {
            playing = false;
            btn.disabled = false;
            btn.textContent = "▶ Lihat Animasi";
        }, smallNodes.length * 150 + 200 + stepDelay * 3 + 900);
    });
}

/*------------------------------------------------
    ACCORDION 4 JENIS ALAMAT (Bagian 6)
    Reusable pola: header dengan data-tier-target
    (berisi id elemen body) di-toggle class "open"
    pada .tier-item induknya. (sama persis materi #2)
------------------------------------------------*/
function initAccordion() {
    document.querySelectorAll(".tier-header[data-tier-target]").forEach(header => {
        header.addEventListener("click", () => {
            const item = header.closest(".tier-item");
            if (!item) return;
            const willOpen = !item.classList.contains("open");
            item.classList.toggle("open", willOpen);
            header.setAttribute("aria-expanded", willOpen ? "true" : "false");
        });
    });
}

/*------------------------------------------------
    BAGIAN 5: SIMULASI JARINGAN SEPI vs RAMAI
    Tombol toggle menambah kotak "tx" di kolom kiri dan
    mengubah warnanya jadi merah (meniru transisi ke ramai),
    lalu bisa diklik lagi untuk reset ke kondisi sepi.
------------------------------------------------*/
function initNetworkSimulation() {
    const btn = document.getElementById("networkSimBtn");
    const grid = document.getElementById("networkTxGrid");
    const label = document.getElementById("networkColLabel");
    const col = document.getElementById("networkColLeft");
    if (!btn || !grid || !label || !col) return;

    const CALM_COUNT = 4;
    const BUSY_COUNT = 8;
    let isBusy = false;

    function render() {
        const count = isBusy ? BUSY_COUNT : CALM_COUNT;
        grid.innerHTML = "";
        for (let i = 0; i < count; i++) {
            const span = document.createElement("span");
            span.className = "network-tx appear " + (isBusy ? "network-tx--busy" : "network-tx--calm");
            span.textContent = "tx";
            grid.appendChild(span);
        }
        label.textContent = isBusy ? "Fee rate tinggi" : "Fee rate rendah";
        col.querySelector(".network-column-title").textContent = isBusy ? "Jaringan Ramai" : "Jaringan Sepi";
        col.querySelector(".network-column-title").classList.toggle("network-column-title--calm", !isBusy);
        col.querySelector(".network-column-title").classList.toggle("network-column-title--busy", isBusy);
        btn.textContent = isBusy ? "🔄 Reset ke Jaringan Sepi" : "🔄 Simulasikan Jaringan Ramai";
    }

    btn.addEventListener("click", () => {
        isBusy = !isBusy;
        render();
    });
}

/*------------------------------------------------
    BAGIAN 7: MINI-QUIZ SINTESIS (1 SOAL PILIHAN GANDA)
------------------------------------------------*/
function initSynthesisQuiz() {
    const card = document.getElementById("synthesisQuizCard");
    if (!card) return;

    const options = card.querySelectorAll(".synthesis-quiz-option");
    const feedback = document.getElementById("synthesisQuizFeedback");
    let answered = false;

    options.forEach(btn => {
        btn.addEventListener("click", () => {
            if (answered) return;
            answered = true;

            const isCorrect = btn.dataset.correct === "true";

            options.forEach(b => {
                b.disabled = true;
                if (b.dataset.correct === "true") {
                    b.classList.add("synthesis-quiz-option--correct");
                } else if (b === btn) {
                    b.classList.add("synthesis-quiz-option--wrong");
                }
            });

            if (feedback) {
                feedback.textContent = (isCorrect ? "Tepat! " : "Kurang tepat. ") +
                    "Kombinasi banyak UTXO kecil, alamat Legacy, dan konsolidasi saat jaringan ramai adalah yang " +
                    "paling mahal — vBytes-nya besar (banyak input, alamat boros) DAN fee rate-nya juga sedang " +
                    "tinggi. Sebaliknya, UTXO dari alamat Native SegWit yang dikonsolidasikan saat jaringan sepi " +
                    "adalah kombinasi paling efisien.";
                feedback.classList.add("show");
            }
        });
    });
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
    initUtxoSelector();
    initConsolidateAnimation();
    initAccordion();
    initNetworkSimulation();
    initSynthesisQuiz();
});

// ==================================================
// KOMENTAR PENGUNJUNG (section "Nilai Situs Ini")
// Pakai Web App Apps Script yang SAMA dengan rating,
// cuma beda parameter ?action=... di URL-nya.
// ==================================================

const COMMENTS_API_URL = RATING_API_URL; // satu Web App yang sama, lihat ratings.js

let recentCommentsCache = [];
let tickerIndex = 0;
let tickerInterval = null;
let commentsLoadedFull = false;

//------------------------------------------------
// TICKER (cuma ambil beberapa komentar terbaru, ringan)
//------------------------------------------------
function loadRecentCommentsForTicker() {
    fetch(COMMENTS_API_URL + "?action=get_comments&limit=8")
        .then(res => res.json())
        .then(data => {
            recentCommentsCache = (data && data.comments) ? data.comments : [];
            startCommentTicker();
        })
        .catch(() => {
            const el = document.getElementById("commentTickerText");
            if (el) el.textContent = "Klik untuk memberi komentar pertama!";
        });
}

function startCommentTicker() {
    const textEl = document.getElementById("commentTickerText");
    if (!textEl) return;

    if (recentCommentsCache.length === 0) {
        textEl.textContent = "Belum ada komentar — jadilah yang pertama!";
        return;
    }

    const showNext = () => {
        const item = recentCommentsCache[tickerIndex % recentCommentsCache.length];
        textEl.classList.remove("ticker-anim");
        void textEl.offsetWidth;
        textEl.textContent = item.name + ": " + item.comment;
        textEl.classList.add("ticker-anim");
        tickerIndex++;
    };

    showNext();
    if (tickerInterval) clearInterval(tickerInterval);
    if (recentCommentsCache.length > 1) {
        tickerInterval = setInterval(showNext, 3800);
    }
}

//------------------------------------------------
// MODAL: daftar lengkap + form kirim komentar
//------------------------------------------------
function openCommentsModal() {
    const backdrop = document.getElementById("commentsModalBackdrop");
    const box = document.getElementById("commentsModalBox");
    if (!backdrop) return;

    box.classList.remove("anim-fade-scale");
    void box.offsetWidth;
    box.classList.add("anim-fade-scale");

    backdrop.classList.add("open");
    document.body.classList.add("modal-open");

    loadFullCommentsList();
}

function closeCommentsModal() {
    const backdrop = document.getElementById("commentsModalBackdrop");
    if (backdrop) backdrop.classList.remove("open");
    document.body.classList.remove("modal-open");
}

function closeCommentsModalOnBackdrop(event) {
    if (event.target.id === "commentsModalBackdrop") closeCommentsModal();
}

function loadFullCommentsList() {
    const listEl = document.getElementById("commentsList");
    if (listEl) listEl.innerHTML = '<p style="text-align:center;color:#888;">Memuat komentar...</p>';

    fetch(COMMENTS_API_URL + "?action=get_comments")
        .then(res => res.json())
        .then(data => {
            const comments = (data && data.comments) ? data.comments : [];
            renderCommentsList(comments);
            commentsLoadedFull = true;
        })
        .catch(() => {
            if (listEl) listEl.innerHTML = '<p style="text-align:center;color:#888;">Gagal memuat komentar. Coba lagi nanti.</p>';
        });
}

function renderCommentsList(comments) {
    const listEl = document.getElementById("commentsList");
    if (!listEl) return;

    if (comments.length === 0) {
        listEl.innerHTML = '<p style="text-align:center;color:#888;">Belum ada komentar — jadilah yang pertama!</p>';
        return;
    }

    listEl.innerHTML = comments.map(c => {
        const date = c.timestamp ? new Date(c.timestamp) : null;
        const dateStr = date && !isNaN(date) ? date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "";
        const safeName = escapeHtml(c.name || "Anonim");
        const safeComment = escapeHtml(c.comment || "");
        return '<div class="comment-item">' +
            '<div class="comment-item-head"><strong>' + safeName + '</strong><span>' + dateStr + '</span></div>' +
            '<p>' + safeComment + '</p>' +
            '</div>';
    }).join("");
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

//------------------------------------------------
// KIRIM KOMENTAR BARU
//------------------------------------------------
function submitComment() {
    const nameInput = document.getElementById("commentNameInput");
    const textInput = document.getElementById("commentTextInput");
    const submitBtn = document.getElementById("commentSubmitBtn");

    const comment = textInput.value.trim();
    if (!comment) {
        alert("Komentar tidak boleh kosong.");
        return;
    }
    if (comment.length > 200) {
        alert("Komentar maksimal 200 karakter.");
        return;
    }

    const name = nameInput.value.trim();

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Mengirim...";

    const url = COMMENTS_API_URL + "?action=add_comment" +
        "&name=" + encodeURIComponent(name) +
        "&comment=" + encodeURIComponent(comment);

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data && data.error) {
                alert(data.error);
                return;
            }
            const comments = (data && data.comments) ? data.comments : [];
            renderCommentsList(comments);
            recentCommentsCache = comments.slice(0, 8);
            tickerIndex = 0;
            startCommentTicker();

            textInput.value = "";
            nameInput.value = "";
            updateCommentCharCount();
        })
        .catch(() => {
            alert("Gagal mengirim komentar. Coba lagi nanti.");
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
}

function updateCommentCharCount() {
    const textInput = document.getElementById("commentTextInput");
    const counter = document.getElementById("commentCharCount");
    if (!textInput || !counter) return;
    counter.textContent = textInput.value.length + " / 200";
}

document.addEventListener("DOMContentLoaded", () => {
    const ticker = document.getElementById("commentTicker");
    if (ticker) loadRecentCommentsForTicker();

    const textInput = document.getElementById("commentTextInput");
    if (textInput) textInput.addEventListener("input", updateCommentCharCount);

    const submitBtn = document.getElementById("commentSubmitBtn");
    if (submitBtn) submitBtn.addEventListener("click", submitComment);
});

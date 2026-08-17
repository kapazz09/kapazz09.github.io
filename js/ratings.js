// ==================================================
// WIDGET RATING BINTANG
// Rating asli dari pengunjung situs (bukan rating Google),
// disimpan di Google Sheet lewat Apps Script Web App.
// ==================================================

// GANTI dengan Web App URL dari Apps Script kamu (langkah deploy)
const RATING_API_URL = "https://script.google.com/macros/s/AKfycbyDNTDrhLTfLINt4c4t1EU1ox5wZEKpDrPWEn5gsLn4pgAQMP8o2qRwIIQ2YcRqZTQ/exec";

function loadRatingSummary() {
    fetch(RATING_API_URL)
        .then(res => res.json())
        .then(data => updateRatingDisplay(data))
        .catch(() => {
            const el = document.getElementById('ratingSummary');
            if (el) el.textContent = 'Gagal memuat rating.';
        });
}

function updateRatingDisplay(data) {
    const summary = document.getElementById('ratingSummary');
    if (!summary) return;
    if (data.count > 0) {
        summary.textContent = data.average.toFixed(1) + ' dari ' + data.count + ' penilaian';
    } else {
        summary.textContent = 'Jadilah yang pertama menilai!';
    }
}

function highlightStars(value) {
    document.querySelectorAll('#starRating .star').forEach(star => {
        star.classList.toggle('filled', Number(star.dataset.value) <= value);
    });
}

function submitRating(value) {
    if (localStorage.getItem('kapazzRated')) {
        return;
    }

    fetch(RATING_API_URL + '?rating=' + value)
        .then(res => res.json())
        .then(data => {
            updateRatingDisplay(data);
            localStorage.setItem('kapazzRated', value);
            highlightStars(value);
            const widget = document.getElementById('starRating');
            if (widget) widget.classList.add('rated');
        })
        .catch(() => {
            alert('Gagal mengirim rating, coba lagi nanti.');
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const widget = document.getElementById('starRating');
    if (!widget) return;

    loadRatingSummary();

    const alreadyRated = localStorage.getItem('kapazzRated');
    if (alreadyRated) {
        highlightStars(Number(alreadyRated));
        widget.classList.add('rated');
    }

    widget.querySelectorAll('.star').forEach(star => {
        star.addEventListener('mouseenter', () => {
            if (widget.classList.contains('rated')) return;
            highlightStars(Number(star.dataset.value));
        });

        star.addEventListener('click', () => {
            if (widget.classList.contains('rated')) return;
            submitRating(Number(star.dataset.value));
        });
    });

    widget.addEventListener('mouseleave', () => {
        if (widget.classList.contains('rated')) return;
        const rated = localStorage.getItem('kapazzRated');
        highlightStars(rated ? Number(rated) : 0);
    });
});

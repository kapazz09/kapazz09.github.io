// ==================================================
// KAPAZZ BITCOIN - SCAM RADAR
// Accordion kartu modus (satu kartu terbuka bergantian) +
// event Google Analytics saat kartu DIBUKA (bukan ditutup).
// Halaman mandiri, tidak bergantung file di folder lain.
// ==================================================

// Aman kalau GA diblokir adblock: tidak melempar error
function kbTrack(name, params) {
    try {
        if (typeof gtag === 'function') {
            gtag('event', name, params || {});
        }
    } catch (e) { /* abaikan */ }
}

(function () {
    var cards = document.querySelectorAll('.sr-card');

    function setOpen(card, open) {
        var head = card.querySelector('.sr-card-head');
        var body = card.querySelector('.sr-card-body');
        card.classList.toggle('open', open);
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
            body.removeAttribute('hidden');
        } else {
            body.setAttribute('hidden', '');
        }
    }

    cards.forEach(function (card) {
        var head = card.querySelector('.sr-card-head');
        head.addEventListener('click', function () {
            var willOpen = !card.classList.contains('open');

            // Tutup kartu lain supaya yang terbuka bergantian
            cards.forEach(function (other) {
                if (other !== card) setOpen(other, false);
            });
            setOpen(card, willOpen);

            if (willOpen) {
                kbTrack('scam_radar_item_open', { item_id: card.getAttribute('data-item-id') });
                // Pastikan judul kartu terlihat setelah kartu lain menutup
                var top = card.getBoundingClientRect().top;
                if (top < 0) {
                    card.scrollIntoView({ block: 'start' });
                }
            }
        });
    });
})();

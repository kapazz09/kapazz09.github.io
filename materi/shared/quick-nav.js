/*==================================================
    KAPAZZ BITCOIN - QUICK NAV LINTAS MATERI
    Dipakai di SEMUA halaman "materi/.../index.html".
    Butuh materi/shared/site-index.js dimuat SEBELUM
    file ini (berisi MATERI_LIST & MATERI_TOPIC_INDEX).

    File ini generik -- tidak ada apapun yang hardcode
    ke materi tertentu. Materi yang lagi aktif dideteksi
    otomatis dari nama folder di URL halaman itu sendiri.
==================================================*/

function getCurrentMateriId() {
    const path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
    const folder = path.split('/').filter(Boolean).pop();
    const found = MATERI_LIST.find(m => m.folder === folder);
    return found ? found.id : null;
}

function getMateriUrl(materi, sectionId) {
    if (materi.external) return materi.url;
    const base = '../' + materi.folder + '/index.html';
    return sectionId ? base + '#' + sectionId : base;
}

function escapeHtmlLite(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
}

function navigateToMateriSection(materi, sectionId, isCurrent) {
    closeQuickNav();
    if (isCurrent) {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
    }
    if (materi.external) {
        window.open(materi.url, '_blank');
        return;
    }
    window.location.href = getMateriUrl(materi, sectionId);
}

// ---------- "Lompat ke Section" (dalam materi ini + daftar materi lain) ----------
function renderQuickNavLinks() {
    const currentId = getCurrentMateriId();
    const currentSectionsEl = document.getElementById('quickNavCurrentSections');
    const otherMateriEl = document.getElementById('quickNavOtherMateri');
    if (!currentSectionsEl || !otherMateriEl) return;

    const currentMateri = MATERI_LIST.find(m => m.id === currentId);
    const currentSections = MATERI_TOPIC_INDEX.filter(t => t.materiId === currentId);

    currentSectionsEl.innerHTML = currentSections.map(s =>
        '<button type="button" data-scroll-target="' + s.sectionId + '">' + escapeHtmlLite(s.sectionTitle) + '</button>'
    ).join('');
    currentSectionsEl.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            closeQuickNav();
            const el = document.getElementById(btn.dataset.scrollTarget);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        });
    });

    const others = MATERI_LIST.filter(m => m.id !== currentId);
    otherMateriEl.innerHTML = others.map(m =>
        '<button type="button" data-materi-id="' + m.id + '">' + m.num + '. ' + escapeHtmlLite(m.title) + '</button>'
    ).join('');
    otherMateriEl.querySelectorAll('button').forEach(btn => {
        const materi = others.find(m => m.id === btn.dataset.materiId);
        btn.addEventListener('click', () => {
            closeQuickNav();
            if (materi.external) window.open(materi.url, '_blank');
            else window.location.href = getMateriUrl(materi);
        });
    });
}

// ---------- Search lintas-materi ----------
let quickNavIndexCache = null;

function buildQuickNavSearchIndex() {
    const currentId = getCurrentMateriId();
    const index = [];

    MATERI_TOPIC_INDEX.forEach(entry => {
        const materi = MATERI_LIST.find(m => m.id === entry.materiId);
        if (!materi) return;
        const isCurrent = entry.materiId === currentId;

        // Section itu sendiri jadi 1 entri yang bisa dicari
        index.push({
            title: entry.sectionTitle,
            materiTitle: materi.title,
            materiNum: materi.num,
            isCurrent: isCurrent,
            action: () => navigateToMateriSection(materi, entry.sectionId, isCurrent)
        });

        // Tiap istilah di section itu jadi entri terpisah, supaya
        // pencarian nama istilah persis langsung ketemu
        (entry.terms || []).forEach(term => {
            index.push({
                title: term,
                materiTitle: materi.title,
                materiNum: materi.num,
                isCurrent: isCurrent,
                sectionTitle: entry.sectionTitle,
                action: () => navigateToMateriSection(materi, entry.sectionId, isCurrent)
            });
        });
    });

    return index;
}

function getQuickNavIndex() {
    if (!quickNavIndexCache) quickNavIndexCache = buildQuickNavSearchIndex();
    return quickNavIndexCache;
}

function renderQuickNavResults(query) {
    const resultsEl = document.getElementById('quickNavResults');
    if (!resultsEl) return;

    const q = query.trim().toLowerCase();
    if (!q) {
        resultsEl.classList.remove('show');
        resultsEl.innerHTML = '';
        return;
    }

    const seenSections = new Set();
    const matches = [];
    for (const item of getQuickNavIndex()) {
        if (matches.length >= 20) break;
        const haystack = (item.title + ' ' + (item.sectionTitle || '')).toLowerCase();
        if (!haystack.includes(q)) continue;

        // Kalau ini entri "section" (tanpa sectionTitle terpisah) dan section
        // yang sama sudah muncul lewat istilahnya, jangan dobel ditampilkan
        const sectionKey = item.materiNum + '|' + (item.sectionTitle || item.title);
        if (!item.sectionTitle) {
            if (seenSections.has(sectionKey)) continue;
        }
        seenSections.add(sectionKey);
        matches.push(item);
    }

    resultsEl.classList.add('show');

    if (matches.length === 0) {
        resultsEl.innerHTML = '<p class="quick-nav-no-result">Tidak ditemukan.</p>';
        return;
    }

    resultsEl.innerHTML = matches.map((item, i) => {
        const badge = item.isCurrent ? 'Di halaman ini' : ('Materi #' + item.materiNum + ' — ' + item.materiTitle);
        const sub = item.sectionTitle ? (badge + ' · ' + item.sectionTitle) : badge;
        return '<button type="button" class="quick-nav-result-item" data-result-index="' + i + '">' +
            '<span class="quick-nav-result-icon">' + (item.isCurrent ? '📍' : '📚') + '</span>' +
            '<span class="quick-nav-result-text">' +
            '<strong>' + escapeHtmlLite(item.title) + '</strong>' +
            '<small>' + escapeHtmlLite(sub) + '</small>' +
            '</span>' +
            '</button>';
    }).join('');

    resultsEl.querySelectorAll('.quick-nav-result-item').forEach((btn, i) => {
        btn.addEventListener('click', () => matches[i].action());
    });
}

// ---------- Buka/tutup panel ----------
function openQuickNav() {
    const backdrop = document.getElementById('quickNavBackdrop');
    const panel = document.getElementById('quickNavPanel');
    if (!backdrop || !panel) return;

    renderQuickNavLinks();

    panel.classList.remove('quick-nav-anim');
    void panel.offsetWidth;
    panel.classList.add('quick-nav-anim');

    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';

    const input = document.getElementById('quickNavSearchInput');
    if (input) {
        input.value = '';
        renderQuickNavResults('');
        setTimeout(() => input.focus(), 150);
    }
}

function closeQuickNav() {
    const backdrop = document.getElementById('quickNavBackdrop');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
}

function closeQuickNavOnBackdrop(event) {
    if (event.target.id === 'quickNavBackdrop') closeQuickNav();
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const input = document.getElementById('quickNavSearchInput');
    if (input) input.addEventListener('input', (e) => renderQuickNavResults(e.target.value));
});

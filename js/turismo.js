(() => {
  'use strict';

  const ICONOS = window.ICONOS;
  const CATS = window.CATEGORIAS;

  /* ---------- pictogramas por categoría (trazo, 64x64) ---------- */
  const PICTOS = {
    fauna: '<path d="M10 38c6-1 11-5 14-11 3-6 9-10 16-10 5 0 9 3 11 7l7 2-7 3c0 10-8 18-19 18H18"/><path d="M24 47l-4 9M32 47l2 9"/><circle cx="44" cy="22" r="1.4"/><path d="M26 32c5 2 10 1 14-3"/>',
    naturaleza: '<circle cx="46" cy="16" r="6"/><path d="M4 52l16-24 9 12 9-16 22 28z"/><path d="M15 36l5 3 4-3M33 31l5 4 4-3"/>',
    patrimonio: '<path d="M32 6v8M28 10h8"/><path d="M20 30l12-14 12 14"/><path d="M14 58V30h36v28"/><path d="M26 58V44a6 6 0 0 1 12 0v14"/><path d="M8 58h48"/><circle cx="32" cy="26" r="2.5"/>',
    orgullo: '<path d="M32 8l6.5 13.4 14.7 2.1-10.6 10.4 2.5 14.6L32 41.6l-13.1 6.9 2.5-14.6L10.8 23.5l14.7-2.1z"/><path d="M22 56h20"/>',
    sabores: '<path d="M12 28h34v10a15 15 0 0 1-15 15h-4a15 15 0 0 1-15-15z"/><path d="M46 31h4a6 6 0 0 1 0 12h-5"/><path d="M8 58h44"/><path d="M22 20c0-4 4-4 4-8M30 20c0-4 4-4 4-8"/>',
    artesania: '<path d="M10 28h44l-5 26H15z"/><path d="M18 28c0-10 6-17 14-17s14 7 14 17"/><path d="M12 36h40M14 44h36M22 28l2 26M32 28v26M42 28l-2 26"/>'
  };

  const color = (cat) => `var(--cat-${cat})`;
  const pad = (n) => String(n).padStart(2, '0');

  const artHTML = (item, withCat = true) => `
    <div class="art" style="--c:${color(item.cat)}">
      ${withCat ? `<span class="art-cat">${CATS[item.cat].label}</span>` : ''}
      <svg viewBox="0 0 64 64" aria-hidden="true">${PICTOS[item.cat]}</svg>
      <span class="art-num">${pad(item.n)}</span>
    </div>`;

  /* ---------- grilla ---------- */
  const grid = document.getElementById('grid');
  grid.innerHTML = ICONOS.map((item) => `
    <li data-cat="${item.cat}" style="animation-delay:${Math.min(item.n, 12) * 35}ms">
      <button class="card" type="button" data-n="${item.n}" aria-label="${item.n}. ${item.name}: leer su historia">
        ${artHTML(item)}
        <div class="card-body">
          <h3 class="card-title">${item.name}</h3>
          <p class="card-place">${item.place}</p>
          <span class="card-more">Leer historia →</span>
        </div>
      </button>
    </li>`).join('');

  /* ---------- filtros ---------- */
  const filters = document.getElementById('filters');
  const counts = ICONOS.reduce((acc, i) => ((acc[i.cat] = (acc[i.cat] || 0) + 1), acc), {});
  filters.innerHTML =
    `<button class="filter" type="button" data-filter="all" aria-pressed="true">Todos <small>${ICONOS.length}</small></button>` +
    Object.entries(CATS).map(([key, c]) =>
      `<button class="filter" type="button" data-filter="${key}" aria-pressed="false" style="--c:${color(key)}"><i></i>${c.label} <small>${counts[key] || 0}</small></button>`
    ).join('');

  let visible = ICONOS.map((i) => i.n);

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    const f = btn.dataset.filter;
    filters.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    grid.querySelectorAll('li').forEach((li) => {
      const show = f === 'all' || li.dataset.cat === f;
      li.classList.toggle('hidden', !show);
      if (show) { li.style.animation = 'none'; void li.offsetWidth; li.style.animation = ''; }
    });
    visible = ICONOS.filter((i) => f === 'all' || i.cat === f).map((i) => i.n);
  });

  /* ---------- detalle ---------- */
  const dialog = document.getElementById('detail');
  const $ = (id) => document.getElementById(id);
  let current = null;

  const open = (n, { updateHash = true } = {}) => {
    const item = ICONOS.find((i) => i.n === n);
    if (!item) return;
    current = n;
    $('detailArt').innerHTML = artHTML(item, false);
    $('detailMeta').textContent = `Ícono ${pad(item.n)} de ${ICONOS.length} · ${CATS[item.cat].label}`;
    $('detailTitle').textContent = item.name;
    $('detailPlace').textContent = item.place;
    $('detailStory').innerHTML = item.story.map((p) => `<p>${p}</p>`).join('');
    $('detailPieza').textContent = `Centro de mesa: ${item.pieza}`;
    dialog.querySelector('.detail-body').scrollTop = 0;
    if (!dialog.open) dialog.showModal();
    if (updateHash) history.replaceState(null, '', `#icono-${n}`);
  };

  const close = () => {
    if (dialog.open) dialog.close();
  };

  dialog.addEventListener('close', () => {
    history.replaceState(null, '', location.pathname + location.search);
    const card = grid.querySelector(`[data-n="${current}"]`);
    if (card) card.focus({ preventScroll: false });
  });

  const step = (dir) => {
    const list = visible.length ? visible : ICONOS.map((i) => i.n);
    const idx = list.indexOf(current);
    const next = list[(idx + dir + list.length) % list.length];
    open(next);
  };

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card) open(Number(card.dataset.n));
  });
  $('detailClose').addEventListener('click', close);
  $('detailPrev').addEventListener('click', () => step(-1));
  $('detailNext').addEventListener('click', () => step(1));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });

  // Enlace directo a un ícono (p. ej. un QR en cada centro de mesa): turismo#icono-12
  const fromHash = () => {
    const m = location.hash.match(/^#icono-(\d+)$/);
    if (m) open(Number(m[1]), { updateHash: false });
  };
  window.addEventListener('hashchange', fromHash);
  fromHash();

  /* ---------- barra superior ---------- */
  const topbar = document.querySelector('.topbar');
  const onScroll = () => topbar.classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.75);
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

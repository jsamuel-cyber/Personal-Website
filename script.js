/* Site behaviour. Vanilla JS, no dependencies. Data lives in content.js. */

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktopQuery = window.matchMedia('(min-width: 1024px)');
const phoneQuery = window.matchMedia('(max-width: 767px)');

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/* ===== Photo galleries and lightbox ===== */
let currentGalleryContext = null;

// Each frame carries its photo's shape: --ar for the desktop row (0.8-2.2), --ar-m for the phone (1-2.2).
// Lazy photos in closed panels have not loaded yet, so after the page has loaded each photo is also
// read once through a plain Image (cached afterwards) to get its shape before the panel is opened.
const ratioProbes = [];
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
let relayoutQueued = false;
function frameRatio(frame, w, h) {
  if (!w || !h) return;
  frame.style.setProperty('--ar', clamp(w / h, 0.8, 2.2).toFixed(3));
  frame.style.setProperty('--ar-m', clamp(w / h, 1, 2.2).toFixed(3));
  if (!relayoutQueued) {
    relayoutQueued = true;
    requestAnimationFrame(() => { relayoutQueued = false; if (typeof measurePanels === 'function' && expList.children.length) measurePanels(); });
  }
}

// Thumbnails are keyboard-accessible buttons; captions only show inside the lightbox
function buildGallery(photos, galleryId) {
  const gallery = el('div', 'photo-gallery');
  gallery.setAttribute('data-gallery-id', galleryId);
  gallery.setAttribute('data-count', photos.length);

  photos.forEach((photo, idx) => {
    const btn = el('button', 'photo-btn');
    btn.type = 'button';
    btn.setAttribute('aria-label', `View photo: ${photo.alt || 'photo'}`);
    btn.setAttribute('data-photo-idx', idx);

    const img = el('img');
    img.src = photo.src;
    img.alt = photo.alt || 'photo';
    img.loading = 'lazy';
    img.style.objectPosition = photo.position || 'center 30%';
    img.addEventListener('load', () => frameRatio(btn, img.naturalWidth, img.naturalHeight));
    btn.appendChild(img);
    ratioProbes.push(() => {
      const probe = new Image();
      probe.onload = () => frameRatio(btn, probe.naturalWidth, probe.naturalHeight);
      probe.src = photo.src;
    });

    btn.addEventListener('click', () => {
      currentGalleryContext = { photos, currentIndex: idx, galleryId };
      openLightboxPhoto(idx, btn);
    });
    gallery.appendChild(btn);
  });
  return gallery;
}

function renderGallery(containerId, photos) {
  if (!photos || photos.length === 0) return;
  const container = document.getElementById(containerId);
  if (container) container.appendChild(buildGallery(photos, containerId));
}

// Move through the open gallery, wrapping at the ends (buttons, keys and swipe)
function stepLightbox(delta) {
  if (!currentGalleryContext) return;
  const n = currentGalleryContext.photos.length;
  openLightboxPhoto((currentGalleryContext.currentIndex + delta + n) % n);
}

function openLightboxPhoto(idx, opener) {
  const context = currentGalleryContext;
  if (!context) return;
  const photo = context.photos[idx];
  const lightbox = document.getElementById('lightbox');
  const total = context.photos.length;

  const img = lightbox.querySelector('.lightbox-img');
  img.src = photo.src;
  img.alt = photo.alt || 'Photo';
  lightbox.querySelector('.lightbox-caption').textContent = photo.caption || '';

  const bar = lightbox.querySelector('.lightbox-bar');
  bar.hidden = total < 2; // counter and arrows only matter with more than one photo
  lightbox.querySelector('.lightbox-counter').textContent = `${idx + 1} / ${total}`;
  lightbox.querySelector('[data-action="prev"]').setAttribute('aria-label', `Previous photo (${(idx - 1 + total) % total + 1} of ${total})`);
  lightbox.querySelector('[data-action="next"]').setAttribute('aria-label', `Next photo (${(idx + 1) % total + 1} of ${total})`);

  context.currentIndex = idx;
  openDialog(lightbox, opener);
}

document.querySelector('#lightbox [data-action="prev"]').addEventListener('click', () => stepLightbox(-1));
document.querySelector('#lightbox [data-action="next"]').addEventListener('click', () => stepLightbox(1));

// Swipe left for the next photo, right for the previous one
let touchStartX = null;
const lightboxEl = document.getElementById('lightbox');
lightboxEl.addEventListener('touchstart', e => {
  touchStartX = currentGalleryContext && currentGalleryContext.photos.length > 1 ? e.changedTouches[0].clientX : null;
}, { passive: true });
lightboxEl.addEventListener('touchend', e => {
  if (touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
}, { passive: true });

/* ===== Experience ===== */
const expList = document.getElementById('exp-list');

function buildCopyLink(id, title) {
  const wrap = el('div', 'exp-copy-row');
  const btn = el('button', 'exp-copy');
  btn.type = 'button';
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg><span class="exp-copy-label">Copy link</span>';
  btn.setAttribute('aria-label', `Copy link to the ${title} role`);

  const live = el('span', 'sr-only');
  live.setAttribute('aria-live', 'polite');

  const label = btn.querySelector('.exp-copy-label');
  let timer = null;
  btn.addEventListener('click', async () => {
    const url = location.origin + location.pathname + `#role-${id}`;
    let ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        ok = true;
      }
    } catch (e) { /* fall through to the fallback */ }
    if (!ok) ok = copyTextFallback(url, wrap);
    const msg = ok ? 'Link copied' : 'Couldn’t copy — use the address bar';
    label.textContent = msg;
    live.textContent = msg;
    clearTimeout(timer);
    timer = setTimeout(() => { label.textContent = 'Copy link'; live.textContent = ''; }, 2000);
  });

  wrap.append(btn, live);
  return wrap;
}

// Fallback when the async clipboard API is unavailable
function copyTextFallback(text, parent) {
  const input = el('input');
  input.type = 'text';
  input.value = text;
  input.readOnly = true;
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');
  input.style.cssText = 'position:absolute;left:-9999px;top:0;opacity:0';
  parent.appendChild(input);
  input.select();
  input.setSelectionRange(0, text.length);
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  input.remove();
  return ok;
}

function renderExperiences() {
  expList.style.setProperty('--n', experiences.length);
  experiences.forEach((exp, i) => {
    const open = i === 0;
    const row = el('div', 'exp');
    row.id = `role-${exp.id}`;

    const bar = el('button', 'exp-bar');
    bar.type = 'button';
    bar.setAttribute('aria-expanded', String(open));
    bar.setAttribute('aria-controls', `body-${exp.id}`);
    const main = el('span', 'exp-main');
    const title = el('span', 'exp-title', exp.title);
    title.id = `exp-title-${exp.id}`;
    main.append(title, el('span', 'exp-role', exp.role));
    const plus = el('span', 'exp-plus');
    plus.setAttribute('aria-hidden', 'true');
    bar.append(main, el('span', 'exp-dates', exp.dates), plus);

    const body = el('div', open ? 'exp-body open' : 'exp-body');
    body.id = `body-${exp.id}`;
    body.setAttribute('role', 'region');
    body.setAttribute('aria-labelledby', title.id);
    body.inert = !open;

    const panel = el('div', 'exp-panel');
    const inner = el('div', 'exp-panel-inner');

    // Desktop: photos, plus a type plate with the location when there is room (or no photo at all).
    // The plate repeats the location, so it is hidden from screen readers and from the phone layout.
    const visual = el('div', 'exp-visual');
    visual.setAttribute('data-count', (exp.photos || []).length);
    if (exp.photos && exp.photos.length > 0) visual.appendChild(buildGallery(exp.photos, `gallery-${exp.id}`));
    if (!exp.photos || exp.photos.length < 2) {
      const plate = el('div', 'exp-plate', exp.loc);
      plate.setAttribute('aria-hidden', 'true');
      visual.appendChild(plate);
    }
    inner.appendChild(visual);

    const meta = el('p', 'exp-meta');
    [exp.role, exp.loc, exp.dates].forEach(part => meta.appendChild(el('span', null, part)));
    inner.appendChild(meta);

    const ul = el('ul', 'exp-bullets');
    exp.bullets.forEach(b => ul.appendChild(el('li', null, b)));
    inner.appendChild(ul);
    inner.appendChild(buildCopyLink(exp.id, exp.title));

    panel.appendChild(inner);
    body.appendChild(panel);
    bar.addEventListener('click', () => selectExp(exp.id));
    row.append(bar, body);
    expList.appendChild(row);
  });
}

const expBar = id => document.querySelector(`#role-${id} .exp-bar`);
const expBody = id => document.getElementById(`body-${id}`);
const isOpen = id => expBody(id).classList.contains('open');
const openIds = () => experiences.filter(e => isOpen(e.id)).map(e => e.id);

// Single source of truth for one row. opts.hash: replace the URL hash when opening.
function setExpOpen(id, open, opts) {
  const body = expBody(id);
  if (!body) return;
  body.classList.toggle('open', open);
  body.inert = !open;
  expBar(id).setAttribute('aria-expanded', String(open));
  if (open && opts && opts.hash) history.replaceState(null, '', `#role-${id}`);
}

// Master-detail: exactly one role open. Accordion: toggle just this one.
function selectExp(id, opts) {
  const o = Object.assign({ hash: true }, opts);
  if (desktopQuery.matches) {
    if (isOpen(id) && openIds().length === 1) return;
    experiences.forEach(e => setExpOpen(e.id, e.id === id, o));
    if (!reducedMotion()) {
      const inner = expBody(id).querySelector('.exp-panel-inner');
      inner.classList.remove('swap');
      void inner.offsetWidth;
      inner.classList.add('swap');
      inner.addEventListener('animationend', () => inner.classList.remove('swap'), { once: true });
    }
  } else {
    const open = !isOpen(id);
    setExpOpen(id, open, o);
    if (open) ensureExpHeaderVisible(id);
  }
  syncToggleAll();
}

function allExpOpen() {
  return experiences.every(e => isOpen(e.id));
}

function syncToggleAll() {
  const label = document.querySelector('.exp-toggle-label');
  if (label) label.textContent = allExpOpen() ? 'Collapse all' : 'Expand all';
}

const navBottom = () => document.querySelector('.site-header').getBoundingClientRect().bottom;

// Accordion: bring a just-opened header under the sticky nav if it would be cut off
function ensureExpHeaderVisible(id) {
  const bar = expBar(id);
  const r = bar.getBoundingClientRect();
  const finalBottom = r.bottom + expBody(id).querySelector('.exp-panel-inner').offsetHeight;
  if (r.top < navBottom() || finalBottom > window.innerHeight) {
    const target = Math.max(0, Math.floor(r.top + window.scrollY - navBottom()));
    if (Math.abs(target - window.scrollY) >= 1) {
      window.scrollTo({ top: target, behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
  }
}

// Master-detail: every panel is as tall as the tallest one (or the list, if that is taller), and the
// photo row of each panel takes up the difference (190-300px), so no panel ends in a dead band.
const VISUAL_MIN = 190, VISUAL_MAX = 300;
function measurePanels() {
  if (!desktopQuery.matches) {
    expList.style.removeProperty('--panel-min');
    return;
  }
  expList.style.removeProperty('--panel-min');
  const bars = Array.from(expList.querySelectorAll('.exp-bar'));
  const listH = bars[bars.length - 1].getBoundingClientRect().bottom - bars[0].getBoundingClientRect().top + 1;
  const items = experiences.map(e => {
    const body = expBody(e.id);
    const visual = body.querySelector('.exp-visual');
    visual.classList.remove('no-plate');
    visual.style.setProperty('--vh', `${VISUAL_MIN}px`);
    const keep = { display: body.style.display, self: body.style.alignSelf };
    body.style.display = 'block';
    body.style.alignSelf = 'start';
    return { body, visual, keep, natural: body.offsetHeight };
  });
  const target = Math.max(listH, ...items.map(i => i.natural));
  items.forEach(i => {
    const vh = clamp(VISUAL_MIN + (target - i.natural), VISUAL_MIN, VISUAL_MAX);
    i.visual.style.setProperty('--vh', `${vh}px`);
    // one photo: keep the plate only if at least 200px remain beside the frame
    const gallery = i.visual.querySelector('.photo-gallery');
    if (gallery && i.visual.getAttribute('data-count') === '1') {
      const ar = parseFloat(gallery.firstElementChild.style.getPropertyValue('--ar')) || 1.5;
      const spare = i.visual.clientWidth - 12 - vh * ar;
      i.visual.classList.toggle('no-plate', spare < 200);
    }
    i.body.style.display = i.keep.display;
    i.body.style.alignSelf = i.keep.self;
  });
  expList.style.setProperty('--panel-min', `${Math.ceil(target)}px`);
}

function expIdFromHash() {
  const m = /^#role-([\w-]+)$/.exec(location.hash);
  return m && expBody(m[1]) ? m[1] : null;
}

// Put a role (accordion) or the whole master-detail block (desktop) at the top, below the nav
function scrollExpIntoView(id, smooth) {
  const target = desktopQuery.matches ? document.getElementById('experience') : expBar(id);
  const y = Math.floor(target.getBoundingClientRect().top + window.scrollY - navBottom());
  window.scrollTo({ top: Math.max(0, y), behavior: smooth && !reducedMotion() ? 'smooth' : 'instant' });
}

function openExpFromHash(smooth) {
  const id = expIdFromHash();
  if (!id) return false;
  if (desktopQuery.matches) experiences.forEach(e => setExpOpen(e.id, e.id === id));
  else setExpOpen(id, true);
  syncToggleAll();
  scrollExpIntoView(id, smooth);
  return true;
}

// Keep the state valid when the layout crosses 1024px: desktop shows exactly one role
function normaliseExp() {
  if (desktopQuery.matches) {
    const open = openIds();
    const keep = expIdFromHash() || open[0] || experiences[0].id;
    experiences.forEach(e => setExpOpen(e.id, e.id === keep));
  }
  measurePanels();
  syncToggleAll();
}

function initExperience() {
  renderExperiences();

  document.querySelector('.exp-toggle-all').addEventListener('click', () => {
    const open = !allExpOpen();
    experiences.forEach(e => setExpOpen(e.id, open));
    syncToggleAll();
  });

  normaliseExp();
  desktopQuery.addEventListener('change', normaliseExp);
  window.addEventListener('resize', measurePanels);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measurePanels);

  // Deep link on load. Lazy photos and webfonts can still shift the layout above the target,
  // so keep the linked role pinned until the layout settles or the reader scrolls.
  if (openExpFromHash(false)) {
    let userScrolled = false;
    ['wheel', 'touchstart', 'keydown'].forEach(t => window.addEventListener(t, () => { userScrolled = true; }, { once: true, passive: true }));
    const settle = () => { if (!userScrolled && expIdFromHash()) scrollExpIntoView(expIdFromHash(), false); };
    window.addEventListener('load', settle);
    if ('ResizeObserver' in window) {
      const started = Date.now();
      const ro = new ResizeObserver(() => {
        if (userScrolled || Date.now() - started > 4000) ro.disconnect();
        else settle();
      });
      ro.observe(expList);
    }
  }
  window.addEventListener('hashchange', () => openExpFromHash(true));
}

/* ===== Dialogs, with a focus trap ===== */
let dialogStack = [];
const dialogOpeners = new Map();
const menuEl = document.getElementById('menu');
const menuBtn = document.getElementById('menu-btn');
const menuOpen = () => menuEl.classList.contains('open');

function focusable(container) {
  return Array.from(container.querySelectorAll('a[href], button, input:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    .filter(n => !n.hidden && !n.closest('[inert]') && getComputedStyle(n).visibility !== 'hidden' && n.getClientRects().length > 0);
}

// The container that currently owns the keyboard: the top dialog, else the phone menu
function trapContainer() {
  if (dialogStack.length) return document.getElementById(dialogStack[dialogStack.length - 1]);
  if (menuOpen()) return document.querySelector('.site-header');
  return null;
}

function trapFocus(e) {
  if (e.key !== 'Tab') return;
  const box = trapContainer();
  if (!box) return;
  const items = focusable(box);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (!box.contains(document.activeElement)) {
    e.preventDefault();
    first.focus();
  } else if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function openDialog(dialogEl, opener) {
  const id = dialogEl.id;
  if (dialogEl.classList.contains('open')) return; // stepping through lightbox photos keeps the original opener
  dialogOpeners.set(id, opener || document.activeElement);
  dialogEl.classList.add('open');
  document.body.style.overflow = 'hidden';
  dialogStack.push(id);
  const close = dialogEl.querySelector('.mclose');
  if (close) close.focus();
}

function closeDialog(dialogEl) {
  const id = dialogEl.id;
  dialogEl.classList.remove('open');
  dialogStack = dialogStack.filter(d => d !== id);
  if (!dialogStack.length) document.body.style.overflow = '';
  const opener = dialogOpeners.get(id);
  dialogOpeners.delete(id);
  if (opener && opener.isConnected) opener.focus();
}

document.addEventListener('keydown', e => {
  trapFocus(e);
  if (e.key === 'Escape') {
    if (dialogStack.length) closeDialog(document.getElementById(dialogStack[dialogStack.length - 1]));
    else if (menuOpen()) setMenu(false);
  }
  if (dialogStack.includes('lightbox') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    e.preventDefault();
    stepLightbox(e.key === 'ArrowLeft' ? -1 : 1);
  }
});

// Click on the backdrop closes
document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay') && e.target.classList.contains('open')) closeDialog(e.target);
});
document.querySelectorAll('.mclose').forEach(btn => {
  btn.addEventListener('click', () => closeDialog(btn.closest('.overlay')));
});
document.getElementById('blame-trigger').addEventListener('click', function () {
  openDialog(document.getElementById('blame-modal'), this);
});

/* ===== Phone menu ===== */
function setMenu(open) {
  if (open === menuOpen()) return;
  menuEl.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? 'Close' : 'Menu';
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) menuEl.querySelector('.nav-links a').focus();
  else menuBtn.focus({ preventScroll: true });
}
menuBtn.addEventListener('click', () => setMenu(!menuOpen()));
menuEl.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
phoneQuery.addEventListener('change', () => { if (!phoneQuery.matches && menuOpen()) setMenu(false); });

/* ===== Scroll: nav border, active link, back to top ===== */
const spyLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const spySections = spyLinks.map(a => document.getElementById(a.getAttribute('href').slice(1)));
const header = document.querySelector('.site-header');
const toTop = document.querySelector('.to-top');
const footer = document.querySelector('.site-footer');
let scrollQueued = false;

// Lift the back-to-top button above the dark footer so it never covers the footer links
function placeToTop() {
  toTop.style.setProperty('--lift', Math.max(0, window.innerHeight - footer.getBoundingClientRect().top) + 'px');
}

function onScroll() {
  scrollQueued = false;
  const root = document.documentElement;
  const y = root.scrollTop;
  header.classList.toggle('scrolled', y > 10);
  toTop.classList.toggle('show', y > 600);
  placeToTop();

  let active = null;
  if (y + root.clientHeight >= root.scrollHeight - 2) {
    active = spySections.indexOf(document.getElementById('contact'));
  } else {
    spySections.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= 160) active = i; });
  }
  spyLinks.forEach((a, i) => {
    const on = i === active;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScroll); }
}, { passive: true });

toTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  document.getElementById('main').focus({ preventScroll: true });
});

/* ===== Link decoration: new-tab notice and PDF page counts ===== */
// UPDATE the count here whenever you replace a PDF with a different length.
const PDF_PAGES = {
  'docs/resume.pdf': 1,
  'docs/writing-sample.pdf': 11,
  'docs/ames-brief.pdf': 25
};

function decorateLinks() {
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    if (!a.querySelector('.sr-only')) a.appendChild(el('span', 'sr-only', '(opens in new tab)'));
  });
  document.querySelectorAll('a[href$=".pdf"]').forEach(a => {
    if (a.querySelector('.pill')) return;
    const pages = PDF_PAGES[a.getAttribute('href')];
    const pill = el('span', 'pill', pages ? `PDF · ${pages} ${pages === 1 ? 'page' : 'pages'}` : 'PDF');
    (a.querySelector('.pill-slot') || a).appendChild(pill);
  });
}

/* ===== Init (scripts are deferred, so the DOM is ready) ===== */
function renderSkillsPhotos() {
  if (!skillsPhotos || skillsPhotos.length === 0) return;
  let box = document.getElementById('skills-photos');
  if (!box) {
    box = el('div');
    box.id = 'skills-photos';
    document.querySelector('#more .wrap').appendChild(box);
  }
  renderGallery('skills-photos', skillsPhotos);
}

initExperience();
window.addEventListener('load', () => ratioProbes.forEach(run => run()));
renderGallery('documentary-photos', documentaryPhotos);
renderSkillsPhotos();
decorateLinks();
onScroll();

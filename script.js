// Gallery navigation context
let currentGalleryContext = null;

// Build photo gallery with keyboard-accessible buttons and prev/next support
function buildGallery(photos, galleryId) {
  const gallery = document.createElement('div');
  gallery.className = 'photo-gallery';
  gallery.setAttribute('data-gallery-id', galleryId);

  photos.forEach((photo, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'photo-btn';
    btn.setAttribute('aria-label', `View photo: ${photo.alt || 'photo'}`);
    btn.setAttribute('data-photo-idx', idx);

    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt || 'photo';
    img.loading = 'lazy';
    img.addEventListener('load', () => recomputeExpBodyHeights());

    btn.appendChild(img);

    btn.addEventListener('click', () => {
      currentGalleryContext = {
        photos: photos,
        currentIndex: idx,
        galleryId: galleryId
      };
      openLightboxPhoto(idx);
    });

    const container = document.createElement('div');
    container.appendChild(btn);

    if (photo.caption) {
      const cap = document.createElement('div');
      cap.className = 'photo-caption';
      cap.textContent = photo.caption;
      container.appendChild(cap);
    }

    gallery.appendChild(container);
  });

  return gallery;
}

// Open lightbox with photo navigation support
// Move through the open gallery, wrapping at the ends (used by buttons, keys and swipe)
function stepLightbox(delta) {
  if (!currentGalleryContext) return;
  const n = currentGalleryContext.photos.length;
  openLightboxPhoto((currentGalleryContext.currentIndex + delta + n) % n);
}

function openLightboxPhoto(idx) {
  if (!currentGalleryContext) return;
  
  const context = currentGalleryContext;
  const photo = context.photos[idx];
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCap = lightbox.querySelector('.lightbox-caption');
  
  lightboxImg.src = photo.src;
  lightboxImg.alt = photo.alt || 'Photo';
  lightboxCap.textContent = photo.caption || '';
  
  // Update counter
  const counter = lightbox.querySelector('.lightbox-counter');
  if (counter) {
    counter.textContent = `${idx + 1} / ${context.photos.length}`;
  }
  
  const prevBtn = lightbox.querySelector('[data-action="prev"]');
  const nextBtn = lightbox.querySelector('[data-action="next"]');
  
  // Hide counter and arrows if only 1 photo
  if (counter) counter.style.display = context.photos.length > 1 ? '' : 'none';
  if (prevBtn) prevBtn.style.display = context.photos.length > 1 ? '' : 'none';
  if (nextBtn) nextBtn.style.display = context.photos.length > 1 ? '' : 'none';
  
  context.currentIndex = idx;
  openDialog(lightbox, document.querySelector(`[data-gallery-id="${context.galleryId}"] [data-photo-idx="${idx}"]`));
}

// Render experiences from content.js
function renderExperiences() {
  const list = document.getElementById('exp-list');
  experiences.forEach((exp, expIdx) => {
    const expDiv = document.createElement('div');
    expDiv.className = 'exp';
    expDiv.id = `role-${exp.id}`;

    const expBar = document.createElement('button');
    expBar.type = 'button';
    expBar.className = 'exp-bar';
    expBar.setAttribute('aria-expanded', expIdx === 0 ? 'true' : 'false');
    expBar.setAttribute('aria-controls', `body-${exp.id}`);

    const expMain = document.createElement('div');
    expMain.className = 'exp-main';

    const expTitle = document.createElement('div');
    expTitle.className = 'exp-title serif';
    expTitle.id = `exp-title-${exp.id}`;
    expTitle.textContent = exp.title;

    const expRole = document.createElement('div');
    expRole.className = 'exp-role';
    expRole.textContent = exp.role;

    // Add photo badge if photos exist
    if (exp.photos && exp.photos.length > 0) {
      const badge = document.createElement('div');
      badge.className = 'exp-badge';
      
      const SVG_NS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'currentColor');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z');
      svg.appendChild(path);
      badge.appendChild(svg);
      
      const text = document.createElement('span');
      text.textContent = exp.photos.length === 1 ? '1 photo' : `${exp.photos.length} photos`;
      badge.appendChild(text);
      
      expRole.appendChild(badge);
    }

    expMain.appendChild(expTitle);
    expMain.appendChild(expRole);

    const expMeta = document.createElement('div');
    expMeta.className = 'exp-meta';

    const expLoc = document.createElement('span');
    expLoc.className = 'loc';
    expLoc.textContent = exp.loc;

    const expDates = document.createElement('span');
    expDates.textContent = exp.dates;

    expMeta.appendChild(expLoc);
    expMeta.appendChild(expDates);

    const expPlus = document.createElement('div');
    expPlus.className = 'exp-plus';
    expPlus.id = `plus-${exp.id}`;
    expPlus.setAttribute('aria-hidden', 'true');

    // Add sr-only text for "View details" / "Hide details"
    const srText = document.createElement('span');
    srText.className = 'sr-only';
    srText.id = `sr-text-${exp.id}`;
    srText.textContent = expIdx === 0 ? 'Hide details' : 'View details';

    expBar.appendChild(expMain);
    expBar.appendChild(expMeta);
    expBar.appendChild(expPlus);
    expBar.appendChild(srText);

    const expBody = document.createElement('div');
    expBody.className = expIdx === 0 ? 'exp-body open' : 'exp-body';
    expBody.id = `body-${exp.id}`;
    expBody.setAttribute('role', 'region');
    expBody.setAttribute('aria-labelledby', `exp-title-${exp.id}`);
    if (expIdx === 0) {
      expBody.style.maxHeight = 'auto';
    } else {
      expBody.style.maxHeight = '0px';
    }

    const ul = document.createElement('ul');
    exp.bullets.forEach(bullet => {
      const li = document.createElement('li');
      li.textContent = bullet;
      ul.appendChild(li);
    });
    expBody.appendChild(ul);

    // Render photo gallery if photos exist
    if (exp.photos && exp.photos.length > 0) {
      const galleryId = `gallery-${exp.id}`;
      const modifiedBuildGallery = buildGallery(exp.photos, galleryId);
      expBody.appendChild(modifiedBuildGallery);
    }

    expBody.appendChild(buildCopyLink(exp.id));
    if (expIdx !== 0) expBody.inert = true; // closed rows keep their controls out of the tab order

    expBar.addEventListener('click', () => toggleExp(exp.id));

    expDiv.appendChild(expBar);
    expDiv.appendChild(expBody);
    list.appendChild(expDiv);
    
    if (expIdx === 0) {
      expPlus.classList.add('open');
    }
  });
}

// Single source of truth for opening/closing a row. opts.updateHash: replace the URL hash when opening.
function setExpOpen(id, open, opts) {
  const body = document.getElementById(`body-${id}`);
  const plus = document.getElementById(`plus-${id}`);
  if (!body || !plus) return;
  const bar = plus.closest('.exp-bar');
  const srText = document.getElementById(`sr-text-${id}`);

  body.classList.toggle('open', open);
  body.inert = !open;
  plus.classList.toggle('open', open);
  bar.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (srText) {
    srText.textContent = open ? 'Hide details' : 'View details';
  }
  body.style.maxHeight = open ? body.scrollHeight + 'px' : '0px';

  if (open && opts && opts.updateHash) {
    history.replaceState(null, '', `#role-${id}`);
  }
  syncToggleAll();
}

// Row header click (a user action)
function toggleExp(id) {
  const body = document.getElementById(`body-${id}`);
  const open = !body.classList.contains('open');
  setExpOpen(id, open, { updateHash: true });
  if (open) ensureExpHeaderVisible(id);
}

/* ===== EXPERIENCE CONTROLS: show/hide all, deep links, copy link, mobile visibility ===== */
const expPrefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const expNavHeight = () => {
  const nav = document.querySelector('nav');
  return nav ? nav.getBoundingClientRect().bottom : 0;
};

function allExpOpen() {
  const bars = document.querySelectorAll('#exp-list .exp-bar');
  return bars.length > 0 && Array.from(bars).every(b => b.getAttribute('aria-expanded') === 'true');
}

// Keep the "Show all roles" / "Hide all roles" button in step with the rows
function syncToggleAll() {
  const btn = document.querySelector('.exp-toggle-all');
  if (!btn) return;
  const all = allExpOpen();
  btn.classList.toggle('is-open', all);
  const label = btn.querySelector('.exp-toggle-label');
  if (label) label.textContent = all ? 'Hide all roles' : 'Show all roles';
}

// On narrow screens, bring a just-opened row's header under the sticky nav if it would be cut off
function ensureExpHeaderVisible(id) {
  if (window.innerWidth >= 720) return;
  const bar = document.getElementById(`role-${id}`).querySelector('.exp-bar');
  const body = document.getElementById(`body-${id}`);
  const navBottom = expNavHeight();
  const r = bar.getBoundingClientRect();
  const finalBottom = r.bottom + body.scrollHeight;
  if (r.top < navBottom || finalBottom > window.innerHeight) {
    const target = Math.max(0, Math.floor(r.top + window.scrollY - navBottom));
    if (Math.abs(target - window.scrollY) >= 1) {
      window.scrollTo({ top: target, behavior: expPrefersReducedMotion() ? 'instant' : 'smooth' });
    }
  }
}

function expIdFromHash() {
  const m = /^#role-([\w-]+)$/.exec(location.hash);
  return m && document.getElementById(`body-${m[1]}`) ? m[1] : null;
}

// Scroll a row so its top sits at or just below the sticky nav (floor keeps it from tucking under by a sub-pixel)
function scrollExpToNav(id, smooth) {
  const el = document.getElementById(`role-${id}`);
  const y = Math.floor(el.getBoundingClientRect().top + window.scrollY - expNavHeight());
  window.scrollTo({ top: Math.max(0, y), behavior: smooth && !expPrefersReducedMotion() ? 'smooth' : 'instant' });
}

// Open + scroll to the row named by the URL hash
function openExpFromHash(smooth) {
  const id = expIdFromHash();
  if (!id) return false;
  setExpOpen(id, true);
  scrollExpToNav(id, smooth);
  return true;
}

function buildCopyLink(id) {
  const wrap = document.createElement('div');
  wrap.className = 'exp-copy-row';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'exp-copy';
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg><span class="exp-copy-label">Copy link to this role</span>';

  const live = document.createElement('span');
  live.className = 'sr-only';
  live.setAttribute('aria-live', 'polite');

  let timer = null;
  const label = btn.querySelector('.exp-copy-label');
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
    const msg = ok ? 'Link copied' : 'Could not copy link';
    label.textContent = msg;
    live.textContent = msg;
    clearTimeout(timer);
    timer = setTimeout(() => {
      label.textContent = 'Copy link to this role';
      live.textContent = '';
    }, 2000);
  });

  wrap.appendChild(btn);
  wrap.appendChild(live);
  return wrap;
}

// Fallback when the async clipboard API is unavailable: select a hidden input and execCommand('copy')
function copyTextFallback(text, parent) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = text;
  input.readOnly = true;
  input.setAttribute('aria-hidden', 'true');
  input.tabIndex = -1;
  input.style.cssText = 'position:absolute;left:-9999px;top:0;opacity:0';
  parent.appendChild(input);
  input.select();
  input.setSelectionRange(0, text.length);
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  input.remove();
  return ok;
}

function initExpControls() {
  const toggleAll = document.querySelector('.exp-toggle-all');
  if (toggleAll) {
    toggleAll.addEventListener('click', () => {
      const open = !allExpOpen();
      experiences.forEach(exp => setExpOpen(exp.id, open));
    });
  }
  syncToggleAll();

  // Deep link on load; re-align once after load in case fonts/images shifted the layout
  if (openExpFromHash(false)) {
    let userScrolled = false;
    const mark = () => { userScrolled = true; };
    ['wheel', 'touchstart', 'keydown'].forEach(t => window.addEventListener(t, mark, { once: true, passive: true }));
    window.addEventListener('load', () => {
      if (!userScrolled && expIdFromHash()) {
        scrollExpToNav(expIdFromHash(), false);
      }
    });
  }
  window.addEventListener('hashchange', () => openExpFromHash(true));
}
/* ===== END EXPERIENCE CONTROLS ===== */

function recomputeExpBodyHeights() {
  document.querySelectorAll('.exp-body.open').forEach(body => {
    body.style.maxHeight = body.scrollHeight + 'px';
  });
}

// Dialog management with focus trapping
let dialogStack = [];
let focusTraps = new Map();

function getFocusableElements(container) {
  const all = container.querySelectorAll(
    'button, [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  // Filter to visible elements only
  return Array.from(all).filter(el => {
    return el.offsetParent !== null && !el.hidden && window.getComputedStyle(el).visibility !== 'hidden';
  });
}

function trapFocus(e) {
  if (e.key !== 'Tab' || dialogStack.length === 0) return;

  const activeDialogId = dialogStack[dialogStack.length - 1];
  const dialog = document.getElementById(activeDialogId);
  if (!dialog || !dialog.classList.contains('open')) return;

  const focusableElements = getFocusableElements(dialog);
  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;

  // Check if focus is outside the dialog
  if (!dialog.contains(activeElement)) {
    e.preventDefault();
    firstElement.focus();
    return;
  }

  if (e.shiftKey) {
    if (activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
  } else {
    if (activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
}

function openDialog(dialogEl, opener) {
  const id = dialogEl.id;

  // Already open (e.g. stepping through lightbox photos): keep the original opener and stack entry
  if (dialogEl.classList.contains('open') && focusTraps.has(id)) {
    const closeBtn = dialogEl.querySelector('.mclose');
    if (closeBtn && !dialogEl.contains(document.activeElement)) closeBtn.focus();
    return;
  }

  const prevFocus = document.activeElement;

  dialogEl.classList.add('open');
  document.body.style.overflow = 'hidden';

  dialogStack.push(id);
  focusTraps.set(id, { opener: opener || prevFocus });

  // Focus the close button right away (the overlay turns visible as soon as .open is added)
  const closeBtn = dialogEl.querySelector('.mclose');
  if (closeBtn) closeBtn.focus();
}

function closeDialog(dialogEl) {
  const id = dialogEl.id;
  const focusTrap = focusTraps.get(id);

  dialogEl.classList.remove('open');
  document.body.style.overflow = '';

  dialogStack = dialogStack.filter(d => d !== id);
  focusTraps.delete(id);

  // Restore focus to the opener synchronously, whether or not the close button ever took focus
  const opener = focusTrap && focusTrap.opener;
  if (opener && opener.isConnected && typeof opener.focus === 'function') {
    opener.focus();
  }
}

// Keyboard navigation
document.addEventListener('keydown', e => {
  // Handle Tab for focus trapping
  trapFocus(e);

  // Handle Escape to close dialogs
  if (e.key === 'Escape') {
    if (dialogStack.length > 0) {
      const id = dialogStack[dialogStack.length - 1];
      const dialog = document.getElementById(id);
      closeDialog(dialog);
    }
  }

  // Handle ArrowLeft/ArrowRight for lightbox navigation
  if (currentGalleryContext && document.getElementById('lightbox').classList.contains('open')) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepLightbox(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepLightbox(1);
    }
  }
});

// Click outside to close
document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay') && e.target.classList.contains('open')) {
    closeDialog(e.target);
  }
});

// Generic gallery renderer
function renderGallery(containerId, photos) {
  if (!photos || photos.length === 0) return;
  
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.appendChild(buildGallery(photos, containerId));
}

// Render skills photos (creates container at bottom of #more if needed)
function renderSkillsPhotos() {
  if (!skillsPhotos || skillsPhotos.length === 0) return;

  let skillsSection = document.getElementById('skills-photos');
  if (!skillsSection) {
    skillsSection = document.createElement('div');
    skillsSection.id = 'skills-photos';
    const moreSection = document.getElementById('more');
    moreSection.appendChild(skillsSection);
  }

  renderGallery('skills-photos', skillsPhotos);
}

// Scroll progress bar
const progress = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const scrollableHeight = h.scrollHeight - h.clientHeight;
  if (scrollableHeight <= 0) {
    progress.style.width = '0%';
  } else {
    const scrolled = (h.scrollTop / scrollableHeight) * 100;
    progress.style.width = scrolled + '%';
  }
}, { passive: true });

// Reveal on scroll
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('in');
      revealObs.unobserve(en.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// Safety: never leave content hidden
setTimeout(() => {
  document.querySelectorAll('.reveal:not(.in)').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) el.classList.add('in');
  });
}, 400);

window.addEventListener('load', () => {
  document.querySelectorAll('.reveal').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight + 100) el.classList.add('in');
  });
});

// Active nav link on scroll (scroll handler with requestAnimationFrame throttling)
const navMap = { education: null, experience: null, more: null, contact: null };
document.querySelectorAll('nav .navlinks a[href^="#"]').forEach(a => {
  const id = a.getAttribute('href').slice(1);
  if (id in navMap) navMap[id] = a;
});

let scrollFrameScheduled = false;
function updateActiveNavLink() {
  scrollFrameScheduled = false;
  
  const sections = ['education', 'experience', 'more', 'contact'];
  const edSection = document.getElementById('education');
  const h = document.documentElement;
  const scrollHeight = h.scrollHeight;
  const clientHeight = h.clientHeight;
  const scrollY = h.scrollTop;
  
  // Update nav shadow
  const nav = document.querySelector('nav');
  if (scrollY > 10) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  
  // Floating back-to-top button
  const toTop = document.querySelector('.to-top');
  if (toTop) toTop.classList.toggle('show', scrollY > 600);

  // Clear all active links
  Object.values(navMap).forEach(a => a && a.classList.remove('active'));
  
  // If above education section, no link active
  if (edSection && edSection.getBoundingClientRect().top > 120) {
    return;
  }
  
  // At very bottom of page, activate Contact
  if (scrollY + clientHeight >= scrollHeight - 2) {
    if (navMap['contact']) navMap['contact'].classList.add('active');
    return;
  }
  
  // Find the last section whose top is <= 120px
  let activeId = null;
  for (const id of sections) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= 120) {
      activeId = id;
    }
  }
  
  if (activeId && navMap[activeId]) {
    navMap[activeId].classList.add('active');
  }
}

window.addEventListener('scroll', () => {
  if (!scrollFrameScheduled) {
    scrollFrameScheduled = true;
    requestAnimationFrame(updateActiveNavLink);
  }
}, { passive: true });

// Back to top: scroll up (instantly under reduced motion) and move focus to <main>
document.querySelector('.to-top').addEventListener('click', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  document.getElementById('main').focus({ preventScroll: true });
});

// Initialize nav on page load
updateActiveNavLink();

// Recompute max-height on window resize
window.addEventListener('resize', recomputeExpBodyHeights);

// Initialize (scripts are at end of body, so DOM is ready)
renderExperiences();
initExpControls();
renderGallery('documentary-photos', documentaryPhotos);
renderSkillsPhotos();

// Page counts shown in the PDF pills, keyed by href.
// UPDATE the count here whenever you replace a PDF with a different length.
const PDF_PAGES = {
  'docs/resume.pdf': 1,
  'docs/writing-sample.pdf': 11,
  'docs/ames-brief.pdf': 25
};

// Add link icons and pills
document.addEventListener('DOMContentLoaded', () => {
  // Add sr-only text for external links
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    if (!a.querySelector('.sr-only')) {
      const sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = '(opens in new tab)';
      a.appendChild(sr);
    }
  });
  
  // Add PDF pills, with page counts where known
  document.querySelectorAll('a[href$=".pdf"]').forEach(a => {
    if (!a.querySelector('.pill')) {
      const pill = document.createElement('span');
      pill.className = 'pill';
      const pages = PDF_PAGES[a.getAttribute('href')];
      pill.textContent = pages ? `PDF \u00b7 ${pages} ${pages === 1 ? 'p' : 'pp'}` : 'PDF';
      a.appendChild(pill);
    }
  });
  
  // Style blame trigger
  const blameTrigger = document.getElementById('blame-trigger');
  if (blameTrigger) {
    // The ::after content is added via CSS
  }
});

// Set up modal/dialog interactions
document.getElementById('blame-trigger').addEventListener('click', function() {
  openDialog(document.getElementById('blame-modal'), this);
});

document.querySelectorAll('.mclose').forEach(btn => {
  btn.addEventListener('click', () => {
    const dialog = btn.closest('.overlay');
    if (dialog) closeDialog(dialog);
  });
});

// Lightbox swipe support
let touchStartX = null;
function handleTouchStart(e) {
  if (currentGalleryContext && currentGalleryContext.photos.length > 1) {
    touchStartX = e.changedTouches[0].clientX;
  }
}

function handleTouchEnd(e) {
  if (touchStartX === null || !currentGalleryContext || currentGalleryContext.photos.length <= 1) {
    touchStartX = null;
    return;
  }

  const touchEndX = e.changedTouches[0].clientX;
  const dx = touchEndX - touchStartX;

  if (Math.abs(dx) > 50) {
    // Swipe left goes to the next photo, swipe right to the previous one
    stepLightbox(dx < 0 ? 1 : -1);
  }

  touchStartX = null;
}

// Add lightbox navigation buttons and counter dynamically
document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('lightbox');
  if (lightbox && !lightbox.querySelector('.lightbox-nav')) {
    // Create nav structure
    const nav = document.createElement('div');
    nav.className = 'lightbox-nav';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.setAttribute('data-action', 'prev');
    prevBtn.setAttribute('aria-label', 'Previous photo');
    prevBtn.textContent = '‹';
    prevBtn.addEventListener('click', () => stepLightbox(-1));

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.setAttribute('data-action', 'next');
    nextBtn.setAttribute('aria-label', 'Next photo');
    nextBtn.textContent = '›';
    nextBtn.addEventListener('click', () => stepLightbox(1));

    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);

    const counter = document.createElement('div');
    counter.className = 'lightbox-counter';
    counter.setAttribute('aria-live', 'polite');
    counter.setAttribute('aria-atomic', 'true');
    counter.textContent = '1 / 1';

    // Add touch listeners for swipe support
    lightbox.addEventListener('touchstart', handleTouchStart, { passive: true });
    lightbox.addEventListener('touchend', handleTouchEnd, { passive: true });

    lightbox.querySelector('.modal').appendChild(counter);
    lightbox.querySelector('.modal').appendChild(nav);
  }
});


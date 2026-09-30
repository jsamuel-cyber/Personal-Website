// Build photo gallery with keyboard-accessible buttons
function buildGallery(photos) {
  const gallery = document.createElement('div');
  gallery.className = 'photo-gallery';

  photos.forEach((photo, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'photo-btn';
    btn.setAttribute('aria-label', `View photo: ${photo.alt || 'photo'}`);

    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt || 'photo';
    img.loading = 'lazy';
    img.addEventListener('load', () => recomputeExpBodyHeights());

    btn.appendChild(img);

    btn.addEventListener('click', () => {
      const lightbox = document.getElementById('lightbox');
      const lightboxImg = lightbox.querySelector('.lightbox-img');
      const lightboxCap = lightbox.querySelector('.lightbox-caption');
      lightboxImg.src = photo.src;
      lightboxImg.alt = photo.alt || 'Photo';
      lightboxCap.textContent = photo.caption || '';
      openDialog(lightbox, btn);
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

// Render experiences from content.js
function renderExperiences() {
  const list = document.getElementById('exp-list');
  experiences.forEach(exp => {
    const expDiv = document.createElement('div');
    expDiv.className = 'exp';

    const expBar = document.createElement('button');
    expBar.type = 'button';
    expBar.className = 'exp-bar';
    expBar.setAttribute('aria-expanded', 'false');
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

    expBar.appendChild(expMain);
    expBar.appendChild(expMeta);
    expBar.appendChild(expPlus);

    const expBody = document.createElement('div');
    expBody.className = 'exp-body';
    expBody.id = `body-${exp.id}`;
    expBody.setAttribute('role', 'region');
    expBody.setAttribute('aria-labelledby', `exp-title-${exp.id}`);

    const ul = document.createElement('ul');
    exp.bullets.forEach(bullet => {
      const li = document.createElement('li');
      li.textContent = bullet;
      ul.appendChild(li);
    });
    expBody.appendChild(ul);

    // Render photo gallery if photos exist
    if (exp.photos && exp.photos.length > 0) {
      expBody.appendChild(buildGallery(exp.photos));
    }

    expBar.addEventListener('click', () => toggleExp(exp.id));

    expDiv.appendChild(expBar);
    expDiv.appendChild(expBody);
    list.appendChild(expDiv);
  });
}

function toggleExp(id) {
  const body = document.getElementById(`body-${id}`);
  const plus = document.getElementById(`plus-${id}`);
  const bar = plus.closest('.exp-bar');

  const isOpen = body.classList.toggle('open');
  plus.classList.toggle('open', isOpen);
  bar.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

  if (isOpen) {
    body.style.maxHeight = body.scrollHeight + 'px';
  } else {
    body.style.maxHeight = '0px';
  }
}

function recomputeExpBodyHeights() {
  document.querySelectorAll('.exp-body.open').forEach(body => {
    body.style.maxHeight = body.scrollHeight + 'px';
  });
}

// Dialog management with focus trapping
let dialogStack = [];
let focusTraps = new Map();

function getFocusableElements(container) {
  return container.querySelectorAll(
    'button, [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
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

  if (e.shiftKey) {
    if (document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
  } else {
    if (document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
}

function openDialog(dialogEl, opener) {
  const id = dialogEl.id;
  const prevFocus = document.activeElement;

  dialogEl.classList.add('open');
  document.body.style.overflow = 'hidden';

  dialogStack.push(id);
  focusTraps.set(id, { opener: opener || prevFocus });

  // Focus close button
  const closeBtn = dialogEl.querySelector('.mclose');
  if (closeBtn) {
    setTimeout(() => closeBtn.focus(), 50);
  }
}

function closeDialog(dialogEl) {
  const id = dialogEl.id;
  const focusTrap = focusTraps.get(id);

  dialogEl.classList.remove('open');
  document.body.style.overflow = '';

  dialogStack = dialogStack.filter(d => d !== id);
  focusTraps.delete(id);

  // Restore focus to opener
  if (focusTrap && focusTrap.opener) {
    setTimeout(() => {
      if (focusTrap.opener && focusTrap.opener.focus) {
        focusTrap.opener.focus();
      }
    }, 0);
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
});

// Click outside to close
document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay') && e.target.classList.contains('open')) {
    closeDialog(e.target);
  }
});

// Render skills photos
function renderSkillsPhotos() {
  if (!skillsPhotos || skillsPhotos.length === 0) return;

  let skillsSection = document.getElementById('skills-photos');
  if (!skillsSection) {
    skillsSection = document.createElement('div');
    skillsSection.id = 'skills-photos';
    const moreSection = document.getElementById('more');
    moreSection.appendChild(skillsSection);
  }

  skillsSection.appendChild(buildGallery(skillsPhotos));
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

// Active nav link on scroll
const navMap = { education: null, experience: null, more: null };
document.querySelectorAll('nav .navlinks a[href^="#"]').forEach(a => {
  const id = a.getAttribute('href').slice(1);
  if (id in navMap) navMap[id] = a;
});

const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      Object.values(navMap).forEach(a => a && a.classList.remove('active'));
      const id = en.target.id;
      if (navMap[id]) navMap[id].classList.add('active');
    }
  });
}, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

['education', 'experience', 'more'].forEach(id => {
  const s = document.getElementById(id);
  if (s) sectionObs.observe(s);
});

// Recompute max-height on window resize
window.addEventListener('resize', recomputeExpBodyHeights);

// Initialize (scripts are at end of body, so DOM is ready)
renderExperiences();
renderSkillsPhotos();

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

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
      btn.focus();
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
      
      const svg = document.createElement('svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'currentColor');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>';
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

    expBar.addEventListener('click', () => {
      toggleExp(exp.id);
      if (expIdx === 0) {
        expBar.setAttribute('aria-expanded', 'true');
      }
    });

    expDiv.appendChild(expBar);
    expDiv.appendChild(expBody);
    list.appendChild(expDiv);
    
    if (expIdx === 0) {
      expPlus.classList.add('open');
    }
  });
}

function toggleExp(id) {
  const body = document.getElementById(`body-${id}`);
  const plus = document.getElementById(`plus-${id}`);
  const bar = plus.closest('.exp-bar');
  const srText = document.getElementById(`sr-text-${id}`);

  const isOpen = body.classList.toggle('open');
  plus.classList.toggle('open', isOpen);
  bar.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  if (srText) {
    srText.textContent = isOpen ? 'Hide details' : 'View details';
  }

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
const navMap = { education: null, experience: null, more: null };
document.querySelectorAll('nav .navlinks a[href^="#"]').forEach(a => {
  const id = a.getAttribute('href').slice(1);
  if (id in navMap) navMap[id] = a;
});

let scrollFrameScheduled = false;
function updateActiveNavLink() {
  scrollFrameScheduled = false;
  
  const sections = ['education', 'experience', 'more'];
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
  
  // Clear all active links
  Object.values(navMap).forEach(a => a && a.classList.remove('active'));
  
  // If above education section, no link active
  if (edSection && edSection.getBoundingClientRect().top > 120) {
    return;
  }
  
  // At very bottom of page, activate Skills
  if (scrollY + clientHeight >= scrollHeight - 2) {
    if (navMap['more']) navMap['more'].classList.add('active');
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

// Initialize nav on page load
updateActiveNavLink();

// Recompute max-height on window resize
window.addEventListener('resize', recomputeExpBodyHeights);

// Initialize (scripts are at end of body, so DOM is ready)
renderExperiences();
renderGallery('documentary-photos', documentaryPhotos);
renderSkillsPhotos();

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
  
  // Add PDF pills
  document.querySelectorAll('a[href$=".pdf"]').forEach(a => {
    if (!a.querySelector('.pill')) {
      const pill = document.createElement('span');
      pill.className = 'pill';
      pill.textContent = 'PDF';
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


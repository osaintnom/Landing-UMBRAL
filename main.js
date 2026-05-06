/* ═══════════════════════════════════════════════════════════════
   UMBRAL COLLECTION — main.js (mobile-first)
   - Loader
   - Nav scrolled state
   - Reveal (IntersectionObserver)
   - Filosofía cols flow-in
   - Problem canvas sketch (desktop+hover only)
   - Word reveal (scroll-linked)
   - Pilares flip cards
   - Formularios: contacto (solo email) + mini-form
   ═══════════════════════════════════════════════════════════════ */

// Para activar el envío real:
// 1. Crear cuenta en formspree.io
// 2. Crear un form apuntando a umbralestructura@gmail.com
// 3. Reemplazar FORMSPREE_ENDPOINT con la URL (ej: https://formspree.io/f/abcd1234)
// El dominio formspree.io ya está autorizado en la CSP.
const FORMSPREE_ENDPOINT = '';

(() => {
  'use strict';

  const mqDesktop = window.matchMedia('(min-width: 768px)');
  const mqHover   = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── LOADER ──────────────────────────────────────────────────── */
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.setAttribute('aria-hidden', 'true'), 600);
    }, 1200);
  }

  /* ── HERO: scroll expansion ─────────────────────────────────── */
  // Traducción vanilla del componente scroll-expansion-hero.tsx.
  // Wheel/touch drives scrollProgress 0→1. Al llegar a 1 se libera el scroll.
  (function setupHeroExpansion() {
    const hero    = document.getElementById('hero-expand');
    if (!hero) return;
    const media   = hero.querySelector('.hx-media');
    const overlay = hero.querySelector('.hx-video-overlay');
    const wordA   = hero.querySelector('.hx-word-a');
    const wordB   = hero.querySelector('.hx-word-b');
    const hint    = hero.querySelector('.hx-hint');
    if (!media) return;

    // Si prefers-reduced-motion: expandir de entrada y salir directamente
    if (reducedMotion) {
      hero.classList.add('is-expanded');
      media.style.width  = '100vw';
      media.style.height = '100dvh';
      if (overlay) overlay.style.opacity = '0.2';
      if (hint)    hint.style.opacity    = '0';
      return;
    }

    let progress   = 0;
    let expanded   = false;
    let touchY     = 0;
    let rafPending = false;

    function isMobile() { return window.innerWidth < 768; }

    function applyProgress(p) {
      const mob = isMobile();
      const w   = 260 + p * (mob ?  720 : 1360);
      const h   = 360 + p * (mob ?  260 :  440);
      const tx  = p   * (mob ?  160 :  140);

      media.style.width  = Math.min(w, window.innerWidth)  + 'px';
      media.style.height = Math.min(h, window.innerHeight) + 'px';
      // border-radius suave hasta 0
      media.style.borderRadius = (10 * (1 - p)) + 'px';
      media.style.boxShadow    = p >= 1
        ? 'none'
        : `0 12px ${Math.round(64 * (1 - p))}px rgba(0,0,0,${0.6 - p * 0.35})`;

      if (overlay) overlay.style.opacity = String(Math.max(0.2, 0.42 - p * 0.22));
      if (wordA)   wordA.style.transform  = `translateX(${-tx}vw)`;
      if (wordB)   wordB.style.transform  = `translateX(${tx}vw)`;
      if (hint)    hint.style.opacity     = String(Math.max(0, 1 - p * 4));
    }

    function setProgress(newP) {
      progress = Math.max(0, Math.min(1, newP));
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => { applyProgress(progress); rafPending = false; });
      }
      if (progress >= 1 && !expanded) {
        expanded = true;
        hero.classList.add('is-expanded');
      } else if (progress < 0.75 && expanded) {
        expanded = false;
        hero.classList.remove('is-expanded');
      }
    }

    function onWheel(e) {
      // Al tope de la página scrolleando hacia arriba: colapsar el hero
      if (expanded && e.deltaY < 0 && window.scrollY <= 5) {
        e.preventDefault();
        setProgress(progress + e.deltaY * 0.0009);
        return;
      }
      // Hero no expandido aún: interceptar y manejar la expansión
      if (!expanded) {
        e.preventDefault();
        setProgress(progress + e.deltaY * 0.0009);
      }
    }

    function onScroll() {
      if (!expanded) window.scrollTo(0, 0);
    }

    function onTouchStart(e) {
      touchY = e.touches[0].clientY;
    }

    function onTouchMove(e) {
      if (!touchY) return;
      const y     = e.touches[0].clientY;
      const delta = touchY - y;
      // Swipe hacia arriba desde el tope: colapsar
      if (expanded && delta < -20 && window.scrollY <= 5) {
        e.preventDefault();
        setProgress(progress + delta * 0.005);
        touchY = y;
        return;
      }
      // Hero no expandido: manejar expansión/colapso
      if (!expanded) {
        e.preventDefault();
        setProgress(progress + delta * (delta < 0 ? 0.008 : 0.005));
        touchY = y;
      }
    }

    function onTouchEnd() { touchY = 0; }

    window.addEventListener('wheel',      onWheel,      { passive: false });
    window.addEventListener('scroll',     onScroll,     { passive: true  });
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });
    window.addEventListener('touchend',   onTouchEnd);

    applyProgress(0); // estado inicial
  })();

  /* ── NAV: estado scrolled ────────────────────────────────────── */
  const nav = document.querySelector('.nav');
  const onNavScroll = () => {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  /* ── REVEAL: IntersectionObserver ────────────────────────────── */
  const revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  /* ── ETAPAS — layout estático, 3 cols en desktop / stack en mobile ── */
  // El CSS maneja todo; no se necesita JS para esta sección.

  /* ── PROBLEM CANVAS: sketch lines hover (desktop + hover only) ─ */
  // Sólo se inicializa en desktop con puntero fino. En touch/mobile no aporta
  // (no hay hover) y el canvas redibujándose en cada resize encarece el scroll.
  const problemCanvas = document.querySelector('.problem-canvas');
  const problemSection = document.querySelector('.problem');

  if (problemCanvas && problemSection && mqDesktop.matches && mqHover.matches && !reducedMotion) {
    const ctx = problemCanvas.getContext('2d');
    let targetX = 0.5, targetY = 0.5;
    let curX = 0.5, curY = 0.5;
    let sketchRaf = null;

    function resizeProblemCanvas() {
      problemCanvas.width = problemSection.offsetWidth;
      problemCanvas.height = problemSection.offsetHeight;
    }

    function drawSketchLines() {
      const w = problemCanvas.width;
      const h = problemCanvas.height;
      ctx.clearRect(0, 0, w, h);

      const dx = (curX - 0.5) * 32;
      const dy = (curY - 0.5) * 16;

      ctx.lineWidth = 0.6;
      const count = 22;
      for (let i = 0; i < count; i++) {
        const yBase = (h / (count + 1)) * (i + 1);
        const naturalWave = Math.sin(i * 0.65) * 6;
        const yShift = dy * (0.2 + 0.8 * (i / count));
        const tilt = dx * 0.06;
        ctx.strokeStyle = `rgba(57,87,20,${0.035 + 0.025 * (1 - Math.abs(curX - 0.5) * 2)})`;
        ctx.beginPath();
        ctx.moveTo(-30 + dx * 0.25 + naturalWave, yBase + yShift);
        ctx.lineTo(w + 30 + dx * 0.25 + naturalWave, yBase + yShift + tilt);
        ctx.stroke();
      }

      ctx.lineWidth = 0.5;
      [0.12, 0.38, 0.62, 0.88].forEach((xr) => {
        const x = w * xr + dx * 0.45;
        ctx.strokeStyle = 'rgba(57,87,20,0.028)';
        ctx.beginPath();
        ctx.moveTo(x, -8 + dy * 0.15);
        ctx.lineTo(x + dx * 0.12, h + 8 + dy * 0.15);
        ctx.stroke();
      });
    }

    function sketchLoop() {
      curX += (targetX - curX) * 0.05;
      curY += (targetY - curY) * 0.05;
      drawSketchLines();
      sketchRaf = requestAnimationFrame(sketchLoop);
    }

    problemSection.addEventListener('mousemove', (e) => {
      const r = problemSection.getBoundingClientRect();
      targetX = (e.clientX - r.left) / r.width;
      targetY = (e.clientY - r.top) / r.height;
    });
    problemSection.addEventListener('mouseleave', () => { targetX = 0.5; targetY = 0.5; });

    const ioSketch = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !sketchRaf) {
        sketchRaf = requestAnimationFrame(sketchLoop);
      } else if (!entry.isIntersecting && sketchRaf) {
        cancelAnimationFrame(sketchRaf);
        sketchRaf = null;
      }
    }, { threshold: 0 });

    resizeProblemCanvas();
    window.addEventListener('resize', resizeProblemCanvas);
    ioSketch.observe(problemSection);
  }

  /* ── WORD REVEAL: iluminación palabra por palabra al scrollear ─ */
  // Aplica a: .problem-tagline y .problem-body p
  // Cada palabra arranca apagada y se ilumina cuando cruza el umbral.
  (function setupWordReveal() {
    const targets = document.querySelectorAll('.problem-tagline, .problem-body p');
    if (!targets.length) return;

    function buildWrapped(sourceEl, target) {
      Array.from(sourceEl.childNodes).forEach((node) => {
        if (node.nodeType === 3 /* TEXT_NODE */) {
          node.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              target.appendChild(document.createTextNode(part));
            } else {
              const s = document.createElement('span');
              s.className = reducedMotion ? 'w lit' : 'w';
              s.textContent = part;
              target.appendChild(s);
            }
          });
        } else if (node.nodeType === 1 /* ELEMENT_NODE */) {
          const clone = node.cloneNode(false);
          buildWrapped(node, clone);
          target.appendChild(clone);
        }
      });
    }

    const allWords = [];
    targets.forEach((el) => {
      const frag = document.createDocumentFragment();
      buildWrapped(el, frag);
      el.innerHTML = '';
      el.appendChild(frag);
      allWords.push(...Array.from(el.querySelectorAll('.w')));
    });

    if (reducedMotion) return;

    function updateWordReveal() {
      const threshold = window.innerHeight * 0.66;
      allWords.forEach((w) => {
        const top = w.getBoundingClientRect().top;
        w.classList.toggle('lit', top < threshold);
      });
    }

    window.addEventListener('scroll', updateWordReveal, { passive: true });
    window.addEventListener('resize', updateWordReveal);
    updateWordReveal();
  })();

  /* ── PILARES: scroll storytelling ───────────────────────────── */
  // Mobile: IntersectionObserver ya maneja los .reveal de cada slide.
  // Desktop: sticky + scroll listener crossfadea entre slides.
  (function setupPilaresScrolly() {
    if (reducedMotion || !mqDesktop.matches) return;

    const scrollWrap = document.querySelector('.pilares-scroll-wrap');
    const slides     = Array.from(document.querySelectorAll('.pilar-slide'));
    const dots       = Array.from(document.querySelectorAll('.pilares-dot'));
    if (!scrollWrap || slides.length < 2) return;

    // En desktop los slides usan position:absolute/opacity — quitamos el
    // opacity:0 que el reveal añade para que el JS controle la visibilidad.
    slides.forEach((s) => {
      s.classList.remove('reveal');
      s.classList.add('is-in'); // evita que el observer los muestre
    });

    let lastIdx    = -1;
    let rafPending = false;

    function update() {
      const rect      = scrollWrap.getBoundingClientRect();
      const scrollable = scrollWrap.offsetHeight - window.innerHeight;
      const progress   = Math.max(0, Math.min(1, -rect.top / Math.max(1, scrollable)));
      // Distribuimos los 5 slides linealmente a lo largo del scroll
      const raw = progress * slides.length;
      const idx = Math.min(slides.length - 1, Math.floor(raw));

      if (idx !== lastIdx) {
        lastIdx = idx;
        slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
        dots.forEach((d, i)   => d.classList.toggle('is-active', i === idx));
      }
    }

    function onScroll() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => { update(); rafPending = false; });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  })();


  /* ── FORMS: contacto (solo email) + mini-form ────────────────── */
  const EMAIL_RE = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,}$/;

  function attachForm({ formId, errorId, okId, submitId, defaultLabel }) {
    const form = document.getElementById(formId);
    if (!form) return;
    const errorEl = document.getElementById(errorId);
    const okEl    = okId ? document.getElementById(okId) : null;
    const submit  = submitId ? document.getElementById(submitId) : form.querySelector('button[type="submit"]');

    function setMessage(type, text) {
      if (errorEl) errorEl.textContent = type === 'error' ? text : '';
      if (okEl)    okEl.textContent    = type === 'ok'    ? text : '';
    }
    function clearMessages() { setMessage('', ''); }

    form.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', clearMessages);
    });

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      clearMessages();

      // Honeypot: si un bot completó el campo oculto, descartamos en silencio.
      const gotcha = form.querySelector('input[name="_gotcha"]');
      if (gotcha && gotcha.value) return;

      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : '';

      if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
        setMessage('error', 'El email no parece válido. Revisalo.');
        if (emailInput) emailInput.focus();
        return;
      }

      // Modo optimista: si no hay endpoint configurado, confirmamos sin enviar.
      if (!FORMSPREE_ENDPOINT) {
        setMessage('ok', 'Gracias. Te contactamos dentro del día.');
        form.reset();
        return;
      }

      if (submit) {
        submit.disabled = true;
        const lbl = submit.querySelector('span');
        if (lbl) lbl.textContent = 'Enviando…';
      }

      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: formId }),
        });

        if (res.ok) {
          setMessage('ok', 'Gracias. Te contactamos dentro del día.');
          form.reset();
        } else {
          const data = await res.json().catch(() => ({}));
          const msg = data?.errors?.[0]?.message || 'Algo falló. Escribinos por WhatsApp.';
          setMessage('error', msg);
        }
      } catch {
        setMessage('error', 'No pudimos enviar. Escribinos por WhatsApp.');
      } finally {
        if (submit) {
          submit.disabled = false;
          const lbl = submit.querySelector('span');
          if (lbl) lbl.textContent = defaultLabel || 'Enviar';
        }
      }
    });
  }

  attachForm({
    formId: 'contacto-form',
    errorId: 'form-error',
    okId: 'email-ok',
    submitId: 'contacto-submit',
    defaultLabel: 'Enviar',
  });

  attachForm({
    formId: 'mini-form',
    errorId: 'mini-form-error',
    okId: null,
    submitId: null,
    defaultLabel: 'Quiero saber más →',
  });

  /* ── MOBILE DOCK ─────────────────────────────────────────────
     Solo opera en mobile (el CSS ya oculta el dock en desktop).
     Maneja:
       1. Ocultar el dock al entrar en #contacto (y footer)
       2. Marcar el ítem activo según la sección más próxima al
          top del viewport
  ─────────────────────────────────────────────────────────────── */
  (function mobileDock() {
    const dock = document.getElementById('mobile-dock');
    if (!dock) return;

    const dockItems = dock.querySelectorAll('.dock-item');

    /* ── 1. Ocultar en #contacto ──────────────────────────── */
    const contactoEl = document.getElementById('contacto');

    function updateDockVisibility() {
      if (!contactoEl) return;
      const rect = contactoEl.getBoundingClientRect();
      // Ocultar en cuanto #contacto empiece a asomarse desde el borde inferior
      dock.classList.toggle('dock-hidden', rect.top < window.innerHeight);
    }

    /* ── 2. Estado activo ─────────────────────────────────── */
    // Mapa: id del elemento DOM → data-dock-section del ítem
    const sectionMap = {
      'hero-expand':   'top',
      'que-es':        'que-es',
      'como-funciona': 'como-funciona',
      'pilares':       'pilares',
      'escuchamos':    'escuchamos',
    };

    function setActive(dockSection) {
      dockItems.forEach(item =>
        item.classList.toggle('is-active', item.dataset.dockSection === dockSection)
      );
    }

    function updateActiveSection() {
      let bestId   = 'top';
      let bestDist = Infinity;

      Object.keys(sectionMap).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const dist = Math.abs(el.getBoundingClientRect().top);
        if (dist < bestDist) { bestDist = dist; bestId = sectionMap[id]; }
      });

      setActive(bestId);
    }

    /* ── Combinar ambos en un único scroll listener ───────── */
    function onDockScroll() {
      updateDockVisibility();
      updateActiveSection();
    }

    window.addEventListener('scroll', onDockScroll, { passive: true });

    // Estado inicial
    updateDockVisibility();
    updateActiveSection();
  })();

})();

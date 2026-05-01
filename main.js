/* ═══════════════════════════════════════════════════════════════
   UMBRAL COLLECTION — main.js
   - Nav scrolled state
   - Reveal (IntersectionObserver)
   - Perfil tab switch
   - Scroll-driven video (Sección 5)
   - Formulario de contacto → Formspree
   ═══════════════════════════════════════════════════════════════ */

// Para activar el envío de formulario:
// 1. Crear cuenta en formspree.io
// 2. Crear un form apuntando a umbralestructura@gmail.com
// 3. Reemplazar el valor de FORMSPREE_ENDPOINT con la URL que te dan (ej: https://formspree.io/f/abcd1234)
const FORMSPREE_ENDPOINT = '';

(() => {
  'use strict';

  /* ── LOADER ──────────────────────────────────────────────────── */
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.setAttribute('aria-hidden', 'true'), 600);
    }, 1400);
  }

  /* ── HERO VIDEO: slow motion ─────────────────────────────────── */
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    heroVideo.playbackRate = 0.6;
    heroVideo.addEventListener('canplay', () => { heroVideo.playbackRate = 0.6; });
  }

  /* ── HERO PHRASE 2: scroll-locked reveal ────────────────────── */
  // Flujo: carga → frase 1 → usuario intenta scrollear → frase 2 aparece
  // → 1.3s después → scroll se desbloquea
  const phrase2 = document.querySelector('.hero-phrase-2');
  if (phrase2) {
    let lockActive = false;

    // Activar lock después de que el loader desaparece
    setTimeout(() => {
      lockActive = true;
      document.documentElement.style.overflow = 'hidden';
    }, 1500);

    const revealAndUnlock = (e) => {
      if (!lockActive) return;
      if (e.cancelable) e.preventDefault();
      lockActive = false;

      phrase2.classList.add('is-revealed');

      window.removeEventListener('wheel', revealAndUnlock);
      window.removeEventListener('touchstart', revealAndUnlock);
      window.removeEventListener('keydown', revealAndUnlock);

      // Desbloquear scroll después de que el usuario tuvo tiempo de leer
      setTimeout(() => {
        document.documentElement.style.overflow = '';
      }, 1300);
    };

    window.addEventListener('wheel', revealAndUnlock, { passive: false });
    window.addEventListener('touchstart', revealAndUnlock, { passive: false });
    // También se activa con Space / flechas / PageDown (teclado)
    window.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp', 'Space', 'PageDown', 'PageUp'].includes(e.code)) {
        revealAndUnlock(e);
      }
    }, { passive: false });
  }

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

  /* ── PERFIL: switch de tabs ──────────────────────────────────── */
  const tabs = document.querySelectorAll('.perfil-tab');
  const panels = document.querySelectorAll('.perfil-panel');

  function activatePanel(key) {
    tabs.forEach((tab) => {
      const isTarget = tab.dataset.target === key;
      tab.classList.toggle('is-active', isTarget);
      tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });
    panels.forEach((panel) => {
      const match = panel.dataset.panel === key;
      if (match) {
        panel.hidden = false;
        requestAnimationFrame(() => panel.classList.add('is-visible'));
      } else {
        panel.classList.remove('is-visible');
        setTimeout(() => { if (panel.dataset.panel !== key) panel.hidden = true; }, 500);
      }
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activatePanel(tab.dataset.target));
  });

  /* ── FILOSOFIA COLS: animación de flujo ─────────────────────── */
  const filosCols = document.querySelector('.filosofia-cols');
  if (filosCols && 'IntersectionObserver' in window) {
    const ioFlow = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        filosCols.classList.add('flow-in');
        ioFlow.disconnect();
      }
    }, { threshold: 0.25 });
    ioFlow.observe(filosCols);
  }

  /* ── SCROLL-DRIVEN VIDEO (Sección 5) ─────────────────────────── */
  const video = document.getElementById('scroll-video');
  const section = document.getElementById('scroll-section');
  const annotations = document.querySelectorAll('.annotation');
  const progressFill = document.getElementById('stage-progress-fill');
  const hint = document.getElementById('scroll-hint');

  if (video && section) {
    // Pausa el video — lo manejamos con currentTime vía scroll
    video.pause();

    let sectionTop = 0;
    let scrollRange = 0;

    function updateMetrics() {
      sectionTop = section.offsetTop;
      scrollRange = Math.max(1, section.offsetHeight - window.innerHeight);
    }

    function updateAnnotations(progress) {
      annotations.forEach((ann) => {
        const from = parseFloat(ann.dataset.from);
        const to = parseFloat(ann.dataset.to);
        ann.classList.toggle('visible', progress >= from && progress < to);
      });
      if (progressFill) progressFill.style.width = (progress * 100) + '%';
    }

    let rafPending = false;
    let lastProgress = -1;

    function onScroll() {
      const scrolled = window.scrollY - sectionTop;
      const progress = Math.max(0, Math.min(1, scrolled / scrollRange));

      if (Math.abs(progress - lastProgress) < 0.001) return;
      lastProgress = progress;

      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          if (video.readyState >= 2 && video.duration) {
            video.currentTime = progress * video.duration;
          }
          updateAnnotations(progress);
          if (scrolled > 20 && hint) hint.classList.add('gone');
          rafPending = false;
        });
      }
    }

    updateMetrics();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { updateMetrics(); onScroll(); });
    onScroll();
  }

  /* ── PROBLEM CANVAS: sketch lines hover ─────────────────────── */
  const problemCanvas = document.querySelector('.problem-canvas');
  const problemSection = document.querySelector('.problem');

  if (problemCanvas && problemSection && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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

      // Horizontal lines with slight tilt from mouse
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

      // Sparse vertical accent lines
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
  // Cada palabra arranca en rgba(26,26,26,0.13) y pasa a color:inherit
  // cuando el usuario scrollea y la palabra cruza el 78% superior del viewport.
  (function setupWordReveal() {
    const targets = document.querySelectorAll('.problem-tagline, .problem-body p');
    if (!targets.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Construye un DocumentFragment wrapeando cada palabra en <span class="w">
    // mientras preserva elementos inline (em, strong, br, etc.)
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
          // Clonar el elemento (vacío) y recursar
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

    if (reducedMotion) return; // Todo ya está como .lit desde el build

    function updateWordReveal() {
      const threshold = window.innerHeight * 0.66;
      allWords.forEach((w) => {
        const top = w.getBoundingClientRect().top;
        w.classList.toggle('lit', top < threshold);
      });
    }

    window.addEventListener('scroll', updateWordReveal, { passive: true });
    window.addEventListener('resize', updateWordReveal);
    updateWordReveal(); // Estado inicial
  })();

  /* ── SCROLL-FADE: opacidad ligada al scroll ─────────────────── */
  const scrollFades = document.querySelectorAll('.scroll-fade');
  if (scrollFades.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    function updateScrollFades() {
      const vh = window.innerHeight;
      scrollFades.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Fade-in: desde que el borde inferior entra por abajo hasta que el borde superior
        // cruza el 60% del viewport. Fade-out: simétrico al subir.
        const fadeInStart = vh;           // elemento empieza a entrar
        const fadeInEnd = vh * 0.35;      // totalmente visible
        const progress = (fadeInStart - rect.top) / (fadeInStart - fadeInEnd);
        el.style.opacity = Math.min(1, Math.max(0, progress));
      });
    }
    window.addEventListener('scroll', updateScrollFades, { passive: true });
    window.addEventListener('resize', updateScrollFades);
    updateScrollFades();
  } else {
    scrollFades.forEach((el) => { el.style.opacity = 1; });
  }

  /* ── CONFIANZA: swap de frases al scrollear ─────────────────── */
  // La sección tiene height:260vh con contenido sticky.
  // Cuando el usuario scrolleó ~45% del espacio extra → frase 1 sale, frase 2 entra.
  (function setupConfianzaSwap() {
    const section  = document.getElementById('confianza-scroll');
    const phrase1  = document.querySelector('.confianza-phrase--1');
    const phrase2  = document.querySelector('.confianza-phrase--2');
    if (!section || !phrase1 || !phrase2) return;

    function update() {
      const rect     = section.getBoundingClientRect();
      const scrolled = -rect.top;                          // px scrolleados dentro de la sección
      const extra    = section.offsetHeight - window.innerHeight; // px de scroll extra (≈160vh)
      const progress = Math.max(0, Math.min(1, scrolled / extra));

      if (progress < 0.4) {
        // Frase 1 visible
        phrase1.classList.remove('is-out');
        phrase2.classList.remove('is-in');
        phrase2.setAttribute('aria-hidden', 'true');
      } else {
        // Frase 2 visible
        phrase1.classList.add('is-out');
        phrase2.classList.add('is-in');
        phrase2.removeAttribute('aria-hidden');
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ── TIMELINE PROGRESS: línea verde crece con el scroll ─────── */
  (function setupTimelineProgress() {
    const progressEl = document.getElementById('timeline-spine-progress');
    const timelineEl = document.querySelector('.roadmap-timeline');
    if (!progressEl || !timelineEl) return;

    function update() {
      const rect = timelineEl.getBoundingClientRect();
      // Empieza a crecer cuando la sección entra, termina cuando sale
      const pct = Math.max(0, Math.min(1,
        (window.innerHeight - rect.top) / (rect.height + window.innerHeight * 0.4)
      ));
      progressEl.style.height = (pct * 100) + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ── FORMULARIO DE CONTACTO ──────────────────────────────────── */
  const form = document.getElementById('contacto-form');
  if (!form) return;

  const submitBtn = document.getElementById('contacto-submit');
  const errorEl = document.getElementById('form-error');
  const okEl = document.getElementById('email-ok');

  const EMAIL_RE = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,}$/;

  function setMessage(type, text) {
    errorEl.textContent = type === 'error' ? text : '';
    okEl.textContent = type === 'ok' ? text : '';
  }

  function clearMessages() { setMessage('', ''); }

  form.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', clearMessages);
  });

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    clearMessages();

    const nombre = form.querySelector('[name="nombre"]').value.trim();
    const empresa = form.querySelector('[name="empresa"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const telefono = form.querySelector('[name="telefono"]').value.trim();

    if (!nombre) {
      setMessage('error', 'Ingresá tu nombre para continuar.');
      form.querySelector('[name="nombre"]').focus();
      return;
    }
    if (!empresa) {
      setMessage('error', 'Ingresá el nombre de tu empresa.');
      form.querySelector('[name="empresa"]').focus();
      return;
    }
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      setMessage('error', 'El email no parece válido. Revisalo.');
      form.querySelector('[name="email"]').focus();
      return;
    }

    // Si no hay endpoint configurado, confirmación optimista
    if (!FORMSPREE_ENDPOINT) {
      setMessage('ok', 'Gracias. Te contactamos dentro del día.');
      form.reset();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Enviando...';
    }

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, empresa, telefono, email }),
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
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Enviar';
      }
    }
  });

  /* ── PILARES: flip cards (FLIP + grow + scroll hand-off) ──────── */
  const pilaresGrid = document.querySelector('.pilares-grid');
  const pilarOverlay = document.querySelector('.pilar-overlay');

  if (pilaresGrid && pilarOverlay) {
    const pilarState = { open: null, sourceBtn: null, lastFocus: null };

    // Sólo permitimos data-pilar de 01 a 05 — evita que un valor inesperado
    // construya un id arbitrario (#pilar-card-${num}) y dispare lookups raros.
    const VALID = new Set(['01', '02', '03', '04', '05']);

    const targetW = (num) => {
      const max = num === '03' ? 640 : 560; // 03 (Beneficios) es la card asimétrica
      return Math.min(max, window.innerWidth * 0.92);
    };
    const targetH = () => Math.min(720, window.innerHeight * 0.84);
    const centerCoords = (w, h) => ({
      top: Math.max(20, (window.innerHeight - h) / 2),
      left: Math.max(16, (window.innerWidth - w) / 2),
    });

    function applyRect(card, rect) {
      card.style.top = rect.top + 'px';
      card.style.left = rect.left + 'px';
      card.style.width = rect.width + 'px';
      card.style.height = rect.height + 'px';
    }

    function openPilar(num) {
      if (!VALID.has(num) || pilarState.open) return;
      const sourceBtn = pilaresGrid.querySelector(`.pilar[data-pilar="${num}"]`);
      const card = document.getElementById(`pilar-card-${num}`);
      if (!sourceBtn || !card) return;

      pilarState.lastFocus = document.activeElement;
      pilarState.open = num;
      pilarState.sourceBtn = sourceBtn;

      // 1. Posicionar card en el rect del botón origen
      const origin = sourceBtn.getBoundingClientRect();
      applyRect(card, origin);

      // 2. Mostrar overlay y card (todavía con tamaño origen)
      pilarOverlay.hidden = false;
      card.hidden = false;
      document.documentElement.classList.add('pilar-card-open');

      // 3. En la próxima frame: activar fade del backdrop y mounted de la card
      requestAnimationFrame(() => {
        pilarOverlay.classList.add('is-active');
        card.classList.add('is-mounted');

        // 4. Frame siguiente: transicionar a centro/grande
        requestAnimationFrame(() => {
          const w = targetW(num);
          const h = targetH();
          const { top, left } = centerCoords(w, h);
          card.style.top = top + 'px';
          card.style.left = left + 'px';
          card.style.width = w + 'px';
          card.style.height = h + 'px';
          // 5. Disparar el flip cuando ya está creciendo
          setTimeout(() => card.classList.add('is-open'), 140);
        });
      });

      sourceBtn.setAttribute('aria-expanded', 'true');

      // Focus al botón × cuando termina la coreografía
      setTimeout(() => {
        const close = card.querySelector('.pilar-card-close');
        if (close && pilarState.open === num) close.focus();
      }, 720);
    }

    function closePilar(opts) {
      const num = pilarState.open;
      if (!num) return;
      const card = document.getElementById(`pilar-card-${num}`);
      const sourceBtn = pilarState.sourceBtn;
      if (!card || !sourceBtn) return;

      // closePilar() → cierre normal con anim de vuelta al rect del botón.
      // closePilar(fn) → cierre rápido + callback (hand-off a otra sección).
      // closePilar({ fast: true }) → cierre rápido sin destino (Cartilla).
      let fastExit = false;
      let thenCallback = null;
      if (typeof opts === 'function') {
        fastExit = true;
        thenCallback = opts;
      } else if (opts && opts.fast) {
        fastExit = true;
      }

      // En cierre rápido liberamos el lock ya — la card es position:fixed,
      // así que sigue visible mientras la página scrollea/se acomoda por debajo.
      if (fastExit) document.documentElement.classList.remove('pilar-card-open');

      card.classList.remove('is-open');

      if (fastExit) {
        // salida rápida con fade (no anima vuelta a origen)
        setTimeout(() => {
          pilarOverlay.classList.remove('is-active');
          card.classList.remove('is-mounted');
        }, 60);
        setTimeout(() => {
          pilarOverlay.hidden = true;
          card.hidden = true;
          card.style.cssText = '';
          sourceBtn.setAttribute('aria-expanded', 'false');
          if (!thenCallback && pilarState.lastFocus && document.contains(pilarState.lastFocus)) {
            pilarState.lastFocus.focus();
          }
          pilarState.open = null;
          pilarState.sourceBtn = null;
          pilarState.lastFocus = null;
        }, 420);
        if (thenCallback) thenCallback();
        return;
      }

      // cierre normal: anima de vuelta al rect del origen
      const origin = sourceBtn.getBoundingClientRect();
      setTimeout(() => applyRect(card, origin), 80);

      setTimeout(() => {
        pilarOverlay.classList.remove('is-active');
        card.classList.remove('is-mounted');
      }, 120);

      setTimeout(() => {
        pilarOverlay.hidden = true;
        card.hidden = true;
        card.style.cssText = '';
        document.documentElement.classList.remove('pilar-card-open');
        sourceBtn.setAttribute('aria-expanded', 'false');
        const focusTarget = pilarState.lastFocus && document.contains(pilarState.lastFocus)
          ? pilarState.lastFocus
          : sourceBtn;
        if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus();
        pilarState.open = null;
        pilarState.sourceBtn = null;
        pilarState.lastFocus = null;
      }, 600);
    }

    // Click en grilla → abrir
    pilaresGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-pilar]');
      if (!btn) return;
      e.preventDefault();
      openPilar(btn.dataset.pilar);
    });

    // Click en overlay → manejar acciones (cerrar, ir a banca)
    pilarOverlay.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]');
      if (!action) return;
      const kind = action.dataset.action;
      if (kind === 'close') {
        e.preventDefault();
        closePilar();
      } else if (kind === 'goto-banca') {
        e.preventDefault();
        closePilar(() => {
          const banca = document.getElementById('banca');
          if (banca) banca.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    });

    // ESC → cerrar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && pilarState.open) {
        e.preventDefault();
        closePilar();
      }
    });

    // Scroll hand-off:
    //   - Banca (05): scroll hacia abajo cierra y lleva a #banca.
    //   - Cartilla (04): cualquier scroll cierra (sin destino — quedás en Pilares).
    const handoff = (e) => {
      const num = pilarState.open;
      if (num !== '04' && num !== '05') return;

      let trigger = false;
      if (e.type === 'wheel') {
        trigger = num === '05' ? e.deltaY > 0 : Math.abs(e.deltaY) > 0;
      } else if (e.type === 'touchmove') {
        trigger = true;
      } else if (e.type === 'keydown') {
        const downKeys = ['ArrowDown', 'PageDown', 'Space'];
        const allKeys = ['ArrowDown', 'PageDown', 'Space', 'ArrowUp', 'PageUp', 'Home', 'End'];
        trigger = (num === '05' ? downKeys : allKeys).includes(e.code);
      }
      if (!trigger) return;
      if (e.cancelable) e.preventDefault();

      if (num === '05') {
        closePilar(() => {
          const banca = document.getElementById('banca');
          if (banca) banca.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      } else {
        closePilar({ fast: true });
      }
    };
    window.addEventListener('wheel', handoff, { passive: false });
    window.addEventListener('touchmove', handoff, { passive: false });
    window.addEventListener('keydown', handoff);

    // Resize → recentrar la card abierta
    window.addEventListener('resize', () => {
      if (!pilarState.open) return;
      const card = document.getElementById(`pilar-card-${pilarState.open}`);
      if (!card || !card.classList.contains('is-mounted')) return;
      const w = targetW(pilarState.open);
      const h = targetH();
      const { top, left } = centerCoords(w, h);
      card.style.top = top + 'px';
      card.style.left = left + 'px';
      card.style.width = w + 'px';
      card.style.height = h + 'px';
    });
  }

})();

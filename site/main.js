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

})();

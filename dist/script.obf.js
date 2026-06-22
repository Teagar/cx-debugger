(function ActionTrackerToolbar() {
  'use strict';

  // ─────────────────────────────────────────────────────
  // GUARD
  // ─────────────────────────────────────────────────────

  if (window._actionTrackerToolbarActive) {
    try {
      if (window._actionTrackerToolbarCleanup) {
        window._actionTrackerToolbarCleanup();
      }
    } catch (e) {}
  }

  window._actionTrackerToolbarActive = true;

  if (window.__ACTION_TRACKER_ACTIVE__) {
    try {
      if (window.ActionTracker) {
        window.ActionTracker.destroy();
      }
    } catch (e) {}
  }

  window.__ACTION_TRACKER_ACTIVE__ = true;

  console.clear();

  console.log(
    '%cAction Tracker V5.3.2 — Toolbar Edition',
    'font-size:14px;font-weight:bold;color:#3483FA;background:#fff;padding:6px 12px;border-radius:4px;border:1px solid #3483FA;'
  );

  console.log(
    '%cShadow DOM • Dedup • Contexto • Rage+Context • Esquerdo = completo • Direito = compacto',
    'font-size:11px;color:#999;'
  );

  // ─────────────────────────────────────────────────────
  // CSS
  // ─────────────────────────────────────────────────────

  const STYLE_ID = 'action-tracker-toolbar-styles';

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;

    style.textContent = `
      @keyframes at-shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      @keyframes at-checkmark-in {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); opacity: 1; }
      }

      @keyframes at-error-in {
        0% { transform: scale(0) rotate(0deg); opacity: 0; }
        50% { transform: scale(1.1) rotate(-5deg); }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }

      @keyframes at-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes at-flash-success {
        0% { background-color: transparent; }
        30% { background-color: rgba(0,166,80,0.12); }
        100% { background-color: transparent; }
      }

      @keyframes at-rec-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(244,67,54,0.4); }
        50% { box-shadow: 0 0 0 4px rgba(244,67,54,0); }
      }

      .at-shimmer-bar {
        background: linear-gradient(90deg, #3483FA 25%, #5ba0ff 50%, #3483FA 75%);
        background-size: 200% 100%;
        animation: at-shimmer 1.5s ease infinite;
      }

      .at-flash-success {
        animation: at-flash-success 0.6s ease;
      }
    `;

    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────────────
  // CONFIG
  // ─────────────────────────────────────────────────────

  const CONFIG = {
    dropdownId: 'action-tracker-dropdown',
    feedbackDuration: 2500,
    watchInterval: 1500,
    colors: {
      success: '#00A650',
      error: '#F23D4F',
      loading: '#FF7733',
      accent: '#3483FA',
      progressBg: '#e9ecef',
      progressFill: '#3483FA',
      rec: '#F44336',
      pause: '#FF9800',
    },
  };

  const ICONS = {
    toolbarMain: `<svg aria-hidden="true" color="#3483fa" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4" fill="currentColor"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="currentColor"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`,

    close: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12.4485 11.5996L8.87116 8.02227L12.4485 4.39446L11.594 3.5519L8.02261 7.17372L4.40077 3.55188L3.55225 4.40041L7.18003 8.02819L3.65246 11.6055L4.50692 12.4481L8.02858 8.87674L11.6 12.4481L12.4485 11.5996Z" fill="currentColor"></path></svg>`,

    checkmark: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display:inline-block;animation:at-checkmark-in 0.3s ease forwards;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#00A650"/></svg>`,

    errorX: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display:inline-block;animation:at-error-in 0.3s ease forwards;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#F23D4F"/></svg>`,

    spinner: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display:inline-block;animation:at-spin 0.8s linear infinite;"><circle cx="12" cy="12" r="10" stroke="#3483FA" stroke-width="3" stroke-dasharray="31.4 31.4" stroke-linecap="round"/></svg>`,

    rec: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;"><circle cx="12" cy="12" r="8" fill="#F44336"/></svg>`,

    log: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;"><path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z"/></svg>`,

    json: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;"><path d="M5 3H7V5H5V10C5 11.1 4.1 12 3 12C4.1 12 5 12.9 5 14V19H7V21H5C3.9 21 3 20.1 3 19V15C3 13.9 2.1 13 1 13V11C2.1 11 3 10.1 3 9V5C3 3.9 3.9 3 5 3ZM19 3C20.1 3 21 3.9 21 5V9C21 10.1 21.9 11 23 11V13C21.9 13 21 13.9 21 15V19C21 20.1 20.1 21 19 21H17V19H19V14C19 12.9 19.9 12 21 12C19.9 12 19 11.1 19 10V5H17V3H19Z"/></svg>`,

    csv: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;"><path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/><path d="M7 7H11V9H7V7ZM13 7H17V9H13V7ZM7 11H11V13H7V11ZM13 11H17V13H13V11ZM7 15H11V17H7V15ZM13 15H17V17H13V15Z"/></svg>`,

    clear: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;"><path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"/></svg>`,
  };

  // ─────────────────────────────────────────────────────
  // CORE CONFIG
  // ─────────────────────────────────────────────────────

  const CFG = {
    DEBOUNCE_MS: 300,
    RAGE_N: 3,
    RAGE_WIN: 2000,
    SCAN_MS: 3000,
    BUCKET: 50,
    MAX_UI: 80,
    READ_PAUSE: 3000,
    INPUT_DEBOUNCE: 800,
  };

  const MOD_MAP = {
    'cx-flow-assistant-frontend': 'Flow Assistant',
    'cx-flow-assistant': 'Flow Assistant',
    'cx-toolbar': 'Toolbar',
    'cx-case-data': 'Dados do Caso',
    'cx-chat': 'Chat',
    'cx-shipping': 'Envios',
  };

  const S = {
    sid: 'AT5_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    t0: Date.now(),
    url0: location.href,
    logs: [],
    cnt: 0,
    rec: true,
    lastClk: { el: null, t: 0 },
    rage: {},
    mods: new Set(),
    modSt: {},
    decs: [],
    dead: false,
    inputTimers: new WeakMap(),
    stepCounter: 0,
    flowResult: null,
  };

  const seenRoots = new WeakSet();
  const _intervals = [];
  const _observers = [];

  // ─────────────────────────────────────────────────────
  // UI STATE
  // ─────────────────────────────────────────────────────

  let dropdownEl = null;
  let compactDropdownEl = null;

  let dropdownOpen = false;
  let compactMode = false;
  let compactHorizontal = false;

  let activeToggleButton = null;
  let activeInactiveTool = null;

  let _uiUpdateCallback = null;

  // ─────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────

  function ts() {
    const d = new Date();
    return d.toTimeString().slice(0, 8) + '.' + String(d.getMilliseconds()).padStart(3, '0');
  }

  function ela() {
    return ((Date.now() - S.t0) / 1000).toFixed(1) + 's';
  }

  function bkt(v) {
    return Math.round(v / CFG.BUCKET) * CFG.BUCKET;
  }

  function rx(c, n) {
    let s = '';
    for (let i = 0; i < n; i++) s += c;
    return s;
  }

  function trunc(s, n) {
    s = (s || '').trim();
    return s.length > n ? s.slice(0, n) + '…' : s;
  }

  function visTxt(el) {
    if (!el) return '';
    if (el.nodeType === 3) return (el.textContent || '').trim();

    const aria = el.getAttribute && el.getAttribute('aria-label');
    if (aria) return aria;

    let r = '';

    for (let i = 0; i < (el.childNodes || []).length; i++) {
      const c = el.childNodes[i];

      if (c.nodeType === 3) {
        r += c.textContent.trim() + ' ';
      } else if (c.nodeType === 1) {
        const tg = (c.tagName || '').toLowerCase();

        if (!['script', 'style', 'svg'].includes(tg)) {
          r += ((!c.children || c.children.length === 0) ? c.textContent.trim() : visTxt(c)) + ' ';
        }
      }
    }

    return r.replace(/\s+/g, ' ').trim();
  }

  function cssPath(el) {
    if (!el || !el.tagName) return '';

    const p = [];
    let cur = el;
    let d = 0;

    while (cur && cur.tagName && d < 6) {
      let t = cur.tagName.toLowerCase();

      if (cur.id && !/^_r_/.test(cur.id)) {
        t += '#' + cur.id;
      } else {
        const cl = Array.from(cur.classList || [])
          .filter(c => c[0] !== '_' && c.length < 40)
          .slice(0, 2)
          .join('.');

        if (cl) t += '.' + cl;
      }

      p.unshift(t);

      cur = cur.parentElement || (cur.getRootNode && cur.getRootNode().host) || null;
      d++;
    }

    return p.join(' > ');
  }

  function mainCls(el) {
    if (!el || !el.classList) return '';

    return Array.from(el.classList)
      .filter(c =>
        c.indexOf('andes-') === 0 ||
        c.indexOf('flow') >= 0 ||
        c.indexOf('button') >= 0 ||
        c.indexOf('card') >= 0 ||
        c.indexOf('list') >= 0 ||
        c.indexOf('step') >= 0
      )
      .slice(0, 3)
      .join(' .');
  }

  function resolveTarget(el) {
    if (!el || !el.tagName) return el;

    const tag = el.tagName.toLowerCase();

    if (['svg', 'path', 'use', 'line', 'circle', 'polygon', 'polyline', 'g', 'rect', 'ellipse'].includes(tag)) {
      let cur = el.parentElement;
      let d = 0;

      while (cur && d < 6) {
        const ctag = cur.tagName.toLowerCase();

        if (['button', 'a', 'label', 'input', 'select', 'li', 'div', 'span'].includes(ctag)) {
          if (cur.textContent && cur.textContent.trim().length > 0) return cur;

          if (
            cur.classList &&
            (
              cur.classList.contains('andes-dropdown__trigger') ||
              cur.classList.contains('andes-button') ||
              cur.getAttribute('role')
            )
          ) {
            return cur;
          }
        }

        cur = cur.parentElement;
        d++;
      }

      return el.parentElement || el;
    }

    return el;
  }

  function detectMod(el) {
    let cur = el;
    let d = 0;

    while (cur && d < 30) {
      if (cur.id && cur.id.indexOf('remote-module-container') >= 0) {
        for (const k in MOD_MAP) {
          if (cur.id.indexOf(k) >= 0) return MOD_MAP[k];
        }

        return cur.id.replace('remote-module-container-', '').split('-').slice(0, 3).join('-');
      }

      if (
        cur.className &&
        typeof cur.className === 'string' &&
        cur.className.indexOf('remote-module') >= 0
      ) {
        for (const k in MOD_MAP) {
          if ((cur.className + ' ' + (cur.id || '')).indexOf(k) >= 0) return MOD_MAP[k];
        }
      }

      cur = cur.parentElement || (cur.getRootNode && cur.getRootNode() !== cur ? cur.getRootNode().host : null);
      d++;
    }

    return 'Página Principal';
  }

  function findQuestion(el) {
    let cur = el;
    let d = 0;
    const seen = [];

    const skip = [
      'Sim', 'Não', 'Yes', 'No', 'Continuar', 'Continue', 'Si', 'Sí',
      'Avançar', 'Próximo', 'Next', 'Siguiente', 'Procurar',
      'Selecionar', 'Seleccionar', 'Select'
    ];

    while (cur && d < 20) {
      if (seen.indexOf(cur) >= 0) break;
      seen.push(cur);

      try {
        const hds = cur.querySelectorAll
          ? cur.querySelectorAll('h1,h2,h3,h4,h5,h6,[class*="title"],[class*="question"],[class*="header"],[class*="label"],[class*="step-name"],[class*="flow-header"]')
          : [];

        for (let i = 0; i < hds.length; i++) {
          const t = (hds[i].textContent || '').replace(/\s+/g, ' ').trim();

          if (t.length > 3 && t.length < 300 && skip.indexOf(t) < 0) {
            return trunc(t, 150);
          }
        }

        let sib = cur.previousElementSibling;
        let sc = 0;

        while (sib && sc < 5) {
          const st = (sib.textContent || '').replace(/\s+/g, ' ').trim();

          if (st.length > 5 && st.length < 300) {
            const tag2 = (sib.tagName || '').toLowerCase();

            if (
              ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'label', 'span', 'div'].includes(tag2) &&
              skip.indexOf(st) < 0
            ) {
              return trunc(st, 150);
            }
          }

          sib = sib.previousElementSibling;
          sc++;
        }
      } catch (e) {}

      cur = cur.parentElement || (cur.getRootNode && cur.getRootNode() !== cur ? cur.getRootNode().host : null);
      d++;
    }

    return null;
  }

  function getLastKnownQuestion() {
    for (let i = S.logs.length - 1; i >= 0 && i >= S.logs.length - 10; i--) {
      if (
        S.logs[i] &&
        S.logs[i].question &&
        S.logs[i].question !== 'Procurar' &&
        S.logs[i].question !== 'Selecionar'
      ) {
        return S.logs[i].question;
      }
    }

    return null;
  }

  function resolveQuestion(question) {
    if (question && question !== 'Procurar' && question !== 'Selecionar') return question;
    return getLastKnownQuestion() || question;
  }

  function classify(type, el, txt) {
    if (type !== 'click') {
      if (type === 'input') return 'INPUT';
      if (type === 'change') return 'CHANGE';
      if (type === 'keydown') return 'HOTKEY';
      return 'CLICK';
    }

    const t = (txt || '').trim().toLowerCase();

    if (['selecionar', 'seleccionar', 'select'].includes(t)) return 'DROPDOWN_OPEN';

    let cur = el;
    let dd = 0;

    while (cur && dd < 4) {
      if (cur.classList) {
        if (
          cur.classList.contains('andes-dropdown__trigger') ||
          cur.classList.contains('andes-dropdown__chevron') ||
          cur.classList.contains('andes-dropdown__standalone-arrow')
        ) {
          return 'DROPDOWN_OPEN';
        }
      }

      cur = cur.parentElement;
      dd++;
    }

    if (['sim', 'yes', 'si', 'sí'].includes(t)) return 'DECISION_YES';
    if (['não', 'no'].includes(t)) return 'DECISION_NO';
    if (['continuar', 'continue', 'siguiente', 'avançar', 'próximo', 'next'].includes(t)) return 'CONTINUE';

    let c = el;
    let ddd = 0;

    while (c && ddd < 5) {
      if (
        c.classList &&
        (
          c.classList.contains('andes-list__item') ||
          c.classList.contains('andes-dropdown__item') ||
          c.classList.contains('andes-list__item-primary')
        )
      ) {
        return 'DROPDOWN_SELECT';
      }

      c = c.parentElement;
      ddd++;
    }

    return 'CLICK';
  }

  function chkRage(x, y) {
    const key = bkt(x) + '_' + bkt(y);
    const now = Date.now();

    if (!S.rage[key]) S.rage[key] = [];

    S.rage[key].push(now);
    S.rage[key] = S.rage[key].filter(t => now - t < CFG.RAGE_WIN);

    if (S.rage[key].length >= CFG.RAGE_N) {
      const cnt = S.rage[key].length;
      const dur = now - S.rage[key][0];

      S.rage[key] = [];

      return {
        rage: true,
        count: cnt,
        duration: dur,
      };
    }

    return { rage: false };
  }

  function isDup(el, now) {
    if (S.lastClk.el === el && now - S.lastClk.t < CFG.DEBOUNCE_MS) return true;

    S.lastClk = {
      el,
      t: now,
    };

    return false;
  }

  function isPanel(el) {
    let c = el;
    let d = 0;

    while (c && d < 20) {
      if (c.id === CONFIG.dropdownId) return true;
      if (c.id === CONFIG.dropdownId + '-compact') return true;

      if (c.getAttribute && c.getAttribute('data-action-tracker') === 'true') return true;

      c = c.parentElement || (c.getRootNode && c.getRootNode() !== c ? c.getRootNode().host : null);
      d++;
    }

    return false;
  }

  // ─────────────────────────────────────────────────────
  // LOGGING
  // ─────────────────────────────────────────────────────

  function addLog(data) {
    S.cnt++;

    const prevTime = S.logs.length > 0 ? S.logs[S.logs.length - 1].timestamp : S.t0;
    const sincePrev = ((Date.now() - prevTime) / 1000).toFixed(1) + 's';

    const entry = {
      id: S.cnt,
      timestamp: Date.now(),
      timeStr: ts(),
      elapsed: ela(),
      sincePrevious: sincePrev,
    };

    for (const k in data) {
      entry[k] = data[k];
    }

    S.logs.push(entry);

    if (data.module) {
      S.mods.add(data.module);
    }

    const flowTypes = ['DECISION_YES', 'DECISION_NO', 'CONTINUE', 'DROPDOWN_SELECT'];

    if (flowTypes.indexOf(data.semantic) >= 0) {
      S.stepCounter++;

      entry.step = S.stepCounter;

      S.decs.push({
        time: entry.timestamp,
        type: data.semantic,
        question: data.question,
        answer: data.text,
        step: S.stepCounter,
      });
    }

    if (data.semantic !== 'RAGE_CLICK') {
      for (let i = S.logs.length - 2; i >= 0 && i >= S.logs.length - 5; i--) {
        if (S.logs[i] && S.logs[i].semantic === 'RAGE_CLICK' && !S.logs[i].resolved) {
          S.logs[i].resolved = true;
          S.logs[i].resolvedAfter = ((entry.timestamp - S.logs[i].timestamp) / 1000).toFixed(1) + 's';
          break;
        }
      }
    }

    if (_uiUpdateCallback) {
      _uiUpdateCallback(entry);
    }

    return entry;
  }

  function onClk(e) {
    if (!S.rec || S.dead) return;

    const path = e.composedPath ? e.composedPath() : [];
    const rawTgt = path[0] || e.target;

    if (!rawTgt || !rawTgt.tagName) return;

    let tgt = resolveTarget(rawTgt);

    if (!tgt || !tgt.tagName) {
      tgt = rawTgt;
    }

    if (isPanel(tgt)) return;

    const now = Date.now();

    if (isDup(tgt, now)) return;

    const x = e.clientX || 0;
    const y = e.clientY || 0;

    const rg = chkRage(x, y);

    if (rg.rage) {
      addLog({
        semantic: 'RAGE_CLICK',
        text: trunc(visTxt(tgt), 60),
        module: detectMod(tgt),
        question: findQuestion(tgt) || getLastKnownQuestion(),
        relatedStep: S.stepCounter + 1,
        tag: tgt.tagName.toLowerCase(),
        classes: mainCls(tgt),
        path: cssPath(tgt),
        x,
        y,
        rageCount: rg.count,
        rageDuration: rg.duration,
        resolved: false,
        resolvedAfter: null,
      });

      return;
    }

    const txt = visTxt(tgt);
    const sem = classify('click', tgt, txt);
    const mod = detectMod(tgt);
    const q = resolveQuestion(findQuestion(tgt));

    S.modSt[mod] = 'LOADED';

    addLog({
      semantic: sem,
      text: trunc(txt, 80),
      module: mod,
      question: q || null,
      tag: tgt.tagName.toLowerCase(),
      classes: mainCls(tgt),
      id: tgt.id && !/^_r_/.test(tgt.id) ? tgt.id : null,
      path: cssPath(tgt),
      x,
      y,
      moduleState: 'LOADED',
    });
  }

  function onInp(e) {
    if (!S.rec || S.dead) return;

    const path = e.composedPath ? e.composedPath() : [];
    const tgt = path[0] || e.target;

    if (!tgt || isPanel(tgt)) return;

    if (S.inputTimers.has(tgt)) {
      clearTimeout(S.inputTimers.get(tgt));
    }

    S.inputTimers.set(tgt, setTimeout(function () {
      S.inputTimers.delete(tgt);

      addLog({
        semantic: 'INPUT',
        text: trunc(tgt.value || '', 60),
        module: detectMod(tgt),
        tag: tgt.tagName.toLowerCase(),
        inputType: tgt.type || 'text',
        placeholder: tgt.placeholder || null,
        path: cssPath(tgt),
      });
    }, CFG.INPUT_DEBOUNCE));
  }

  function onChg(e) {
    if (!S.rec || S.dead) return;

    const path = e.composedPath ? e.composedPath() : [];
    const tgt = path[0] || e.target;

    if (!tgt || isPanel(tgt)) return;

    if (S.inputTimers.has(tgt)) {
      clearTimeout(S.inputTimers.get(tgt));
      S.inputTimers.delete(tgt);
    }

    addLog({
      semantic: 'CHANGE',
      text: trunc(tgt.value || '', 60),
      module: detectMod(tgt),
      tag: tgt.tagName.toLowerCase(),
      path: cssPath(tgt),
    });
  }

  function onKey(e) {
    if (!S.rec || S.dead) return;

    if (
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey &&
      ['Escape', 'Enter', 'Tab', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].indexOf(e.key) < 0
    ) {
      return;
    }

    const path = e.composedPath ? e.composedPath() : [];
    const tgt = path[0] || e.target;

    if (isPanel(tgt)) return;

    const combo =
      (e.ctrlKey ? 'Ctrl+' : '') +
      (e.altKey ? 'Alt+' : '') +
      (e.metaKey ? 'Meta+' : '') +
      (e.shiftKey ? 'Shift+' : '') +
      e.key;

    addLog({
      semantic: 'HOTKEY',
      text: combo,
      module: detectMod(tgt),
      tag: tgt ? (tgt.tagName || '').toLowerCase() : 'body',
      path: cssPath(tgt),
    });
  }

  let lastUrl = location.href;

  function chkNav() {
    if (S.dead) return;

    if (location.href !== lastUrl) {
      const old = lastUrl;

      lastUrl = location.href;

      addLog({
        semantic: 'NAVIGATION',
        text: location.href,
        module: 'Navegação',
        from: old,
        to: location.href,
      });
    }
  }

  function attach(root) {
    if (seenRoots.has(root)) return;

    seenRoots.add(root);

    root.addEventListener('click', onClk, true);
    root.addEventListener('input', onInp, true);
    root.addEventListener('change', onChg, true);
    root.addEventListener('keydown', onKey, true);
  }

  function scanShadows(node) {
    if (S.dead || !node) return;

    try {
      if (node.shadowRoot && !seenRoots.has(node.shadowRoot)) {
        attach(node.shadowRoot);
        scanShadows(node.shadowRoot);
      }

      const all = node.querySelectorAll ? node.querySelectorAll('*') : [];

      for (let i = 0; i < all.length; i++) {
        if (all[i].shadowRoot && !seenRoots.has(all[i].shadowRoot)) {
          attach(all[i].shadowRoot);
          scanShadows(all[i].shadowRoot);
        }
      }
    } catch (e) {}
  }

  function startObs() {
    const obs = new MutationObserver(function (muts) {
      for (let i = 0; i < muts.length; i++) {
        const added = muts[i].addedNodes || [];

        for (let j = 0; j < added.length; j++) {
          if (added[j].nodeType === 1) {
            scanShadows(added[j]);

            if (added[j].shadowRoot) {
              attach(added[j].shadowRoot);
            }
          }
        }
      }
    });

    obs.observe(document.body, {
      childList: true,
      subtree: true,
    });

    _observers.push(obs);

    return obs;
  }

  // ─────────────────────────────────────────────────────
  // REPORTS
  // ─────────────────────────────────────────────────────

  const EICONS = {
    DECISION_YES: 'YES',
    DECISION_NO: 'NO',
    CONTINUE: 'NEXT',
    DROPDOWN_OPEN: 'OPEN',
    DROPDOWN_SELECT: 'SEL',
    RAGE_CLICK: 'RAGE',
    NAVIGATION: 'NAV',
    INPUT: 'INP',
    CHANGE: 'CHG',
    HOTKEY: 'KEY',
    CLICK: 'CLK',
  };

  const SEMANTIC_COLORS = {
    DECISION_YES: '#00A650',
    DECISION_NO: '#F23D4F',
    CONTINUE: '#3483FA',
    DROPDOWN_OPEN: '#7B61FF',
    DROPDOWN_SELECT: '#9C27B0',
    RAGE_CLICK: '#FF6D00',
    NAVIGATION: '#00838F',
    INPUT: '#8E24AA',
    CHANGE: '#5C6BC0',
    HOTKEY: '#F9A825',
    CLICK: '#666666',
  };

  function getMetrics() {
    const td = S.decs.length;

    let avg = 0;

    if (td > 1) {
      let g = 0;

      for (let i = 1; i < S.decs.length; i++) {
        g += S.decs[i].time - S.decs[i - 1].time;
      }

      avg = (g / (td - 1) / 1000).toFixed(1);
    }

    const rage = S.logs.filter(l => l.semantic === 'RAGE_CLICK').length;

    const tot = S.logs.filter(l =>
      ['CLICK', 'DECISION_YES', 'DECISION_NO', 'CONTINUE', 'DROPDOWN_SELECT', 'RAGE_CLICK'].includes(l.semantic)
    ).length;

    const mean = S.logs.filter(l =>
      ['DECISION_YES', 'DECISION_NO', 'CONTINUE', 'DROPDOWN_SELECT'].includes(l.semantic)
    ).length;

    const eff = tot > 0 ? ((mean / tot) * 100).toFixed(0) : '100';

    return {
      totalDecisions: td,
      avgDecisionTime: avg,
      rageClicks: rage,
      totalClicks: tot,
      meaningfulClicks: mean,
      efficiency: eff,
    };
  }

  function flowPath() {
    return S.decs.map(d => {
      return '  ' + d.step + '. ' + (d.question ? '"' + d.question + '"' : '(sem contexto)') + ' -> ' + (d.answer || d.type);
    }).join('\n');
  }

  function genLog() {
    const m = getMetrics();
    const dur = ((Date.now() - S.t0) / 1000 / 60).toFixed(1);

    let L =
      '\n╔' + rx('═', 76) + '╗\n' +
      '║                    ACTION TRACKER V5.3.2 — RELATÓRIO                        ║\n' +
      '╚' + rx('═', 76) + '╝\n\n';

    L += 'RESUMO\n' + rx('─', 78) + '\n';
    L += '  ID: ' + S.sid + '\n';
    L += '  URL: ' + S.url0 + '\n';
    L += '  Duração: ' + dur + ' min | ' + new Date(S.t0).toLocaleString('pt-BR') + ' -> ' + new Date().toLocaleString('pt-BR') + '\n\n';

    L += 'MÓDULOS\n' + rx('─', 78) + '\n';

    const ma = Array.from(S.mods);

    L += (ma.length ? ma.map(x => '  • ' + x + ' [' + (S.modSt[x] || 'LOADED') + ']').join('\n') : '  (nenhum)') + '\n\n';

    L += 'FLUXO (' + S.decs.length + ' decisões)\n' + rx('─', 78) + '\n';
    L += (flowPath() || '  (nenhuma)') + '\n\n';

    L += 'MÉTRICAS\n' + rx('─', 78) + '\n';
    L += '  Decisões: ' + m.totalDecisions + '\n';
    L += '  Média por decisão: ' + m.avgDecisionTime + 's\n';
    L += '  Rage clicks: ' + m.rageClicks + '\n';
    L += '  Cliques totais: ' + m.totalClicks + '\n';
    L += '  Eficiência: ' + m.efficiency + '%\n\n';

    L += rx('═', 78) + '\nEVENTOS\n' + rx('═', 78) + '\n';

    S.logs.forEach(e => {
      const ic = EICONS[e.semantic] || 'CLK';

      L += '\n┌ ' + ic + ' #' + e.id + ' ' + e.semantic + (e.step ? ' (Step ' + e.step + ')' : '') + '\n';
      L += '│ ' + e.timeStr + ' (' + e.elapsed + ')';

      if (e.sincePrevious && e.sincePrevious !== '0.0s') {
        L += ' [+' + e.sincePrevious + ']';
      }

      L += '\n│ Módulo: ' + (e.module || '-') + '\n';

      if (e.question) L += '│ Pergunta: "' + e.question + '"\n';
      if (e.text) L += '│ Valor: "' + e.text + '"\n';
      if (e.rageCount) L += '│ Rage: ' + e.rageCount + 'x/' + e.rageDuration + 'ms' + (e.resolved ? ' resolvido em ' + e.resolvedAfter : '') + '\n';
      if (e.path) L += '│ CSS: ' + e.path + '\n';
      if (e.x !== undefined && e.y !== undefined) L += '│ X=' + e.x + ' Y=' + e.y + '\n';

      L += '└' + rx('─', 65) + '\n';
    });

    L += '\n' + rx('═', 78) + '\nAction Tracker V5.3.2 • ' + new Date().toLocaleString('pt-BR') + '\n' + rx('═', 78) + '\n';

    return L;
  }

  function genJSON() {
    return JSON.stringify({
      session: {
        id: S.sid,
        url: S.url0,
        start: S.t0,
        end: Date.now(),
        duration: Date.now() - S.t0,
      },
      metrics: getMetrics(),
      modules: Array.from(S.mods).map(mm => ({
        name: mm,
        state: S.modSt[mm] || 'LOADED',
      })),
      flowPath: S.decs,
      flowResult: S.flowResult || {
        text: null,
        detectedAt: null,
        source: 'not-captured',
      },
      events: S.logs,
    }, null, 2);
  }

  function genCSV() {
    let c = 'ID,Timestamp,Elapsed,SincePrev,Semantic,Module,Step,RelStep,Question,Text,Tag,Path,X,Y,RageCount,Resolved,ResolvedAfter,ModuleState\n';

    S.logs.forEach(e => {
      c += [
        e.id,
        e.timeStr,
        e.elapsed,
        e.sincePrevious || '',
        e.semantic,
        '"' + (e.module || '') + '"',
        e.step || '',
        e.relatedStep || '',
        '"' + (e.question || '').replace(/"/g, '""') + '"',
        '"' + (e.text || '').replace(/"/g, '""') + '"',
        e.tag || '',
        '"' + (e.path || '') + '"',
        e.x != null ? e.x : '',
        e.y != null ? e.y : '',
        e.rageCount || '',
        e.resolved !== undefined ? e.resolved : '',
        e.resolvedAfter || '',
        e.moduleState || '',
      ].join(',') + '\n';
    });

    return c;
  }

  function clip(text) {
    try {
      navigator.clipboard.writeText(text).catch(() => fbC(text));
    } catch (e) {
      fbC(text);
    }
  }

  function fbC(text) {
    const ta = document.createElement('textarea');

    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';

    document.body.appendChild(ta);
    ta.select();

    try {
      document.execCommand('copy');
    } catch (e) {}

    document.body.removeChild(ta);
  }

  // ─────────────────────────────────────────────────────
  // UI HELPERS
  // ─────────────────────────────────────────────────────

  function showToast(msg, type) {
    const normal = document.getElementById(CONFIG.dropdownId);
    const compact = document.getElementById(CONFIG.dropdownId + '-compact');

    let toast = null;

    if (compactMode && compact) {
      toast = compact.querySelector('#at-compact-toast');
    }

    if (!toast && normal) {
      toast = normal.querySelector('#at-toast');
    }

    if (!toast) return;

    toast.innerHTML = type === 'success'
      ? `${ICONS.checkmark} <span style="color:${CONFIG.colors.success};margin-left:4px">${msg}</span>`
      : type === 'error'
        ? `${ICONS.errorX} <span style="color:${CONFIG.colors.error};margin-left:4px">${msg}</span>`
        : `${ICONS.spinner} <span style="color:${CONFIG.colors.loading};margin-left:4px">${msg}</span>`;

    setTimeout(() => {
      if (toast) {
        toast.innerHTML = '';
      }
    }, CONFIG.feedbackDuration);
  }

  function updateRecBadge(dropdown) {
    const dd = dropdown || document.getElementById(CONFIG.dropdownId);

    if (dd) {
      const badge = dd.querySelector('#at-rec-badge');

      if (badge) {
        badge.textContent = S.rec ? 'REC' : 'PAUSA';
        badge.style.background = S.rec ? CONFIG.colors.rec : CONFIG.colors.pause;
        badge.style.animation = S.rec ? 'at-rec-pulse 1.5s infinite' : 'none';
      }
    }

    const compact = document.getElementById(CONFIG.dropdownId + '-compact');

    if (compact) {
      const recBadge = compact.querySelector('#at-compact-rec-badge');

      if (recBadge) {
        recBadge.textContent = S.rec ? 'REC' : 'PAUSA';
        recBadge.style.background = S.rec ? CONFIG.colors.rec : CONFIG.colors.pause;
        recBadge.style.animation = S.rec ? 'at-rec-pulse 1.5s infinite' : 'none';
      }
    }
  }

  function toggleRecordingQuick() {
    S.rec = !S.rec;

    updateRecBadge();

    showToast(S.rec ? 'Gravando...' : 'Pausado', S.rec ? 'loading' : 'error');
  }

  function clearTrackerData() {
    S.logs = [];
    S.cnt = 0;
    S.decs = [];
    S.rage = {};
    S.stepCounter = 0;
    S.flowResult = null;

    const normalDropdown = document.getElementById(CONFIG.dropdownId);

    if (normalDropdown) {
      const evList = normalDropdown.querySelector('#at-events-list');
      if (evList) evList.innerHTML = '';

      const cb = normalDropdown.querySelector('#at-count-badge');
      if (cb) cb.textContent = '0';

      const fc = normalDropdown.querySelector('#at-footer-count');
      if (fc) fc.textContent = '0 eventos';
    }

    const compactDropdown = document.getElementById(CONFIG.dropdownId + '-compact');

    if (compactDropdown) {
      const count = compactDropdown.querySelector('#at-compact-count');
      if (count) count.textContent = '0';

      const last = compactDropdown.querySelector('#at-compact-last');
      if (last) last.textContent = 'Sem eventos';
    }
  }

  function updateCompactDropdown(entry) {
    const compact = document.getElementById(CONFIG.dropdownId + '-compact');

    if (!compact) return;

    const count = compact.querySelector('#at-compact-count');

    if (count) {
      count.textContent = String(S.logs.length);
    }

    const recBadge = compact.querySelector('#at-compact-rec-badge');

    if (recBadge) {
      recBadge.textContent = S.rec ? 'REC' : 'PAUSA';
      recBadge.style.background = S.rec ? CONFIG.colors.rec : CONFIG.colors.pause;
      recBadge.style.animation = S.rec ? 'at-rec-pulse 1.5s infinite' : 'none';
    }

    const last = compact.querySelector('#at-compact-last');

    if (last && entry) {
      const semantic = entry.semantic || 'EVENTO';
      const text = entry.text || entry.module || '';

      last.textContent = `#${entry.id} ${semantic}${text ? ' — ' + text : ''}`;
    } else if (last && S.logs.length === 0) {
      last.textContent = 'Sem eventos';
    }
  }

  function fmtDetail(e) {
    let d = 'Módulo: ' + (e.module || '-');

    if (e.step) d += '\nStep ' + e.step;
    if (e.relatedStep) d += '\nRel. Step ' + e.relatedStep;
    if (e.question) d += '\nPergunta: "' + e.question + '"';
    if (e.text) d += '\nValor: "' + e.text + '"';
    if (e.sincePrevious) d += '\nTempo: +' + e.sincePrevious;
    if (e.tag) d += '\nElemento: <' + e.tag + '>' + (e.classes ? ' .' + e.classes : '');
    if (e.path) d += '\nCSS: ' + e.path;
    if (e.x !== undefined && e.x !== null) d += '\nMouse: X=' + e.x + ', Y=' + e.y;
    if (e.rageCount) d += '\nRage: ' + e.rageCount + 'x em ' + e.rageDuration + 'ms';
    if (e.resolved !== undefined) d += '\n' + (e.resolved ? 'Resolvido em ' + e.resolvedAfter : 'Pendente');
    if (e.moduleState) d += '\nEstado módulo: ' + e.moduleState;
    if (e.from) d += '\nDe: ' + e.from + '\nPara: ' + e.to;

    return d;
  }

  function createEventElement(entry) {
    const color = SEMANTIC_COLORS[entry.semantic] || '#666';
    const icon = EICONS[entry.semantic] || 'CLK';

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-action-tracker', 'true');

    const el = document.createElement('div');

    Object.assign(el.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '5px 10px',
      margin: '1px 6px',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background 0.12s ease',
      fontSize: '11px',
      borderLeft: `3px solid ${color}`,
    });

    el.addEventListener('mouseenter', () => {
      el.style.background = '#f5f7fa';
    });

    el.addEventListener('mouseleave', () => {
      el.style.background = 'transparent';
    });

    const numEl = document.createElement('span');

    Object.assign(numEl.style, {
      color: '#aaa',
      fontSize: '9px',
      minWidth: '20px',
      flexShrink: '0',
    });

    numEl.textContent = '#' + entry.id;

    const semEl = document.createElement('span');

    Object.assign(semEl.style, {
      fontWeight: '700',
      fontSize: '9px',
      color,
      textTransform: 'uppercase',
      flexShrink: '0',
    });

    semEl.textContent = icon + ' ' + entry.semantic;

    const textEl = document.createElement('span');

    Object.assign(textEl.style, {
      flex: '1',
      color: '#333',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: '11px',
    });

    textEl.textContent = entry.text || entry.module || '';

    const timeEl = document.createElement('span');

    Object.assign(timeEl.style, {
      color: '#aaa',
      fontSize: '9px',
      flexShrink: '0',
    });

    timeEl.textContent = entry.timeStr.slice(0, 8) + (entry.sincePrevious && entry.sincePrevious !== '0.0s' ? ' (+' + entry.sincePrevious + ')' : '');

    el.appendChild(numEl);
    el.appendChild(semEl);
    el.appendChild(textEl);
    el.appendChild(timeEl);

    const detail = document.createElement('div');

    Object.assign(detail.style, {
      display: 'none',
      margin: '0 6px 4px 16px',
      padding: '6px 8px',
      background: '#fafbfc',
      borderRadius: '4px',
      fontSize: '10px',
      color: '#666',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      lineHeight: '1.4',
      borderLeft: `2px solid ${color}40`,
    });

    detail.textContent = fmtDetail(entry);

    el.addEventListener('click', e => {
      e.stopPropagation();
      detail.style.display = detail.style.display === 'none' ? 'block' : 'none';
    });

    wrapper.appendChild(el);
    wrapper.appendChild(detail);

    return wrapper;
  }

  // ─────────────────────────────────────────────────────
  // COMPACT DROPDOWN
  // ─────────────────────────────────────────────────────

  function clampElementToViewport(el) {
    if (!el) return;

    const rect = el.getBoundingClientRect();

    let left = rect.left;
    let top = rect.top;

    const width = rect.width || el.offsetWidth || 150;
    const height = rect.height || el.offsetHeight || 230;

    if (left < 0) left = 0;
    if (top < 0) top = 0;

    if (left + width > window.innerWidth) {
      left = Math.max(0, window.innerWidth - width);
    }

    if (top + height > window.innerHeight) {
      top = Math.max(0, window.innerHeight - height);
    }

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }

  function getOrCreateCompactDropdown() {
    if (compactDropdownEl && document.body.contains(compactDropdownEl)) {
      return compactDropdownEl;
    }

    const old = document.getElementById(CONFIG.dropdownId + '-compact');

    if (old) old.remove();

    const compact = document.createElement('div');

    compact.id = CONFIG.dropdownId + '-compact';
    compact.setAttribute('data-action-tracker', 'true');
    compact.setAttribute('role', 'menu');

    function applyCompactOrientation(options) {
      options = options || {};

      const keepPosition = options.keepPosition === true;

      let oldLeft = null;
      let oldTop = null;

      if (keepPosition && document.body.contains(compact)) {
        const rect = compact.getBoundingClientRect();
        oldLeft = rect.left;
        oldTop = rect.top;
      }

      const buttonsWrap = compact.querySelector('#at-compact-buttons-wrap');

      if (compactHorizontal) {
        compact.style.width = '360px';

        if (buttonsWrap) {
          buttonsWrap.style.flexDirection = 'row';
          buttonsWrap.style.flexWrap = 'nowrap';
          buttonsWrap.style.alignItems = 'stretch';
          buttonsWrap.style.justifyContent = 'space-between';

          buttonsWrap.querySelectorAll('button').forEach(btn => {
            btn.style.width = 'auto';
            btn.style.flex = '1 1 0';
            btn.style.minWidth = '0';
            btn.style.justifyContent = 'center';
            btn.style.padding = '6px 5px';
          });
        }
      } else {
        compact.style.width = '150px';

        if (buttonsWrap) {
          buttonsWrap.style.flexDirection = 'column';
          buttonsWrap.style.flexWrap = 'nowrap';
          buttonsWrap.style.alignItems = 'stretch';
          buttonsWrap.style.justifyContent = 'flex-start';

          buttonsWrap.querySelectorAll('button').forEach(btn => {
            btn.style.width = '100%';
            btn.style.flex = 'initial';
            btn.style.minWidth = '0';
            btn.style.justifyContent = 'flex-start';
            btn.style.padding = '6px 7px';
          });
        }
      }

      if (keepPosition && oldLeft !== null && oldTop !== null) {
        compact.style.left = `${oldLeft}px`;
        compact.style.top = `${oldTop}px`;

        requestAnimationFrame(() => {
          clampElementToViewport(compact);
        });
      }
    }

    Object.assign(compact.style, {
      display: 'none',
      position: 'fixed',
      zIndex: '999999',
      background: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)',
      padding: '0',
      width: compactHorizontal ? '360px' : '150px',
      fontFamily: "'Proxima Nova', -apple-system, sans-serif",
      fontSize: '11px',
      border: '1px solid rgba(0,0,0,0.08)',
      overflow: 'hidden',
      flexDirection: 'column',
      transition: 'width 0.15s ease',
    });

    const header = document.createElement('div');

    Object.assign(header.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '7px 9px',
      borderBottom: '1px solid #f0f0f0',
      userSelect: 'none',
      cursor: 'move',
    });

    const title = document.createElement('span');

    Object.assign(title.style, {
      fontSize: '10px',
      fontWeight: '700',
      color: CONFIG.colors.accent,
    });

    title.textContent = 'Tracker';

    const badges = document.createElement('div');

    Object.assign(badges.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    });

    const recBadge = document.createElement('span');

    recBadge.id = 'at-compact-rec-badge';

    Object.assign(recBadge.style, {
      fontSize: '8px',
      fontWeight: '700',
      color: '#fff',
      background: S.rec ? CONFIG.colors.rec : CONFIG.colors.pause,
      padding: '2px 5px',
      borderRadius: '10px',
      animation: S.rec ? 'at-rec-pulse 1.5s infinite' : 'none',
    });

    recBadge.textContent = S.rec ? 'REC' : 'PAUSA';

    const countBadge = document.createElement('span');

    countBadge.id = 'at-compact-count';

    Object.assign(countBadge.style, {
      fontSize: '8px',
      fontWeight: '700',
      color: '#666',
      background: '#f0f0f0',
      padding: '2px 5px',
      borderRadius: '10px',
    });

    countBadge.textContent = String(S.logs.length);

    badges.appendChild(recBadge);
    badges.appendChild(countBadge);

    header.appendChild(title);
    header.appendChild(badges);

    compact.appendChild(header);

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let startLeft = 0;
    let startTop = 0;

    header.addEventListener('mousedown', e => {
      if (e.button !== 0) return;

      e.preventDefault();
      e.stopPropagation();

      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      const rect = compact.getBoundingClientRect();

      startLeft = rect.left;
      startTop = rect.top;
    });

    header.addEventListener('contextmenu', e => {
      e.preventDefault();
      e.stopPropagation();

      compactHorizontal = !compactHorizontal;

      // Mantém a posição atual ao alternar orientação.
      // Apenas ajusta se o elemento passar da borda da tela.
      applyCompactOrientation({ keepPosition: true });
    });

    document.addEventListener('mousemove', e => {
      if (!isDragging) return;

      e.preventDefault();

      let newLeft = startLeft + (e.clientX - dragStartX);
      let newTop = startTop + (e.clientY - dragStartY);

      const width = compact.offsetWidth || (compactHorizontal ? 360 : 150);
      const height = compact.offsetHeight || 230;

      if (newLeft < 0) newLeft = 0;
      if (newTop < 0) newTop = 0;

      if (newLeft + width > window.innerWidth) {
        newLeft = window.innerWidth - width;
      }

      if (newTop + height > window.innerHeight) {
        newTop = window.innerHeight - height;
      }

      compact.style.left = `${newLeft}px`;
      compact.style.top = `${newTop}px`;
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    const buttonsWrap = document.createElement('div');

    buttonsWrap.id = 'at-compact-buttons-wrap';

    Object.assign(buttonsWrap.style, {
      display: 'flex',
      flexDirection: compactHorizontal ? 'row' : 'column',
      flexWrap: compactHorizontal ? 'nowrap' : 'nowrap',
      alignItems: compactHorizontal ? 'stretch' : 'stretch',
      justifyContent: compactHorizontal ? 'space-between' : 'flex-start',
      gap: '3px',
      padding: '6px',
      transition: 'all 0.15s ease',
    });

    const compactItems = [
      { abbr: 'REC', color: CONFIG.colors.rec, icon: ICONS.rec, action: 'toggle-rec' },
      { abbr: 'LOG', color: '#1F4E96', icon: ICONS.log, action: 'copy-log' },
      { abbr: 'JSON', color: '#00838F', icon: ICONS.json, action: 'copy-json' },
      { abbr: 'CSV', color: '#7B61FF', icon: ICONS.csv, action: 'copy-csv' },
      { abbr: 'CLR', color: '#F23D4F', icon: ICONS.clear, action: 'clear' },
    ];

    compactItems.forEach(item => {
      const btn = document.createElement('button');

      btn.setAttribute('data-action-tracker', 'true');

      Object.assign(btn.style, {
        display: 'flex',
        alignItems: 'center',
        gap: compactHorizontal ? '3px' : '6px',
        width: compactHorizontal ? 'auto' : '100%',
        flex: compactHorizontal ? '1 1 0' : 'initial',
        minWidth: '0',
        justifyContent: compactHorizontal ? 'center' : 'flex-start',
        padding: compactHorizontal ? '6px 5px' : '6px 7px',
        border: '1px solid #e0e0e0',
        borderRadius: '5px',
        background: '#fff',
        cursor: 'pointer',
        fontSize: '10px',
        fontWeight: '700',
        color: item.color,
        transition: 'all 0.12s ease',
        lineHeight: '1',
      });

      btn.innerHTML = `
        <span style="display:inline-flex;align-items:center;flex-shrink:0">${item.icon}</span>
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.abbr}</span>
      `;

      btn.addEventListener('mouseenter', () => {
        btn.style.background = '#f5f7fa';
        btn.style.borderColor = item.color;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.background = '#fff';
        btn.style.borderColor = '#e0e0e0';
      });

      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();

        switch (item.action) {
          case 'toggle-rec':
            toggleRecordingQuick();
            updateCompactDropdown();
            break;

          case 'copy-log':
            clip(genLog());
            showToast('LOG copiado!', 'success');
            break;

          case 'copy-json':
            clip(genJSON());
            showToast('JSON copiado!', 'success');
            break;

          case 'copy-csv':
            clip(genCSV());
            showToast('CSV copiado!', 'success');
            break;

          case 'clear':
            clearTrackerData();
            updateCompactDropdown();
            showToast('Limpo!', 'success');
            break;
        }
      });

      buttonsWrap.appendChild(btn);
    });

    compact.appendChild(buttonsWrap);

    const compactToast = document.createElement('div');

    compactToast.id = 'at-compact-toast';

    Object.assign(compactToast.style, {
      minHeight: '16px',
      padding: '0 7px 4px',
      fontSize: '9px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    });

    compact.appendChild(compactToast);

    const lastEvent = document.createElement('div');

    lastEvent.id = 'at-compact-last';

    Object.assign(lastEvent.style, {
      padding: '6px 8px',
      borderTop: '1px solid #f0f0f0',
      color: '#777',
      fontSize: '9px',
      lineHeight: '1.3',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    });

    const lastLog = S.logs[S.logs.length - 1];

    lastEvent.textContent = lastLog
      ? `#${lastLog.id} ${lastLog.semantic}${lastLog.text ? ' — ' + lastLog.text : ''}`
      : 'Sem eventos';

    compact.appendChild(lastEvent);

    document.body.appendChild(compact);

    compactDropdownEl = compact;

    applyCompactOrientation();

    return compact;
  }

  // ─────────────────────────────────────────────────────
  // NORMAL DROPDOWN
  // ─────────────────────────────────────────────────────

  function getOrCreateDropdown() {
    if (dropdownEl && document.body.contains(dropdownEl)) {
      return dropdownEl;
    }

    const old = document.getElementById(CONFIG.dropdownId);

    if (old) old.remove();

    const dropdown = document.createElement('div');

    dropdown.id = CONFIG.dropdownId;
    dropdown.setAttribute('data-action-tracker', 'true');
    dropdown.setAttribute('role', 'menu');

    Object.assign(dropdown.style, {
      display: 'none',
      position: 'fixed',
      zIndex: '999999',
      background: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)',
      padding: '0',
      width: '380px',
      maxHeight: '80vh',
      fontFamily: "'Proxima Nova', -apple-system, sans-serif",
      fontSize: '13px',
      border: '1px solid rgba(0,0,0,0.08)',
      overflow: 'hidden',
      flexDirection: 'column',
    });

    const headerRow = document.createElement('div');

    Object.assign(headerRow.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px 8px',
      borderBottom: '1px solid #f0f0f0',
      cursor: 'move',
      userSelect: 'none',
    });

    const headerLeft = document.createElement('div');

    Object.assign(headerLeft.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    });

    const headerTitle = document.createElement('span');

    Object.assign(headerTitle.style, {
      fontSize: '12px',
      fontWeight: '700',
      color: CONFIG.colors.accent,
    });

    headerTitle.textContent = 'Tracker V5.3.2';

    const recBadge = document.createElement('span');

    recBadge.id = 'at-rec-badge';

    Object.assign(recBadge.style, {
      fontSize: '9px',
      fontWeight: '700',
      color: '#fff',
      background: CONFIG.colors.rec,
      padding: '2px 6px',
      borderRadius: '10px',
      animation: 'at-rec-pulse 1.5s infinite',
    });

    recBadge.textContent = 'REC';

    const countBadge = document.createElement('span');

    countBadge.id = 'at-count-badge';

    Object.assign(countBadge.style, {
      fontSize: '9px',
      fontWeight: '600',
      color: '#666',
      background: '#f0f0f0',
      padding: '2px 6px',
      borderRadius: '10px',
    });

    countBadge.textContent = '0';

    headerLeft.appendChild(headerTitle);
    headerLeft.appendChild(recBadge);
    headerLeft.appendChild(countBadge);

    const closeBtn = document.createElement('div');

    closeBtn.setAttribute('role', 'button');

    Object.assign(closeBtn.style, {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '20px',
      height: '20px',
      borderRadius: '4px',
      transition: 'background-color 0.15s ease',
    });

    closeBtn.innerHTML = ICONS.close;

    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.backgroundColor = '#f0f0f0';
    });

    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.backgroundColor = 'transparent';
    });

    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      closeDropdown();
    });

    headerRow.appendChild(headerLeft);
    headerRow.appendChild(closeBtn);

    dropdown.appendChild(headerRow);

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let ddStartX = 0;
    let ddStartY = 0;

    headerRow.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      if (e.target === closeBtn || closeBtn.contains(e.target)) return;

      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      const rect = dropdown.getBoundingClientRect();

      ddStartX = rect.left;
      ddStartY = rect.top;

      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!isDragging) return;

      let newLeft = ddStartX + (e.clientX - dragStartX);
      let newTop = ddStartY + (e.clientY - dragStartY);

      if (newLeft < 0) newLeft = 0;
      if (newTop < 0) newTop = 0;

      dropdown.style.left = `${newLeft}px`;
      dropdown.style.top = `${newTop}px`;
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    const toolbar = document.createElement('div');

    Object.assign(toolbar.style, {
      display: 'flex',
      gap: '4px',
      padding: '6px 10px',
      borderBottom: '1px solid #f0f0f0',
      flexWrap: 'wrap',
      alignItems: 'center',
    });

    const TOOL_ITEMS = [
      { id: 'rec', abbr: 'REC', color: CONFIG.colors.rec, icon: ICONS.rec, action: 'toggle-rec' },
      { id: 'log', abbr: 'LOG', color: '#1F4E96', icon: ICONS.log, action: 'copy-log' },
      { id: 'json', abbr: 'JSON', color: '#00838F', icon: ICONS.json, action: 'copy-json' },
      { id: 'csv', abbr: 'CSV', color: '#7B61FF', icon: ICONS.csv, action: 'copy-csv' },
      { id: 'clear', abbr: 'CLR', color: '#F23D4F', icon: ICONS.clear, action: 'clear' },
    ];

    TOOL_ITEMS.forEach(item => {
      const btn = document.createElement('button');

      btn.setAttribute('data-action-tracker', 'true');

      Object.assign(btn.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        border: '1px solid #e0e0e0',
        borderRadius: '5px',
        background: '#fff',
        cursor: 'pointer',
        fontSize: '10px',
        fontWeight: '600',
        color: item.color,
        transition: 'all 0.12s ease',
        lineHeight: '1',
      });

      btn.innerHTML = `<span style="display:inline-flex;align-items:center">${item.icon}</span><span>${item.abbr}</span>`;

      btn.addEventListener('mouseenter', () => {
        btn.style.background = '#f5f7fa';
        btn.style.borderColor = item.color;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.background = '#fff';
        btn.style.borderColor = '#e0e0e0';
      });

      btn.addEventListener('click', e => {
        e.stopPropagation();

        switch (item.action) {
          case 'toggle-rec':
            toggleRecordingQuick();
            break;

          case 'copy-log':
            clip(genLog());
            showToast('LOG copiado!', 'success');
            break;

          case 'copy-json':
            clip(genJSON());
            showToast('JSON copiado!', 'success');
            break;

          case 'copy-csv':
            clip(genCSV());
            showToast('CSV copiado!', 'success');
            break;

          case 'clear':
            clearTrackerData();
            updateCompactDropdown();
            showToast('Limpo!', 'success');
            break;
        }
      });

      toolbar.appendChild(btn);
    });

    dropdown.appendChild(toolbar);

    const toast = document.createElement('div');

    toast.id = 'at-toast';

    Object.assign(toast.style, {
      padding: '2px 14px 4px',
      fontSize: '11px',
      fontWeight: '600',
      minHeight: '16px',
      lineHeight: '16px',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.2s ease',
    });

    dropdown.appendChild(toast);

    const eventsList = document.createElement('div');

    eventsList.id = 'at-events-list';
    eventsList.setAttribute('data-action-tracker', 'true');

    Object.assign(eventsList.style, {
      flex: '1',
      overflowY: 'auto',
      padding: '4px 0',
      minHeight: '100px',
      maxHeight: '50vh',
    });

    dropdown.appendChild(eventsList);

    const footer = document.createElement('div');

    Object.assign(footer.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 14px',
      borderTop: '1px solid #f0f0f0',
      fontSize: '10px',
      color: '#999',
    });

    const footerLeft = document.createElement('span');

    footerLeft.id = 'at-footer-count';
    footerLeft.textContent = '0 eventos';

    const footerRight = document.createElement('span');

    footerRight.id = 'at-footer-time';
    footerRight.textContent = '0s';

    footer.appendChild(footerLeft);
    footer.appendChild(footerRight);

    dropdown.appendChild(footer);

    document.body.appendChild(dropdown);

    dropdownEl = dropdown;

    _uiUpdateCallback = entry => {
      const list = dropdown.querySelector('#at-events-list');

      if (list) {
        const el = createEventElement(entry);
        list.appendChild(el);

        while (list.children.length > CFG.MAX_UI) {
          list.removeChild(list.firstChild);
        }

        list.scrollTop = list.scrollHeight;
      }

      const cb = dropdown.querySelector('#at-count-badge');
      if (cb) cb.textContent = String(S.logs.length);

      const fc = dropdown.querySelector('#at-footer-count');
      if (fc) fc.textContent = S.logs.length + ' eventos';

      updateCompactDropdown(entry);
    };

    updateRecBadge(dropdown);

    return dropdown;
  }

  // ─────────────────────────────────────────────────────
  // POSITION / TOGGLE
  // ─────────────────────────────────────────────────────

  function positionDropdown(triggerButton) {
    const dropdown = getOrCreateDropdown();
    const rect = triggerButton.getBoundingClientRect();

    const dropdownWidth = 380;
    const bottomMargin = 16;

    let left = rect.left - dropdownWidth - 8;
    let top = rect.top;

    if (left < 8) {
      left = rect.left;
      top = rect.bottom + 4;
    }

    const dropdownHeight = dropdown.offsetHeight || 400;

    if (top + dropdownHeight + bottomMargin > window.innerHeight) {
      top = window.innerHeight - dropdownHeight - bottomMargin;
    }

    if (top < 8) top = 8;

    dropdown.style.left = `${left}px`;
    dropdown.style.top = `${top}px`;
  }

  function positionCompactDropdown(triggerButton) {
    const compact = getOrCreateCompactDropdown();
    const rect = triggerButton.getBoundingClientRect();

    const compactWidth = compactHorizontal ? 360 : 150;
    const bottomMargin = 16;

    let left = rect.left - compactWidth - 8;
    let top = rect.top;

    if (left < 8) {
      left = rect.left;
      top = rect.bottom + 4;
    }

    const compactHeight = compact.offsetHeight || 230;

    if (top + compactHeight + bottomMargin > window.innerHeight) {
      top = window.innerHeight - compactHeight - bottomMargin;
    }

    if (top < 8) top = 8;

    compact.style.left = `${left}px`;
    compact.style.top = `${top}px`;
  }

  function closeDropdown() {
    if (!dropdownOpen) return;

    dropdownOpen = false;
    compactMode = false;

    const dd = document.getElementById(CONFIG.dropdownId);
    if (dd) dd.style.display = 'none';

    const compact = document.getElementById(CONFIG.dropdownId + '-compact');
    if (compact) compact.style.display = 'none';

    if (activeInactiveTool) {
      activeInactiveTool.className = 'inactive-tool';
    }

    if (activeToggleButton) {
      activeToggleButton.classList.remove('toolbar-component__content-button--active');
    }

    activeToggleButton = null;
    activeInactiveTool = null;
  }

  function toggleDropdown(triggerButton, inactiveToolEl) {
    const dropdown = getOrCreateDropdown();
    const compact = document.getElementById(CONFIG.dropdownId + '-compact');

    if (dropdownOpen && !compactMode && activeToggleButton === triggerButton) {
      closeDropdown();
      return;
    }

    if (compact) compact.style.display = 'none';

    dropdownOpen = true;
    compactMode = false;

    activeToggleButton = triggerButton;
    activeInactiveTool = inactiveToolEl;

    positionDropdown(triggerButton);

    dropdown.style.display = 'flex';

    inactiveToolEl.className = 'active-tool';
    triggerButton.classList.add('toolbar-component__content-button--active');

    updateRecBadge(dropdown);
  }

  function toggleCompactDropdown(triggerButton, inactiveToolEl) {
    const normal = document.getElementById(CONFIG.dropdownId);
    const compact = getOrCreateCompactDropdown();

    if (dropdownOpen && compactMode && activeToggleButton === triggerButton) {
      closeDropdown();
      return;
    }

    if (normal) normal.style.display = 'none';

    dropdownOpen = true;
    compactMode = true;

    activeToggleButton = triggerButton;
    activeInactiveTool = inactiveToolEl;

    positionCompactDropdown(triggerButton);

    compact.style.display = 'flex';

    inactiveToolEl.className = 'active-tool';
    triggerButton.classList.add('toolbar-component__content-button--active');

    updateCompactDropdown();
  }

  window.addEventListener('scroll', () => {
    if (!dropdownOpen || !activeToggleButton) return;

    if (compactMode) {
      positionCompactDropdown(activeToggleButton);
    } else {
      positionDropdown(activeToggleButton);
    }
  }, { passive: true });

  // ─────────────────────────────────────────────────────
  // TOOLBAR ICON
  // ─────────────────────────────────────────────────────

  function createToolbarIcon() {
    const iconContainer = document.createElement('div');

    iconContainer.className = 'icon-container';
    iconContainer.setAttribute('data-action-tracker', 'true');

    const wrapper = document.createElement('div');

    wrapper.className = 'toolbar-icon-button-component-container';

    const innerDiv1 = document.createElement('div');

    const tooltipTrigger = document.createElement('div');

    tooltipTrigger.className = 'andes-tooltip__trigger';

    const inactiveTool = document.createElement('div');

    inactiveTool.className = 'inactive-tool';

    const mainButton = document.createElement('button');

    mainButton.setAttribute('data-testid', 'toolbar-tool-button');
    mainButton.className = 'toolbar-component__content-button';
    mainButton.setAttribute('aria-label', 'Action Tracker');
    mainButton.type = 'button';
    mainButton.innerHTML = ICONS.toolbarMain;

    const srLabel = document.createElement('span');

    srLabel.className = 'andes-visually-hidden';
    srLabel.setAttribute('aria-hidden', 'true');
    srLabel.textContent = 'Action Tracker ';

    tooltipTrigger.appendChild(inactiveTool);
    tooltipTrigger.appendChild(mainButton);

    innerDiv1.appendChild(tooltipTrigger);
    innerDiv1.appendChild(srLabel);

    wrapper.appendChild(innerDiv1);
    iconContainer.appendChild(wrapper);

    // Clique esquerdo: painel completo
    mainButton.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();

      toggleDropdown(mainButton, inactiveTool);
    });

    // Clique direito: painel compacto
    mainButton.addEventListener('contextmenu', e => {
      e.preventDefault();
      e.stopPropagation();

      toggleCompactDropdown(mainButton, inactiveTool);
    });

    return iconContainer;
  }

  // ─────────────────────────────────────────────────────
  // SCANNER TOOLBAR
  // ─────────────────────────────────────────────────────

  const injectedShadowRoots = new WeakSet();

  function findAllToolbarShadowRoots() {
    const results = [];

    document.querySelectorAll('section.remote-module, section[id*="remote-module"]').forEach(section => {
      if (section.id?.includes('cx-toolbar') && section.shadowRoot) {
        results.push(section.shadowRoot);
      }
    });

    return results;
  }

  function injectIntoShadowRoot(shadowRoot) {
    if (injectedShadowRoots.has(shadowRoot)) {
      const existing = shadowRoot.querySelector('[data-action-tracker="true"]');

      if (existing) return;
    }

    const iconsContainer = shadowRoot.querySelector('.icons-container');

    if (!iconsContainer) return;

    const oldIcon = iconsContainer.querySelector('[data-action-tracker="true"]');

    if (oldIcon) oldIcon.remove();

    const icon = createToolbarIcon();
    const emptyContainer = iconsContainer.querySelector('.icon-container:empty');

    if (emptyContainer) {
      iconsContainer.insertBefore(icon, emptyContainer);
    } else {
      iconsContainer.appendChild(icon);
    }

    injectedShadowRoots.add(shadowRoot);
  }

  function scanAndInject() {
    const shadowRoots = findAllToolbarShadowRoots();

    for (const sr of shadowRoots) {
      injectIntoShadowRoot(sr);

      const existing = sr.querySelector('[data-action-tracker="true"]');

      if (!existing) {
        injectedShadowRoots.delete(sr);
        injectIntoShadowRoot(sr);
      }
    }
  }

  // ─────────────────────────────────────────────────────
  // WATCHER
  // ─────────────────────────────────────────────────────

  function startWatcher() {
    getOrCreateDropdown();
    getOrCreateCompactDropdown();
    scanAndInject();

    const bodyObserver = new MutationObserver(mutations => {
      let shouldScan = false;

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const added of mutation.addedNodes) {
            if (added.nodeType !== 1) continue;

            if (added.tagName === 'SECTION' || added.querySelector?.('section')) {
              shouldScan = true;
              break;
            }

            if (added.id?.includes('toolbar') || added.id?.includes('cases')) {
              shouldScan = true;
              break;
            }
          }

          for (const removed of mutation.removedNodes) {
            if (removed.nodeType !== 1) continue;

            if (removed.id === CONFIG.dropdownId) {
              dropdownEl = null;
              getOrCreateDropdown();
            }

            if (removed.id === CONFIG.dropdownId + '-compact') {
              compactDropdownEl = null;
              getOrCreateCompactDropdown();
            }
          }
        }

        if (shouldScan) break;
      }

      if (shouldScan) {
        setTimeout(scanAndInject, 500);
      }
    });

    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    let lastUrlW = window.location.href;

    const urlObserver = new MutationObserver(() => {
      if (window.location.href !== lastUrlW) {
        lastUrlW = window.location.href;

        setTimeout(scanAndInject, 1000);
        setTimeout(scanAndInject, 2500);
        setTimeout(scanAndInject, 5000);
      }
    });

    urlObserver.observe(
      document.querySelector('head > title') || document.head,
      {
        childList: true,
        subtree: true,
        characterData: true,
      }
    );

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      setTimeout(scanAndInject, 1000);
      setTimeout(scanAndInject, 3000);
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      setTimeout(scanAndInject, 1000);
      setTimeout(scanAndInject, 3000);
    };

    function handlePopState() {
      setTimeout(scanAndInject, 1000);
      setTimeout(scanAndInject, 3000);
    }

    window.addEventListener('popstate', handlePopState);

    const safetyInterval = setInterval(() => {
      scanAndInject();

      if (!document.body.contains(dropdownEl)) {
        dropdownEl = null;
        getOrCreateDropdown();
      }

      if (!document.body.contains(compactDropdownEl)) {
        compactDropdownEl = null;
        getOrCreateCompactDropdown();
      }

      const ft = document.querySelector('#' + CONFIG.dropdownId + ' #at-footer-time');

      if (ft) {
        ft.textContent = ela();
      }
    }, CONFIG.watchInterval);

    window._actionTrackerToolbarCleanup = () => {
      S.dead = true;
      window.__ACTION_TRACKER_ACTIVE__ = false;

      bodyObserver.disconnect();
      urlObserver.disconnect();
      clearInterval(safetyInterval);

      _intervals.forEach(clearInterval);
      _observers.forEach(o => o.disconnect());

      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;

      window.removeEventListener('popstate', handlePopState);

      document.removeEventListener('click', onClk, true);
      document.removeEventListener('input', onInp, true);
      document.removeEventListener('change', onChg, true);
      document.removeEventListener('keydown', onKey, true);

      const dd = document.getElementById(CONFIG.dropdownId);

      if (dd) dd.remove();

      const compact = document.getElementById(CONFIG.dropdownId + '-compact');

      if (compact) compact.remove();

      const style = document.getElementById(STYLE_ID);

      if (style) style.remove();

      findAllToolbarShadowRoots().forEach(sr => {
        sr.querySelectorAll('[data-action-tracker="true"]').forEach(el => el.remove());
      });

      dropdownEl = null;
      compactDropdownEl = null;
      compactMode = false;
      compactHorizontal = false;

      window._actionTrackerToolbarActive = false;

      delete window.ActionTracker;
    };
  }

  // ─────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────

  attach(document);
  scanShadows(document.body);
  startObs();

  _intervals.push(setInterval(() => {
    if (!S.dead) {
      scanShadows(document.body);
      chkNav();
    }
  }, CFG.SCAN_MS));

  _intervals.push(setInterval(chkNav, 1000));

  startWatcher();

  // ─────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────

  window.ActionTracker = {
    getLogs() {
      return S.logs;
    },

    getFlowResult() {
      return S.flowResult;
    },

    setFlowResult(text) {
      S.flowResult = {
        text,
        detectedAt: Date.now(),
        source: 'manual',
      };

      showToast('Resultado: "' + trunc(text, 40) + '"', 'success');
    },

    copyLog() {
      clip(genLog());
      showToast('LOG copiado!', 'success');
    },

    copyJSON() {
      clip(genJSON());
      showToast('JSON copiado!', 'success');
    },

    copyCSV() {
      clip(genCSV());
      showToast('CSV copiado!', 'success');
    },

    toggleRecording() {
      toggleRecordingQuick();
    },

    togglePanel() {
      const dd = document.getElementById(CONFIG.dropdownId);

      if (dd) {
        dd.style.display = dd.style.display === 'none' ? 'flex' : 'none';
      }
    },

    toggleCompactPanel() {
      const compact = document.getElementById(CONFIG.dropdownId + '-compact');

      if (compact) {
        compact.style.display = compact.style.display === 'none' ? 'flex' : 'none';
      }
    },

    toggleCompactOrientation() {
      const compact = getOrCreateCompactDropdown();

      if (!compact) return;

      compactHorizontal = !compactHorizontal;

      const rect = compact.getBoundingClientRect();

      compact.style.left = `${rect.left}px`;
      compact.style.top = `${rect.top}px`;

      const buttonsWrap = compact.querySelector('#at-compact-buttons-wrap');

      if (compactHorizontal) {
        compact.style.width = '360px';

        if (buttonsWrap) {
          buttonsWrap.style.flexDirection = 'row';
          buttonsWrap.style.flexWrap = 'nowrap';
          buttonsWrap.style.justifyContent = 'space-between';

          buttonsWrap.querySelectorAll('button').forEach(btn => {
            btn.style.width = 'auto';
            btn.style.flex = '1 1 0';
            btn.style.justifyContent = 'center';
          });
        }
      } else {
        compact.style.width = '150px';

        if (buttonsWrap) {
          buttonsWrap.style.flexDirection = 'column';
          buttonsWrap.style.flexWrap = 'nowrap';
          buttonsWrap.style.justifyContent = 'flex-start';

          buttonsWrap.querySelectorAll('button').forEach(btn => {
            btn.style.width = '100%';
            btn.style.flex = 'initial';
            btn.style.justifyContent = 'flex-start';
          });
        }
      }

      requestAnimationFrame(() => {
        clampElementToViewport(compact);
      });
    },

    destroy() {
      if (window._actionTrackerToolbarCleanup) {
        window._actionTrackerToolbarCleanup();
      }
    },
  };

  console.log(
    '%cV5.3.2 Toolbar | Esquerdo: completo | Direito: compacto | Direito no header compacto: horizontal/vertical',
    'font-size:12px;color:#3483FA;'
  );

  console.log(
    '%cActionTracker.copyLog() | .copyJSON() | .copyCSV() | .toggleRecording() | .toggleCompactPanel() | .toggleCompactOrientation() | .destroy()',
    'font-size:11px;color:#999;'
  );
})();

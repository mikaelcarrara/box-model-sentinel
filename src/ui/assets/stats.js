(() => {
  const vscode = acquireVsCodeApi();
  const getItems = () => (Array.isArray(window.__BMS_ITEMS__) ? window.__BMS_ITEMS__ : []);
  const state = { active: 'all' };
  function computeCounts(items) {
    const c = { critical: 0, medium: 0, low: 0 };
    for (const it of items) {
      const s = String(it.sev || '').toLowerCase();
      if (c[s] !== undefined) c[s]++;
    }
    return c;
  }
  function isAll() { return String(state.active || '') === 'all'; }

  function createItemRow(it) {
    const row = document.createElement('div');
    row.className = 'item';
    const sev = String(it.sev || '').toLowerCase();
    if (sev === 'critical' || sev === 'medium' || sev === 'low') {
      row.classList.add(sev);
    }

    const head = document.createElement('div');
    head.className = 'item-head';

    const title = document.createElement('div');
    title.className = 'title';
    const titleStrong = document.createElement('strong');
    titleStrong.textContent = String(it.title || '');
    const typeSpan = document.createElement('span');
    typeSpan.className = 'type';
    typeSpan.textContent = String(it.type || '');
    title.appendChild(titleStrong);
    title.appendChild(document.createTextNode(' '));
    title.appendChild(typeSpan);

    const lineBadge = document.createElement('div');
    lineBadge.className = 'line-badge';
    lineBadge.textContent = `L${(it.line ?? 0) + 1}`;
    lineBadge.title = 'Ir para a linha';
    lineBadge.addEventListener('click', () => {
      console.log('[BMS-WebView] Line badge clicked:', it.line);
      try {
        vscode.postMessage({ type: 'openLocation', line: (it.line ?? 0), column: 0 });
        console.log('[BMS-WebView] Message sent successfully');
      } catch (e) {
        console.error('[BMS-WebView] Failed to send message:', e);
      }
    });

    head.appendChild(title);
    head.appendChild(lineBadge);
    row.appendChild(head);

    const body = document.createElement('div');
    body.className = 'item-body';
    const exp = String(it.explanation || '').trim();
    const imp = String(it.viewportImpact || '').trim();
    const combined = [exp, imp].filter(Boolean).join(' — ');
    body.textContent = combined;
    row.appendChild(body);

    const code = document.createElement('code');
    code.className = 'solution';
    code.textContent = String(it.suggestion || '').trim();
    row.appendChild(code);

    // Add visualization if available
    if (it.visualization) {
      const vizContainer = document.createElement('details');
      vizContainer.className = 'visualization-container';
      
      const vizSummary = document.createElement('summary');
      vizSummary.textContent = 'Compare';
      vizContainer.appendChild(vizSummary);
      
      const vizPre = document.createElement('pre');
      vizPre.className = 'visualization';
      vizPre.textContent = it.visualization;
      vizContainer.appendChild(vizPre);
      
      row.appendChild(vizContainer);
    }

    return row;
  }

  function renderList() {
    const items = getItems();
    const filt = String(state.active || '').toLowerCase();
    const visible = isAll() ? items : items.filter(it => String(it.sev || '').toLowerCase() === filt);
    const container = document.getElementById('list');
    if (!container) return;
    while (container.firstChild) container.removeChild(container.firstChild);
    if (visible.length === 0) {
      const msg = document.createElement('div');
      msg.className = 'blankslate';
      msg.textContent = 'No issues at this level.';
      container.appendChild(msg);
    } else {
      for (const it of visible) {
        container.appendChild(createItemRow(it));
      }
    }
  }

  function renderTabsActive() {
    const cards = document.querySelectorAll('.counts .count-card');
    cards.forEach(c => c.classList.remove('active'));
    if (!isAll()) {
      const activeCard = document.querySelector(`.counts .count-card.${state.active}`);
      if (activeCard) activeCard.classList.add('active');
    }
  }

  function setActive(sev) {
    state.active = sev;
    renderTabsActive();
    renderList();
  }

  function setupTabs() {
    state.active = 'all';
    const cards = document.querySelectorAll('.counts .count-card');
    cards.forEach(card => {
      let sev = 'low';
      if (card.classList.contains('critical')) sev = 'critical';
      else if (card.classList.contains('medium')) sev = 'medium';
      else if (card.classList.contains('low')) sev = 'low';
      card.dataset.sev = sev;
    });
    // Initialize disabled state based on current counts
    const updateDisabled = () => {
      const counts = computeCounts(getItems());
      document.querySelectorAll('.counts .count-card').forEach(card => {
        const sev = card.dataset.sev;
        const hasItems = (counts[sev] || 0) > 0;
        if (!hasItems) card.classList.add('disabled');
        else card.classList.remove('disabled');
      });
    };
    updateDisabled();
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        if (card.classList.contains('disabled')) return;
        const sev = card.dataset.sev;
        const newActive = (state.active === sev ? 'all' : sev);
        setActive(newActive);
      }, false);
    });
    renderTabsActive();
  }

  // Painel CSS é estático; atualização acontece via re-render do HTML pelo host.

  setupTabs();
  renderList();
})(); 

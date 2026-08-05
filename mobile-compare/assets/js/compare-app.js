/**
 * Mobile Compare SPA — 91mobiles-style WooCommerce compare.
 */
(function () {
  'use strict';

  const cfg = window.mobileCompareConfig || {};
  const REST = cfg.restUrl || '';
  const MAX = 3;
  const SEARCH_DEBOUNCE_MS = 280;
  const SKELETON_SPEC_ROWS = 12;

  const state = {
    view: 'select',
    selected: [],
    products: [],
    specs: [],
    config: null,
    showDiffOnly: false,
    highlightBetter: true,
    searchResults: [],
    searchQuery: '',
    popular: [],
    suggested: [],
    loading: false,
    booting: true,
    comparing: false,
    searching: false,
    error: null,
    activeSlot: null,
    toast: null,
  };

  let searchTimer = null;
  const dataCache = new Map();

  const app = document.getElementById('mobile-compare-app');
  if (!app) return;

  function api(path, params) {
    const url = new URL(REST.replace(/\/$/, '') + '/' + path.replace(/^\//, ''));
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return fetch(url.toString(), {
      headers: { 'X-WP-Nonce': cfg.restNonce || '' },
    }).then((r) => {
      if (!r.ok) throw new Error('API error');
      return r.json();
    });
  }

  function t(key) {
    return (state.config && state.config.i18n && state.config.i18n[key]) || key;
  }

  function parseRoute() {
    const path = window.location.pathname.replace(/\/+$/, '');
    const match = path.match(/\/compare\/(.+)$/);
    if (match && match[1]) {
      return { view: 'compare', slugPath: match[1] };
    }
    return { view: 'select', slugPath: '' };
  }

  function idsParam() {
    return state.selected.map((p) => p.id).join(',');
  }

  function cacheKey(ids) {
    return ids.slice().sort((a, b) => a - b).join(',');
  }

  function applyCompareData(data) {
    state.products = data.products || [];
    state.specs = data.specs || [];
    state.selected = state.products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.image,
      price: p.price,
      url: p.url,
    }));
  }

  function prefetchCompare(ids) {
    const key = cacheKey(ids);
    if (!ids.length || dataCache.has(key)) return;
    api('products', { ids: ids.join(',') })
      .then((data) => dataCache.set(key, data))
      .catch(() => {});
  }

  function navigateCompare(ids) {
    if (ids.length < 2) {
      state.view = 'select';
      state.products = [];
      state.specs = [];
      history.pushState(null, '', cfg.compareUrl || '/compare/');
      render();
      loadSelectData();
      return;
    }

    const url = buildSlugUrl(ids);
    const relative = url.replace(window.location.origin, '');
    if (window.location.pathname + window.location.search !== relative) {
      history.pushState(null, '', url);
    }
    loadCompareByIds(ids);
  }

  function buildSlugUrl(ids) {
    const slugs = ids.map((id) => {
      const p = state.selected.find((x) => x.id === id) || state.products.find((x) => x.id === id);
      return p ? p.slug : id;
    });
    const base = (cfg.compareUrl || '/compare/').replace(/\/+$/, '');
    return base + '/' + slugs.join('/vs/') + '/';
  }

  function previewProductsFromSelected() {
    return state.selected.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.image,
      price: p.price || '—',
      url: p.url || '#',
      buy_url: p.url || '#',
    }));
  }

  function loadCompareByIds(ids) {
    if (!ids.length) {
      state.view = 'select';
      state.products = [];
      state.specs = [];
      state.loading = false;
      state.comparing = false;
      state.error = null;
      render();
      loadSelectData();
      return;
    }

    const key = cacheKey(ids);
    const cached = dataCache.get(key);

    state.loading = true;
    state.comparing = true;
    state.error = null;
    state.view = 'compare';
    state.products = previewProductsFromSelected();
    state.specs = [];
    render();

    if (cached) {
      applyCompareData(cached);
      state.loading = false;
      state.comparing = false;
      render();
      return;
    }

    api('products', { ids: ids.join(',') })
      .then((data) => {
        dataCache.set(key, data);
        applyCompareData(data);
        state.loading = false;
        state.comparing = false;
        render();
      })
      .catch(() => {
        state.loading = false;
        state.comparing = false;
        state.error = t('loadError');
        state.view = 'select';
        state.products = [];
        state.specs = [];
        render();
        loadSelectData();
        showToast(t('loadError'));
      });
  }

  function loadCompareBySlugs(slugPath) {
    state.loading = true;
    state.comparing = true;
    state.error = null;
    state.view = 'compare';
    state.products = [];
    state.specs = [];
    render();

    api('products-by-slugs', { path: slugPath })
      .then((data) => {
        applyCompareData(data);
        if (state.products.length) {
          dataCache.set(cacheKey(state.products.map((p) => p.id)), data);
        }
        state.loading = false;
        state.comparing = false;
        render();
      })
      .catch(() => {
        state.loading = false;
        state.comparing = false;
        state.error = t('loadError');
        state.view = 'select';
        state.products = [];
        state.specs = [];
        render();
        loadSelectData();
        showToast(t('loadError'));
      });
  }

  function loadSelectData() {
    api('popular').then((d) => { state.popular = d.pairs || []; render(); });
    api('suggested', { exclude: idsParam() }).then((d) => { state.suggested = d.items || []; render(); });
  }

  function addProduct(product) {
    if (state.selected.find((p) => p.id === product.id)) return;
    if (state.selected.length >= MAX) return;
    state.selected.push(product);
    loadSelectData();
    render();
    if (state.selected.length >= 2) {
      prefetchCompare(state.selected.map((p) => p.id));
    }
  }

  function removeProduct(id) {
    state.selected = state.selected.filter((p) => p.id !== id);
    loadSelectData();
    render();
  }

  function searchProducts(q) {
    state.searchQuery = q;
    clearTimeout(searchTimer);

    if (!q || q.length < 2) {
      state.searchResults = [];
      state.searching = false;
      render();
      return;
    }

    state.searching = true;
    render();

    searchTimer = setTimeout(() => {
      api('search', { q, limit: 10 })
        .then((d) => {
          state.searchResults = d.items || [];
          state.searching = false;
          render();
        })
        .catch(() => {
          state.searchResults = [];
          state.searching = false;
          render();
        });
    }, SEARCH_DEBOUNCE_MS);
  }

  function parseNumber(val) {
    if (!val || val === '-') return null;
    const m = String(val).replace(/,/g, '').match(/(\d+\.?\d*)/);
    return m ? parseFloat(m[1]) : null;
  }

  function isTruthy(val) {
    const s = String(val).toLowerCase().trim();
    return ['yes', 'true', '1', 'available', 'supported', '✓', '✔'].some((x) => s.includes(x));
  }

  function getWinners(row) {
    const rule = row.rule || 'text';
    const values = row.values || [];
    if (rule === 'text') return values.map(() => false);

    if (rule === 'boolean') {
      const wins = values.map((v) => isTruthy(v));
      const any = wins.some(Boolean);
      return wins.map((w) => w && any);
    }

    const nums = values.map(parseNumber);
    const valid = nums.filter((n) => n !== null);
    if (!valid.length) return values.map(() => false);

    const target = rule === 'lower' ? Math.min(...valid) : Math.max(...valid);
    return nums.map((n) => n !== null && n === target);
  }

  function filteredSpecs() {
    if (!state.showDiffOnly) return state.specs;
    return state.specs.filter((row) => {
      const uniq = new Set(row.values.map((v) => String(v).trim().toLowerCase()));
      return uniq.size > 1;
    });
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function showToast(message) {
    state.toast = message;
    render();
    setTimeout(() => {
      if (state.toast === message) {
        state.toast = null;
        const toastEl = app.querySelector('.mc-toast');
        if (toastEl) toastEl.remove();
      }
    }, 3200);
  }

  function shareCompare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: t('title'), url });
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => showToast(t('linkCopied')));
    } else {
      showToast(url);
    }
  }

  function slugPathFromUrl(url) {
    const base = (cfg.compareUrl || '/compare/').replace(/\/+$/, '');
    const path = url.replace(window.location.origin, '').replace(/\/+$/, '');
    if (path.startsWith(base + '/')) {
      return path.slice(base.length + 1);
    }
    const match = path.match(/\/compare\/(.+)$/);
    return match ? match[1] : '';
  }

  /* ─── Render helpers ─── */

  function renderSpinner() {
    return '<span class="mc-spinner" aria-hidden="true"></span>';
  }

  function renderBootView() {
    return `
      <div class="mc-page mc-boot">
        <div class="mc-boot-inner">
          ${renderSpinner()}
          <p class="mc-boot-text">${escapeHtml(t('loadingCompare'))}</p>
        </div>
      </div>`;
  }

  function renderSelectSlot(index) {
    const item = state.selected[index];
    if (item) {
      return `
        <div class="mc-slot-card mc-slot-filled" data-index="${index}">
          <button type="button" class="mc-slot-remove" data-id="${item.id}" aria-label="Remove">×</button>
          <img src="${escapeHtml(item.image)}" alt="" class="mc-slot-img" />
          <span class="mc-slot-name">${escapeHtml(item.name)}</span>
        </div>`;
    }
    const isActive = state.activeSlot === index;
    return `
      <div class="mc-slot-card mc-slot-empty" data-index="${index}">
        <div class="mc-slot-placeholder">+</div>
        <input type="text" class="mc-search-input" placeholder="${escapeHtml(t('selectProduct'))}" data-slot="${index}" value="${isActive ? escapeHtml(state.searchQuery) : ''}" autocomplete="off" />
        ${isActive && state.searching ? `<div class="mc-search-status">${renderSpinner()}</div>` : ''}
        ${isActive && !state.searching && state.searchResults.length ? `
          <ul class="mc-search-dropdown">
            ${state.searchResults.map((p) => `
              <li data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-slug="${escapeHtml(p.slug)}" data-image="${escapeHtml(p.image)}" data-price="${escapeHtml(p.price)}" data-url="${escapeHtml(p.url)}">
                <img src="${escapeHtml(p.image)}" alt="" /> ${escapeHtml(p.name)}
              </li>`).join('')}
          </ul>` : ''}
      </div>`;
  }

  function renderSelectView() {
    const canCompare = state.selected.length >= 2;
    return `
      <div class="mc-page mc-select">
        ${state.error ? `<div class="mc-alert mc-alert-error" role="alert">${escapeHtml(state.error)}</div>` : ''}

        <section class="mc-select-section">
          <p class="mc-section-label">${escapeHtml(t('selectLabel'))}</p>
          <div class="mc-slots-scroll">
            ${renderSelectSlot(0)}
            <span class="mc-vs-badge">vs</span>
            ${renderSelectSlot(1)}
            <span class="mc-vs-badge">vs</span>
            ${renderSelectSlot(2)}
          </div>
          <button type="button" class="mc-btn mc-btn-primary mc-btn-compare ${canCompare ? '' : 'mc-disabled'} ${state.comparing ? 'mc-btn-loading' : ''}" ${canCompare && !state.comparing ? '' : 'disabled'}>
            ${state.comparing ? renderSpinner() : ''}
            ${escapeHtml(t('compareNow'))}
          </button>
        </section>

        ${!state.suggested.length && state.booting === false ? `
        <section class="mc-section">
          <h2>${escapeHtml(t('suggestedTitle'))}</h2>
          <div class="mc-card-grid mc-skeleton-grid">
            ${Array(4).fill('<article class="mc-product-card mc-skeleton-card"><div class="mc-skeleton mc-skeleton-img"></div><div class="mc-skeleton mc-skeleton-text"></div></article>').join('')}
          </div>
        </section>` : ''}

        ${state.suggested.length ? `
        <section class="mc-section">
          <h2>${escapeHtml(t('suggestedTitle'))}</h2>
          <div class="mc-card-grid">
            ${state.suggested.map((p) => {
              const added = state.selected.some((s) => s.id === p.id);
              return `
              <article class="mc-product-card">
                <img src="${escapeHtml(p.image)}" alt="" />
                <h3>${escapeHtml(p.name)}</h3>
                <button type="button" class="mc-btn mc-btn-outline mc-add-btn ${added ? 'mc-added' : ''}" data-suggest-id="${p.id}" ${added ? 'disabled' : ''}>
                  ${added ? '+ ' + escapeHtml(t('addedToCompare')) : '+ ' + escapeHtml(t('addToCompare'))}
                </button>
              </article>`;
            }).join('')}
          </div>
        </section>` : ''}

        ${!state.popular.length && state.booting === false ? `
        <section class="mc-section">
          <h2>${escapeHtml(t('popularTitle'))}</h2>
          <div class="mc-popular-grid mc-skeleton-grid">
            ${Array(3).fill('<div class="mc-popular-pair mc-skeleton-pair"><div class="mc-skeleton mc-skeleton-block"></div></div>').join('')}
          </div>
        </section>` : ''}

        ${state.popular.length ? `
        <section class="mc-section">
          <h2 class="mc-section-title">${escapeHtml(t('popularTitle'))}</h2>
          <div class="mc-popular-scroll">
            ${state.popular.map((pair) => {
              const a = pair.products[0];
              const b = pair.products[1];
              const slugPath = slugPathFromUrl(pair.url);
              return `
              <a href="${escapeHtml(pair.url)}" class="mc-popular-pair" data-slug-path="${escapeHtml(slugPath)}">
                <div class="mc-popular-side">
                  <img src="${escapeHtml(a.image)}" alt="" />
                  <span>${escapeHtml(a.name)}</span>
                </div>
                <span class="mc-vs-badge">vs</span>
                <div class="mc-popular-side">
                  <img src="${escapeHtml(b.image)}" alt="" />
                  <span>${escapeHtml(b.name)}</span>
                </div>
              </a>`;
            }).join('')}
          </div>
        </section>` : ''}
      </div>
      ${state.toast ? `<div class="mc-toast" role="status">${escapeHtml(state.toast)}</div>` : ''}`;
  }

  function renderSkeletonSpecRows(cols) {
    return Array(SKELETON_SPEC_ROWS).fill(0).map(() => `
      <tr class="mc-spec-row mc-spec-skeleton">
        <th class="mc-spec-label"><span class="mc-skeleton mc-skeleton-label"></span></th>
        ${Array(cols).fill('<td class="mc-spec-val mc-phone-col"><span class="mc-skeleton mc-skeleton-val"></span></td>').join('')}
      </tr>`).join('');
  }

  function renderPhoneHeaderCell(p, skeleton) {
    if (skeleton && !p.image) {
      return `
        <div class="mc-phone-header-cell">
          <div class="mc-skeleton mc-skeleton-img-sm"></div>
          <div class="mc-skeleton mc-skeleton-text"></div>
        </div>`;
    }
    return `
      <div class="mc-phone-header-cell">
        <button type="button" class="mc-card-close" data-remove-id="${p.id}" aria-label="Remove">×</button>
        <img src="${escapeHtml(p.image)}" alt="" class="mc-phone-img" />
        <h3 class="mc-phone-name">${escapeHtml(p.name)}</h3>
        <p class="mc-phone-price">${p.price}</p>
        ${skeleton ? '' : `
          <div class="mc-phone-actions">
            <a href="${escapeHtml(p.url)}" class="mc-btn mc-btn-xs mc-btn-outline">${escapeHtml(t('viewDetails'))}</a>
            <a href="${escapeHtml(p.buy_url || p.url)}" class="mc-btn mc-btn-xs mc-btn-buy">${escapeHtml(t('buyNow'))}</a>
          </div>
        `}
      </div>`;
  }

  function renderAddPhoneCell() {
    return `
      <div class="mc-phone-header-cell mc-phone-add-col">
        <span class="mc-add-icon-sm">+</span>
        <button type="button" class="mc-btn mc-btn-xs mc-btn-outline mc-back-select">${escapeHtml(t('addPhone'))}</button>
      </div>`;
  }

  function renderToolbarBar(skeleton) {
    return `
      <div class="mc-toolbar-bar">
        <label class="mc-toggle mc-toggle-compact">
          <input type="checkbox" class="mc-toggle-diff" ${state.showDiffOnly ? 'checked' : ''} ${skeleton ? 'disabled' : ''} />
          <span>${escapeHtml(t('showDifferences'))}</span>
        </label>
        <label class="mc-toggle mc-toggle-compact">
          <input type="checkbox" class="mc-toggle-highlight" ${state.highlightBetter ? 'checked' : ''} ${skeleton ? 'disabled' : ''} />
          <span>${escapeHtml(t('highlightBetter'))}</span>
        </label>
        ${skeleton ? `<span class="mc-loading-inline">${renderSpinner()} ${escapeHtml(t('loadingCompare'))}</span>` : ''}
      </div>`;
  }

  function renderSpecRows(specs, emptySlots, skeleton) {
    if (skeleton) {
      return renderSkeletonSpecRows(MAX);
    }

    let lastGroup = '';
    let html = '';

    specs.forEach((row) => {
      if (row.group && row.group !== lastGroup) {
        lastGroup = row.group;
        html += `
          <tr class="mc-spec-group-row">
            <th class="mc-spec-group" colspan="${MAX + 1}">${escapeHtml(row.group)}</th>
          </tr>`;
      }

      const winners = state.highlightBetter ? getWinners(row) : row.values.map(() => false);
      html += `
        <tr class="mc-spec-row">
          <th class="mc-spec-label">
            ${escapeHtml(row.label)}
          </th>
          ${row.values.map((val, idx) => `
            <td class="mc-spec-val mc-phone-col ${winners[idx] ? 'mc-better' : ''}">${escapeHtml(String(val))}</td>`).join('')}
          ${Array(emptySlots).fill('<td class="mc-spec-val mc-phone-col">-</td>').join('')}
        </tr>`;
    });

    return html;
  }

  function renderCompareView() {
    const skeleton = state.loading;
    const products = skeleton && !state.products.length
      ? Array(Math.min(state.selected.length || 2, MAX)).fill(null).map((_, i) => ({
          id: i,
          name: '…',
          image: '',
          price: '—',
          url: '#',
        }))
      : state.products;
    const specs = skeleton ? [] : filteredSpecs();
    const emptySlots = MAX - products.length;

    const phoneHeaders = products.map((p) => renderPhoneHeaderCell(p, skeleton)).join('');
    const addCol = !skeleton && emptySlots > 0 ? renderAddPhoneCell() : '';
    const specRows = renderSpecRows(specs, emptySlots, skeleton);

    return `
      <div class="mc-page mc-compare">
        <header class="mc-header-compact">
          <nav class="mc-breadcrumb"><a href="${escapeHtml(cfg.homeUrl || '/')}">Home</a> › Compare</nav>
          <div class="mc-header-compact-actions">
            <button type="button" class="mc-btn mc-btn-xs mc-btn-ghost mc-share-btn" ${skeleton ? 'disabled' : ''}>${escapeHtml(t('share'))}</button>
            <button type="button" class="mc-btn mc-btn-xs mc-btn-ghost mc-clear-btn" ${skeleton ? 'disabled' : ''}>${escapeHtml(t('clearAll'))}</button>
            <button type="button" class="mc-btn mc-btn-xs mc-btn-ghost mc-back-select">← ${escapeHtml(t('backToSelection'))}</button>
          </div>
        </header>

        ${renderToolbarBar(skeleton)}

        <div class="mc-sticky-phone-bar">
          <div class="mc-sync-scroll" data-mc-sync>
            <div class="mc-phone-header-track">
              <div class="mc-label-spacer" aria-hidden="true"></div>
              ${phoneHeaders}
              ${addCol}
            </div>
          </div>
        </div>

        <div class="mc-sync-scroll mc-spec-scroll" data-mc-sync>
          <table class="mc-compare-table mc-spec-only">
            <tbody>${specRows}</tbody>
          </table>
        </div>

        ${!skeleton && emptySlots > 0 ? `
        <footer class="mc-footer-compact">
          <button type="button" class="mc-btn mc-btn-sm mc-btn-primary mc-back-select">+ ${escapeHtml(t('addAnotherPhone'))}</button>
        </footer>` : ''}
      </div>
      ${state.toast ? `<div class="mc-toast" role="status">${escapeHtml(state.toast)}</div>` : ''}`;
  }

  function bindScrollSync() {
    const scrollers = app.querySelectorAll('[data-mc-sync]');
    if (scrollers.length < 2) return;
    let syncing = false;
    scrollers.forEach((el) => {
      el.addEventListener('scroll', () => {
        if (syncing) return;
        syncing = true;
        const left = el.scrollLeft;
        scrollers.forEach((other) => {
          if (other !== el) other.scrollLeft = left;
        });
        syncing = false;
      }, { passive: true });
    });
  }

  function render() {
    if (state.booting) {
      app.innerHTML = renderBootView();
      return;
    }

    if (state.view === 'compare' && (state.products.length || state.loading)) {
      app.innerHTML = renderCompareView();
    } else {
      app.innerHTML = renderSelectView();
    }
    bindEvents();
  }

  function bindEvents() {
    const compareBtn = app.querySelector('.mc-btn-compare');
    if (compareBtn) {
      compareBtn.addEventListener('mouseenter', () => {
        if (state.selected.length >= 2) {
          prefetchCompare(state.selected.map((p) => p.id));
        }
      });
      compareBtn.addEventListener('click', () => {
        if (state.selected.length >= 2 && !state.comparing) {
          state.error = null;
          navigateCompare(state.selected.map((p) => p.id));
        }
      });
    }

    app.querySelectorAll('.mc-slot-remove').forEach((btn) => {
      btn.addEventListener('click', () => removeProduct(parseInt(btn.dataset.id, 10)));
    });

    app.querySelectorAll('.mc-search-input').forEach((input) => {
      input.addEventListener('focus', () => {
        state.activeSlot = parseInt(input.dataset.slot, 10);
      });
      input.addEventListener('input', (e) => {
        state.activeSlot = parseInt(input.dataset.slot, 10);
        searchProducts(e.target.value);
      });
    });

    app.querySelectorAll('.mc-search-dropdown li').forEach((li) => {
      li.addEventListener('click', () => {
        addProduct({
          id: parseInt(li.dataset.id, 10),
          name: li.dataset.name,
          slug: li.dataset.slug,
          image: li.dataset.image,
          price: li.dataset.price,
          url: li.dataset.url,
        });
        state.searchQuery = '';
        state.searchResults = [];
        state.searching = false;
        state.activeSlot = null;
        render();
      });
    });

    app.querySelectorAll('.mc-add-btn:not(:disabled)').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.suggestId, 10);
        const p = state.suggested.find((x) => x.id === id);
        if (p) addProduct(p);
      });
    });

    app.querySelectorAll('.mc-popular-pair[data-slug-path]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const slugPath = link.dataset.slugPath;
        if (!slugPath) return;
        state.error = null;
        const url = (cfg.compareUrl || '/compare/').replace(/\/+$/, '') + '/' + slugPath + '/';
        history.pushState(null, '', url);
        loadCompareBySlugs(slugPath);
      });
    });

    app.querySelectorAll('.mc-back-select').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.view = 'select';
        state.loading = false;
        state.comparing = false;
        history.pushState(null, '', cfg.compareUrl || '/compare/');
        render();
        loadSelectData();
      });
    });

    app.querySelector('.mc-clear-btn')?.addEventListener('click', () => {
      state.selected = [];
      state.products = [];
      state.specs = [];
      state.view = 'select';
      state.loading = false;
      state.comparing = false;
      history.pushState(null, '', cfg.compareUrl || '/compare/');
      render();
      loadSelectData();
    });

    app.querySelector('.mc-share-btn')?.addEventListener('click', shareCompare);

    app.querySelector('.mc-toggle-diff')?.addEventListener('change', (e) => {
      state.showDiffOnly = e.target.checked;
      render();
    });

    app.querySelector('.mc-toggle-highlight')?.addEventListener('change', (e) => {
      state.highlightBetter = e.target.checked;
      render();
    });

    app.querySelectorAll('[data-remove-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.removeId, 10);
        state.selected = state.selected.filter((p) => p.id !== id);
        const remaining = state.selected.map((p) => p.id);
        navigateCompare(remaining);
      });
    });

    bindScrollSync();
  }

  /* ─── Init ─── */

  api('config').then((config) => {
    state.config = config;
    state.booting = false;
    const route = parseRoute();
    if (route.view === 'compare' && route.slugPath) {
      loadCompareBySlugs(route.slugPath);
    } else {
      state.view = 'select';
      render();
      loadSelectData();
    }
  }).catch(() => {
    state.booting = false;
    state.view = 'select';
    render();
    loadSelectData();
  });

  window.addEventListener('popstate', () => {
    const route = parseRoute();
    state.error = null;
    if (route.view === 'compare' && route.slugPath) {
      loadCompareBySlugs(route.slugPath);
    } else {
      state.view = 'select';
      state.loading = false;
      state.comparing = false;
      render();
      loadSelectData();
    }
  });
})();

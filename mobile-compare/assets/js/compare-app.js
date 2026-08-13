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
    slotProducts: [null, null, null],
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

  function syncSelectedFromSlots() {
    state.selected = state.slotProducts.filter(Boolean);
  }

  function applyCompareData(data) {
    state.products = data.products || [];
    state.specs = data.specs || [];
    const mapped = state.products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.image,
      price: p.price,
      url: p.url,
    }));
    state.slotProducts = [null, null, null];
    mapped.forEach((p, i) => {
      if (i < MAX) state.slotProducts[i] = p;
    });
    state.selected = mapped;
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
      buy_url: p.amazon_url || p.url || '#',
      amazon_url: p.amazon_url || '',
      amazon_button_text: p.amazon_button_text || '',
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

  function addProduct(product, slotIndex) {
    if (state.slotProducts.some((p) => p && p.id === product.id)) return;
    const idx = typeof slotIndex === 'number' ? slotIndex : state.slotProducts.findIndex((p) => !p);
    if (idx < 0 || idx >= MAX) return;
    state.slotProducts[idx] = product;
    syncSelectedFromSlots();
    loadSelectData();
    render();
    if (state.selected.length >= 2) {
      prefetchCompare(state.selected.map((p) => p.id));
    }
  }

  function removeProduct(id) {
    state.slotProducts = state.slotProducts.map((p) => (p && p.id === id ? null : p));
    syncSelectedFromSlots();
    loadSelectData();
    render();
  }

  function slotPickerItems() {
    const exclude = new Set(state.slotProducts.filter(Boolean).map((p) => p.id));
    if (state.searchQuery && state.searchQuery.length >= 2) {
      return state.searchResults.filter((p) => !exclude.has(p.id));
    }
    return state.suggested.filter((p) => !exclude.has(p.id));
  }

  function activateSlot(index) {
    state.activeSlot = index;
    state.searchQuery = '';
    state.searchResults = [];
    state.searching = false;
    if (!state.suggested.length) {
      api('suggested', { exclude: idsParam() }).then((d) => {
        state.suggested = d.items || [];
        render();
      });
    } else {
      render();
    }
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

  function renderSlotDropdown() {
    if (state.searching) {
      return `<div class="mc-search-status">${renderSpinner()} ${escapeHtml(t('loadingSearch'))}</div>`;
    }
    const items = slotPickerItems();
    if (!items.length) return '';
    return `
      <ul class="mc-search-dropdown">
        ${items.map((p) => `
          <li data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-slug="${escapeHtml(p.slug)}" data-image="${escapeHtml(p.image)}" data-price="${escapeHtml(p.price)}" data-url="${escapeHtml(p.url)}" data-amazon-url="${escapeHtml(p.amazon_url || '')}" data-amazon-button-text="${escapeHtml(p.amazon_button_text || '')}" data-slot="${state.activeSlot}">
            <img src="${escapeHtml(p.image)}" alt="" /> ${escapeHtml(p.name)}
          </li>`).join('')}
      </ul>`;
  }

  function renderSelectSlot(index) {
    const item = state.slotProducts[index];
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
      <div class="mc-slot-card mc-slot-empty ${isActive ? 'mc-slot-active' : ''}" data-index="${index}">
        <button type="button" class="mc-slot-open" data-slot="${index}">
          <span class="mc-slot-placeholder">+</span>
          <span class="mc-slot-open-label">${escapeHtml(t('selectProduct'))}</span>
        </button>
        <div class="mc-slot-picker ${isActive ? 'mc-slot-picker-open' : ''}">
          <input type="text" class="mc-search-input" placeholder="${escapeHtml(t('searchOrPick'))}" data-slot="${index}" value="${isActive ? escapeHtml(state.searchQuery) : ''}" autocomplete="off" />
          ${isActive ? renderSlotDropdown() : ''}
        </div>
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

  function formatPrice(price, plain) {
    const raw = plain || price;
    if (!raw || raw === '0') return '—';
    if (plain) return String(plain).trim();
    const d = document.createElement('div');
    d.innerHTML = String(price);
    const text = d.textContent.replace(/\s+/g, ' ').trim();
    return text || '—';
  }

  function compareTitle(products) {
    return products.map((p) => p.name).join(' vs ');
  }

  function renderHeroPhone(p, skeleton) {
    if (skeleton && !p.image) {
      return `
        <div class="mc-hero-phone mc-hero-skeleton">
          <div class="mc-skeleton mc-skeleton-hero-img"></div>
          <div class="mc-skeleton mc-skeleton-text"></div>
        </div>`;
    }
    const price = formatPrice(p.price, p.price_plain);
    const buyUrl = p.amazon_url || p.buy_url || '';
    const buyLabel = p.amazon_button_text || t('buyNow');
    return `
      <div class="mc-hero-phone">
        <button type="button" class="mc-hero-close" data-remove-id="${p.id}" aria-label="Remove">×</button>
        <a href="${escapeHtml(p.url)}" class="mc-hero-img-link">
          <img src="${escapeHtml(p.image)}" alt="" class="mc-hero-img" />
        </a>
        <h2 class="mc-hero-name">${escapeHtml(p.name)}</h2>
        <p class="mc-hero-price">${escapeHtml(price)}</p>
        ${!skeleton && buyUrl ? `<a href="${escapeHtml(buyUrl)}" class="mc-hero-buy-btn" target="_blank" rel="nofollow sponsored noopener">${escapeHtml(buyLabel)}</a>` : ''}
        ${!skeleton && p.url ? `<a href="${escapeHtml(p.url)}" class="mc-hero-store-link">${escapeHtml(t('viewDetails'))} ›</a>` : ''}
      </div>`;
  }

  function renderHeroAddSlot() {
    return `
      <div class="mc-hero-phone mc-hero-add">
        <button type="button" class="mc-btn-add-compare mc-back-select">
          <span class="mc-btn-add-icon">+</span>
          ${escapeHtml(t('addToCompare'))}
        </button>
      </div>`;
  }

  function renderStickyMini(products, emptySlots, skeleton) {
    const cells = products.map((p) => {
      if (skeleton && !p.image) {
        return `<div class="mc-mini-cell"><div class="mc-skeleton mc-skeleton-mini-img"></div></div>`;
      }
      return `
        <div class="mc-mini-cell">
          <img src="${escapeHtml(p.image)}" alt="" class="mc-mini-img" />
          <span class="mc-mini-name">${escapeHtml(p.name)}</span>
        </div>`;
    }).join('');
    const empty = Array(emptySlots).fill('<div class="mc-mini-cell mc-mini-empty"></div>').join('');
    return `
      <div class="mc-sticky-mini" aria-hidden="true">
        <div class="mc-mini-label"></div>
        ${cells}${empty}
      </div>`;
  }

  function renderToolbarBar(skeleton) {
    return `
      <div class="mc-filter-bar">
        <div class="mc-filter-bar-inner">
          <label class="mc-toggle mc-toggle-compact">
            <input type="checkbox" class="mc-toggle-diff" ${state.showDiffOnly ? 'checked' : ''} ${skeleton ? 'disabled' : ''} />
            <span>${escapeHtml(t('showDifferences'))}</span>
          </label>
          <label class="mc-toggle mc-toggle-compact">
            <input type="checkbox" class="mc-toggle-highlight" ${state.highlightBetter ? 'checked' : ''} ${skeleton ? 'disabled' : ''} />
            <span>${escapeHtml(t('highlightBetter'))}</span>
          </label>
          ${skeleton ? `<span class="mc-loading-inline">${renderSpinner()}</span>` : ''}
        </div>
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

  function renderBuyRow(products, emptySlots) {
    const hasAny = products.some((p) => p.amazon_url || p.buy_url);
    if (!hasAny) return '';

    return `
      <tr class="mc-spec-row mc-buy-row">
        <th class="mc-spec-label">${escapeHtml(t('buyNow'))}</th>
        ${products.map((p) => {
          const url = p.amazon_url || p.buy_url || '';
          const label = p.amazon_button_text || t('buyNow');
          return `<td class="mc-spec-val mc-phone-col">${url ? `<a href="${escapeHtml(url)}" class="mc-hero-buy-btn" target="_blank" rel="nofollow sponsored noopener">${escapeHtml(label)}</a>` : '—'}</td>`;
        }).join('')}
        ${Array(emptySlots).fill('<td class="mc-spec-val mc-phone-col">-</td>').join('')}
      </tr>`;
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

    const phoneHeaders = products.map((p) => renderHeroPhone(p, skeleton)).join('');
    const addCol = !skeleton && emptySlots > 0 ? renderHeroAddSlot() : '';
    const specRows = renderSpecRows(specs, emptySlots, skeleton);
    const buyRow = skeleton ? '' : renderBuyRow(products, emptySlots);
    const colCount = products.length + (addCol ? 1 : 0);
    const title = compareTitle(products);

    return `
      <div class="mc-page mc-compare" data-cols="${colCount}" style="--mc-cols:${colCount}">
        <header class="mc-compare-top">
          <div class="mc-compare-top-left">
            <nav class="mc-breadcrumb"><a href="${escapeHtml(cfg.homeUrl || '/')}">Home</a> › Compare</nav>
            <h1 class="mc-compare-title">${escapeHtml(title)}</h1>
          </div>
          <div class="mc-compare-top-actions">
            <button type="button" class="mc-link-btn mc-share-btn" ${skeleton ? 'disabled' : ''}>
              ${escapeHtml(t('share'))} <span aria-hidden="true">⎘</span>
            </button>
            <button type="button" class="mc-link-btn mc-clear-btn" ${skeleton ? 'disabled' : ''}>${escapeHtml(t('clearAll'))}</button>
            <button type="button" class="mc-link-btn mc-back-select">← ${escapeHtml(t('backToSelection'))}</button>
          </div>
        </header>

        <div class="mc-compare-hero" data-mc-hero>
          <div class="mc-hero-grid" style="--mc-cols: ${colCount}">
            ${phoneHeaders}
            ${addCol}
          </div>
        </div>

        ${renderStickyMini(products, emptySlots, skeleton)}

        ${renderToolbarBar(skeleton)}

        <div class="mc-compare-table-wrap">
          <table class="mc-compare-table" style="--mc-cols: ${colCount}">
            <colgroup>
              <col class="mc-col-label" />
              ${Array(colCount).fill('<col class="mc-col-phone" />').join('')}
            </colgroup>
            <tbody>${buyRow}${specRows}</tbody>
          </table>
        </div>
      </div>
      ${state.toast ? `<div class="mc-toast" role="status">${escapeHtml(state.toast)}</div>` : ''}`;
  }

  function bindStickyMini() {
    const hero = app.querySelector('[data-mc-hero]');
    const mini = app.querySelector('.mc-sticky-mini');
    if (!hero || !mini) return;

    if (state._stickyObserver) {
      state._stickyObserver.disconnect();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = !entry.isIntersecting;
        mini.classList.toggle('mc-is-visible', visible);
        mini.setAttribute('aria-hidden', visible ? 'false' : 'true');
      },
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );
    observer.observe(hero);
    state._stickyObserver = observer;
  }

  function render() {
    if (state.booting) {
      app.innerHTML = renderBootView();
      return;
    }

    if (state.view === 'compare' && (state.products.length || state.loading)) {
      app.innerHTML = renderCompareView();
      bindStickyMini();
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

    app.querySelectorAll('.mc-slot-open').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        activateSlot(parseInt(btn.dataset.slot, 10));
        setTimeout(() => {
          const input = app.querySelector(`.mc-search-input[data-slot="${btn.dataset.slot}"]`);
          input?.focus();
        }, 0);
      });
    });

    app.querySelectorAll('.mc-search-input').forEach((input) => {
      input.addEventListener('focus', () => {
        const slot = parseInt(input.dataset.slot, 10);
        if (state.activeSlot !== slot) activateSlot(slot);
      });
      input.addEventListener('input', (e) => {
        state.activeSlot = parseInt(input.dataset.slot, 10);
        searchProducts(e.target.value);
      });
    });

    app.querySelectorAll('.mc-search-dropdown li').forEach((li) => {
      li.addEventListener('click', (e) => {
        e.stopPropagation();
        const slot = li.dataset.slot != null ? parseInt(li.dataset.slot, 10) : state.activeSlot;
        addProduct({
          id: parseInt(li.dataset.id, 10),
          name: li.dataset.name,
          slug: li.dataset.slug,
          image: li.dataset.image,
          price: li.dataset.price,
          url: li.dataset.url,
          amazon_url: li.dataset.amazonUrl || '',
          amazon_button_text: li.dataset.amazonButtonText || '',
        }, slot);
        state.searchQuery = '';
        state.searchResults = [];
        state.searching = false;
        state.activeSlot = null;
        render();
      });
    });

    if (!state._outsideClick) {
      state._outsideClick = true;
      document.addEventListener('click', (e) => {
        if (state.view !== 'select' || state.activeSlot === null) return;
        if (e.target.closest('.mc-slot-empty') || e.target.closest('.mc-search-dropdown')) return;
        state.activeSlot = null;
        render();
      });
    }

    app.querySelectorAll('.mc-add-btn:not(:disabled)').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.suggestId, 10);
        const p = state.suggested.find((x) => x.id === id);
        if (p) {
          const slot = state.slotProducts.findIndex((s) => !s);
          if (slot >= 0) addProduct(p, slot);
        }
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
      state.slotProducts = [null, null, null];
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
        removeProduct(id);
        const remaining = state.selected.map((p) => p.id);
        navigateCompare(remaining);
      });
    });
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

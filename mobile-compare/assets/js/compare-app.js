/**
 * Mobile Compare SPA — 91mobiles-style WooCommerce compare.
 */
(function () {
  'use strict';

  const cfg = window.mobileCompareConfig || {};
  const REST = cfg.restUrl || '';
  const MAX = 3;
  const SEARCH_DEBOUNCE_MS = 200;
  const SKELETON_SPEC_ROWS = 6;

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
    searchedQuery: '',
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
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    return fetch(url.toString(), {
      headers: { 'X-WP-Nonce': cfg.restNonce || '' },
      signal: controller.signal,
    }).then((r) => {
      if (!r.ok) throw new Error('API error');
      return r.json();
    }).finally(() => clearTimeout(timer));
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
      price_plain: p.price_plain || '',
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
      price: p.price || '',
      price_plain: p.price_plain || '',
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
    const q = (state.searchQuery || '').trim().toLowerCase();

    if (q.length >= 2 && state.searchResults.length && (state.searching || state.searchedQuery === q)) {
      return state.searchResults.filter((p) => !exclude.has(p.id));
    }

    const base = state.suggested.filter((p) => !exclude.has(p.id));
    if (!q) return base;
    return base.filter((p) => p.name.toLowerCase().includes(q));
  }

  function renderDropdownListHtml() {
    const items = slotPickerItems();
    let html = '';

    if (items.length) {
      html += `
        <ul class="mc-search-dropdown">
          ${items.map((p) => renderDropdownItem(p)).join('')}
        </ul>`;
    } else if (state.searchQuery.trim().length >= 2 && !state.searching && state.searchedQuery === state.searchQuery.trim()) {
      html += `<div class="mc-search-empty">${escapeHtml(t('noResults'))}</div>`;
    }

    if (state.searching) {
      html += `<div class="mc-search-status mc-search-status-inline">${renderSpinner('fast')}</div>`;
    }

    return html;
  }

  function decodeEntities(str) {
    if (!str) return '';
    const d = document.createElement('textarea');
    d.innerHTML = String(str);
    return d.value.replace(/\s+/g, ' ').trim();
  }

  function formatDisplayPrice(product) {
    const plain = (product.price_plain || '').trim();
    if (plain && plain !== '0') {
      return decodeEntities(plain);
    }
    if (product.price) {
      const el = document.createElement('div');
      el.innerHTML = String(product.price);
      const text = el.textContent.replace(/\s+/g, ' ').trim();
      if (text && text !== '0') return text;
    }
    return '';
  }

  function renderDropdownItem(p) {
    const price = formatDisplayPrice(p);
    return `
      <li data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-slug="${escapeHtml(p.slug)}" data-image="${escapeHtml(p.image)}" data-price="${escapeHtml(p.price || '')}" data-price-plain="${escapeHtml(p.price_plain || '')}" data-url="${escapeHtml(p.url)}" data-slot="${state.activeSlot}">
        <img src="${escapeHtml(p.image)}" alt="" />
        <div class="mc-dd-body">
          <span class="mc-dd-name">${escapeHtml(p.name)}</span>
          ${price ? `<span class="mc-dd-meta">${escapeHtml(price)}</span>` : ''}
        </div>
      </li>`;
  }

  function updateSlotDropdown() {
    const dropdown = app.querySelector('.mc-slot-dropdown');
    if (!dropdown) return;
    dropdown.innerHTML = renderDropdownListHtml();
    bindDropdownItems(dropdown);
  }

  function bindDropdownItems(root) {
    root.querySelectorAll('.mc-search-dropdown li').forEach((li) => {
      li.addEventListener('mousedown', (e) => e.preventDefault());
      li.addEventListener('click', (e) => {
        e.stopPropagation();
        const slot = li.dataset.slot != null ? parseInt(li.dataset.slot, 10) : state.activeSlot;
        addProduct({
          id: parseInt(li.dataset.id, 10),
          name: li.dataset.name,
          slug: li.dataset.slug,
          image: li.dataset.image,
          price: li.dataset.price,
          price_plain: li.dataset.pricePlain || '',
          url: li.dataset.url,
        }, slot);
        state.searchQuery = '';
        state.searchResults = [];
        state.searchedQuery = '';
        state.searching = false;
        state.activeSlot = null;
        render();
      });
    });
  }

  function activateSlot(index) {
    state.activeSlot = index;
    state.searchQuery = '';
    state.searchResults = [];
    state.searchedQuery = '';
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
      state.searchedQuery = '';
      updateSlotDropdown();
      return;
    }

    updateSlotDropdown();

    searchTimer = setTimeout(() => {
      const query = q.trim();
      state.searching = true;
      updateSlotDropdown();
      api('search', { q: query, limit: 10 })
        .then((d) => {
          if (state.searchQuery.trim() !== query) return;
          state.searchResults = d.items || [];
          state.searchedQuery = query;
          state.searching = false;
          updateSlotDropdown();
        })
        .catch(() => {
          if (state.searchQuery.trim() !== query) return;
          state.searchResults = [];
          state.searchedQuery = query;
          state.searching = false;
          updateSlotDropdown();
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

  function renderSpinner(fast) {
    return `<span class="mc-spinner${fast ? ' mc-spinner-fast' : ''}" aria-hidden="true"></span>`;
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
    return renderDropdownListHtml();
  }

  function renderSelectSlot(index) {
    const item = state.slotProducts[index];
    if (item) {
      return `
        <div class="mc-slot-wrap" data-slot="${index}">
          <div class="mc-slot-91 mc-slot-filled" data-index="${index}">
            <img src="${escapeHtml(item.image)}" alt="" class="mc-slot-91-img" />
            <span class="mc-slot-91-name">${escapeHtml(item.name)}</span>
            <button type="button" class="mc-slot-91-remove" data-id="${item.id}" aria-label="Remove">×</button>
          </div>
        </div>`;
    }

    const isActive = state.activeSlot === index;
    if (isActive) {
      return `
        <div class="mc-slot-wrap is-open" data-slot="${index}">
          <div class="mc-slot-91 mc-slot-picker">
            <input type="text" class="mc-picker-search" placeholder="${escapeHtml(t('searchOrPick'))}" value="${escapeHtml(state.searchQuery)}" autocomplete="off" />
          </div>
          <div class="mc-slot-dropdown">${renderSlotDropdown()}</div>
        </div>`;
    }

    return `
      <div class="mc-slot-wrap" data-slot="${index}">
        <button type="button" class="mc-slot-91 mc-slot-empty" data-slot="${index}">
          ${escapeHtml(t('selectProduct'))}
        </button>
      </div>`;
  }

  function renderSelectView() {
    const canCompare = state.selected.length >= 2;
    return `
      <div class="mc-page mc-select">
        ${state.error ? `<div class="mc-alert mc-alert-error" role="alert">${escapeHtml(state.error)}</div>` : ''}

        <header class="mc-header mc-header-91">
          <h1 class="mc-title">${escapeHtml(t('title'))}</h1>
        </header>

        <section class="mc-select-section mc-select-91">
          <p class="mc-section-label">${escapeHtml(t('selectLabel'))}</p>
          <div class="mc-slots-91">
            ${renderSelectSlot(0)}
            <span class="mc-vs-pill">vs</span>
            ${renderSelectSlot(1)}
            <span class="mc-vs-pill">vs</span>
            ${renderSelectSlot(2)}
          </div>
          <button type="button" class="mc-btn-compare-91 ${canCompare ? 'is-ready' : ''} ${state.comparing ? 'mc-btn-loading' : ''}" ${canCompare && !state.comparing ? '' : 'disabled'}>
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
        <section class="mc-section mc-section-91">
          <h2 class="mc-section-title">${escapeHtml(t('suggestedTitle'))}</h2>
          <div class="mc-suggest-91">
            ${state.suggested.map((p) => {
              const added = state.selected.some((s) => s.id === p.id);
              return `
              <article class="mc-suggest-item">
                <img src="${escapeHtml(p.image)}" alt="" />
                <div class="mc-suggest-body">
                  <h3>${escapeHtml(p.name)}</h3>
                  <button type="button" class="mc-suggest-add ${added ? 'is-added' : ''}" data-suggest-id="${p.id}" ${added ? 'disabled' : ''}>
                    ${added ? escapeHtml(t('addedToCompare')) : '+ ' + escapeHtml(t('addToCompare'))}
                  </button>
                </div>
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
        <section class="mc-section mc-section-91">
          <h2 class="mc-section-title">${escapeHtml(t('popularTitle'))}</h2>
          <div class="mc-popular-91">
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
    const text = formatDisplayPrice({ price, price_plain: plain });
    return text;
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
    return `
      <div class="mc-hero-phone">
        <button type="button" class="mc-hero-close" data-remove-id="${p.id}" aria-label="Remove">×</button>
        <a href="${escapeHtml(p.url)}" class="mc-hero-img-link">
          <img src="${escapeHtml(p.image)}" alt="" class="mc-hero-img" />
        </a>
        <h2 class="mc-hero-name">${escapeHtml(p.name)}</h2>
        ${price ? `<p class="mc-hero-price">${escapeHtml(price)}</p>` : ''}
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

  function renderCompareView() {
    const specsLoading = state.loading && !state.specs.length;
    const products = specsLoading && !state.products.length
      ? Array(Math.min(state.selected.length || 2, MAX)).fill(null).map((_, i) => ({
          id: i,
          name: '…',
          image: '',
          price: '—',
          url: '#',
        }))
      : state.products;
    const specs = specsLoading ? [] : filteredSpecs();
    const emptySlots = MAX - products.length;

    const phoneHeaders = products.map((p) => renderHeroPhone(p, specsLoading && !p.image)).join('');
    const addCol = !specsLoading && emptySlots > 0 ? renderHeroAddSlot() : '';
    const specRows = renderSpecRows(specs, emptySlots, specsLoading);
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
            <button type="button" class="mc-link-btn mc-clear-btn" ${specsLoading ? 'disabled' : ''}>${escapeHtml(t('clearAll'))}</button>
            <button type="button" class="mc-link-btn mc-back-select">← ${escapeHtml(t('backToSelection'))}</button>
          </div>
        </header>

        <div class="mc-compare-sync" data-mc-hscroll>
          <div class="mc-compare-sync-inner">
            <div class="mc-compare-sticky-anchor" data-mc-sticky-anchor aria-hidden="true"></div>
            <div class="mc-compare-sticky" data-mc-sticky>
              <div class="mc-compare-hero">
                <div class="mc-hero-grid">
                  <div class="mc-hero-label-spacer" aria-hidden="true"></div>
                  ${phoneHeaders}
                  ${addCol}
                </div>
              </div>
              ${renderToolbarBar(specsLoading)}
            </div>
            <div class="mc-compare-sticky-spacer" data-mc-sticky-spacer aria-hidden="true"></div>

            <div class="mc-compare-table-wrap">
              <table class="mc-compare-table" style="--mc-cols: ${colCount}">
                <colgroup>
                  <col class="mc-col-label" />
                  ${Array(colCount).fill('<col class="mc-col-phone" />').join('')}
                </colgroup>
                <tbody>${specRows}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      ${state.toast ? `<div class="mc-toast" role="status">${escapeHtml(state.toast)}</div>` : ''}`;
  }

  function bindHeroSticky() {
    const sticky = app.querySelector('[data-mc-sticky]');
    const anchor = app.querySelector('[data-mc-sticky-anchor]');
    const spacer = app.querySelector('[data-mc-sticky-spacer]');
    const page = app.querySelector('.mc-page.mc-compare');
    if (!sticky || !anchor || !page) return;

    if (state._stickyObserver) {
      state._stickyObserver.disconnect();
      state._stickyObserver = null;
    }
    if (state._onStickyResize) {
      window.removeEventListener('resize', state._onStickyResize);
    }
    if (state._onStickyScroll) {
      window.removeEventListener('scroll', state._onStickyScroll);
    }

    const getStickyTop = () => {
      const adminBar = document.getElementById('wpadminbar');
      return adminBar ? adminBar.offsetHeight : 0;
    };

    const syncPinnedLayout = () => {
      const top = getStickyTop();
      document.documentElement.style.setProperty('--mc-sticky-top', `${top}px`);

      if (!sticky.classList.contains('is-pinned')) {
        sticky.style.left = '';
        sticky.style.width = '';
        return;
      }

      if (window.innerWidth < 768) {
        sticky.style.left = '0';
        sticky.style.width = '100%';
        return;
      }

      const rect = page.getBoundingClientRect();
      sticky.style.left = `${rect.left}px`;
      sticky.style.width = `${rect.width}px`;
    };

    const setPinned = (pinned) => {
      const isMobile = window.innerWidth < 768;

      /* Mobile: CSS sticky inside single h-scroll — no fixed pin */
      if (isMobile) {
        sticky.classList.remove('is-pinned', 'is-pinned-mobile');
        if (spacer) spacer.style.height = '0px';
        sticky.style.left = '';
        sticky.style.width = '';
        return;
      }

      sticky.classList.toggle('is-pinned', pinned);
      sticky.classList.remove('is-pinned-mobile');

      if (spacer) {
        requestAnimationFrame(() => {
          spacer.style.height = pinned ? `${sticky.offsetHeight}px` : '0px';
        });
      }

      if (pinned) {
        const rect = page.getBoundingClientRect();
        sticky.style.left = `${rect.left}px`;
        sticky.style.width = `${rect.width}px`;
      } else {
        sticky.style.left = '';
        sticky.style.width = '';
      }
    };

    const setupObserver = () => {
      if (state._stickyObserver) {
        state._stickyObserver.disconnect();
      }
      state._stickyObserver = new IntersectionObserver(
        ([entry]) => setPinned(!entry.isIntersecting),
        {
          root: null,
          rootMargin: `-${getStickyTop()}px 0px 0px 0px`,
          threshold: 0,
        }
      );
      state._stickyObserver.observe(anchor);
    };

    const applyStickyOffset = () => {
      syncPinnedLayout();
      if (spacer && sticky.classList.contains('is-pinned')) {
        spacer.style.height = `${sticky.offsetHeight}px`;
      }
      setupObserver();
    };

    state._onStickyResize = applyStickyOffset;
    state._onStickyScroll = syncPinnedLayout;
    applyStickyOffset();
    window.addEventListener('resize', applyStickyOffset, { passive: true });
    window.addEventListener('scroll', syncPinnedLayout, { passive: true });
  }

  function bindMobileScrollSync() {
    if (state._mobileScrollCleanup) {
      state._mobileScrollCleanup();
      state._mobileScrollCleanup = null;
    }
    /* Mobile horizontal scroll is handled by .mc-compare-sync CSS wrapper */
  }

  function render() {
    if (state.booting) {
      app.innerHTML = renderBootView();
      return;
    }

    if (state.view === 'compare' && (state.products.length || state.loading)) {
      app.innerHTML = renderCompareView();
      bindHeroSticky();
      bindMobileScrollSync();
    } else {
      app.innerHTML = renderSelectView();
    }
    bindEvents();
  }

  function bindEvents() {
    const compareBtn = app.querySelector('.mc-btn-compare-91');
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

    app.querySelectorAll('.mc-slot-91-remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeProduct(parseInt(btn.dataset.id, 10));
      });
    });

    app.querySelectorAll('.mc-slot-91.mc-slot-empty').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        activateSlot(parseInt(btn.dataset.slot, 10));
        requestAnimationFrame(() => {
          const input = app.querySelector('.mc-slot-wrap.is-open .mc-picker-search');
          if (input) {
            input.focus();
            const len = input.value.length;
            input.setSelectionRange(len, len);
          }
        });
      });
    });

    const pickerSearch = app.querySelector('.mc-picker-search');
    if (pickerSearch) {
      pickerSearch.addEventListener('input', (e) => searchProducts(e.target.value));
    }

    const dropdown = app.querySelector('.mc-slot-dropdown');
    if (dropdown) bindDropdownItems(dropdown);

    if (!state._outsideClick) {
      state._outsideClick = true;
      document.addEventListener('click', (e) => {
        if (state.view !== 'select' || state.activeSlot === null) return;
        if (e.target.closest('.mc-slot-wrap.is-open') || e.target.closest('.mc-slot-91.mc-slot-empty')) return;
        state.activeSlot = null;
        render();
      });
    }

    app.querySelectorAll('.mc-suggest-add:not(:disabled)').forEach((btn) => {
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

/**
 * Mobile Compare SPA — 91mobiles-style WooCommerce compare.
 */
(function () {
  'use strict';

  const cfg = window.mobileCompareConfig || {};
  const REST = cfg.restUrl || '';
  const MAX = 3;

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
  };

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

  function navigateCompare(ids) {
    const url = ids.length
      ? buildSlugUrl(ids)
      : (cfg.compareUrl || '/compare/');
    if (window.location.pathname + window.location.search !== url.replace(location.origin, '')) {
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

  function loadCompareByIds(ids) {
    if (!ids.length) {
      state.view = 'select';
      state.products = [];
      state.specs = [];
      render();
      loadSelectData();
      return;
    }
    state.loading = true;
    state.view = 'compare';
    render();
    api('products', { ids: ids.join(',') })
      .then((data) => {
        state.products = data.products || [];
        state.specs = data.specs || [];
        state.selected = state.products.map((p) => ({ id: p.id, name: p.name, slug: p.slug, image: p.image, price: p.price, url: p.url }));
        state.loading = false;
        render();
      })
      .catch(() => {
        state.loading = false;
        state.view = 'select';
        render();
      });
  }

  function loadCompareBySlugs(slugPath) {
    state.loading = true;
    state.view = 'compare';
    render();
    api('products-by-slugs', { path: slugPath })
      .then((data) => {
        state.products = data.products || [];
        state.specs = data.specs || [];
        state.selected = state.products.map((p) => ({ id: p.id, name: p.name, slug: p.slug, image: p.image, price: p.price, url: p.url }));
        state.loading = false;
        render();
      })
      .catch(() => {
        state.loading = false;
        state.view = 'select';
        render();
        loadSelectData();
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
  }

  function removeProduct(id) {
    state.selected = state.selected.filter((p) => p.id !== id);
    loadSelectData();
    render();
  }

  function searchProducts(q) {
    state.searchQuery = q;
    if (!q || q.length < 2) {
      state.searchResults = [];
      render();
      return;
    }
    api('search', { q, limit: 10 }).then((d) => {
      state.searchResults = d.items || [];
      render();
    });
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

  function shareCompare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: t('title'), url });
    } else {
      navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
    }
  }

  /* ─── Render helpers ─── */

  function renderSelectSlot(index) {
    const item = state.selected[index];
    if (item) {
      return `
        <div class="mc-slot mc-slot-filled" data-index="${index}">
          <img src="${escapeHtml(item.image)}" alt="" class="mc-slot-img" />
          <span class="mc-slot-name">${escapeHtml(item.name)}</span>
          <button type="button" class="mc-slot-remove" data-id="${item.id}" aria-label="Remove">×</button>
        </div>`;
    }
    return `
      <div class="mc-slot mc-slot-empty" data-index="${index}">
        <input type="text" class="mc-search-input" placeholder="${escapeHtml(t('selectProduct'))}" data-slot="${index}" value="${state.activeSlot === index ? escapeHtml(state.searchQuery) : ''}" />
        ${state.activeSlot === index && state.searchResults.length ? `
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
        <header class="mc-header">
          <h1 class="mc-title">${escapeHtml(t('title'))}</h1>
        </header>

        <section class="mc-select-section">
          <h2 class="mc-section-label">Select Mobiles to Compare</h2>
          <div class="mc-slots-row">
            ${renderSelectSlot(0)}
            <span class="mc-vs-badge">vs</span>
            ${renderSelectSlot(1)}
            <span class="mc-vs-badge">vs</span>
            ${renderSelectSlot(2)}
          </div>
          <button type="button" class="mc-btn mc-btn-primary mc-btn-compare ${canCompare ? '' : 'mc-disabled'}" ${canCompare ? '' : 'disabled'}>
            ${escapeHtml(t('compareNow'))}
          </button>
        </section>

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

        ${state.popular.length ? `
        <section class="mc-section">
          <h2>${escapeHtml(t('popularTitle'))}</h2>
          <div class="mc-popular-grid">
            ${state.popular.map((pair) => {
              const a = pair.products[0];
              const b = pair.products[1];
              return `
              <a href="${escapeHtml(pair.url)}" class="mc-popular-pair">
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
      </div>`;
  }

  function renderCompareView() {
    const cols = MAX;
    const products = state.products;
    const specs = filteredSpecs();
    const emptySlots = cols - products.length;

    const productCards = products.map((p, i) => `
      <article class="mc-compare-card">
        <span class="mc-card-badge">${i + 1}</span>
        <button type="button" class="mc-card-close" data-remove-id="${p.id}" aria-label="Remove">×</button>
        <img src="${escapeHtml(p.image)}" alt="" class="mc-compare-img" />
        <h3>${escapeHtml(p.name)}</h3>
        <p class="mc-price">${escapeHtml(t('startingAt'))} ${p.price}</p>
        <a href="${escapeHtml(p.url)}" class="mc-btn mc-btn-outline">${escapeHtml(t('viewDetails'))}</a>
        <a href="${escapeHtml(p.buy_url || p.url)}" class="mc-btn mc-btn-buy">${escapeHtml(t('buyNow'))}</a>
      </article>`).join('');

    const addCard = emptySlots > 0 ? `
      <article class="mc-compare-card mc-compare-add">
        <div class="mc-add-icon">+</div>
        <button type="button" class="mc-btn mc-btn-outline mc-back-select">${escapeHtml(t('addPhone'))}</button>
      </article>` : '';

    const specRows = specs.map((row) => {
      const winners = state.highlightBetter ? getWinners(row) : row.values.map(() => false);
      return `
        <tr class="mc-spec-row">
          <th class="mc-spec-label">
            <span class="mc-spec-icon mc-icon-${escapeHtml(row.icon || 'default')}"></span>
            ${escapeHtml(row.label)}
          </th>
          ${row.values.map((val, idx) => `
            <td class="mc-spec-val ${winners[idx] ? 'mc-better' : ''}">${escapeHtml(String(val))}</td>`).join('')}
          ${Array(emptySlots).fill('<td class="mc-spec-val">-</td>').join('')}
        </tr>`;
    }).join('');

    return `
      <div class="mc-page mc-compare">
        <header class="mc-header mc-header-compare">
          <nav class="mc-breadcrumb"><a href="${escapeHtml(cfg.homeUrl || '/')}">Home</a> &gt; Compare</nav>
          <div class="mc-header-row">
            <div>
              <h1 class="mc-title">${escapeHtml(t('title'))}</h1>
              <p class="mc-subtitle">${escapeHtml(t('subtitle'))}</p>
            </div>
            <div class="mc-header-actions">
              <button type="button" class="mc-btn mc-btn-ghost mc-share-btn">${escapeHtml(t('share'))}</button>
              <button type="button" class="mc-btn mc-btn-ghost mc-clear-btn">${escapeHtml(t('clearAll'))}</button>
            </div>
          </div>
        </header>

        <aside class="mc-sidebar">
          <label class="mc-toggle">
            <input type="checkbox" class="mc-toggle-diff" ${state.showDiffOnly ? 'checked' : ''} />
            <span>${escapeHtml(t('showDifferences'))}</span>
          </label>
          <label class="mc-toggle">
            <input type="checkbox" class="mc-toggle-highlight" ${state.highlightBetter ? 'checked' : ''} />
            <span>${escapeHtml(t('highlightBetter'))}</span>
          </label>
        </aside>

        <div class="mc-compare-cards">
          ${productCards}${addCard}
        </div>

        <div class="mc-table-wrap">
          <table class="mc-spec-table">
            <tbody>${specRows}</tbody>
          </table>
        </div>

        <footer class="mc-footer-actions">
          <button type="button" class="mc-btn mc-btn-ghost mc-back-select">← ${escapeHtml(t('backToSelection'))}</button>
          ${emptySlots > 0 ? `<button type="button" class="mc-btn mc-btn-primary mc-back-select">+ ${escapeHtml(t('addAnotherPhone'))}</button>` : ''}
        </footer>
      </div>`;
  }

  function render() {
    if (state.loading) {
      app.innerHTML = '<div class="mc-loading">Loading compare data…</div>';
      return;
    }

    if (state.view === 'compare' && state.products.length) {
      app.innerHTML = renderCompareView();
    } else {
      app.innerHTML = renderSelectView();
    }
    bindEvents();
  }

  function bindEvents() {
    app.querySelector('.mc-btn-compare')?.addEventListener('click', () => {
      if (state.selected.length >= 2) {
        navigateCompare(state.selected.map((p) => p.id));
      }
    });

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

    app.querySelectorAll('.mc-back-select').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.view = 'select';
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
        const remaining = state.selected.filter((p) => p.id !== id).map((p) => p.id);
        state.selected = state.selected.filter((p) => p.id !== id);
        if (remaining.length >= 1) {
          navigateCompare(remaining);
        } else {
          state.view = 'select';
          state.products = [];
          history.pushState(null, '', cfg.compareUrl || '/compare/');
          render();
          loadSelectData();
        }
      });
    });
  }

  /* ─── Init ─── */

  api('config').then((config) => {
    state.config = config;
    const route = parseRoute();
    if (route.view === 'compare' && route.slugPath) {
      loadCompareBySlugs(route.slugPath);
    } else {
      state.view = 'select';
      render();
      loadSelectData();
    }
  }).catch(() => {
    state.view = 'select';
    render();
    loadSelectData();
  });

  window.addEventListener('popstate', () => {
    const route = parseRoute();
    if (route.view === 'compare' && route.slugPath) {
      loadCompareBySlugs(route.slugPath);
    } else {
      state.view = 'select';
      render();
      loadSelectData();
    }
  });
})();

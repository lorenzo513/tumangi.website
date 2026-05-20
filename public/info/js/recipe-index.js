(async function () {
  const dataUrl = '../data/recipes.json'; // percorso relativo da info/ricette/index.html verso public/data

  // Elementi DOM
  const listEl = document.getElementById('recipes-list');
  const searchInput = document.getElementById('search-input');
  const tagFilter = document.getElementById('tag-filter');
  const clearFilters = document.getElementById('clear-filters');
  const noResults = document.getElementById('no-results');

  let allRecipes = [];
  let allTags = new Set();

  function normalize(str) {
    return (str || '').toString().toLowerCase();
  }

  function buildCard(recipe) {
    // Usa root-relative URL se presente (es. "/ricette/insalata-caprese.html")
    const url = recipe.url || '#';
    const tags = (recipe.tags || []).map(t => `<button class="recipe-tag" data-tag="${t}" style="margin-right:6px; border:none; background:#eee; padding:6px 8px; border-radius:6px; cursor:pointer;">${t}</button>`).join(' ');

    return `
      <article class="recipe-card">
        <h3><a href="${url}">${escapeHtml(recipe.title)}</a></h3>
        <p class="recipe-summary">${escapeHtml(recipe.summary || '')}</p>
        <p><strong>Tempo:</strong> ${recipe.time ?? '—'} min • <strong>Porzioni:</strong> ${recipe.servings ?? '—'} • <strong>Difficoltà:</strong> ${escapeHtml(recipe.difficulty || '—')}</p>
        <p><strong>Ingredienti:</strong> ${escapeHtml((recipe.ingredients || []).join(', '))}</p>
        <div style="margin-top:8px;">${tags}</div>
      </article>
    `;
  }

  // semplice escape per contenuti testuali
  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function render(recipes) {
    if (!recipes || recipes.length === 0) {
      listEl.innerHTML = '';
      noResults.style.display = 'block';
      return;
    }
    noResults.style.display = 'none';
    listEl.innerHTML = recipes.map(buildCard).join('\n');

    // Aggiungi listener per i tag cliccabili dentro le card
    listEl.querySelectorAll('.recipe-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.getAttribute('data-tag');
        if (t) {
          tagFilter.value = t;
          applyFilters();
          // metti a fuoco il filtro per chiarezza
          tagFilter.focus();
        }
      });
    });
  }

  function applyFilters() {
    const q = normalize(searchInput.value);
    const tag = tagFilter.value;

    const filtered = allRecipes.filter(r => {
      // filtro tag
      if (tag) {
        const tags = (r.tags || []).map(normalize);
        if (!tags.includes(normalize(tag))) return false;
      }

      // ricerca su titolo, summary, tags, ingredients
      if (!q) return true;
      const hay = [
        r.title,
        r.summary || '',
        (r.tags || []).join(' '),
        (r.ingredients || []).join(' ')
      ].map(normalize).join(' ');
      return hay.indexOf(q) !== -1;
    });

    render(filtered);
  }

  function populateTagSelect() {
    // aggiunge opzioni in ordine alfabetico
    const tags = Array.from(allTags).sort((a,b) => a.localeCompare(b));
    tags.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      tagFilter.appendChild(opt);
    });
  }

  function readQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const ingredientParam = params.get('ingredient'); // esempio: ?ingredient=pomodori
    const tagParam = params.get('tag'); // esempio: ?tag=estate
    if (ingredientParam) {
      // popola la search con il nome ingrediente (così filtra anche per ingredient)
      searchInput.value = ingredientParam;
    }
    if (tagParam) {
      tagFilter.value = tagParam;
    }
  }

  // fetch dati
  try {
    const resp = await fetch(dataUrl, {cache: "no-store"});
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const json = await resp.json();
    allRecipes = json.recipes || [];

    // costruisci set di tag
    allRecipes.forEach(r => {
      (r.tags || []).forEach(t => allTags.add(t));
    });

    populateTagSelect();
    readQueryParams();
    applyFilters();
  } catch (err) {
    console.error('Errore caricando le ricette:', err);
    listEl.innerHTML = '<p>Errore nel caricamento delle ricette. Riprova più tardi.</p>';
  }

  // Eventi UI
  searchInput.addEventListener('input', () => {
    // debounce minimal
    clearTimeout(searchInput._deb);
    searchInput._deb = setTimeout(applyFilters, 200);
  });
  tagFilter.addEventListener('change', applyFilters);
  clearFilters.addEventListener('click', () => {
    searchInput.value = '';
    tagFilter.value = '';
    applyFilters();
  });

})();

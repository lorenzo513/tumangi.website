// Legge il/ i tag dell'ingrediente e carica le ricette correlate
async function loadRecipesForIngredient() {
    // Preleva tutti i meta tag con name="ingredient-id"
    const metas = Array.from(document.querySelectorAll('meta[name="ingredient-id"]'));

    // Se non ne trovi, esci
    if (!metas || metas.length === 0) return;

    // Costruisci lista di tag: supporta sia più meta che singolo meta con valori separati da virgola
    const rawTags = metas.flatMap(m => (m.content || '').split(','));
    const ingredientTags = Array.from(new Set(
        rawTags
            .map(t => t.trim().toLowerCase())
            .filter(Boolean)
    ));

    if (ingredientTags.length === 0) return;

    try {
        // Percorso relativo al json (stesso come prima)
        const response = await fetch('../data/recipes.json');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();

        // Filtra ricette che contengono almeno uno degli ingredientTags
        const relatedRecipes = (data.recipes || []).filter(recipe => {
            const recipeIngredients = (recipe.ingredients || []).map(i => i.toString().toLowerCase());
            const recipeTags = (recipe.tags || []).map(t => t.toString().toLowerCase());
            // match su ingredients OR su tags della ricetta (utile se vuoi associare tag generali)
            return ingredientTags.some(tag =>
                recipeIngredients.includes(tag) || recipeTags.includes(tag)
            );
        });

        // Visualizza le ricette
        displayRecipes(relatedRecipes, ingredientTags);
    } catch (error) {
        console.error('Errore nel caricamento ricette:', error);
        displayError(ingredientTags);
    }
}

function escapeHtml(s) {
    return String(s || '')
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function displayRecipes(recipes, ingredientTags = []) {
    const container = document.getElementById('recipes-container');

    if (!container) return; // Se il div non esiste, esci

    // Header che mostra i tag cercati (emoji in CSS)
    const header = `<h2 class="recipes-header">Ricette con ${ingredientTags.map(t => `<strong>${escapeHtml(t)}</strong>`).join(', ')}</h2>`;

    if (!recipes || recipes.length === 0) {
        // Messaggio amichevole con stile dedicato
        container.innerHTML = `
            ${header}
            <div class="recipes-empty">
                <div class="empty-icon"></div>
                <h3>Nessuna ricetta (ancora!)</h3>
                <p>Non abbiamo ancora ricette con ${ingredientTags.map(t => `<strong>${escapeHtml(t)}</strong>`).join(', ')}, ma stiamo lavorando per aggiungerne altre.</p>
                <p class="empty-hint">Nel frattempo, scopri le <a href="../ricette.html" class="link-cta">altre ricette disponibili</a> nel nostro ricettario!</p>
            </div>
        `;
        return;
    }

    const recipesHTML = recipes
        .map(recipe => {
            const url = recipe.url || '#';
            const summary = recipe.summary ? `<p class="recipe-summary">${escapeHtml(recipe.summary)}</p>` : '';
            const ingr = (recipe.ingredients || []).map(i => escapeHtml(i)).join(', ');
            const tagsHtml = (recipe.tags || []).map(t => `<span class="recipe-meta-tag">${escapeHtml(t)}</span>`).join('');
            return `
                <article class="recipe-card">
                    <h3><a href="${url}">${escapeHtml(recipe.title)}</a></h3>
                    ${summary}
                    <p class="recipe-ingredients"><strong>Ingredienti:</strong> ${ingr}</p>
                    <div class="recipe-tags">${tagsHtml}</div>
                </article>
            `;
        })
        .join('');

    container.innerHTML = `
        ${header}
        <div class="recipes-grid">
            ${recipesHTML}
        </div>
    `;
}

function displayError(ingredientTags = []) {
    const container = document.getElementById('recipes-container');
    if (!container) return;

    const header = `<h2 class="recipes-header">Ricette con ${ingredientTags.map(t => `<strong>${escapeHtml(t)}</strong>`).join(', ')}</h2>`;
    container.innerHTML = `
        ${header}
        <div class="recipes-error">
            <div class="error-icon"></div>
            <h3>Oops! Si è verificato un errore</h3>
            <p>Non riusciamo a caricare le ricette al momento. Riprova fra qualche istante.</p>
            <p class="error-hint">Se il problema persiste, <a href="../../index.html" class="link-cta">torna alla home</a> e riprovaci.</p>
        </div>
    `;
}

// Esegui quando il DOM è pronto
document.addEventListener('DOMContentLoaded', loadRecipesForIngredient);

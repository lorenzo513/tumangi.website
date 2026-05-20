class PortionSelector {
  constructor(recipeElement, originalServings, ingredients) {
    this.originalServings = originalServings;
    this.ingredients = ingredients;
    this.currentServings = originalServings;
    this.recipeElement = recipeElement;

    this.init();
  }

  init() {
    // Crea il selezionatore
    const selector = document.createElement('div');
    selector.className = 'portion-selector';
    selector.innerHTML = `
      <label for="servings-input">👥 Porzioni: </label>
      <button class="btn-minus" type="button">−</button>
      <input type="number" id="servings-input" min="1" value="${this.originalServings}">
      <button class="btn-plus" type="button">+</button>
      <span class="original-servings">(originale: ${this.originalServings})</span>
    `;

    // Inserisci in cima agli ingredienti
    const ingredientsSection = this.recipeElement.querySelector('.ingredients-section');
    if (!ingredientsSection) return; // Sicurezza

    ingredientsSection.insertBefore(selector, ingredientsSection.firstChild);

    // Aggiungi event listeners
    selector.querySelector('.btn-minus').addEventListener('click', () => this.decreaseServings());
    selector.querySelector('.btn-plus').addEventListener('click', () => this.increaseServings());
    selector.querySelector('#servings-input').addEventListener('change', (e) => {
      const val = parseInt(e.target.value);
      if (val > 0) this.setServings(val);
    });
  }

  decreaseServings() {
    if (this.currentServings > 1) {
      this.setServings(this.currentServings - 1);
    }
  }

  increaseServings() {
    this.setServings(this.currentServings + 1);
  }

  setServings(newServings) {
    if (newServings < 1) return;
    this.currentServings = newServings;
    document.querySelector('#servings-input').value = newServings;
    this.updateIngredients();
  }

  updateIngredients() {
    const multiplier = this.currentServings / this.originalServings;

    this.ingredients.forEach((ingredient, index) => {
      const elements = document.querySelectorAll(`[data-ingredient-index="${index}"]`);
      elements.forEach(el => {
        if (ingredient.amount !== null && ingredient.amount !== undefined) {
          const newAmount = (ingredient.amount * multiplier).toFixed(2).replace(/\.?0+$/, '');
          el.textContent = `${newAmount} ${ingredient.unit}`;
        }
      });
    });
  }
}

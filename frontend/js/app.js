// Configuration de l'API
const API_URL = 'http://localhost:3000/products';

// Éléments DOM
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const searchInput = document.getElementById('search-input');
const contentSection = document.getElementById('content-section');
const categoryFilter = document.getElementById('category-filter');
const productForm = document.getElementById('product-form');

// État de l'application
let products = [];

// Gestion du thème
themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Gestion de la recherche
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filterContent(searchTerm);
});

// Gestion du filtre par catégorie
categoryFilter.addEventListener('change', (e) => {
    const category = e.target.value;
    filterByCategory(category);
});

// Gestion du formulaire
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newProduct = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        image: document.getElementById('product-image').value,
        rating: 0,
        lastUpdated: new Date().toISOString().split('T')[0]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProduct)
        });

        if (response.ok) {
            const addedProduct = await response.json();
            products.push(addedProduct);
            displayContent(products);
            productForm.reset();
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout du produit:', error);
    }
});

// Chargement initial des données
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(API_URL);
        products = await response.json();
        displayContent(products);
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        contentSection.innerHTML = '<p>Erreur lors du chargement des données</p>';
    }
});

// Fonction pour afficher le contenu
function displayContent(data) {
    contentSection.innerHTML = data.map(product => `
        <div class="card">
            <span class="category">${product.category}</span>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-details">
                <span class="price">${product.price.toFixed(2)} €</span>
                <span class="stock">Stock: ${product.stock}</span>
                <span class="rating">⭐ ${product.rating}</span>
            </div>
            <span class="date">Dernière mise à jour: ${product.lastUpdated}</span>
            <div class="actions">
                <button onclick="updateStock(${product.id}, ${product.stock - 1})" ${product.stock <= 0 ? 'disabled' : ''}>
                    Diminuer le stock
                </button>
                <button onclick="updateStock(${product.id}, ${product.stock + 1})">
                    Augmenter le stock
                </button>
            </div>
        </div>
    `).join('');
}

// Fonction pour filtrer le contenu
function filterContent(searchTerm) {
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    displayContent(filteredProducts);
}

// Fonction pour filtrer par catégorie
function filterByCategory(category) {
    const filteredProducts = category
        ? products.filter(product => product.category === category)
        : products;
    displayContent(filteredProducts);
}

// Fonction pour mettre à jour le stock
async function updateStock(id, newStock) {
    if (newStock < 0) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                stock: newStock,
                lastUpdated: new Date().toISOString().split('T')[0]
            })
        });

        if (response.ok) {
            const updatedProduct = await response.json();
            products = products.map(product => 
                product.id === id ? updatedProduct : product
            );
            displayContent(products);
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du stock:', error);
    }
}

// Chargement du thème sauvegardé
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
} 
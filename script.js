import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// CONFIGURACIÓN DE SEGURIDAD
const firebaseConfig = {
    apiKey: "AIzaSyCHti6mA1gh-3M38XpjnFFGTLcxFPEJnQg",
    authDomain: "chris-landing.firebaseapp.com",
    projectId: "chris-landing",
    storageBucket: "chris-landing.firebasestorage.app",
    messagingSenderId: "343277009357",
    appId: "1:343277009357:web:570ebe5fe4431119adec84"
};

class StoreEngine {
    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
        this.cart = [];
        this.products = [];
        
        this.init();
    }

    async init() {
        console.log("🚀 ChrisTech Elite Engine iniciado...");
        this.handleScroll();
        this.bindEvents();
        await this.loadProducts();
        this.renderComparison();
    }

    // CARGA DE PRODUCTOS CON FILTROS INTELIGENTES
    async loadProducts(category = 'all') {
        const container = document.getElementById('mainStore');
        container.innerHTML = '<div class="skeleton-loader"></div>'.repeat(3);

        try {
            const q = category === 'all' 
                ? collection(this.db, "iphones") 
                : query(collection(this.db, "iphones"), where("categoria", "==", category));

            const snap = await getDocs(q);
            this.products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderProducts(this.products);
        } catch (err) {
            console.error("Error crítico de stock:", err);
            container.innerHTML = `<p class="error">Lo sentimos, hubo un error al cargar el stock.</p>`;
        }
    }

    renderProducts(items) {
        const container = document.getElementById('mainStore');
        container.innerHTML = '';

        items.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card reveal animate__animated animate__fadeInUp';
            card.innerHTML = `
                <span class="stock-badge ${p.stock > 0 ? 'in' : 'out'}">
                    ${p.stock > 0 ? 'Disponible' : 'Agotado'}
                </span>
                <img src="${p.img}" alt="${p.nombre}" loading="lazy">
                <div class="card-body">
                    <h3 class="text-xl font-bold">${p.nombre}</h3>
                    <p class="text-gray-500 text-sm mb-4">${p.desc || 'Edición Titanium'}</p>
                    <div class="flex justify-between items-center">
                        <span class="price text-2xl font-extrabold text-blue-600">${p.precio}</span>
                        <button class="btn-add" onclick="store.addToCart('${p.id}')">
                            <i class="ri-add-line"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // MANEJO DE CARRITO (LÓGICA DE ESTADO)
    addToCart(id) {
        const product = this.products.find(p => p.id === id);
        this.cart.push(product);
        this.updateUI();
        
        // Efecto de notificación
        this.showToast(`Añadido: ${product.nombre}`);
    }

    updateUI() {
        document.querySelector('.cart-count').innerText = this.cart.length;
    }

    // SISTEMA DE COMPARACIÓN DINÁMICO
    renderComparison() {
        const compareData = [
            { feat: "Cámara", p1: "48MP Pro", p2: "12MP Dual" },
            { feat: "Chip", p1: "A17 Pro", p2: "A16 Bionic" },
            { feat: "Pantalla", p1: "ProMotion 120Hz", p2: "60Hz Retina" }
        ];
        
        const grid = document.getElementById('compareGrid');
        if(!grid) return;

        grid.innerHTML = compareData.map(d => `
            <div class="compare-row flex justify-between border-b py-6">
                <span class="font-semibold text-gray-400 uppercase text-xs">${d.feat}</span>
                <span class="font-bold">${d.p1}</span>
                <span class="text-gray-600">${d.p2}</span>
            </div>
        `).join('');
    }

    // UTILIDADES DE INTERFAZ
    handleScroll() {
        const header = document.getElementById('mainHeader');
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification animate__animated animate__slideInRight';
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    bindEvents() {
        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelector('.filter-btn.active').classList.remove('active');
                e.target.classList.add('active');
                this.loadProducts(e.target.dataset.cat);
            });
        });
    }
}

// Global scope para facilitar onclicks
window.store = new StoreEngine();
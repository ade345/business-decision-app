const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");

navItems.forEach((item) => {
    item.addEventListener("click", () => {

        const targetPage = item.dataset.page;

        // Remove active state from navigation
        navItems.forEach((nav) => {
            nav.classList.remove("active");
        });

        // Activate clicked navigation item
        item.classList.add("active");

        // Hide all pages
        pages.forEach((page) => {
            page.classList.remove("active-page");
        });

        // Show selected page
        const selectedPage = document.getElementById(targetPage);

        if (selectedPage) {
            selectedPage.classList.add("active-page");
        }
    });
});


// ================================
// SALE TOTAL CALCULATION
// ================================

const quantityInput = document.getElementById("quantity");
const unitPriceInput = document.getElementById("unit-price");
const saleTotal = document.getElementById("sale-total");

function calculateSaleTotal() {

    if (!quantityInput || !unitPriceInput || !saleTotal) {
        return;
    }

    const quantity = Number(quantityInput.value) || 0;
    const unitPrice = Number(unitPriceInput.value) || 0;

    const total = quantity * unitPrice;

    saleTotal.textContent = `€${total.toFixed(2)}`;
}


// Recalculate whenever quantity changes
if (quantityInput) {
    quantityInput.addEventListener("input", calculateSaleTotal);
    quantityInput.addEventListener("change", calculateSaleTotal);
}


// Recalculate whenever unit price changes
if (unitPriceInput) {
    unitPriceInput.addEventListener("input", calculateSaleTotal);
    unitPriceInput.addEventListener("change", calculateSaleTotal);
}


// Calculate immediately when the page loads
calculateSaleTotal();

// ================================
// LOAD PRODUCTS FROM DATABASE
// ================================

const productInput = document.getElementById("product");

async function loadProducts() {

    if (!productInput) {
        return;
    }

    try {

        const response = await fetch("http://localhost:3000/api/products");
        const data = await response.json();

        if (!data.success) {
            console.error("Failed to load products");
            return;
        }

        // Clear existing products
        productInput.innerHTML = `
            <option value="">Select product</option>
        `;

        // Add products from MySQL
        data.products.forEach((product) => {

            const option = document.createElement("option");

            option.value = product.product_id;

            option.textContent =
                `${product.product_name} - €${Number(product.selling_price).toFixed(2)}`;

            option.dataset.price = product.selling_price;
            option.dataset.cost = product.cost_price;

            productInput.appendChild(option);
        });

    } catch (error) {

        console.error("Error loading products:", error);

    }
}


// ================================
// AUTO-FILL PRODUCT PRICE
// ================================

if (productInput) {

    productInput.addEventListener("change", () => {

        const selectedOption =
            productInput.options[productInput.selectedIndex];

        const price = selectedOption.dataset.price || "";

        if (unitPriceInput) {
            unitPriceInput.value = price;
        }

        calculateSaleTotal();
    });
}


// Load products when page loads
loadProducts();

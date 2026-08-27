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


// SALE TOTAL CALCULATION

const quantityInput = document.getElementById("quantity");
const unitPriceInput = document.getElementById("unit-price");
const saleTotal = document.getElementById("sale-total");

function calculateSaleTotal() {
    const quantity = parseFloat(quantityInput.value) || 0;
    const unitPrice = parseFloat(unitPriceInput.value) || 0;

    const total = quantity * unitPrice;

    saleTotal.textContent = `€${total.toFixed(2)}`;
}

if (quantityInput && unitPriceInput) {
    quantityInput.addEventListener("input", calculateSaleTotal);
    unitPriceInput.addEventListener("input", calculateSaleTotal);
}

Fix sale total calculation

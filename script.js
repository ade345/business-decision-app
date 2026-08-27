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

// ================================
// RECORD SALE
// ================================

const salesForm = document.getElementById("sales-form");

if (salesForm) {

    salesForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const selectedOption =
            productInput.options[productInput.selectedIndex];

        const saleData = {

            business_id: 1,

            customer_id:
                document.getElementById("customer").value || null,

            sale_date:
                document.getElementById("sale-date").value || null,

            payment_method:
                document.getElementById("payment-method").value,

            payment_status:
                document.getElementById("payment-status").value,

            total_amount:
                Number(unitPriceInput.value) *
                Number(quantityInput.value),

            amount_paid:
                Number(document.getElementById("amount-paid").value) || 0,

            notes:
                document.getElementById("sale-notes").value || null,

            product_id:
                Number(productInput.value),

            quantity:
                Number(quantityInput.value),

            unit_price:
                Number(unitPriceInput.value),

            cost_price:
                Number(selectedOption.dataset.cost)
        };


        // Basic validation
        if (!saleData.product_id) {
            alert("Please select a product.");
            return;
        }

        if (!saleData.quantity || saleData.quantity <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }

        if (!saleData.unit_price || saleData.unit_price < 0) {
            alert("Please enter a valid unit price.");
            return;
        }

        if (!saleData.payment_method) {
            alert("Please select a payment method.");
            return;
        }

        if (!saleData.payment_status) {
            alert("Please select a payment status.");
            return;
        }


        try {

            const response = await fetch(
                "http://localhost:3000/api/sales",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(saleData)
                }
            );


            const result = await response.json();


            if (!response.ok || !result.success) {

                alert(
                    result.message ||
                    "Failed to record sale."
                );

                return;
            }


            alert(
                `Sale recorded successfully!\nSale ID: ${result.sale_id}\nTotal: €${Number(result.line_total).toFixed(2)}`
            );


            // Clear the form
            salesForm.reset();

            // Reset total
            calculateSaleTotal();

        } catch (error) {

            console.error("Error recording sale:", error);

            alert(
                "Unable to connect to the Business Decision API."
            );
        }

    });
}

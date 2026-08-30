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

// ================================
// LOAD SALES HISTORY
// ================================

const salesHistory = document.getElementById("sales-history");

async function loadSalesHistory() {

    if (!salesHistory) {
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:3000/api/sales"
        );

        const data = await response.json();



if (!data.success) {
    salesHistory.innerHTML =
        "<p>Failed to load sales.</p>";
    return;
}


// ================================
// UPDATE SALES OVERVIEW
// ================================

const salesCount = document.getElementById("sales-count");
const salesRevenue = document.getElementById("sales-revenue");
const salesProfit = document.getElementById("sales-profit");
const salesAverage = document.getElementById("sales-average");

const uniqueSales = {};

data.sales.forEach((sale) => {

    if (!uniqueSales[sale.sale_id]) {

        uniqueSales[sale.sale_id] = {
            total_amount: Number(sale.total_amount || 0),
            profit: Number(sale.profit || 0)
        };

    } else {

        uniqueSales[sale.sale_id].profit +=
            Number(sale.profit || 0);

    }
});

const salesList = Object.values(uniqueSales);

const totalSales = salesList.length;

const totalRevenue = salesList.reduce(
    (sum, sale) => sum + sale.total_amount,
    0
);

const totalProfit = salesList.reduce(
    (sum, sale) => sum + sale.profit,
    0
);

const averageSale =
    totalSales > 0
        ? totalRevenue / totalSales
        : 0;

if (salesCount) {
    salesCount.textContent = totalSales;
}

if (salesRevenue) {
    salesRevenue.textContent =
        `€${totalRevenue.toFixed(2)}`;
}

if (salesProfit) {
    salesProfit.textContent =
        `€${totalProfit.toFixed(2)}`;
}

if (salesAverage) {
    salesAverage.textContent =
        `€${averageSale.toFixed(2)}`;
}
       
        
        if (data.sales.length === 0) {
            salesHistory.innerHTML =
                "<p>No sales recorded yet.</p>";
            return;
        }

        // Group products by sale
        const groupedSales = {};

        data.sales.forEach((sale) => {

            if (!groupedSales[sale.sale_id]) {

                groupedSales[sale.sale_id] = {
                    sale_id: sale.sale_id,
                    sale_date: sale.sale_date,
                    customer_name: sale.customer_name,
                    payment_method: sale.payment_method,
                    payment_status: sale.payment_status,
                    total_amount: Number(sale.total_amount),
                    amount_paid: Number(sale.amount_paid),
                    notes: sale.notes,
                    products: [],
                    total_profit: 0
                };
            }

            groupedSales[sale.sale_id].products.push({
                product_name: sale.product_name || "Product",
                quantity: Number(sale.quantity),
                unit_price: Number(sale.unit_price),
                line_total: Number(sale.line_total),
                profit: Number(sale.profit)
            });

            groupedSales[sale.sale_id].total_profit +=
                Number(sale.profit);
        });


        salesHistory.innerHTML = "";


        Object.values(groupedSales).forEach((sale) => {

            const saleCard = document.createElement("div");

            saleCard.className = "sale-history-card";


            const date = new Date(sale.sale_date);

            const formattedDate =
                date.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                });


            let productsHTML = "";

            sale.products.forEach((product) => {

                productsHTML += `
                    <div class="sale-product-row">

                        <span>
                            ${product.product_name}
                        </span>

                        <span>
                            Qty: ${product.quantity}
                        </span>

                        <span>
                            €${product.line_total.toFixed(2)}
                        </span>

                    </div>
                `;
            });


            saleCard.innerHTML = `

                <div class="sale-history-header">

                    <strong>
                        Sale #${sale.sale_id}
                    </strong>

                    <span>
                        ${formattedDate}
                    </span>

                    <span>
                        ${sale.payment_status}
                    </span>

                </div>


                <div class="sale-customer">

                    Customer:
                    ${sale.customer_name || "Walk-in Customer"}

                </div>


                <div class="sale-products">

                    ${productsHTML}

                </div>


                <div class="sale-history-footer">

                    <strong>
                        Total: €${sale.total_amount.toFixed(2)}
                    </strong>

                    <strong>
                        Profit: €${sale.total_profit.toFixed(2)}
                    </strong>

                </div>

            `;


            salesHistory.appendChild(saleCard);

        });

    } catch (error) {

        console.error(
            "Error loading sales history:",
            error
        );

        salesHistory.innerHTML =
            "<p>Unable to connect to the Business Decision API.</p>";
    }
}


// Load sales history when page loads
loadSalesHistory();

// ================================
// UPDATE DASHBOARD
// ================================

async function loadDashboardMetrics() {

    try {

        const response = await fetch(
            "http://localhost:3000/api/dashboard/financials"
        );

        const data = await response.json();

        if (!data.success) {
            console.error(
                "Failed to load dashboard financials"
            );
            return;
        }

        const financials = data.financials;


        // ================================
        // UPDATE NET CASH MOVEMENT
        // ================================

        const dashboardCash =
            document.getElementById("dashboard-cash");

        if (dashboardCash) {

            const cashMovement =
                Number(financials.net_cash_movement || 0);

            dashboardCash.textContent =
                `${cashMovement < 0 ? "-" : ""}€${Math.abs(cashMovement).toFixed(2)}`;

        }


        // ================================
        // UPDATE DASHBOARD REVENUE
        // ================================

        const dashboardRevenue =
            document.getElementById("dashboard-revenue");

        if (dashboardRevenue) {

            dashboardRevenue.textContent =
                `€${Number(financials.revenue || 0).toFixed(2)}`;

        }


        // ================================
        // UPDATE DASHBOARD OPERATING PROFIT
        // ================================

        const dashboardProfit =
            document.getElementById("dashboard-profit");

        if (dashboardProfit) {

            dashboardProfit.textContent =
                `€${Number(financials.operating_profit || 0).toFixed(2)}`;

        }
// ================================
// UPDATE INVENTORY VALUE
// ================================

const inventoryResponse = await fetch(
    "http://localhost:3000/api/dashboard/inventory"
);

const inventoryData = await inventoryResponse.json();

if (inventoryData.success) {

    const dashboardInventory =
        document.getElementById("dashboard-inventory");

    if (dashboardInventory) {

        dashboardInventory.textContent =
            `€${Number(
                inventoryData.inventory.inventory_value || 0
            ).toFixed(2)}`;

    }
}
    } catch (error) {

        console.error(
            "Error loading dashboard metrics:",
            error
        );

    }

}


// ================================
// LOAD DASHBOARD METRICS
// ================================

loadDashboardMetrics();

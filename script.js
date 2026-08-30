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
// ================================

const kpiResponse = await fetch(
    "http://localhost:3000/api/dashboard/kpis"
);

const kpiData = await kpiResponse.json();

if (kpiData.success) {

    const healthScore =
        document.getElementById("business-health-score");

    if (healthScore) {

        healthScore.textContent =
            Number(
                kpiData.kpis.business_health_score || 0
            );

    }
}

// ================================
// UPDATE BUSINESS HEALTH STATUS
// ================================

const healthStatus =
    document.getElementById("business-health-status");

if (healthStatus && kpiData.success) {

    healthStatus.textContent =
        String(
            kpiData.kpis.business_health_status || "UNKNOWN"
        ).replace(/_/g, " ");

}
        // ================================
// UPDATE DECISION SUMMARY
// ================================

const cashTitle =
    document.getElementById("decision-cash-title");

const cashMessage =
    document.getElementById("decision-cash-message");

const inventoryTitle =
    document.getElementById("decision-inventory-title");

const inventoryMessage =
    document.getElementById("decision-inventory-message");

const productTitle =
    document.getElementById("decision-product-title");

const productMessage =
    document.getElementById("decision-product-message");


if (kpiData.success) {

    // CASH DECISION

    if (cashTitle && cashMessage) {

        const cashMovement =
            Number(kpiData.kpis.net_cash_movement || 0);

        if (cashMovement < 0) {

            cashTitle.textContent = "Cash Pressure";

            cashMessage.textContent =
                "Net cash movement is negative. Management should investigate cash outflows and working capital.";

        } else {

            cashTitle.textContent = "Cash Position";

            cashMessage.textContent =
                "Cash movement is positive. Continue monitoring inflows and outflows.";

        }
    }


    // INVENTORY DECISION

    if (inventoryTitle && inventoryMessage) {

        const highStock =
            Number(kpiData.kpis.high_stock_percentage || 0);

        if (highStock > 30) {

            inventoryTitle.textContent = "Inventory Attention";

            inventoryMessage.textContent =
                `${highStock.toFixed(1)}% of inventory is classified as high stock. Review high-stock products before making new purchases.`;

        } else {

            inventoryTitle.textContent = "Inventory";

            inventoryMessage.textContent =
                "Inventory levels are currently within a manageable range.";

        }
    }


    // PRODUCT DECISION

    if (productTitle && productMessage) {

        const topProduct =
            kpiData.kpis.top_profit_product || "No product identified";

        productTitle.textContent =
            "Top Profit Product";

        productMessage.textContent =
            `${topProduct} is currently the top profit-performing product. Monitor its sales and margin performance.`;

    }
}
        // ================================
// UPDATE ALERTS & RECOMMENDATIONS
// ================================

const cashAlert =
    document.getElementById("cash-alert");

const cashAlertTitle =
    document.getElementById("cash-alert-title");

const cashAlertMessage =
    document.getElementById("cash-alert-message");

const inventoryAlert =
    document.getElementById("inventory-alert");

const inventoryAlertTitle =
    document.getElementById("inventory-alert-title");

const inventoryAlertMessage =
    document.getElementById("inventory-alert-message");

const productAlert =
    document.getElementById("product-alert");

const productAlertTitle =
    document.getElementById("product-alert-title");

const productAlertMessage =
    document.getElementById("product-alert-message");


if (kpiData.success) {

    // CASH ALERT

    const cashMovement =
        Number(kpiData.kpis.net_cash_movement || 0);

    if (cashAlert && cashAlertTitle && cashAlertMessage) {

        if (cashMovement < 0) {

            cashAlertTitle.textContent =
                "Cash Alert";

            cashAlertMessage.textContent =
                `Net cash movement is negative at €${Math.abs(cashMovement).toFixed(2)}. Management should investigate cash outflows and working capital.`;

        } else {

            cashAlertTitle.textContent =
                "Cash Position";

            cashAlertMessage.textContent =
                `Net cash movement is positive at €${cashMovement.toFixed(2)}.`;

        }
    }


    // INVENTORY ALERT

    const highStock =
        Number(kpiData.kpis.high_stock_percentage || 0);

    if (
        inventoryAlert &&
        inventoryAlertTitle &&
        inventoryAlertMessage
    ) {

        if (highStock > 30) {

            inventoryAlertTitle.textContent =
                "Inventory Alert";

            inventoryAlertMessage.textContent =
                `${highStock.toFixed(1)}% of inventory is classified as high stock. Review high-stock products before making new purchases.`;

        } else {

            inventoryAlertTitle.textContent =
                "Inventory Status";

            inventoryAlertMessage.textContent =
                "Inventory levels are currently within a manageable range.";

        }
    }


    // PRODUCT OPPORTUNITY

    const topProduct =
        kpiData.kpis.top_profit_product ||
        "No product identified";

    if (
        productAlert &&
        productAlertTitle &&
        productAlertMessage
    ) {

        productAlertTitle.textContent =
            "Product Opportunity";

        productAlertMessage.textContent =
            `${topProduct} is currently the top profit-performing product. Monitor its sales and margin performance.`;

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

// ================================
// LOAD INVENTORY PAGE
// ================================

// ================================
// LOAD INVENTORY PAGE
// ================================

async function loadInventoryPage() {

    const inventoryContainer =
        document.getElementById("inventory-table-container");

    if (!inventoryContainer) {
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:3000/api/dashboard/inventory/details"
        );

        const data = await response.json();

        if (!data.success) {
            inventoryContainer.innerHTML =
                "<p>Failed to load inventory data.</p>";
            return;
        }

        const inventory = data.inventory || [];

        // ================================
        // UPDATE INVENTORY SUMMARY
        // ================================

        const totalValue =
            document.getElementById("inventory-total-value");

        const productCount =
            document.getElementById("inventory-product-count");

        const highStock =
            document.getElementById("inventory-high-stock");


        const totalInventoryValue = inventory.reduce(
            (sum, product) =>
                sum + Number(product.inventory_value || 0),
            0
        );


        const highStockCount = inventory.filter(
            product =>
                String(product.stock_status || "").toUpperCase()
                === "HIGH_STOCK"
        ).length;


        const highStockPercentage =
            inventory.length > 0
                ? (highStockCount / inventory.length) * 100
                : 0;


        if (totalValue) {
            totalValue.textContent =
                `€${totalInventoryValue.toFixed(2)}`;
        }


        if (productCount) {
            productCount.textContent =
                inventory.length;
        }


        if (highStock) {
            highStock.textContent =
                `${highStockPercentage.toFixed(1)}%`;
        }


        // ================================
        // NO PRODUCTS
        // ================================

        if (inventory.length === 0) {

            inventoryContainer.innerHTML =
                "<p>No inventory products found.</p>";

            return;
        }


        // ================================
        // BUILD INVENTORY TABLE
        // ================================

        let tableHTML = `

            <table class="inventory-table">

                <thead>

                    <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Stock</th>
                        <th>Minimum</th>
                        <th>Inventory Value</th>
                        <th>Units Sold</th>
                        <th>Revenue</th>
                        <th>Gross Profit</th>
                        <th>Margin</th>
                        <th>Status</th>
                    </tr>

                </thead>

                <tbody>
        `;


        inventory.forEach((product) => {

            const status =
                String(product.stock_status || "")
                    .toUpperCase();


            let statusClass = "ok";

            if (status === "HIGH_STOCK") {
                statusClass = "high";
            }

            if (
                status === "LOW_STOCK" ||
                status === "OUT_OF_STOCK"
            ) {
                statusClass = "low";
            }


            tableHTML += `

                <tr>

                    <td class="inventory-product-name">
                        ${product.product_name || "Unknown Product"}
                    </td>

                    <td>
                        ${product.sku || "-"}
                    </td>

                    <td>
                        ${Number(product.current_stock || 0).toFixed(0)}
                    </td>

                    <td>
                        ${Number(product.minimum_stock || 0).toFixed(0)}
                    </td>

                    <td>
                        €${Number(product.inventory_value || 0).toFixed(2)}
                    </td>

                    <td>
                        ${Number(product.units_sold || 0).toFixed(0)}
                    </td>

                    <td>
                        €${Number(product.revenue || 0).toFixed(2)}
                    </td>

                    <td>
                        €${Number(product.gross_profit || 0).toFixed(2)}
                    </td>

                    <td>
                        ${product.gross_margin_percentage !== null
                            ? Number(product.gross_margin_percentage).toFixed(1) + "%"
                            : "-"
                        }
                    </td>

                    <td>
                        <span class="inventory-status ${statusClass}">
                            ${status.replace(/_/g, " ")}
                        </span>
                    </td>

                </tr>

            `;
        });


        tableHTML += `

                </tbody>

            </table>

        `;


        inventoryContainer.innerHTML =
            tableHTML;


    } catch (error) {

        console.error(
            "Error loading inventory:",
            error
        );

        inventoryContainer.innerHTML =
            "<p>Unable to connect to the Business Decision API.</p>";
    }
}


// Load inventory when page loads

loadInventoryPage();
loadProductsPage()

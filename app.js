require("dotenv").config();
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const axios = require("axios");

// =======================
// CONFIGURATION (from .env)
// =======================
const api = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: "wc/v3"
});

const ZOHO_ACCESS_TOKEN = process.env.ZOHO_ACCESS_TOKEN;

// =======================
// ZOHO FUNCTIONS
// =======================

/**
 * Create a contact in Zoho CRM
 * Maps WooCommerce billing info → Zoho Contact fields
 */
async function createContactZoho(order) {
  const contactData = {
    data: [
      {
        First_Name: order.billing.first_name,
        Last_Name: order.billing.last_name,
        Email: order.billing.email
      }
    ]
  };

  try {
    const response = await axios.post(
      "https://www.zohoapis.com/crm/v8/Contacts",
      contactData,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${ZOHO_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log(`✅ Contact created for ${order.billing.first_name} ${order.billing.last_name}`);
  } catch (error) {
    console.error("❌ Error creating contact:", error.response ? error.response.data : error.message);
  }
}

/**
 * Create a deal in Zoho CRM
 * Maps WooCommerce order info → Zoho Deal fields
 */
async function createDealZoho(order) {
  const products = order.line_items.map(item => item.name).join(", ");
  const dealData = {
    data: [
      {
        Deal_Name: `Order #${order.id} - ${products}`,
        Amount: order.total,
        Stage: "Qualification"
      }
    ]
  };

  try {
    const response = await axios.post(
      "https://www.zohoapis.com/crm/v8/Deals",
      dealData,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${ZOHO_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log(`✅ Deal created for Order #${order.id}`);
  } catch (error) {
    console.error("❌ Error creating deal:", error.response ? error.response.data : error.message);
  }
}

// =======================
// MAIN INTEGRATION
// =======================
async function runIntegration() {
  try {
    const { data: orders } = await api.get("orders");
    if (!orders.length) {
      console.log("⚠️ No orders found.");
      return;
    }

    for (const order of orders) {
      console.log(`\n🔄 Processing Order #${order.id}...`);
      await createContactZoho(order);
      await createDealZoho(order);
    }

    console.log("\n🎉 Integration completed successfully!");
  } catch (error) {
    console.error("❌ Error running integration:", error.message);
  }
}

// Run the script
runIntegration();

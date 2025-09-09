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
 * Check if contact exists in Zoho CRM by email
 */
async function findContactByEmail(email) {
  try {
    const response = await axios.get(
      `https://www.zohoapis.com/crm/v8/Contacts/search?criteria=(Email:equals:${email})`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${ZOHO_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    return response.data.data && response.data.data.length > 0 ? response.data.data[0].id : null;
  } catch (error) {
    // If not found, Zoho returns 204 No Content
    return null;
  }
}

/**
 * Check if deal exists in Zoho CRM by Deal_Name
 */
async function findDealByName(dealName) {
  try {
    const response = await axios.get(
      `https://www.zohoapis.com/crm/v8/Deals/search?criteria=(Deal_Name:equals:${encodeURIComponent(dealName)})`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${ZOHO_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    return response.data.data && response.data.data.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Create a contact in Zoho CRM if not exists
 */
async function createContactZoho(order) {
  const email = order.billing.email;
  if (!email) {
    console.log("⚠️ No email for order, skipping contact creation.");
    return null;
  }
  const existingContactId = await findContactByEmail(email);
  if (existingContactId) {
    console.log(`ℹ️ Contact already exists for ${email}: ${existingContactId}`);
    return existingContactId;
  }

  const contactData = {
    data: [
      {
        First_Name: order.billing.first_name,
        Last_Name: order.billing.last_name,
        Email: email
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
    const newId = response.data.data[0].details.id;
    console.log(`✅ Contact created for ${order.billing.first_name} ${order.billing.last_name}: ${newId}`);
    return newId;
  } catch (error) {
    console.error("❌ Error creating contact:", error.response ? error.response.data : error.message);
    return null;
  }
}

/**
 * Create a deal in Zoho CRM if not exists
 */
async function createDealZoho(order, contactId) {
  const products = order.line_items.map(item => item.name).join(", ");
  const dealName = `Order #${order.id} - ${products}`;

  const exists = await findDealByName(dealName);
  if (exists) {
    console.log(`ℹ️ Deal already exists for Order #${order.id}`);
    return;
  }

  const dealData = {
    data: [
      {
        Deal_Name: dealName,
        Amount: order.total,
        Stage: "Qualification",
        ...(contactId && { Contact_Name: contactId })
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
      const contactId = await createContactZoho(order);
      await createDealZoho(order, contactId);
    }

    console.log("\n🎉 Integration completed with duplicate-checking!");
  } catch (error) {
    console.error("❌ Error running integration:", error.message);
  }
}

// Run the script
runIntegration();

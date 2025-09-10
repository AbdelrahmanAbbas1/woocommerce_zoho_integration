# WooCommerce → Zoho CRM Integration

## Overview

This project integrates a local WooCommerce store with Zoho CRM. It automatically sends customer order data from WooCommerce into Zoho CRM as Contacts and Deals.

---

## Deliverables

- Source code (Node.js and Deluge) with clear structure and comments
- `.env.example` file (lists environment variables, no secrets)
- Postman collection (`woo_zoho_postman_collection.json`) with sample requests
- Mapping document (`mapping.md`) showing WooCommerce → Zoho CRM field mapping
- Sample data (`sample_orders.json`) with at least 2 test orders
- This `README.md` with setup, run, and test instructions

---

## Setup

### 1. Requirements

- Node.js (v14 or higher)
- Local WooCommerce store (via LocalWP or WordPress)
- WooCommerce REST API keys (Consumer Key & Secret)
- Zoho CRM account and OAuth access token

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
WOOCOMMERCE_URL=http://your-woocommerce-url
WOOCOMMERCE_CONSUMER_KEY=your_woocommerce_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_woocommerce_consumer_secret
ZOHO_ACCESS_TOKEN=your_zoho_access_token
```

### 3. Obtaining API Keys/Tokens

- **WooCommerce:**  
  Go to WooCommerce → Settings → Advanced → REST API. Create a new key and copy the Consumer Key and Consumer Secret.

- **Zoho CRM:**  
  Follow [Zoho CRM API OAuth documentation](https://www.zoho.com/crm/developer/docs/api/v8/oauth-overview.html) to generate an access token.

---

## Running the Node.js Integration

1. Install dependencies:

    ```bash
    npm install
    ```

2. Run the integration script:

    ```bash
    node app.js
    ```

3. The script will:
    - Fetch orders from WooCommerce
    - Create/update Contacts in Zoho CRM
    - Create Deals in Zoho CRM

---

## Deluge Script

- The Deluge script (`woo_to_zoho_deluge.txt`) can be uploaded to Zoho CRM as a custom function.
- It fetches WooCommerce orders and creates Contacts and Deals in Zoho CRM, with duplicate checking.

---

## Postman Collection

- Use `postman_collection.json` to manually test WooCommerce and Zoho CRM API endpoints.
- Import into Postman and update variables as needed.

---

## Field Mapping

See [`mapping.md`](mapping.md) for details on how WooCommerce fields map to Zoho CRM fields.

---

## Sample Data

See [`sample_orders.json`](sample_orders.json) for example WooCommerce orders used for testing.

---

## Testing

- Place at least 2 test orders in WooCommerce.
- Run the integration and verify Contacts and Deals are created in Zoho CRM.
- Use Postman to test API endpoints if needed.

---

## Using ngrok for Deluge Integration

When running WooCommerce locally, you need to expose your local site to the internet so Zoho CRM (Deluge) can access it. This is done using [ngrok](https://ngrok.com/).

### Steps:

1. **Install ngrok:**  
   Download and install ngrok from [ngrok.com](https://ngrok.com/download).

2. **Start ngrok:**  
   Run the following command in your terminal, replacing `10004` with your local WordPress port if different:
   ```bash
   ngrok http 10004
   ```
   This will provide a public HTTPS URL (e.g., `https://xxxx.ngrok-free.app`) that tunnels to your local WooCommerce site.

3. **Update Deluge Script:**  
   Copy the ngrok URL and update the WooCommerce API endpoint in your Deluge script (`woo_to_zoho_deluge.txt`):
   ```deluge
   wooURL = "https://xxxx.ngrok-free.app/wp-json/wc/v3/orders?consumer_key=...&consumer_secret=...";
   ```
   **Note:** You must update this URL every time you restart ngrok.

4. **Test Integration:**  
   Run your Deluge function in Zoho CRM. It will fetch orders from your WooCommerce store using the ngrok URL.

---

**Tip:**  
Always ensure ngrok is running and the URL in your Deluge script matches the current ngrok session before testing the integration.

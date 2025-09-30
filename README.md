**Water Bill Payments**

Overview
This project is a full-stack water bill payment management system with a React frontend and an Express + Sequelize (MySQL) backend. Operators can search and view bills, generate Cashfree payment links, and email those links to customers. Customers pay through the payment link, and the backend reconciles the transaction by handling Cashfree webhooks. On successful payment, the bill status is updated to PAID, the transaction is recorded, and the Mock Bank JSON store is updated to reflect the cleared bill.


**Setup**

Clone the repository and install dependencies:

git clone https://github.com/your-username/waterbillpayments.git
cd waterbillpayments

**Backend**

cd backend

npm install

npm start

Runs at http://localhost:4000

**Frontend**

cd ../frontend

npm install

cd backend

npm start

Runs at http://localhost:3000


**Mock Bank**

The mock bank simulates external bill updates and reads from mock-bank/data/bills.json.

cd mock-bank

npm install

npm start

Runs at http://localhost:4001


**MailHog (local email testing)**

Install MailHog

and run: mailhog

Web UI: http://localhost:8025

SMTP Server: localhost:1025

**Ngrok (webhook testing)**

To expose your backend for Cashfree webhook simulation:

ngrok http 4000

Ngrok will give you a public HTTPS URL (e.g., https://abcd1234.ngrok.io).

Set this in Cashfree as your webhook URL:

https://abcd1234.ngrok.io/webhooks/cashfree


**Environment Variables**

Create a .env file in the backend folder:

PORT=4000

DB_NAME=waterbills

DB_USER=root

DB_PASS=yourpassword

DB_HOST=127.0.0.1

DB_DIALECT=mysql

CASHFREE_CLIENT_ID=your_client_id

CASHFREE_CLIENT_SECRET=your_client_secret

SMTP_HOST=localhost

SMTP_PORT=1025

SMTP_USER=

SMTP_PASS=

DISABLE_WEBHOOK_SIGNATURE=true

**Test Commands**

Tests are inside backend/src/tests.

Run all tests:

cd backend

npm test



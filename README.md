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

**Screenshots**

Enter a bill id

<img width="1467" height="755" alt="Screenshot 2025-09-30 at 3 27 08 PM" src="https://github.com/user-attachments/assets/664d1939-e4b2-413e-9483-ef52314c72fa" />

Fetch Bill

<img width="1469" height="802" alt="Screenshot 2025-09-30 at 3 27 21 PM" src="https://github.com/user-attachments/assets/78b9d7eb-7728-4d76-8868-d2ea098f213c" />

Send email 

<img width="797" height="334" alt="Screenshot 2025-09-30 at 3 27 27 PM" src="https://github.com/user-attachments/assets/ac247fd4-2b0d-4bfe-be30-00768a5ae0f8" />

Pay from mailhog which simulates what the customer sees

<img width="912" height="716" alt="image" src="https://github.com/user-attachments/assets/2a4610a3-fbba-4144-b97c-945afb6205f9" />


Pay through cashfree api 

<img width="639" height="749" alt="Screenshot 2025-09-30 at 3 28 08 PM" src="https://github.com/user-attachments/assets/9fdd9448-e97b-48a5-aaab-fe113b0d29ab" />

<img width="505" height="758" alt="Screenshot 2025-09-30 at 3 28 16 PM" src="https://github.com/user-attachments/assets/36246353-d07a-4eaf-8949-bcf9ba63f379" />

Database and mock-bank api uploaded with paid status

<img width="955" height="485" alt="Screenshot 2025-09-30 at 3 28 26 PM" src="https://github.com/user-attachments/assets/3f20aed2-acce-42a5-9db8-4e01a777f0e4" />






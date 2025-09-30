Water Bill Payments System

This project is a full-stack application for managing and paying water bills. It includes:

Backend (waterbillpayments/backend)
REST API built with Node.js, Express, Sequelize, and MySQL.

Frontend (waterbillpayments/frontend)
React-based dashboard for operators to manage bills and payments.

Mock Bank Service (mock-bank)
Lightweight Express server simulating bank responses.

Postman Collection (postman)
Contains example API requests for testing.

Features

Bill Management: Create, fetch, search, and filter bills.

Payment Links: Generate and resend payment links via email.

Webhook Handling: Cashfree webhook simulation with bill updates.

Dashboard: Operator dashboard to search bills, view statuses, resend links, and see analytics.

Mock Bank: Simulates bill payment status changes for integration testing.

Project Structure
FINAL_ASSESMENT/
│── waterbillpayments/
│   ├── backend/           # Express + Sequelize backend
│   │   ├── src/           # API source code
│   │   ├── .env           # Backend environment variables
│   │   ├── package.json
│   │   └── ...
│   ├── frontend/          # React frontend
│   │   ├── src/components # React components (Dashboard, etc.)
│   │   ├── public/
│   │   ├── package.json
│   │   └── ...
│
│── mock-bank/             # Mock Bank service
│   ├── data/bills.json    # Local JSON store
│   ├── server.js          # Express mock server
│   ├── package.json
│   └── ...
│
│── postman/               # Postman test collection
│── README.md              # Project documentation

Setup Instructions
1. Clone the Repository
git clone <your-repo-url>
cd FINAL_ASSESMENT

2. Backend Setup (waterbillpayments/backend)
cd waterbillpayments/backend
npm install

Environment Variables (.env)

Create a .env file inside backend/:

# Database
DB_NAME=waterbills
DB_USER=root
DB_PASS=yourpassword
DB_HOST=localhost
DB_DIALECT=mysql

# Server
PORT=4000

# Cashfree
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_CLIENT_SECRET=your_cashfree_secret

# Email (example SMTP settings)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password

Run Backend
npm start


Server runs at:

http://localhost:4000

3. Frontend Setup (waterbillpayments/frontend)
cd waterbillpayments/frontend
npm install

Run Frontend
npm start


Frontend runs at:

http://localhost:3000

4. Mock Bank Setup (mock-bank)
cd mock-bank
npm install
npm start


Mock Bank runs at:

http://localhost:4001

Running Tests

Backend includes unit and integration tests (using Jest + Supertest).
For tests, an in-memory SQLite database is used.

cd waterbillpayments/backend
NODE_ENV=test npm test

Example Flow

Create a bill via backend API.

Generate a payment link.

Use Mock Bank to simulate marking a bill as paid.

Cashfree webhook simulation updates bill status → Dashboard reflects the change.

Notes

The backend uses Sequelize migrations (sequelize.sync()) to manage schema.

The mock-bank/data/bills.json file resets whenever the mock service restarts.

Dashboard shows status timeline (CREATED → LINK_SENT → PAYMENT_PENDING → PAID/EXPIRED).
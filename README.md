# Trace Origins - Blockchain Product Traceability Platform

A SaaS platform for universal blockchain-based product traceability. Track products across any industry with immutable blockchain records, QR code access, and interactive consumer timelines.

## Features

-   **Vendor Dashboard**: Create pipelines, manage products, capture geo-tagged data
-   **Blockchain Integration**: Immutable records with Ethereum/Polygon support
-   **QR Code Generation**: Auto-generated QR codes linking to product timelines
-   **Consumer Viewer**: Interactive timeline UI for product journey transparency
-   **Analytics**: Track scans, monitor compliance, generate reports

## Tech Stack

-   **Frontend**: Next.js 16, React 19, Tailwind CSS
-   **Backend**: Next.js API Routes
-   **Database**: PostgreSQL with Prisma ORM
-   **Blockchain**: Ethereum/Polygon via ethers.js
-   **Authentication**: JWT with HTTP-only cookies

## Getting Started

### Prerequisites

-   Node.js 18+
-   PostgreSQL database

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your database URL and other configuration.

3. Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma db push
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

| Variable                   | Description                         |
| -------------------------- | ----------------------------------- |
| `DATABASE_URL`             | PostgreSQL connection string        |
| `JWT_SECRET`               | Secret key for JWT tokens           |
| `BLOCKCHAIN_RPC_URL`       | Ethereum/Polygon RPC endpoint       |
| `BLOCKCHAIN_PRIVATE_KEY`   | Wallet private key for transactions |
| `STORAGE_CONTRACT_ADDRESS` | Deployed smart contract address     |
| `NEXT_PUBLIC_APP_URL`      | Public URL for QR code generation   |

## Project Structure

```
app/
  (auth)/           # Login/Register pages
  (dashboard)/      # Vendor dashboard pages
  api/              # API routes
  track/[id]/       # Consumer product viewer
components/         # Reusable UI components
lib/                # Utilities, auth, blockchain, db
prisma/             # Database schema
```

## API Endpoints

-   `POST /api/auth/register` - Register vendor account
-   `POST /api/auth/login` - Login
-   `GET /api/pipelines` - List pipelines
-   `POST /api/pipelines` - Create pipeline
-   `GET /api/products` - List products
-   `POST /api/products` - Create product with QR code
-   `PATCH /api/products/[id]/stages/[stageId]` - Update stage with geo-tagged data
-   `GET /api/track/[id]` - Public product timeline (no auth)
-   `GET /api/analytics` - Dashboard analytics

# FTD — Perfume store (MERN + Tailwind, plain JavaScript)

Pages: Home, Shop, Product, Cart/Checkout, plus Sign in, Sign up and an Admin panel.

## Run it
You need Node 18+ and MongoDB running locally (or an Atlas URI).

### 1. Server
```
cd server
npm install
cp .env.example .env     # set MONGO_URI and JWT_SECRET
npm run seed             # adds 5 sample perfumes + an admin user
npm run dev              # http://localhost:5000
```
Admin login comes from ADMIN_EMAIL / ADMIN_PASSWORD in `.env`
(default admin@example.com / admin12345). Change it before going live.

### 2. Client
```
cd client
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```

## What the admin can do
- Add, edit and delete fragrances (price, stock, notes, colour, image URL)
- See every order and change its status (pending → confirmed → shipped → delivered / cancelled)

## Rename the brand
Search for "FTD" in `client/index.html`, `Bottle.jsx`, `Navbar.jsx`, `Footer.jsx`, `Home.jsx`, `Register.jsx`, `TicketThread.jsx`.

## Product photos, notes and payments

**Photos.** In Admin > Products you can add up to 4 photos per fragrance (upload from your
computer, or paste a link). Uploaded photos are shrunk in the browser and saved with the product.
For this to work, in `server/index.js` change

    app.use(express.json());

to

    app.use(express.json({ limit: '10mb' }));

and restart the server.

**Payments.** Cash on delivery works out of the box. For Easypaisa and JazzCash, add your
account number (and account title) to `server/.env`, then restart:

    EASYPAISA_NUMBER=03XXXXXXXXX
    EASYPAISA_TITLE=Your name or business
    JAZZCASH_NUMBER=03XXXXXXXXX
    JAZZCASH_TITLE=Your name or business

The customer sends the money from their app and enters the transaction ID. The order then shows
"Awaiting verification" in Admin > Orders; after you check the payment, set it to "Paid".
Card and PayPro are listed as "Coming soon" until a gateway merchant account is connected.

Prices are shown in Rs.

# Ombre — Perfume store (MERN + Tailwind, plain JavaScript)

Pages: Home, Shop, Product, Cart/Checkout, plus Sign in, Sign up and an Admin panel.

## Run it
You need Node 18+ and MongoDB running locally (or an Atlas URI).

### 1. Server
```
cd server
npm install
cp .env.example .env     # set MONGO_URI and JWT_SECRET 
            # adds 5 sample perfumes + an admin user
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
Search for "Ombre" in `client/index.html`, `Navbar.jsx`, `Footer.jsx`.

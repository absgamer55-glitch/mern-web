import { useEffect, useRef } from 'react';
import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Protected from './components/Protected.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Admin from './pages/Admin.jsx';
import Profile from './pages/Profile.jsx';
import Support from './pages/Support.jsx';
import Orders from './pages/Orders.jsx';

// Go back to the top when a new page opens. Typing in the search box
// (which only replaces the URL) does not jump the page.
function ScrollToTop() {
  const location = useLocation();
  const navType = useNavigationType();
  const prev = useRef(location.pathname);
  useEffect(() => {
    const pathChanged = prev.current !== location.pathname;
    prev.current = location.pathname;
    if (pathChanged || navType === 'PUSH') window.scrollTo(0, 0);
  }, [location.key]);
  return null;
}

export default function App() {
  // Sign in / sign up are clean pages: no footer.
  const { pathname } = useLocation();
  const bare = ['/login', '/register'].includes(pathname);
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/orders" element={<Protected><Orders /></Protected>} />
          <Route path="/support" element={<Protected><Support /></Protected>} />
          <Route path="/admin" element={<Protected adminOnly><Admin /></Protected>} />
          <Route path="*" element={<p className="p-16 text-center">Page not found.</p>} />
        </Routes>
      </main>
      {!bare && <Footer />}
    </div>
  );
}

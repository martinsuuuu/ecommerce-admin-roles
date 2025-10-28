import { useState, useEffect } from 'react';
import { LittleMijaWebsite } from './components/LittleMijaWebsite';
import { LoginPage } from './components/LoginPage';
import { MasterAdminDashboard } from './components/MasterAdminDashboard';
import { SecondAdminDashboard } from './components/SecondAdminDashboard';
import { CustomerView } from './components/CustomerView';
import { projectId, publicAnonKey } from './utils/supabase/info';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [view, setView] = useState<'public' | 'login' | 'dashboard'>('public');
  const [cart, setCart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize server and check for stored user session on mount
    const initializeApp = async () => {
      try {
        // Call the init endpoint to create default users if they don't exist
        const initResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/init`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (initResponse.ok) {
          const initData = await initResponse.json();
          console.log('Server initialized:', initData.message);
        } else {
          console.error('Failed to initialize server:', await initResponse.text());
        }
      } catch (error) {
        console.error('Error initializing server:', error);
      }
      
      // Check for stored user session
      const storedUser = localStorage.getItem('littleMija_currentUser');
      const storedCart = localStorage.getItem('littleMija_shoppingCart');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          setView('dashboard');
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('littleMija_currentUser');
        }
      }
      
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart);
          setCart(parsedCart);
        } catch (error) {
          console.error('Error parsing stored cart:', error);
          localStorage.removeItem('littleMija_shoppingCart');
        }
      }
      
      setIsLoading(false);
    };
    
    initializeApp();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('littleMija_shoppingCart', JSON.stringify(cart));
    }
  }, [cart, isLoading]);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('littleMija_currentUser', JSON.stringify(user));
    setView('dashboard');
  };

  const handleLogout = () => {
    // Clear user session
    setCurrentUser(null);
    localStorage.removeItem('littleMija_currentUser');
    
    // Keep the cart for customers who might want to continue shopping
    // Only clear it if explicitly needed
    
    setView('public');
  };

  const handleSignupClick = () => {
    setView('login');
  };

  const handleBackToPublic = () => {
    setView('public');
  };

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.setItem('littleMija_shoppingCart', JSON.stringify([]));
  };

  const handleViewCart = () => {
    // If not logged in, prompt to login/signup
    if (!currentUser) {
      setView('login');
    } else if (currentUser.role === 'customer') {
      // Customer is already logged in, they'll see their cart in CustomerView
      setView('dashboard');
    }
  };

  // Show loading state while checking for stored session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#faf3f0] via-[#fef7f3] to-[#fff9f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#f8bbd0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#7d5a50] font-['Poppins',sans-serif]">Loading Little Mija...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, show dashboard regardless of view state
  if (currentUser) {
    if (currentUser.role === 'master') {
      return <MasterAdminDashboard user={currentUser} onLogout={handleLogout} />;
    } else if (currentUser.role === 'second') {
      return <SecondAdminDashboard user={currentUser} onLogout={handleLogout} />;
    } else if (currentUser.role === 'customer') {
      return (
        <CustomerView 
          user={currentUser} 
          onLogout={handleLogout}
          cart={cart}
          onUpdateCartQuantity={updateCartQuantity}
          onRemoveFromCart={removeFromCart}
          onClearCart={clearCart}
        />
      );
    }
  }

  // Login view
  if (view === 'login') {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        onBackToPublic={handleBackToPublic}
        cartItemCount={cart.length}
      />
    );
  }

  // Public website view (default)
  return (
    <LittleMijaWebsite 
      onSignupClick={handleSignupClick} 
      onLoginClick={() => setView('login')}
      cart={cart}
      onAddToCart={addToCart}
      onViewCart={handleViewCart}
      currentUser={currentUser}
      onLogout={handleLogout}
    />
  );
}
import { useState } from 'react';
import { ShoppingCart, Package, LogOut, Trash2, Plus, Minus, CreditCard, MapPin, Phone, Mail, User, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from 'figma:asset/086cf3cc9a736a513ded11d47e82ce484a90947a.png';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'master' | 'second' | 'customer';
};

type CustomerViewProps = {
  user: User;
  onLogout: () => void;
  cart: any[];
  onUpdateCartQuantity: (productId: number, quantity: number) => void;
  onRemoveFromCart: (productId: number) => void;
  onClearCart: () => void;
};

export function CustomerView({ user, onLogout, cart, onUpdateCartQuantity, onRemoveFromCart, onClearCart }: CustomerViewProps) {
  const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Checkout form state
  const [customerName, setCustomerName] = useState(user.name);
  const [customerEmail, setCustomerEmail] = useState(user.email);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [submitting, setSubmitting] = useState(false);

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!customerPhone || !customerAddress) {
      toast.error('Please fill in all delivery details');
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: cartTotal,
        paymentMethod,
        status: 'pending', // Customer orders start as pending
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      if (response.ok) {
        toast.success('Order placed successfully! 🎉');
        onClearCart();
        setCheckoutOpen(false);
        setActiveTab('orders');
        // Refresh orders
        fetchOrders();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('An error occurred during checkout');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/orders`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      // Filter orders by customer email
      const customerOrders = (data.orders || []).filter(
        (order: any) => order.customerEmail === user.email
      );
      setOrders(customerOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf3f0] via-[#fef7f3] to-[#fff9f5] font-['Poppins',sans-serif]">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b-2 border-[#d4a5a5]/20 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <img src={logoImage} alt="Little Mija" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-md" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-[#7d5a50]">Little Mija</h1>
                <p className="text-xs sm:text-sm text-[#a67c6d] hidden sm:block">My Shopping</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-xl bg-[#fff4e6] border-2 border-[#d4a5a5]/20">
                <div className="w-9 h-9 bg-gradient-to-br from-[#f8bbd0] to-[#ffc1e3] rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-[#7d5a50] text-sm">{user.name}</p>
                  <p className="text-xs text-[#a67c6d]">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="gap-2 border-2 border-[#d4a5a5]/40 text-[#7d5a50] hover:bg-red-50 hover:text-red-600 hover:border-red-300 rounded-xl text-xs sm:text-base"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-8">
          <TabsList className="bg-white/90 backdrop-blur-sm border-2 border-[#d4a5a5]/20 p-1 rounded-2xl shadow-lg">
            <TabsTrigger 
              value="cart" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#f8bbd0] data-[state=active]:to-[#ffc1e3] data-[state=active]:text-white rounded-xl px-6 py-2"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Shopping Cart {cart.length > 0 && `(${cart.length})`}
            </TabsTrigger>
            <TabsTrigger 
              value="orders"
              onClick={() => fetchOrders()}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#f8bbd0] data-[state=active]:to-[#ffc1e3] data-[state=active]:text-white rounded-xl px-6 py-2"
            >
              <Package className="w-4 h-4 mr-2" />
              My Orders
            </TabsTrigger>
          </TabsList>

          {/* Shopping Cart Tab */}
          <TabsContent value="cart" className="space-y-6">
            <Card className="border-2 border-[#d4a5a5]/20 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
              <CardHeader className="border-b-2 border-[#d4a5a5]/20">
                <CardTitle className="text-[#7d5a50]">Your Shopping Cart</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-[#d4a5a5] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[#7d5a50] mb-2">Your cart is empty</h3>
                    <p className="text-[#a67c6d] mb-6">Add some adorable baby clothes to get started!</p>
                    <Button 
                      onClick={onLogout}
                      className="bg-gradient-to-r from-[#f8bbd0] to-[#ffc1e3] hover:from-[#f48fb1] hover:to-[#f8bbd0] text-white rounded-full px-8"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Cart Items */}
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 rounded-2xl border-2 border-[#d4a5a5]/20 hover:border-[#f8bbd0]/50 transition-all">
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[#7d5a50] mb-1 line-clamp-2">{item.name}</h3>
                            <p className="text-lg font-bold text-[#f8bbd0] mb-2">₱{item.price}</p>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-2 bg-[#fff4e6] rounded-xl p-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 rounded-lg hover:bg-white"
                                  onClick={() => onUpdateCartQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="w-3 h-3 text-[#7d5a50]" />
                                </Button>
                                <span className="w-8 text-center font-medium text-[#7d5a50]">{item.quantity}</span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 rounded-lg hover:bg-white"
                                  onClick={() => onUpdateCartQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="w-3 h-3 text-[#7d5a50]" />
                                </Button>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => onRemoveFromCart(item.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Remove</span>
                              </Button>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 min-w-[100px]">
                            <p className="text-sm text-[#a67c6d] mb-1">Subtotal</p>
                            <p className="text-lg sm:text-xl font-bold text-[#7d5a50] whitespace-nowrap">₱{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cart Summary */}
                    <div className="bg-gradient-to-br from-[#fff4e6] to-[#fef7f3] rounded-2xl p-6 border-2 border-[#d4a5a5]/20">
                      <div className="space-y-3">
                        <div className="flex justify-between text-[#a67c6d]">
                          <span>Subtotal</span>
                          <span>₱{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[#a67c6d]">
                          <span>Shipping</span>
                          <span className="text-green-600">FREE</span>
                        </div>
                        <div className="h-px bg-[#d4a5a5]/30"></div>
                        <div className="flex justify-between text-xl font-bold">
                          <span className="text-[#7d5a50]">Total</span>
                          <span className="text-[#f8bbd0]">₱{cartTotal.toFixed(2)}</span>
                        </div>
                      </div>
                      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full mt-6 h-12 bg-gradient-to-r from-[#f8bbd0] to-[#ffc1e3] hover:from-[#f48fb1] hover:to-[#f8bbd0] text-white rounded-xl shadow-lg">
                            <CreditCard className="w-5 h-5 mr-2" />
                            Proceed to Checkout
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-white rounded-2xl border-2 border-[#d4a5a5]/30">
                          <DialogHeader>
                            <DialogTitle className="text-2xl text-[#7d5a50]">Checkout</DialogTitle>
                            <DialogDescription className="text-[#a67c6d]">
                              Complete your order details below
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 py-4">
                            {/* Delivery Information */}
                            <div className="space-y-4">
                              <h3 className="font-semibold text-[#7d5a50]">Delivery Information</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-[#7d5a50]">Full Name</Label>
                                  <Input
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="border-[#d4a5a5]/40 focus:border-[#f8bbd0] rounded-xl"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[#7d5a50]">Phone Number</Label>
                                  <Input
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="+63 912 345 6789"
                                    className="border-[#d4a5a5]/40 focus:border-[#f8bbd0] rounded-xl"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[#7d5a50]">Email</Label>
                                <Input
                                  value={customerEmail}
                                  onChange={(e) => setCustomerEmail(e.target.value)}
                                  className="border-[#d4a5a5]/40 focus:border-[#f8bbd0] rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[#7d5a50]">Delivery Address</Label>
                                <Textarea
                                  value={customerAddress}
                                  onChange={(e) => setCustomerAddress(e.target.value)}
                                  placeholder="Street, Barangay, City, Province"
                                  className="border-[#d4a5a5]/40 focus:border-[#f8bbd0] rounded-xl min-h-[80px]"
                                />
                              </div>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-4">
                              <h3 className="font-semibold text-[#7d5a50]">Payment Method</h3>
                              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger className="border-[#d4a5a5]/40 focus:border-[#f8bbd0] rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="gcash">GCash</SelectItem>
                                  <SelectItem value="bank">Bank Transfer</SelectItem>
                                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-[#fff4e6]/50 rounded-2xl p-4 border border-[#d4a5a5]/20">
                              <h3 className="font-semibold text-[#7d5a50] mb-3">Order Summary</h3>
                              <div className="space-y-2 text-sm">
                                {cart.map((item) => (
                                  <div key={item.id} className="flex justify-between text-[#a67c6d]">
                                    <span>{item.name} x{item.quantity}</span>
                                    <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                                <div className="h-px bg-[#d4a5a5]/30 my-2"></div>
                                <div className="flex justify-between font-semibold">
                                  <span className="text-[#7d5a50]">Total</span>
                                  <span className="text-[#f8bbd0]">₱{cartTotal.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            <Button
                              onClick={handleCheckout}
                              disabled={submitting}
                              className="w-full h-12 bg-gradient-to-r from-[#f8bbd0] to-[#ffc1e3] hover:from-[#f48fb1] hover:to-[#f8bbd0] text-white rounded-xl shadow-lg"
                            >
                              {submitting ? 'Placing Order...' : 'Place Order'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-2 border-[#d4a5a5]/20 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
              <CardHeader className="border-b-2 border-[#d4a5a5]/20">
                <CardTitle className="text-[#7d5a50]">My Orders</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-[#d4a5a5] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[#7d5a50] mb-2">No orders yet</h3>
                    <p className="text-[#a67c6d]">Your order history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="p-6 rounded-2xl border-2 border-[#d4a5a5]/20 hover:border-[#f8bbd0]/50 transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-sm text-[#a67c6d] mb-1">Order ID: {order.id.slice(0, 8)}</p>
                            <p className="text-xs text-[#a67c6d]">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Badge 
                            className={
                              order.status === 'shipped' 
                                ? 'bg-gradient-to-r from-[#ce93d8] to-[#ba68c8] text-white'
                                : order.status === 'fully_paid'
                                ? 'bg-[#e3f2fd] text-[#81d4fa]'
                                : 'bg-[#fff4e6] text-[#ff9a8b]'
                            }
                          >
                            {order.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="bg-[#fff4e6]/50 rounded-xl p-4 mb-4">
                          <div className="space-y-2">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-[#a67c6d]">{item.productName} x{item.quantity}</span>
                                <span className="font-medium text-[#7d5a50]">₱{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="h-px bg-[#d4a5a5]/30 my-2"></div>
                            <div className="flex justify-between font-semibold">
                              <span className="text-[#7d5a50]">Total</span>
                              <span className="text-[#f8bbd0]">₱{order.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-[#a67c6d]">
                          <p>📍 {order.customerAddress}</p>
                          <p>📞 {order.customerPhone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
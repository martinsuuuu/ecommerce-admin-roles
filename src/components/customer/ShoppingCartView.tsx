import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Trash2, CreditCard, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

type CartItem = {
  productId: string;
  productName: string;
  productCategory: 'pasabuy' | 'onhand' | 'sale';
  price: number;
  quantity: number;
  image: string;
};

type ShoppingCartViewProps = {
  userId: string;
  onCartUpdate: (count: number) => void;
};

export function ShoppingCartView({ userId, onCartUpdate }: ShoppingCartViewProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'bank' | 'credit'>('gcash');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  useEffect(() => {
    fetchCart();
  }, [userId]);

  const fetchCart = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/cart/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
        onCartUpdate(data.items?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/cart`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ userId, productId, quantity }),
        }
      );

      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/cart/${userId}/${productId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Item removed from cart');
        fetchCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = async () => {
    if (!customerName || !customerEmail || !customerPhone || !customerAddress) {
      toast.error('Please fill in all customer details');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Order placed successfully!');
        setCheckoutDialogOpen(false);
        fetchCart();
        
        // Show deposit deadline if applicable
        if (data.depositDeadline) {
          setTimeout(() => {
            toast.info(`Deposit must be paid within 24 hours (by ${new Date(data.depositDeadline).toLocaleString()})`);
          }, 1000);
        }
      } else {
        toast.error(data.error || 'Checkout failed');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('An error occurred');
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasPasabuyItems = cartItems.some((item) => item.productCategory === 'pasabuy');
  const depositAmount = hasPasabuyItems ? totalAmount * 0.3 : totalAmount; // 30% deposit for pasabuy

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">Your cart is empty</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shopping Cart ({cartItems.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3>{item.productName}</h3>
                    <Badge className="text-xs">
                      {item.productCategory.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-green-600 mt-1">
                    ₱{item.price.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.productId, parseInt(e.target.value))
                    }
                    className="w-20"
                  />
                  <div className="text-gray-900 w-24 text-right">
                    ₱{(item.price * item.quantity).toLocaleString()}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPasabuyItems && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-yellow-800">
                    Your cart contains Pasabuy (pre-order) items. You'll need to pay a 30%
                    deposit within 24 hours.
                  </p>
                  <p className="text-yellow-800 mt-2">
                    Once items arrive, you can pay the remaining balance.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>₱{totalAmount.toLocaleString()}</span>
            </div>
            {hasPasabuyItems && (
              <>
                <div className="flex justify-between text-yellow-600">
                  <span>Deposit Required (30%)</span>
                  <span>₱{depositAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Remaining Balance</span>
                  <span>₱{(totalAmount - depositAmount).toLocaleString()}</span>
                </div>
              </>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="text-gray-900">{hasPasabuyItems ? 'Deposit Due Now' : 'Total'}</span>
                <span className="text-green-600">
                  ₱{depositAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <Button className="w-full" onClick={() => setCheckoutDialogOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Proceed to Checkout
          </Button>
        </CardContent>
      </Card>

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>Enter your details to complete the checkout process.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Shipping Address</Label>
              <Input
                id="address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount Due:</span>
                <span className="text-green-600">
                  ₱{depositAmount.toLocaleString()}
                </span>
              </div>
              <p className="text-gray-600">
                {hasPasabuyItems
                  ? 'This is a 30% deposit. You must pay within 24 hours or your order will be cancelled.'
                  : 'Full payment for on-hand items.'}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCheckoutDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCheckout}>
                Confirm Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
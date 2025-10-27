import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Clock, Package, Truck, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

type Order = {
  id: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  status: 'pending' | 'ready_for_payment' | 'deposit_paid' | 'fully_paid' | 'shipped' | 'cancelled';
  depositPaid: boolean;
  fullPaid: boolean;
  depositDeadline?: string;
  createdAt: string;
  totalAmount: number;
  depositAmount: number;
  remainingBalance: number;
  paymentMethod?: string;
  shippingMethod?: string;
};

type MyOrdersProps = {
  userId: string;
};

export function MyOrders({ userId }: MyOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'bank' | 'credit'>('gcash');

  useEffect(() => {
    fetchOrders();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/customer-orders/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (orderId: string, isFull: boolean) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            orderId,
            paymentMethod,
            isFull,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Payment successful!');
        setPaymentDialogOpen(false);
        fetchOrders();
      } else {
        toast.error(data.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('An error occurred');
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      pending: <Clock className="h-5 w-5 text-yellow-600" />,
      ready_for_payment: <CreditCard className="h-5 w-5 text-blue-600" />,
      deposit_paid: <Package className="h-5 w-5 text-purple-600" />,
      fully_paid: <Package className="h-5 w-5 text-green-600" />,
      shipped: <Truck className="h-5 w-5 text-gray-600" />,
      cancelled: <XCircle className="h-5 w-5 text-red-600" />,
    };
    return icons[status] || null;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      ready_for_payment: 'bg-blue-100 text-blue-800',
      deposit_paid: 'bg-purple-100 text-purple-800',
      fully_paid: 'bg-green-100 text-green-800',
      shipped: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={colors[status] || ''}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  const getStatusMessage = (order: Order) => {
    switch (order.status) {
      case 'pending':
        return 'Your order is pending. Items are expected to arrive soon.';
      case 'ready_for_payment':
        return 'Items have arrived! You can now pay the full amount to complete your order.';
      case 'deposit_paid':
        return 'Deposit paid. Waiting for items to arrive.';
      case 'fully_paid':
        return 'Payment complete! Your order is being prepared for shipping.';
      case 'shipped':
        return `Order shipped via ${order.shippingMethod || 'courier'}!`;
      case 'cancelled':
        return 'Order cancelled. Stock has been returned to inventory.';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No orders yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <div>
                  <CardTitle>Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                  <p className="text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{getStatusMessage(order)}</p>
            </div>

            <div>
              <h4 className="text-gray-900 mb-2">Items</h4>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-gray-600">
                    <span>
                      {item.productName} x{item.quantity}
                    </span>
                    <span>₱{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span>₱{order.totalAmount.toLocaleString()}</span>
              </div>
              {!order.fullPaid && (
                <>
                  {order.depositPaid ? (
                    <div className="flex justify-between text-green-600">
                      <span>Deposit Paid</span>
                      <span>₱{order.depositAmount.toLocaleString()}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-yellow-600">
                      <span>Deposit Required</span>
                      <span>₱{order.depositAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Remaining Balance</span>
                    <span>₱{order.remainingBalance.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>

            {order.depositDeadline && !order.depositPaid && order.status !== 'cancelled' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">
                  <strong>Deposit Deadline:</strong>{' '}
                  {new Date(order.depositDeadline).toLocaleString()}
                </p>
                <p className="text-red-700 mt-1">
                  Order will be automatically cancelled if not paid by deadline.
                </p>
              </div>
            )}

            {order.status === 'ready_for_payment' && (
              <Button
                className="w-full"
                onClick={() => {
                  setSelectedOrder(order);
                  setPaymentDialogOpen(true);
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Pay Full Amount (₱{order.remainingBalance.toLocaleString()})
              </Button>
            )}

            {order.status === 'shipped' && (
              <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800">Order completed and delivered!</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Please select a payment method and confirm to complete your payment.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Amount Due:</span>
                  <span className="text-green-600">
                    ₱{selectedOrder.remainingBalance.toLocaleString()}
                  </span>
                </div>
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

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPaymentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handlePayment(selectedOrder.id, true)}
                >
                  Confirm Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
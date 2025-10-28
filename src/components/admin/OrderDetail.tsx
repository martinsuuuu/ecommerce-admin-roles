import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Package, Truck, CheckCircle, XCircle, CheckSquare, DollarSign, Coins, ArrowLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  status: 'pending' | 'ready_for_payment' | 'deposit_paid' | 'fully_paid' | 'shipped' | 'cancelled' | 'completed';
  depositPaid: boolean;
  fullPaid: boolean;
  depositDeadline?: string;
  shippingMethod?: 'lalamove' | 'shopee';
  createdAt: string;
  totalAmount: number;
  depositAmount: number;
};

type OrderDetailProps = {
  orderId: string;
  userRole: 'master' | 'second';
  onBack: () => void;
};

export function OrderDetail({ orderId, userRole, onBack }: OrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [depositConfirmOpen, setDepositConfirmOpen] = useState(false);
  const [fullPaymentConfirmOpen, setFullPaymentConfirmOpen] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status: string, shippingMethod?: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/orders/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ status, shippingMethod }),
        }
      );

      if (response.ok) {
        toast.success('Order status updated!');
        fetchOrder();
        if (status === 'shipped') {
          setDialogOpen(false);
        }
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('An error occurred');
    }
  };

  const markReadyForPayment = () => updateOrderStatus('ready_for_payment');
  const handleCancelOrder = () => {
    updateOrderStatus('cancelled');
    setCancelDialogOpen(false);
  };
  const handleCompleteOrder = () => {
    updateOrderStatus('completed');
    setCompleteDialogOpen(false);
  };
  const handleConfirmDeposit = () => {
    updateOrderStatus('deposit_paid');
    setDepositConfirmOpen(false);
  };
  const handleConfirmFullPayment = () => {
    updateOrderStatus('fully_paid');
    setFullPaymentConfirmOpen(false);
  };
  const markAsShipped = (shippingMethod: string) => updateOrderStatus('shipped', shippingMethod);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      ready_for_payment: 'bg-blue-100 text-blue-800',
      deposit_paid: 'bg-purple-100 text-purple-800',
      fully_paid: 'bg-green-100 text-green-800',
      shipped: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={colors[status] || ''}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f8bbd0]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-[#a67c6d]">Order not found</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-[#7d5a50] hover:bg-[#fff4e6] mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </Button>

      {/* Order Details Card */}
      <Card className="border-2 border-[#d4a5a5]/20 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
        <CardHeader className="border-b-2 border-[#d4a5a5]/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-[#7d5a50]">Order Details</CardTitle>
              <p className="text-sm text-[#a67c6d] mt-1">Order ID: {order.id.slice(0, 8)}</p>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-[#fff4e6]/50 rounded-2xl p-4 border border-[#d4a5a5]/20">
            <h3 className="font-semibold text-[#7d5a50] mb-3">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#a67c6d]">Name:</span>
                <span className="font-medium text-[#7d5a50]">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a67c6d]">Email:</span>
                <span className="font-medium text-[#7d5a50]">{order.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a67c6d]">Date:</span>
                <span className="font-medium text-[#7d5a50]">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-[#fff4e6]/50 rounded-2xl p-4 border border-[#d4a5a5]/20">
            <h3 className="font-semibold text-[#7d5a50] mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start pb-3 border-b border-[#d4a5a5]/20 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-[#7d5a50]">{item.productName}</p>
                    <p className="text-sm text-[#a67c6d]">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-[#7d5a50]">₱{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-[#fff4e6]/50 rounded-2xl p-4 border border-[#d4a5a5]/20">
            <h3 className="font-semibold text-[#7d5a50] mb-3">Payment Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#a67c6d]">Total Amount:</span>
                <span className="font-semibold text-[#7d5a50]">₱{order.totalAmount.toLocaleString()}</span>
              </div>
              {order.depositAmount && order.depositAmount > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#a67c6d]">Deposit Amount:</span>
                    <span className="font-medium text-[#7d5a50]">₱{order.depositAmount.toLocaleString()}</span>
                  </div>
                  {order.depositPaid && !order.fullPaid && (
                    <div className="flex justify-between">
                      <span className="text-[#a67c6d]">Remaining Balance:</span>
                      <span className="font-medium text-[#7d5a50]">
                        ₱{(order.totalAmount - order.depositAmount).toLocaleString()}
                      </span>
                    </div>
                  )}
                </>
              )}
              {order.shippingMethod && (
                <div className="flex justify-between">
                  <span className="text-[#a67c6d]">Shipping Method:</span>
                  <span className="font-medium text-[#7d5a50]">{order.shippingMethod}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {userRole === 'master' && order.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={markReadyForPayment}
                  className="flex-1 sm:flex-none"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Mark Ready
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setCancelDialogOpen(true)}
                  className="flex-1 sm:flex-none"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
            {userRole === 'master' && order.status === 'ready_for_payment' && (
              <>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 flex-1 sm:flex-none"
                  onClick={() => setDepositConfirmOpen(true)}
                >
                  <Coins className="mr-2 h-4 w-4" />
                  Confirm Deposit
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                  onClick={() => setFullPaymentConfirmOpen(true)}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Confirm Full Payment
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setCancelDialogOpen(true)}
                  className="flex-1 sm:flex-none"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
            {userRole === 'master' && order.status === 'deposit_paid' && (
              <>
                <Button
                  className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                  onClick={() => setFullPaymentConfirmOpen(true)}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Confirm Remaining Payment
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setCancelDialogOpen(true)}
                  className="flex-1 sm:flex-none"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
            {order.status === 'fully_paid' && (
              <>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="bg-gradient-to-r from-[#f8bbd0] to-[#ffc1e3] hover:from-[#f48fb1] hover:to-[#f8bbd0] text-white flex-1 sm:flex-none"
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Ship Order
                </Button>
                {userRole === 'master' && (
                  <Button
                    variant="destructive"
                    onClick={() => setCancelDialogOpen(true)}
                    className="flex-1 sm:flex-none"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </>
            )}
            {order.status === 'shipped' && userRole === 'master' && (
              <Button
                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                onClick={() => setCompleteDialogOpen(true)}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                Complete Order
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Mark Order as Shipped</DialogTitle>
            <DialogDescription>Select a shipping method to mark this order as shipped.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Shipping Method</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                  onClick={() => markAsShipped('lalamove')}
                >
                  <Truck className="h-5 w-5" />
                  Lalamove
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                  onClick={() => markAsShipped('shopee')}
                >
                  <Package className="h-5 w-5" />
                  Shopee Checkout
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Alert Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Order Alert Dialog */}
      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Mark this order as completed? This confirms successful delivery to the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not Yet</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompleteOrder}
              className="bg-green-600 hover:bg-green-700"
            >
              Yes, Mark as Completed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Deposit Payment Dialog */}
      <AlertDialog open={depositConfirmOpen} onOpenChange={setDepositConfirmOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deposit Payment Received</AlertDialogTitle>
            <AlertDialogDescription>
              Have you received the deposit payment of ₱{(order.depositAmount || 0).toLocaleString()}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not Yet</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeposit}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Yes, Deposit Received
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Full Payment Dialog */}
      <AlertDialog open={fullPaymentConfirmOpen} onOpenChange={setFullPaymentConfirmOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Full Payment Received</AlertDialogTitle>
            <AlertDialogDescription>
              Have you received the full payment of ₱{order.totalAmount?.toLocaleString()}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not Yet</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmFullPayment}
              className="bg-green-600 hover:bg-green-700"
            >
              Yes, Full Payment Received
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

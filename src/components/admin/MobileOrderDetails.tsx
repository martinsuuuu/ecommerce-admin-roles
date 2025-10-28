import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, CheckSquare, DollarSign, Coins } from 'lucide-react';
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
  customerPhone: string;
  customerAddress: string;
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

type MobileOrderDetailsProps = {
  order: Order;
  userRole: 'master' | 'second';
  onBack: () => void;
  onUpdateOrderStatus: (orderId: string, status: string, shippingMethod?: string) => Promise<void>;
};

export function MobileOrderDetails({ order, userRole, onBack, onUpdateOrderStatus }: MobileOrderDetailsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [depositConfirmOpen, setDepositConfirmOpen] = useState(false);
  const [fullPaymentConfirmOpen, setFullPaymentConfirmOpen] = useState(false);

  const markAsShipped = async (shippingMethod: string) => {
    try {
      await onUpdateOrderStatus(order.id, 'shipped', shippingMethod);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error marking as shipped:', error);
    }
  };

  const handleCancelOrder = async () => {
    try {
      await onUpdateOrderStatus(order.id, 'cancelled');
      setCancelDialogOpen(false);
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const handleCompleteOrder = async () => {
    try {
      await onUpdateOrderStatus(order.id, 'completed');
      setCompleteDialogOpen(false);
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const handleConfirmDeposit = async () => {
    try {
      await onUpdateOrderStatus(order.id, 'deposit_paid');
      setDepositConfirmOpen(false);
    } catch (error) {
      console.error('Error confirming deposit:', error);
    }
  };

  const handleConfirmFullPayment = async () => {
    try {
      await onUpdateOrderStatus(order.id, 'fully_paid');
      setFullPaymentConfirmOpen(false);
    } catch (error) {
      console.error('Error confirming full payment:', error);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf3f0] via-[#fef7f3] to-[#fff9f5] font-['Poppins',sans-serif]">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b-2 border-[#d4a5a5]/20 sticky top-0 z-30 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-[#7d5a50] hover:bg-[#fff4e6]"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-[#7d5a50]">Order Details</h1>
              <p className="text-xs text-[#a67c6d]">#{order.id.slice(0, 8)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 space-y-4">
        {/* Order Status */}
        <Card className="border-2 border-[#d4a5a5]/20 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a67c6d] mb-1">Status</p>
                {getStatusBadge(order.status)}
              </div>
              <div className="text-right">
                <p className="text-sm text-[#a67c6d] mb-1">Order Date</p>
                <p className="text-sm font-medium text-[#7d5a50]">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card className="border-2 border-[#d4a5a5]/20 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#7d5a50] text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div>
              <p className="text-sm text-[#a67c6d] mb-1">Name</p>
              <p className="font-semibold text-[#7d5a50]">{order.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-[#a67c6d] mb-1">Email</p>
              <p className="text-[#7d5a50]">{order.customerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-[#a67c6d] mb-1">Phone</p>
              <p className="text-[#7d5a50]">{order.customerPhone}</p>
            </div>
            <div>
              <p className="text-sm text-[#a67c6d] mb-1">Address</p>
              <p className="text-[#7d5a50]">{order.customerAddress}</p>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="border-2 border-[#d4a5a5]/20 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#7d5a50] text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-[#fff4e6]/50 rounded-xl border border-[#d4a5a5]/20">
                <div className="flex-1">
                  <p className="font-medium text-[#7d5a50]">{item.productName}</p>
                  <p className="text-sm text-[#a67c6d]">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#7d5a50]">₱{(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-xs text-[#a67c6d]">₱{item.price} each</p>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t-2 border-[#d4a5a5]/20">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-[#7d5a50]">Total Amount</span>
                <span className="text-xl font-bold text-[#f8bbd0]">₱{order.totalAmount.toLocaleString()}</span>
              </div>
              {order.depositPaid && !order.fullPaid && order.depositAmount && (
                <div className="mt-2 text-sm text-[#a67c6d]">
                  <p>Deposit Paid: ₱{order.depositAmount.toLocaleString()}</p>
                  <p>Remaining: ₱{(order.totalAmount - order.depositAmount).toLocaleString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="border-2 border-[#d4a5a5]/20 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#7d5a50] text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {userRole === 'master' && order.status === 'pending' && (
              <>
                <Button
                  className="w-full bg-gradient-to-r from-[#f8bbd0] to-[#ffc1e3] hover:from-[#f48fb1] hover:to-[#f8bbd0] text-white rounded-xl"
                  onClick={() => onUpdateOrderStatus(order.id, 'ready_for_payment')}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Mark Ready for Payment
                </Button>
                <Button
                  variant="destructive"
                  className="w-full rounded-xl"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Order
                </Button>
              </>
            )}
            {userRole === 'master' && order.status === 'ready_for_payment' && (
              <>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                  onClick={() => setDepositConfirmOpen(true)}
                >
                  <Coins className="mr-2 h-4 w-4" />
                  Confirm Deposit Payment
                </Button>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
                  onClick={() => setFullPaymentConfirmOpen(true)}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Confirm Full Payment
                </Button>
                <Button
                  variant="destructive"
                  className="w-full rounded-xl"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Order
                </Button>
              </>
            )}
            {userRole === 'master' && order.status === 'deposit_paid' && (
              <>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
                  onClick={() => setFullPaymentConfirmOpen(true)}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Confirm Remaining Payment
                </Button>
                <Button
                  variant="destructive"
                  className="w-full rounded-xl"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Order
                </Button>
              </>
            )}
            {order.status === 'fully_paid' && (
              <>
                <Button
                  className="w-full bg-gradient-to-r from-[#f8bbd0] to-[#ffc1e3] hover:from-[#f48fb1] hover:to-[#f8bbd0] text-white rounded-xl"
                  onClick={() => setDialogOpen(true)}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Ship Order
                </Button>
                {userRole === 'master' && (
                  <Button
                    variant="destructive"
                    className="w-full rounded-xl"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Order
                  </Button>
                )}
              </>
            )}
            {order.status === 'shipped' && (
              <>
                <div className="w-full p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center">
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Shipped via {order.shippingMethod}
                  </Badge>
                </div>
                {userRole === 'master' && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
                    onClick={() => setCompleteDialogOpen(true)}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Complete Order
                  </Button>
                )}
              </>
            )}
            {order.status === 'completed' && (
              <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
                <Badge variant="outline" className="text-gray-600">
                  <CheckSquare className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              </div>
            )}
            {order.status === 'cancelled' && (
              <div className="w-full p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center">
                <Badge variant="outline" className="text-red-600">
                  <XCircle className="mr-1 h-3 w-3" />
                  Cancelled
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Shipping Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Select Shipping Method</DialogTitle>
            <DialogDescription>Choose how this order will be shipped.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-16 flex flex-col gap-2"
              onClick={() => markAsShipped('lalamove')}
            >
              <Truck className="h-5 w-5" />
              Lalamove
            </Button>
            <Button
              variant="outline"
              className="w-full h-16 flex flex-col gap-2"
              onClick={() => markAsShipped('shopee')}
            >
              <Package className="h-5 w-5" />
              Shopee Checkout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Alert Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="max-w-sm mx-auto">
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
        <AlertDialogContent className="max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Mark this order as completed? This confirms successful delivery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not Yet</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompleteOrder}
              className="bg-green-600 hover:bg-green-700"
            >
              Yes, Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Deposit Payment Dialog */}
      <AlertDialog open={depositConfirmOpen} onOpenChange={setDepositConfirmOpen}>
        <AlertDialogContent className="max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deposit Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Have you received the deposit payment for this order?
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
        <AlertDialogContent className="max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Full Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Have you received the full payment for this order?
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

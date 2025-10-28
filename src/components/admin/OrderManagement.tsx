import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Package, Truck, CheckCircle, XCircle, CheckSquare, DollarSign, Coins } from 'lucide-react';
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
import { MobileOrderDetails } from './MobileOrderDetails';

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

type OrderManagementProps = {
  userRole: 'master' | 'second';
};

export function OrderManagement({ userRole }: OrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [depositConfirmOpen, setDepositConfirmOpen] = useState(false);
  const [fullPaymentConfirmOpen, setFullPaymentConfirmOpen] = useState(false);
  const [orderToAction, setOrderToAction] = useState<Order | null>(null);
  const [mobileOrderDetailsOpen, setMobileOrderDetailsOpen] = useState(false);
  const [selectedOrderForMobile, setSelectedOrderForMobile] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [userRole]);

  const fetchOrders = async () => {
    try {
      const url = userRole === 'second'
        ? `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/orders?filter=ready_to_ship`
        : `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/orders`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

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

  const updateOrderStatus = async (orderId: string, status: string, shippingMethod?: string) => {
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
        fetchOrders();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('An error occurred');
    }
  };

  const markReadyForPayment = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'ready_for_payment');
    } catch (error) {
      console.error('Error marking ready for payment:', error);
    }
  };

  const markAsShipped = async (orderId: string, shippingMethod: string) => {
    try {
      await updateOrderStatus(orderId, 'shipped', shippingMethod);
      setDialogOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error marking as shipped:', error);
    }
  };

  const handleCancelOrder = async () => {
    if (orderToAction) {
      try {
        await updateOrderStatus(orderToAction.id, 'cancelled');
        setCancelDialogOpen(false);
        setOrderToAction(null);
      } catch (error) {
        console.error('Error cancelling order:', error);
      }
    }
  };

  const handleCompleteOrder = async () => {
    if (orderToAction) {
      try {
        await updateOrderStatus(orderToAction.id, 'completed');
        setCompleteDialogOpen(false);
        setOrderToAction(null);
      } catch (error) {
        console.error('Error completing order:', error);
      }
    }
  };

  const handleConfirmDeposit = async () => {
    if (orderToAction) {
      try {
        await updateOrderStatus(orderToAction.id, 'deposit_paid');
        setDepositConfirmOpen(false);
        setOrderToAction(null);
      } catch (error) {
        console.error('Error confirming deposit:', error);
      }
    }
  };

  const handleConfirmFullPayment = async () => {
    if (orderToAction) {
      try {
        await updateOrderStatus(orderToAction.id, 'fully_paid');
        setFullPaymentConfirmOpen(false);
        setOrderToAction(null);
      } catch (error) {
        console.error('Error confirming full payment:', error);
      }
    }
  };

  const handleMobileOrderClick = (order: Order) => {
    setSelectedOrderForMobile(order);
    setMobileOrderDetailsOpen(true);
  };

  const handleBackFromMobileDetails = () => {
    setMobileOrderDetailsOpen(false);
    setSelectedOrderForMobile(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {userRole === 'master' && (
        <div>
          <h2 className="text-gray-900">Order Management</h2>
          <p className="text-gray-600">View and manage all customer orders</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {userRole === 'second' ? 'Orders Ready to Ship' : `All Orders (${orders.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      {userRole === 'second'
                        ? 'No orders ready to ship at the moment.'
                        : 'No orders found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-gray-600">
                        {order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{order.customerName}</div>
                          <div className="text-gray-500">{order.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-gray-600">
                              {item.productName} x{item.quantity}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>₱{order.totalAmount.toLocaleString()}</div>
                          {order.depositPaid && !order.fullPaid && order.depositAmount && (
                            <div className="text-gray-500">
                              Deposit: ₱{order.depositAmount.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="w-[250px]">
                        <div className="flex gap-2 flex-wrap">
                          {userRole === 'master' && order.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markReadyForPayment(order.id)}
                                className="whitespace-nowrap"
                              >
                                <Package className="mr-1 h-3 w-3" />
                                Mark Ready
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setOrderToAction(order);
                                  setCancelDialogOpen(true);
                                }}
                                className="whitespace-nowrap"
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {userRole === 'master' && order.status === 'ready_for_payment' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
                                onClick={() => {
                                  setOrderToAction(order);
                                  setDepositConfirmOpen(true);
                                }}
                              >
                                <Coins className="mr-1 h-3 w-3" />
                                Confirm Deposit
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                                onClick={() => {
                                  setOrderToAction(order);
                                  setFullPaymentConfirmOpen(true);
                                }}
                              >
                                <DollarSign className="mr-1 h-3 w-3" />
                                Confirm Full Payment
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setOrderToAction(order);
                                  setCancelDialogOpen(true);
                                }}
                                className="whitespace-nowrap"
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {userRole === 'master' && order.status === 'deposit_paid' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                                onClick={() => {
                                  setOrderToAction(order);
                                  setFullPaymentConfirmOpen(true);
                                }}
                              >
                                <DollarSign className="mr-1 h-3 w-3" />
                                Confirm Remaining Payment
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setOrderToAction(order);
                                  setCancelDialogOpen(true);
                                }}
                                className="whitespace-nowrap"
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {order.status === 'fully_paid' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setDialogOpen(true);
                                }}
                                className="whitespace-nowrap"
                              >
                                <Truck className="mr-1 h-3 w-3" />
                                Ship Order
                              </Button>
                              {userRole === 'master' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setOrderToAction(order);
                                    setCancelDialogOpen(true);
                                  }}
                                  className="whitespace-nowrap"
                                >
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Cancel
                                </Button>
                              )}
                            </>
                          )}
                          {order.status === 'shipped' && (
                            <>
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Shipped via {order.shippingMethod}
                              </Badge>
                              {userRole === 'master' && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                                  onClick={() => {
                                    setOrderToAction(order);
                                    setCompleteDialogOpen(true);
                                  }}
                                >
                                  <CheckSquare className="mr-1 h-3 w-3" />
                                  Complete
                                </Button>
                              )}
                            </>
                          )}
                          {order.status === 'completed' && (
                            <Badge variant="outline" className="text-gray-600">
                              <CheckSquare className="mr-1 h-3 w-3" />
                              Completed
                            </Badge>
                          )}
                          {order.status === 'cancelled' && (
                            <Badge variant="outline" className="text-red-600">
                              <XCircle className="mr-1 h-3 w-3" />
                              Cancelled
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {userRole === 'second'
                  ? 'No orders ready to ship at the moment.'
                  : 'No orders found.'}
              </div>
            ) : (
              orders.map((order) => (
                <Card 
                  key={order.id} 
                  className="border-2 border-gray-200 cursor-pointer hover:border-[#f8bbd0] hover:shadow-lg transition-all"
                  onClick={() => handleMobileOrderClick(order)}
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm text-gray-600">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-1 pb-2 border-b">
                      <p className="font-semibold text-gray-900">{order.customerName}</p>
                      <p className="text-sm text-gray-600">{order.customerEmail}</p>
                    </div>

                    {/* Click to view details */}
                    <div className="text-center py-2">
                      <p className="text-xs text-[#a67c6d]">Tap to view full details</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Order Details */}
      {mobileOrderDetailsOpen && selectedOrderForMobile && (
        <MobileOrderDetails
          order={selectedOrderForMobile}
          userRole={userRole}
          onBack={handleBackFromMobileDetails}
          onUpdateOrderStatus={updateOrderStatus}
        />
      )}

      {/* Shipping Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setSelectedOrder(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Order as Shipped</DialogTitle>
            <DialogDescription>Select a shipping method to mark this order as shipped.</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <Label>Order Details</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg space-y-2">
                  <div>
                    <span className="text-gray-600">Customer:</span>{' '}
                    {selectedOrder.customerName}
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span> ₱
                    {selectedOrder.totalAmount.toLocaleString()}
                  </div>
                  <div>
                    <span className="text-gray-600">Items:</span>
                    <ul className="mt-1 ml-4 list-disc">
                      {selectedOrder.items.map((item, idx) => (
                        <li key={idx}>
                          {item.productName} x{item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Shipping Method</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => markAsShipped(selectedOrder.id, 'lalamove')}
                  >
                    <Truck className="h-5 w-5" />
                    Lalamove
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => markAsShipped(selectedOrder.id, 'shopee')}
                  >
                    <Package className="h-5 w-5" />
                    Shopee Checkout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Order Alert Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {orderToAction && (
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <div className="text-gray-900">
                <strong>Order ID:</strong> {orderToAction.id.slice(0, 8)}
              </div>
              <div className="text-gray-900">
                <strong>Customer:</strong> {orderToAction.customerName}
              </div>
              <div className="text-gray-900">
                <strong>Amount:</strong> ₱{orderToAction.totalAmount.toLocaleString()}
              </div>
            </div>
          )}
          <p className="text-sm text-red-600">
            This action cannot be undone. The customer will be notified of the cancellation.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToAction(null)}>No, Keep Order</AlertDialogCancel>
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
              Mark this order as completed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {orderToAction && (
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <div className="text-gray-900">
                <strong>Order ID:</strong> {orderToAction.id.slice(0, 8)}
              </div>
              <div className="text-gray-900">
                <strong>Customer:</strong> {orderToAction.customerName}
              </div>
              <div className="text-gray-900">
                <strong>Amount:</strong> ₱{orderToAction.totalAmount.toLocaleString()}
              </div>
              <div className="text-gray-900">
                <strong>Shipping:</strong> {orderToAction.shippingMethod}
              </div>
            </div>
          )}
          <p className="text-sm text-green-600">
            This confirms that the order has been successfully delivered to the customer.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToAction(null)}>Not Yet</AlertDialogCancel>
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
              Have you received the deposit payment for this order?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {orderToAction && (
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <div className="text-gray-900">
                <strong>Order ID:</strong> {orderToAction.id.slice(0, 8)}
              </div>
              <div className="text-gray-900">
                <strong>Customer:</strong> {orderToAction.customerName}
              </div>
              <div className="text-gray-900">
                <strong>Total Amount:</strong> ₱{orderToAction.totalAmount?.toLocaleString() || '0'}
              </div>
              <div className="text-gray-900">
                <strong>Deposit Amount:</strong> ₱{(orderToAction.depositAmount || 0).toLocaleString()}
              </div>
              <div className="text-gray-900">
                <strong>Remaining:</strong> ₱{((orderToAction.totalAmount || 0) - (orderToAction.depositAmount || 0)).toLocaleString()}
              </div>
            </div>
          )}
          <p className="text-sm text-purple-600">
            This will mark the deposit as paid. Customer will need to pay the remaining amount.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToAction(null)}>Not Yet</AlertDialogCancel>
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
              Have you received the full payment for this order?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {orderToAction && (
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <div className="text-gray-900">
                <strong>Order ID:</strong> {orderToAction.id.slice(0, 8)}
              </div>
              <div className="text-gray-900">
                <strong>Customer:</strong> {orderToAction.customerName}
              </div>
              <div className="text-gray-900">
                <strong>Total Amount:</strong> ₱{orderToAction.totalAmount?.toLocaleString() || '0'}
              </div>
              {orderToAction.status === 'deposit_paid' && (
                <>
                  <div className="text-gray-900">
                    <strong>Deposit Paid:</strong> ₱{(orderToAction.depositAmount || 0).toLocaleString()}
                  </div>
                  <div className="text-gray-900">
                    <strong>Remaining Amount:</strong> ₱{((orderToAction.totalAmount || 0) - (orderToAction.depositAmount || 0)).toLocaleString()}
                  </div>
                </>
              )}
            </div>
          )}
          <p className="text-sm text-green-600">
            This will mark the order as fully paid and ready for shipping.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToAction(null)}>Not Yet</AlertDialogCancel>
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
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
import { Package, Truck, CheckCircle, XCircle, CheckSquare, DollarSign, Coins, Edit, ChevronRight } from 'lucide-react';
import { OrderDetail } from './OrderDetail';
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

type OrderManagementProps = {
  userRole: 'master' | 'second';
  filterStatus?: string;
};

export function OrderManagement({ userRole, filterStatus }: OrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [depositConfirmOpen, setDepositConfirmOpen] = useState(false);
  const [fullPaymentConfirmOpen, setFullPaymentConfirmOpen] = useState(false);
  const [editDepositOpen, setEditDepositOpen] = useState(false);
  const [orderToAction, setOrderToAction] = useState<Order | null>(null);
  const [newDepositAmount, setNewDepositAmount] = useState('');
  const [tempDepositAmount, setTempDepositAmount] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchOrders();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [userRole, filterStatus]);

  const fetchOrders = async () => {
    try {
      const url = userRole === 'second'
        ? `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/orders?filter=ready_to_ship`
        : `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/orders`;

      console.log('Fetching orders from:', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Orders fetched:', data.orders?.length || 0);
        
        // Filter orders based on filterStatus if provided
        let filteredOrders = data.orders || [];
        if (filterStatus) {
          filteredOrders = filteredOrders.filter((order: Order) => order.status === filterStatus);
        } else {
          // Exclude completed orders from the orders tab
          filteredOrders = filteredOrders.filter((order: Order) => order.status !== 'completed');
        }
        
        setOrders(filteredOrders);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch orders. Status:', response.status, 'Error:', errorText);
        toast.error(`Failed to load orders: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      toast.error('Failed to connect to server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, shippingMethod?: string, depositAmount?: number) => {
    try {
      const body: any = { status };
      if (shippingMethod) body.shippingMethod = shippingMethod;
      if (depositAmount !== undefined) body.depositAmount = depositAmount;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/orders/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(body),
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
    await updateOrderStatus(orderId, 'ready_for_payment');
  };

  const markAsShipped = async (orderId: string, shippingMethod: string) => {
    await updateOrderStatus(orderId, 'shipped', shippingMethod);
    setDialogOpen(false);
  };

  const handleCancelOrder = () => {
    if (orderToAction) {
      updateOrderStatus(orderToAction.id, 'cancelled');
      setCancelDialogOpen(false);
      setOrderToAction(null);
    }
  };

  const handleCompleteOrder = () => {
    if (orderToAction) {
      updateOrderStatus(orderToAction.id, 'completed');
      setCompleteDialogOpen(false);
      setOrderToAction(null);
    }
  };

  const handleConfirmDeposit = async () => {
    if (orderToAction) {
      const depositAmount = tempDepositAmount ? parseFloat(tempDepositAmount) : (orderToAction.depositAmount || 0);
      if (depositAmount > 0 && depositAmount <= orderToAction.totalAmount) {
        // Update order with deposit amount
        await updateOrderStatus(orderToAction.id, 'deposit_paid', undefined, depositAmount);
        setDepositConfirmOpen(false);
        setOrderToAction(null);
        setTempDepositAmount('');
      } else {
        toast.error('Please enter a valid deposit amount');
      }
    }
  };

  const handleConfirmFullPayment = () => {
    if (orderToAction) {
      updateOrderStatus(orderToAction.id, 'fully_paid');
      setFullPaymentConfirmOpen(false);
      setOrderToAction(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show order detail on mobile
  if (isMobile && selectedOrderId) {
    return (
      <OrderDetail
        orderId={selectedOrderId}
        userRole={userRole}
        onBack={() => setSelectedOrderId(null)}
      />
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
          {/* Mobile List View */}
          <div className="md:hidden space-y-3">
            {orders.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {userRole === 'second'
                  ? 'No orders ready to ship at the moment.'
                  : filterStatus === 'completed'
                  ? 'No completed orders found.'
                  : 'No orders found.'}
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className="p-4 rounded-xl border-2 border-[#d4a5a5]/20 hover:border-[#f8bbd0] bg-white active:bg-[#fff4e6]/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-[#7d5a50]">#{order.id.slice(0, 8)}</p>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-[#a67c6d]">{order.customerName}</p>
                      <p className="text-xs text-[#a67c6d]">{order.customerEmail}</p>
                      <p className="font-semibold text-[#f8bbd0] mt-1">₱{order.totalAmount.toLocaleString()}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#a67c6d]" />
                  </div>
                </div>
              ))
            )}
          </div>

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
                        : filterStatus === 'completed'
                        ? 'No completed orders found.'
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
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          {userRole === 'master' && order.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markReadyForPayment(order.id)}
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
                                className="bg-purple-600 hover:bg-purple-700"
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
                                className="bg-green-600 hover:bg-green-700"
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
                                className="bg-green-600 hover:bg-green-700"
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
                                  className="bg-green-600 hover:bg-green-700"
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
        </CardContent>
      </Card>

      {/* Shipping Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                <div className="grid grid-cols-2 gap-3">
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
      <AlertDialog open={depositConfirmOpen} onOpenChange={(open) => {
        setDepositConfirmOpen(open);
        if (!open) {
          setOrderToAction(null);
          setTempDepositAmount('');
        }
      }}>
        <AlertDialogContent className="bg-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deposit Payment Received</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the deposit amount paid by the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {orderToAction && (
            <div className="mt-1 space-y-3">
              <div className="p-3 bg-gray-50 rounded-md space-y-2">
                <div className="text-gray-900">
                  <strong>Order ID:</strong> {orderToAction.id.slice(0, 8)}
                </div>
                <div className="text-gray-900">
                  <strong>Customer:</strong> {orderToAction.customerName}
                </div>
                <div className="text-gray-900">
                  <strong>Total Amount:</strong> ₱{orderToAction.totalAmount?.toLocaleString() || '0'}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Deposit Amount (₱)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  min="0"
                  max={orderToAction.totalAmount}
                  step="0.01"
                  value={tempDepositAmount || (orderToAction.depositAmount || 0).toString()}
                  onChange={(e) => {
                    setTempDepositAmount(e.target.value);
                  }}
                  placeholder="Enter deposit amount"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Remaining amount: ₱{((orderToAction.totalAmount || 0) - (parseFloat(tempDepositAmount) || orderToAction.depositAmount || 0)).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setOrderToAction(null);
              setTempDepositAmount('');
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeposit}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Confirm Deposit
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
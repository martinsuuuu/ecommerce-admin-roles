import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Truck, Package, LogOut, Search, Filter } from 'lucide-react';
import { Input } from './ui/input';
import logoImage from 'figma:asset/086cf3cc9a736a513ded11d47e82ce484a90947a.png';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'master' | 'second' | 'customer';
};

type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: any[];
  totalAmount: number;
  status: string;
  shippingMethod?: string;
  createdAt: string;
};

type SecondAdminDashboardProps = {
  user: User;
  onLogout: () => void;
  onGoHome?: () => void;
};

export function SecondAdminDashboard({ user, onLogout, onGoHome }: SecondAdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/orders?filter=ready_to_ship`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
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
        toast.success('Order updated successfully');
        fetchOrders();
      } else {
        toast.error('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('An error occurred');
    }
  };

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf3f0] via-[#fef7f3] to-[#fff9f5] font-['Poppins',sans-serif]">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b-2 border-[#d4a5a5]/20 sticky top-0 z-30 shadow-sm">
        <div className="px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <img 
                src={logoImage} 
                alt="Little Mija" 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-md cursor-pointer" 
                onClick={onGoHome}
              />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-[#7d5a50]">Warehouse Dashboard</h1>
                <p className="text-xs sm:text-sm text-[#a67c6d] hidden sm:block">Ready to Ship Orders</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-xl bg-[#fff4e6] border-2 border-[#d4a5a5]/20">
                <div className="w-9 h-9 bg-gradient-to-br from-[#81d4fa] to-[#4fc3f7] rounded-full flex items-center justify-center shadow-md">
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
      <main className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-[#d4a5a5]/20 shadow-lg hover-lift bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#a67c6d] mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-[#7d5a50]">{orders.length}</p>
                </div>
                <div className="w-14 h-14 bg-[#fff4e6] rounded-2xl flex items-center justify-center shadow-md">
                  <Package className="w-7 h-7 text-[#f8bbd0]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#d4a5a5]/20 shadow-lg hover-lift bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#a67c6d] mb-1">Ready to Ship</p>
                  <p className="text-3xl font-bold text-[#7d5a50]">
                    {orders.filter(o => o.status === 'fully_paid').length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-[#e3f2fd] rounded-2xl flex items-center justify-center shadow-md">
                  <Truck className="w-7 h-7 text-[#81d4fa]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#d4a5a5]/20 shadow-lg hover-lift bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#a67c6d] mb-1">Shipped</p>
                  <p className="text-3xl font-bold text-[#7d5a50]">
                    {orders.filter(o => o.status === 'shipped').length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-[#f3e5f5] rounded-2xl flex items-center justify-center shadow-md">
                  <Package className="w-7 h-7 text-[#ce93d8]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Section */}
        <Card className="border-2 border-[#d4a5a5]/20 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader className="border-b-2 border-[#d4a5a5]/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#7d5a50]">Orders Ready to Ship</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#a67c6d]" />
                  <Input
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 border-[#d4a5a5]/40 focus:border-[#f8bbd0] rounded-xl"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f8bbd0]"></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-[#d4a5a5] mx-auto mb-3" />
                <p className="text-[#a67c6d]">No orders ready to ship</p>
              </div>
            ) : (
              <div className="divide-y divide-[#d4a5a5]/20">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-[#fff4e6]/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-[#7d5a50]">{order.customerName}</h3>
                          <Badge 
                            variant={order.status === 'shipped' ? 'default' : 'secondary'}
                            className={order.status === 'shipped' 
                              ? 'bg-gradient-to-r from-[#ce93d8] to-[#ba68c8] text-white' 
                              : 'bg-[#e3f2fd] text-[#81d4fa]'
                            }
                          >
                            {order.status === 'fully_paid' ? 'Ready to Ship' : 'Shipped'}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-[#a67c6d]">
                          <p>📧 {order.customerEmail}</p>
                          <p>📞 {order.customerPhone}</p>
                          <p>📍 {order.customerAddress}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#a67c6d] mb-1">Order ID</p>
                        <p className="font-mono text-xs text-[#a67c6d]">{order.id.slice(0, 8)}</p>
                      </div>
                    </div>

                    <div className="bg-[#fff4e6]/50 rounded-2xl p-4 mb-4 border border-[#d4a5a5]/20">
                      <p className="text-sm font-medium text-[#7d5a50] mb-2">Order Items</p>
                      <div className="space-y-2">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-[#a67c6d]">
                              {item.productName} x{item.quantity}
                            </span>
                            <span className="font-medium text-[#7d5a50]">
                              ₱{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <div className="pt-2 border-t-2 border-[#d4a5a5]/20 flex justify-between font-semibold">
                          <span className="text-[#7d5a50]">Total</span>
                          <span className="text-[#f8bbd0]">₱{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Select
                        defaultValue={order.shippingMethod || ''}
                        onValueChange={(value) =>
                          updateOrderStatus(order.id, 'shipped', value)
                        }
                      >
                        <SelectTrigger className="w-48 border-[#d4a5a5]/40 focus:border-[#f8bbd0] rounded-xl">
                          <SelectValue placeholder="Select shipping method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard Shipping</SelectItem>
                          <SelectItem value="express">Express Shipping</SelectItem>
                          <SelectItem value="pickup">Store Pickup</SelectItem>
                        </SelectContent>
                      </Select>
                      {order.status === 'fully_paid' && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'shipped', order.shippingMethod)}
                          className="bg-gradient-to-r from-[#f8bbd0] to-[#ffc1e3] hover:from-[#f48fb1] hover:to-[#f8bbd0] text-white rounded-xl shadow-lg"
                        >
                          Mark as Shipped
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DollarSign, ShoppingCart, Package, TrendingUp, TrendingDown, Activity, CheckCircle2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

type Stats = {
  totalSales: number;
  totalExpenses: number;
  grossProfit: number;
  pendingOrders: number;
  fullyPaidOrders: number;
  completedOrders: number;
  totalProducts: number;
};

export function Overview() {
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    totalExpenses: 0,
    grossProfit: 0,
    pendingOrders: 0,
    fullyPaidOrders: 0,
    completedOrders: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/stats`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Sales',
      value: `₱${stats.totalSales.toLocaleString()}`,
      description: 'Revenue from completed orders',
      icon: DollarSign,
      color: 'indigo',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Total Expenses',
      value: `₱${stats.totalExpenses.toLocaleString()}`,
      description: 'Operating costs and expenses',
      icon: TrendingDown,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      title: 'Gross Profit',
      value: `₱${stats.grossProfit.toLocaleString()}`,
      description: 'Total sales minus expenses',
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      description: 'Orders awaiting payment',
      icon: Activity,
      color: 'amber',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Fully Paid Orders',
      value: stats.fullyPaidOrders.toString(),
      description: 'Ready to ship',
      icon: ShoppingCart,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      description: 'Active products in catalog',
      icon: Package,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      gradient: 'from-purple-500 to-pink-500'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-slate-200 shadow-sm hover-lift overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full -mr-16 -mt-16`}></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.textColor} mb-1`}>
                  {stat.value}
                </div>
                <p className="text-sm text-slate-500">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm hover-lift">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Profit Margin</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {stats.totalSales > 0 
                      ? ((stats.grossProfit / stats.totalSales) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-indigo-700" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Revenue</p>
                  <p className="text-lg font-bold text-slate-900">₱{stats.totalSales.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Costs</p>
                  <p className="text-lg font-bold text-slate-900">₱{stats.totalExpenses.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover-lift">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Order Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(stats.pendingOrders + stats.fullyPaidOrders) > 0
                      ? ((stats.fullyPaidOrders / (stats.pendingOrders + stats.fullyPaidOrders)) * 100).toFixed(0)
                      : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-700" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Pending</p>
                  <p className="text-lg font-bold text-amber-600">{stats.pendingOrders}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Completed</p>
                  <p className="text-lg font-bold text-green-600">{stats.fullyPaidOrders}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
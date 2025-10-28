import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  BarChart3, 
  Truck, 
  LogOut,
  Menu,
  X,
  Baby
} from 'lucide-react';
import { Button } from './ui/button';
import { Overview } from './admin/Overview';
import { ProductManagement } from './admin/ProductManagement';
import { OrderManagement } from './admin/OrderManagement';
import { ExpenseTracking } from './admin/ExpenseTracking';
import { Reports } from './admin/Reports';
import { SupplierOrders } from './admin/SupplierOrders';
import logoImage from 'figma:asset/086cf3cc9a736a513ded11d47e82ce484a90947a.png';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'master' | 'second' | 'customer';
};

type MasterAdminDashboardProps = {
  user: User;
  onLogout: () => void;
};

type TabType = 'overview' | 'products' | 'orders' | 'expenses' | 'reports' | 'suppliers';

export function MasterAdminDashboard({ user, onLogout }: MasterAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'products' as TabType, label: 'Products', icon: Package },
    { id: 'orders' as TabType, label: 'Orders', icon: ShoppingCart },
    { id: 'expenses' as TabType, label: 'Expenses', icon: DollarSign },
    { id: 'reports' as TabType, label: 'Reports', icon: BarChart3 },
    { id: 'suppliers' as TabType, label: 'Suppliers', icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf3f0] via-[#fef7f3] to-[#fff9f5] font-['Poppins',sans-serif]">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen bg-white/95 backdrop-blur-sm border-r-2 border-[#d4a5a5]/20 shadow-lg transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b-2 border-[#d4a5a5]/20">
            {sidebarOpen ? (
              <>
                <div className="flex items-center gap-3">
                  <img src={logoImage} alt="Little Mija" className="w-10 h-10 rounded-full shadow-md" />
                  <div>
                    <h2 className="font-bold text-[#7d5a50]">Little Mija</h2>
                    <p className="text-xs text-[#a67c6d]">Master Admin</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="text-[#a67c6d] hover:bg-[#fff4e6]"
                >
                  <X className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="mx-auto text-[#a67c6d] hover:bg-[#fff4e6]"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#f8bbd0] to-[#ffc1e3] text-white shadow-lg shadow-pink-200'
                      : 'text-[#7d5a50] hover:bg-[#fff4e6]'
                  } ${!sidebarOpen && 'justify-center'}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t-2 border-[#d4a5a5]/20">
            {sidebarOpen ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#fff4e6]">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#f8bbd0] to-[#ffc1e3] rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#7d5a50] truncate">{user.name}</p>
                    <p className="text-xs text-[#a67c6d] truncate">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-center gap-2 border-2 border-[#d4a5a5]/40 text-[#7d5a50] hover:bg-red-50 hover:text-red-600 hover:border-red-300 rounded-xl"
                  onClick={onLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="w-full border-2 border-[#d4a5a5]/40 text-[#7d5a50] hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                onClick={onLogout}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#7d5a50] mb-2">
              {navItems.find(item => item.id === activeTab)?.label}
            </h1>
            <p className="text-[#a67c6d]">
              {activeTab === 'overview' && 'Dashboard overview and key metrics'}
              {activeTab === 'products' && 'Manage your product catalog'}
              {activeTab === 'orders' && 'View and manage customer orders'}
              {activeTab === 'expenses' && 'Track business expenses'}
              {activeTab === 'reports' && 'Financial reports and analytics'}
              {activeTab === 'suppliers' && 'Supplier orders and costing'}
            </p>
          </div>

          {/* Content */}
          <div className="animate-in fade-in duration-300">
            {activeTab === 'overview' && <Overview />}
            {activeTab === 'products' && <ProductManagement />}
            {activeTab === 'orders' && <OrderManagement userRole="master" />}
            {activeTab === 'expenses' && <ExpenseTracking />}
            {activeTab === 'reports' && <Reports />}
            {activeTab === 'suppliers' && <SupplierOrders />}
          </div>
        </div>
      </main>
    </div>
  );
}
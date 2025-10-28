import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  LogOut
} from 'lucide-react';
import { Button } from './ui/button';
import { Overview } from './admin/Overview';
import { ProductManagement } from './admin/ProductManagement';
import { OrderManagement } from './admin/OrderManagement';
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
  onGoHome?: () => void;
};

type TabType = 'overview' | 'products' | 'orders' | 'suppliers';

export function MasterAdminDashboard({ user, onLogout, onGoHome }: MasterAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'products' as TabType, label: 'Products', icon: Package },
    { id: 'orders' as TabType, label: 'Orders', icon: ShoppingCart },
    { id: 'suppliers' as TabType, label: 'Suppliers', icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf3f0] via-[#fef7f3] to-[#fff9f5] font-['Poppins',sans-serif]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 z-40 h-screen w-64 bg-white/95 backdrop-blur-sm border-r-2 border-[#d4a5a5]/20 shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b-2 border-[#d4a5a5]/20">
            <div className="flex items-center gap-3">
              <img 
                src={logoImage} 
                alt="Little Mija" 
                className="w-10 h-10 rounded-full shadow-md cursor-pointer" 
                onClick={onGoHome}
              />
              <div>
                <h2 className="font-bold text-[#7d5a50]">Little Mija</h2>
                <p className="text-xs text-[#a67c6d]">Master Admin</p>
              </div>
            </div>
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
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t-2 border-[#d4a5a5]/20">
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
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white/95 backdrop-blur-sm border-b-2 border-[#d4a5a5]/20 sticky top-0 z-30 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={logoImage} 
                alt="Little Mija" 
                className="w-8 h-8 rounded-full shadow-md cursor-pointer" 
                onClick={onGoHome}
              />
              <div>
                <h1 className="text-lg font-bold text-[#7d5a50]">Little Mija</h1>
                <p className="text-xs text-[#a67c6d]">Master Admin</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-2 border-[#d4a5a5]/40 text-[#7d5a50] hover:bg-red-50 hover:text-red-600 hover:border-red-300 rounded-xl"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="md:ml-64 pb-20 md:pb-0">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#7d5a50] mb-2">
              {navItems.find(item => item.id === activeTab)?.label}
            </h1>
            <p className="text-[#a67c6d] text-sm md:text-base">
              {activeTab === 'overview' && 'Dashboard overview and key metrics'}
              {activeTab === 'products' && 'Manage your product catalog'}
              {activeTab === 'orders' && 'View and manage customer orders'}
              {activeTab === 'suppliers' && 'Supplier orders and costing'}
            </p>
          </div>

          {/* Content */}
          <div className="animate-in fade-in duration-300">
            {activeTab === 'overview' && <Overview />}
            {activeTab === 'products' && <ProductManagement />}
            {activeTab === 'orders' && <OrderManagement userRole="master" />}
            {activeTab === 'suppliers' && <SupplierOrders />}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-2 border-[#d4a5a5]/20 shadow-lg z-30">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#f8bbd0] to-[#ffc1e3] text-white'
                    : 'text-[#7d5a50] hover:bg-[#fff4e6]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
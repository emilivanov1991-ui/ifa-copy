import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  DollarSign, 
  GraduationCap, 
  Calendar, 
  Mail,
  TrendingUp,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Eye,
  Brain,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Sparkles,
  Zap,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";

import ConsultantDashboard from '@/components/consultant/ConsultantDashboard';
import ConsultantCRMAdvanced from '@/components/consultant/ConsultantCRMAdvanced';
import JourneyStagesCRM from '@/components/consultant/JourneyStagesCRM';
import ConsultantStatistics from '@/components/consultant/ConsultantStatistics';
import ConsultantReports from '@/components/consultant/ConsultantReports';
import ElearningPortal from '@/components/consultant/ElearningPortal';
import ConsultantCalendar from '@/components/consultant/ConsultantCalendar';
import ConsultantMail from '@/components/consultant/ConsultantMail';
import ConsultantAnalytics from '@/components/consultant/ConsultantAnalytics';
import ConsultantIntegrations from '@/components/consultant/ConsultantIntegrations';
import ConsultantNotifications from '@/components/consultant/ConsultantNotifications';
import AIAnalyticsDashboard from '@/components/consultant/AIAnalyticsDashboard';
import RBACManager from '@/components/consultant/RBACManager';
import CommissionsManager from '@/components/consultant/CommissionsManager';
import ProductCatalogManager from '@/components/admin/ProductCatalogManager';
import DossiersManager from '@/components/consultant/DossiersManager';
import ConsultantLogin from '@/components/consultant/ConsultantLogin';
import { Package, FolderOpen, Workflow } from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Табло', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
  { id: 'journeys', label: 'Client Journeys', icon: Workflow, color: 'from-violet-500 to-violet-600' },
  { id: 'crm', label: 'CRM / Клиенти', icon: Users, color: 'from-blue-500 to-cyan-600' },
  { id: 'dossiers', label: 'Flow', icon: FolderOpen, color: 'from-blue-500 to-cyan-600' },
  { id: 'performance-formula', label: 'Performance Formula', icon: BarChart3, color: 'from-cyan-500 to-cyan-600' },
  { id: 'analysis', label: 'Финансов анализ', icon: FileText, color: 'from-emerald-500 to-emerald-600' },
  { id: 'commissions', label: 'Комисионни', icon: DollarSign, color: 'from-green-500 to-emerald-600' },
  { id: 'ai-analytics', label: 'AI Аналитика', icon: Brain, badge: 'AI', color: 'from-purple-500 to-pink-500' },
  { id: 'reports', label: 'Отчети', icon: FileText, color: 'from-amber-500 to-amber-600' },
  { id: 'elearning', label: 'E-Learning', icon: GraduationCap, color: 'from-indigo-500 to-indigo-600' },
  { id: 'calendar', label: 'Календар', icon: Calendar, color: 'from-rose-500 to-rose-600' },
  { id: 'mail', label: 'Съобщения', icon: Mail, badge: '3', color: 'from-teal-500 to-teal-600' },
  { id: 'integrations', label: 'Интеграции', icon: Zap, color: 'from-orange-500 to-orange-600' },
  { id: 'notifications', label: 'Известия', icon: Bell, color: 'from-sky-500 to-sky-600' },
  { id: 'product-catalog', label: 'Продуктов каталог', icon: Package, adminOnly: true, color: 'from-indigo-500 to-purple-600' },
  { id: 'rbac', label: 'Достъп', icon: Shield, adminOnly: true, color: 'from-slate-500 to-slate-600' },
];

export default function ConsultantPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [consultantAccount, setConsultantAccount] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
    // Check session storage for logged-in consultant
    const saved = sessionStorage.getItem('consultantAccount');
    if (saved) setConsultantAccount(JSON.parse(saved));
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleConsultantLogin = (account) => {
    setConsultantAccount(account);
    sessionStorage.setItem('consultantAccount', JSON.stringify(account));
  };

  const handleLogout = () => {
    setConsultantAccount(null);
    sessionStorage.removeItem('consultantAccount');
  };

  if (!consultantAccount) {
    return <ConsultantLogin onLogin={handleConsultantLogin} />;
  }

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Добро утро';
    if (hour < 18) return 'Добър ден';
    return 'Добър вечер';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 flex pt-0">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-white/80 backdrop-blur-xl border-r border-slate-200/50 fixed left-0 top-0 bottom-0 z-40 flex flex-col shadow-xl shadow-slate-200/20"
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/30"
            >
              <TrendingUp className="h-5 w-5 text-white" />
            </motion.div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">APEX</h1>
                  <p className="text-xs text-slate-500 font-medium">Консултант Портал</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white rounded-full border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors z-50"
        >
          {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin">
          <div className="space-y-1">
            {menuItems.filter(item => !item.adminOnly || currentUser?.role === 'admin').map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative overflow-hidden group",
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100/80'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={cn("absolute inset-0 bg-gradient-to-r rounded-xl", item.color)}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={cn(
                    "relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'
                  )}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="relative z-10 flex-1 text-left"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {item.badge && !sidebarCollapsed && (
                    <Badge className={cn(
                      "relative z-10 text-xs",
                      item.badge === 'AI' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-0' 
                        : isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    )}>
                      {item.badge === 'AI' && <Sparkles className="h-3 w-3 mr-1" />}
                      {item.badge}
                    </Badge>
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50/50">
          <div className="flex items-center gap-3 mb-3">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25"
            >
              <span className="text-sm font-bold text-white">
                {consultantAccount?.full_name?.charAt(0) || 'К'}
              </span>
            </motion.div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-semibold text-slate-900 truncate">{consultantAccount?.full_name}</p>
                  <p className="text-xs text-slate-500 capitalize">{consultantAccount?.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!sidebarCollapsed && (
            <Button variant="outline" onClick={handleLogout} className="w-full text-slate-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 rounded-xl transition-all">
              <LogOut className="h-4 w-4 mr-2" />
              Изход
            </Button>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.div 
        className="flex-1"
        animate={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Top Header */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-30 px-6 h-16 flex items-center justify-between shadow-sm">
          <div>
            <motion.h2 
              key={activeTab}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-semibold text-slate-900 text-lg"
            >
              {menuItems.find(m => m.id === activeTab)?.label || 'Табло'}
            </motion.h2>
            <p className="text-xs text-slate-500">{getGreeting()}, {consultantAccount?.full_name?.split(' ')[0]}! • {currentTime.toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-slate-100" onClick={() => setActiveTab('notifications')}>
                <Bell className="h-5 w-5 text-slate-600" />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-lg shadow-red-500/30">5</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-slate-100" onClick={() => setActiveTab('mail')}>
                <Mail className="h-5 w-5 text-slate-600" />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/30">3</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100" onClick={() => setActiveTab('calendar')}>
                <Calendar className="h-5 w-5 text-slate-600" />
              </Button>
            </motion.div>
            <div className="w-px h-8 bg-slate-200 mx-2" />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                <Settings className="h-5 w-5 text-slate-600" />
              </Button>
            </motion.div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {activeTab === 'dashboard' && <ConsultantDashboard onNavigate={setActiveTab} />}
              {activeTab === 'journeys' && <JourneyStagesCRM />}
              {activeTab === 'crm' && <ConsultantCRMAdvanced isAdmin={currentUser?.role === 'admin'} />}
              {activeTab === 'dossiers' && <DossiersManager />}
              {activeTab === 'performance-formula' && <ConsultantAnalytics />}
              {activeTab === 'analysis' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5" />
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="text-xl">Финансов анализ</span>
                          <p className="text-sm font-normal text-slate-500">Създайте персонализирани финансови планове</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="flex gap-3">
                        <Link to={createPageUrl('FinancialAnalysis')}>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25 rounded-xl">
                              <Plus className="h-4 w-4 mr-2" />
                              Нов анализ
                            </Button>
                          </motion.div>
                        </Link>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button variant="outline" className="rounded-xl hover:bg-slate-50">
                            <Eye className="h-4 w-4 mr-2" />
                            Преглед на анализи
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {activeTab === 'commissions' && <CommissionsManager consultantEmail={currentUser?.email} />}
              {activeTab === 'ai-analytics' && <AIAnalyticsDashboard />}
              {activeTab === 'reports' && <ConsultantReports />}
              {activeTab === 'elearning' && <ElearningPortal isAdmin={currentUser?.role === 'admin'} />}
              {activeTab === 'calendar' && <ConsultantCalendar />}
              {activeTab === 'mail' && <ConsultantMail />}
              {activeTab === 'integrations' && <ConsultantIntegrations />}
              {activeTab === 'notifications' && <ConsultantNotifications />}
              {activeTab === 'product-catalog' && currentUser?.role === 'admin' && <ProductCatalogManager />}
              {activeTab === 'rbac' && currentUser?.role === 'admin' && <RBACManager />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
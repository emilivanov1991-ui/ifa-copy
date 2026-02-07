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
  Bell,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import DarkModeToggle from '@/components/portal/DarkModeToggle';

import ConsultantDashboard from '@/components/consultant/ConsultantDashboard';
import ConsultantCRMAdvanced from '@/components/consultant/ConsultantCRMAdvanced';
import ConsultantStatistics from '@/components/consultant/ConsultantStatistics';
import ConsultantReports from '@/components/consultant/ConsultantReports';
import ConsultantElearningAdvanced from '@/components/consultant/ConsultantElearningAdvanced';
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
import { Package, FolderOpen } from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Табло', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
  { id: 'crm', label: 'CRM / Клиенти', icon: Users, color: 'from-violet-500 to-violet-600' },
  { id: 'dossiers', label: 'Досиета', icon: FolderOpen, color: 'from-blue-500 to-cyan-600' },
  { id: 'analysis', label: 'Финансов анализ', icon: FileText, color: 'from-emerald-500 to-emerald-600' },
  { id: 'commissions', label: 'Комисионни', icon: DollarSign, color: 'from-green-500 to-emerald-600' },
  { id: 'ai-analytics', label: 'AI Аналитика', icon: Brain, badge: 'AI', color: 'from-purple-500 to-pink-500' },
  { id: 'analytics', label: 'Статистики', icon: BarChart3, color: 'from-cyan-500 to-cyan-600' },
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Добро утро';
    if (hour < 18) return 'Добър ден';
    return 'Добър вечер';
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gradient-to-br dark:from-[#0D1442] dark:via-[#1A237E] dark:to-[#1A237E] flex pt-0">
      {/* Premium Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 300 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="glass dark:glass-dark border-r border-white/20 dark:border-white/10 fixed left-0 top-0 bottom-0 z-40 flex flex-col shadow-2xl premium-scrollbar overflow-y-auto"
      >
        {/* Premium Logo */}
        <div className="p-6 border-b border-white/20 dark:border-white/10">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-12 h-12 rounded-2xl premium-gradient-navy dark:premium-gradient-teal flex items-center justify-center shadow-xl shadow-[#1A237E]/40 dark:shadow-[#00BFA5]/40 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00BFA5]/20 to-transparent" />
              <Briefcase className="h-6 w-6 text-white relative z-10" />
            </motion.div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <h1 className="font-black text-xl bg-gradient-to-r from-[#1A237E] to-[#00BFA5] dark:from-white dark:to-[#00BFA5] bg-clip-text text-transparent">APEX</h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Pro Console</p>
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
                  whileHover={{ x: 6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all relative overflow-hidden group",
                    isActive
                      ? 'text-white shadow-2xl'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={cn("absolute inset-0 rounded-2xl", isActive && "premium-gradient-navy dark:premium-gradient-teal")}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={cn(
                    "relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg",
                    isActive ? 'bg-white/20 shadow-white/20' : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/10 dark:to-white/5 group-hover:from-[#00BFA5]/20 group-hover:to-[#1DE9B6]/20 dark:group-hover:from-[#00BFA5]/30 dark:group-hover:to-[#1DE9B6]/30'
                  )}>
                    <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-[#1A237E] dark:text-[#00BFA5]")} />
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

        {/* Premium User Section */}
        <div className="p-6 border-t border-white/20 dark:border-white/10 bg-gradient-to-br from-[#1A237E]/5 to-[#00BFA5]/5 dark:from-[#00BFA5]/5 dark:to-[#1A237E]/10">
          <div className="flex items-center gap-4 mb-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-12 h-12 rounded-2xl premium-gradient-gold flex items-center justify-center shadow-xl shadow-[#FFD700]/40 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                animate={{ x: [-100, 100] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <span className="text-base font-black text-[#1A237E] relative z-10">ИП</span>
            </motion.div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">Иван Петров</p>
                  <p className="text-xs text-[#00BFA5] dark:text-[#1DE9B6] font-bold">Старши консултант</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!sidebarCollapsed && (
            <Link to={createPageUrl('Home')}>
              <Button className="w-full premium-gradient-navy dark:bg-red-600 dark:hover:bg-red-700 text-white hover:opacity-90 rounded-xl transition-all shadow-lg font-bold">
                <LogOut className="h-4 w-4 mr-2" />
                Изход
              </Button>
            </Link>
          )}
        </div>
      </motion.aside>

      {/* Premium Main Content */}
      <motion.div 
        className="flex-1"
        animate={{ marginLeft: sidebarCollapsed ? 80 : 300 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Premium Top Header */}
        <header className="glass dark:glass-dark border-b border-white/20 dark:border-white/10 sticky top-0 z-30 px-8 h-20 flex items-center justify-between shadow-2xl">
          <div>
            <motion.h2 
              key={activeTab}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-black text-2xl bg-gradient-to-r from-[#1A237E] to-[#00BFA5] dark:from-white dark:to-[#00BFA5] bg-clip-text text-transparent"
            >
              {menuItems.find(m => m.id === activeTab)?.label || 'Табло'}
            </motion.h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-2">
              <span>{getGreeting()}, Иван!</span>
              <span className="text-[#00BFA5]">•</span>
              <span>{currentTime.toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all" onClick={() => setActiveTab('notifications')}>
                <Bell className="h-5 w-5 text-[#1A237E] dark:text-[#00BFA5]" />
                <span className="absolute -top-1 -right-1 w-6 h-6 premium-gradient-gold rounded-full text-[10px] text-[#1A237E] flex items-center justify-center font-black shadow-xl shadow-[#FFD700]/40">5</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all" onClick={() => setActiveTab('mail')}>
                <Mail className="h-5 w-5 text-[#1A237E] dark:text-[#00BFA5]" />
                <span className="absolute -top-1 -right-1 w-6 h-6 premium-gradient-teal rounded-full text-[10px] text-white flex items-center justify-center font-black shadow-xl shadow-[#00BFA5]/40">3</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all" onClick={() => setActiveTab('calendar')}>
                <Calendar className="h-5 w-5 text-[#1A237E] dark:text-[#00BFA5]" />
              </Button>
            </motion.div>
            <div className="w-px h-10 bg-white/20 dark:bg-white/10 mx-2" />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all">
                <Settings className="h-5 w-5 text-[#1A237E] dark:text-[#00BFA5]" />
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
              {activeTab === 'crm' && <ConsultantCRMAdvanced isAdmin={currentUser?.role === 'admin'} />}
              {activeTab === 'dossiers' && <DossiersManager />}
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
              {activeTab === 'analytics' && <ConsultantAnalytics />}
              {activeTab === 'reports' && <ConsultantReports />}
              {activeTab === 'elearning' && <ConsultantElearningAdvanced />}
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
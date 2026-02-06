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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20 flex pt-0">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="glass-card border-r border-white/30 fixed left-0 top-0 bottom-0 z-40 flex flex-col shadow-2xl"
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/30">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 rounded-2xl gradient-navy-emerald flex items-center justify-center shadow-xl"
            >
              <TrendingUp className="h-6 w-6 text-white" />
            </motion.div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <h1 className="font-bold text-lg gradient-navy-emerald bg-clip-text text-transparent">APEX</h1>
                  <p className="text-xs text-slate-600 font-medium">Consultant Portal</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collapse Button */}
        <motion.button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute -right-3 top-20 w-7 h-7 glass-card shadow-xl flex items-center justify-center hover:shadow-2xl transition-all z-50"
        >
          {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-slate-700" /> : <ChevronLeft className="h-3.5 w-3.5 text-slate-700" />}
        </motion.button>

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
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-2xl font-medium text-sm transition-all relative overflow-hidden group",
                    isActive
                      ? 'text-white shadow-2xl'
                      : 'text-slate-700 hover:bg-white/50 hover:shadow-md'
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
        <div className="p-4 border-t border-white/30 glass">
          <div className="flex items-center gap-3 mb-3">
            <motion.div 
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 rounded-2xl gradient-navy-emerald flex items-center justify-center shadow-xl"
            >
              <span className="text-sm font-bold text-white">ИП</span>
            </motion.div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-bold text-slate-900 truncate">Иван Петров</p>
                  <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-0 px-2 py-0">Senior Advisor</Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!sidebarCollapsed && (
            <Link to={createPageUrl('Home')}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" className="w-full text-slate-700 hover:text-red-600 hover:border-red-300 hover:bg-red-50/80 rounded-2xl transition-all border-slate-200">
                  <LogOut className="h-4 w-4 mr-2" />
                  Изход
                </Button>
              </motion.div>
            </Link>
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
        <header className="glass-card border-b border-white/30 sticky top-0 z-30 px-6 h-16 flex items-center justify-between shadow-xl">
          <div>
            <motion.h2 
              key={activeTab}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-bold text-slate-900 text-xl"
            >
              {menuItems.find(m => m.id === activeTab)?.label || 'Табло'}
            </motion.h2>
            <p className="text-xs text-slate-600 font-medium">{getGreeting()}, Иван! • {currentTime.toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Button variant="ghost" size="icon" className="relative rounded-2xl hover:bg-white/60 hover:shadow-lg transition-all" onClick={() => setActiveTab('notifications')}>
                <Bell className="h-5 w-5 text-slate-700" />
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 gradient-navy-emerald rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-xl"
                >5</motion.span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Button variant="ghost" size="icon" className="relative rounded-2xl hover:bg-white/60 hover:shadow-lg transition-all" onClick={() => setActiveTab('mail')}>
                <Mail className="h-5 w-5 text-slate-700" />
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-xl"
                >3</motion.span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-white/60 hover:shadow-lg transition-all" onClick={() => setActiveTab('calendar')}>
                <Calendar className="h-5 w-5 text-slate-700" />
              </Button>
            </motion.div>
            <div className="w-px h-8 bg-slate-300 mx-2" />
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-white/60 hover:shadow-lg transition-all">
                <Settings className="h-5 w-5 text-slate-700" />
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
                  <Card className="glass-card border-0 shadow-2xl overflow-hidden hover-lift">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10" />
                    <CardHeader className="relative pb-4">
                      <CardTitle className="flex items-center gap-4">
                        <motion.div 
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl"
                        >
                          <FileText className="h-6 w-6 text-white" />
                        </motion.div>
                        <div>
                          <span className="text-2xl font-bold text-slate-900">Финансов анализ</span>
                          <p className="text-sm font-normal text-slate-600 mt-0.5">Създайте персонализирани финансови планове</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="flex gap-3">
                        <Link to={createPageUrl('FinancialAnalysis')}>
                          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                            <Button className="gradient-navy-emerald hover:shadow-2xl shadow-lg rounded-2xl px-6 py-6 text-white font-semibold">
                              <Plus className="h-5 w-5 mr-2" />
                              Нов анализ
                            </Button>
                          </motion.div>
                        </Link>
                        <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                          <Button variant="outline" className="rounded-2xl hover:bg-white hover:shadow-lg transition-all px-6 py-6 border-slate-300">
                            <Eye className="h-5 w-5 mr-2" />
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
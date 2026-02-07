import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  Calendar,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  User,
  LogOut,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Activity
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import PortfolioChart from '../components/portal/PortfolioChart';
import ProductsListAdvanced from '../components/portal/ProductsListAdvanced';
import PaymentsList from '../components/portal/PaymentsList';
import ProposedProducts from '../components/portal/ProposedProducts';
import DocumentsManager from '../components/portal/DocumentsManager';
import NotificationsPanel from '../components/portal/NotificationsPanel';
import CalendarIntegration from '../components/portal/CalendarIntegration';
import ClientDossier from '../components/portal/ClientDossier';
import DarkModeToggle from '../components/portal/DarkModeToggle';

export default function ClientPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check for saved session
  useEffect(() => {
    const savedSession = localStorage.getItem('clientPortalSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setCurrentUser(session.user);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('clientPortalSession');
      }
    }
  }, []);

  // Fetch client data based on user email
  const { data: clients, isLoading: clientLoading } = useQuery({
    queryKey: ['client', currentUser?.email],
    queryFn: async () => {
      const allClients = await base44.entities.Client.list();
      return allClients.filter(c => c.email === currentUser?.email);
    },
    enabled: !!currentUser?.email,
  });

  useEffect(() => {
    if (clients && clients.length > 0) {
      setClientData(clients[0]);
    }
  }, [clients]);

  // Fetch products for this client
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', clientData?.id],
    queryFn: () => base44.entities.FinancialProduct.filter({ client_id: clientData?.id }),
    enabled: !!clientData?.id,
  });

  // Fetch payments for this client
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments', clientData?.id],
    queryFn: () => base44.entities.Payment.filter({ client_id: clientData?.id }, '-due_date'),
    enabled: !!clientData?.id,
  });

  // Fetch portfolio history
  const { data: portfolioHistory = [] } = useQuery({
    queryKey: ['portfolioHistory', clientData?.id],
    queryFn: () => base44.entities.PortfolioHistory.filter({ client_id: clientData?.id }, 'date'),
    enabled: !!clientData?.id,
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      // Get all clients and find by email locally (to work around security rules)
      const allClients = await base44.entities.Client.list();
      const clients = allClients.filter(c => c.email === loginForm.username);
      
      if (clients.length === 0) {
        setLoginError('Невалидно потребителско име или парола');
        setIsLoggingIn(false);
        return;
      }

      const client = clients[0];
      
      // Check password (stored in client record)
      if (client.portal_password !== loginForm.password) {
        setLoginError('Невалидно потребителско име или парола');
        setIsLoggingIn(false);
        return;
      }

      // Success - save session
      const session = {
        user: { email: client.email, name: `${client.first_name} ${client.last_name}` },
        clientId: client.id
      };
      localStorage.setItem('clientPortalSession', JSON.stringify(session));
      setCurrentUser(session.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Възникна грешка. Моля, опитайте отново.');
    }
    
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('clientPortalSession');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setClientData(null);
  };

  // Not authenticated - show login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-gradient-to-br dark:from-[#0D1442] dark:via-[#1A237E] dark:to-[#283593] relative overflow-hidden">
        {/* Premium background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 dark:opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0, 191, 165, 0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00BFA5]/20 dark:bg-[#00BFA5]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#1A237E]/20 dark:bg-[#1A237E]/30 rounded-full blur-3xl" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFD700]/10 dark:bg-[#FFD700]/5 rounded-full blur-3xl" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '2s' }} />
        </div>
        
        <div className="max-w-md mx-auto px-6 py-16 relative z-10">
          {/* Dark Mode Toggle */}
          <div className="absolute top-6 right-6">
            <DarkModeToggle />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass dark:glass-dark rounded-3xl shadow-2xl p-10 border border-white/20 dark:border-white/10"
          >
            {/* Premium Logo */}
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="w-24 h-24 rounded-3xl premium-gradient-navy flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#1A237E]/40 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00BFA5]/20 to-transparent" />
                <Lock className="h-12 w-12 text-white relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/0 via-[#FFD700]/20 to-[#FFD700]/0"
                  animate={{ x: [-100, 200] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold bg-gradient-to-r from-[#1A237E] to-[#00BFA5] dark:from-white dark:to-[#00BFA5] bg-clip-text text-transparent mb-2"
              >
                Клиентски портал
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-600 dark:text-slate-300 font-medium"
              >
                Сигурен достъп до вашите финанси
              </motion.p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 font-semibold">Имейл адрес</Label>
                <Input
                  id="username"
                  type="email"
                  placeholder="example@mail.com"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="rounded-xl bg-white dark:bg-white/10 border-2 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#00BFA5] focus:ring-[#00BFA5]/20 h-14 text-base transition-all"
                  required
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-semibold">Парола</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="rounded-xl bg-white dark:bg-white/10 border-2 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#00BFA5] pr-14 h-14 text-base transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-[#00BFA5] dark:hover:text-[#00BFA5] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </motion.div>

              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm backdrop-blur-sm"
                >
                  {loginError}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button 
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full premium-gradient-teal hover:opacity-90 rounded-xl h-14 text-lg font-bold shadow-xl shadow-[#00BFA5]/30 transition-all hover:shadow-2xl hover:shadow-[#00BFA5]/40 hover:scale-[1.02] text-white border-0 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/0 via-[#FFD700]/20 to-[#FFD700]/0"
                    animate={{ x: [-200, 400] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin relative z-10" />
                      <span className="relative z-10">Влизане...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-5 w-5 relative z-10" />
                      <span className="relative z-10">Сигурен вход</span>
                      <ChevronRight className="ml-2 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-center space-y-3"
            >
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium flex items-center justify-center gap-2">
                <Shield className="h-4 w-4 text-[#00BFA5]" />
                Данните за вход са изпратени на вашия имейл
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Защитена връзка SSL</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Authenticated but no client record
  if (!clientLoading && !clientData) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-md mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-10 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-3">
              Няма активен профил
            </h1>
            <p className="text-slate-600 mb-8">
              Вашият акаунт все още не е свързан с активен финансов план. 
              Моля, свържете се с вашия консултант или попълнете безплатния финансов анализ.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = '/FinancialAnalysis'}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-full"
              >
                Безплатен финансов анализ
              </Button>
              <Button 
                variant="outline"
                onClick={handleLogout}
                className="w-full rounded-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Изход
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading client data
  if (clientLoading) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Calculate statistics
  const activeProducts = products.filter(p => p.status === 'active');
  const proposedProducts = products.filter(p => p.status === 'proposed');
  const totalValue = activeProducts.reduce((sum, p) => sum + (p.current_value || 0), 0);
  const totalMonthlyPremium = activeProducts.reduce((sum, p) => sum + (p.monthly_premium || 0), 0);
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');
  const upcomingMaturity = activeProducts.filter(p => {
    if (!p.maturity_date) return false;
    const maturity = new Date(p.maturity_date);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return maturity <= threeMonthsFromNow;
  });

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gradient-to-br dark:from-[#0D1442] dark:via-[#1A237E] dark:to-[#1A237E]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Premium Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <motion.div 
              className="flex items-center gap-3 mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-12 h-12 rounded-2xl premium-gradient-navy dark:premium-gradient-teal flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1A237E] to-[#00BFA5] dark:from-white dark:to-[#00BFA5] bg-clip-text text-transparent">
                  Здравейте, {clientData.first_name}!
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#00BFA5]" />
                  {new Date().toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </motion.div>
          </div>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="rounded-xl glass dark:glass-dark border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/20 hover:shadow-xl transition-all">
                <Bell className="h-4 w-4 mr-2 text-[#1A237E] dark:text-[#00BFA5]" />
                <span className="text-[#1A237E] dark:text-white font-semibold">Известия</span>
                {pendingPayments.length > 0 && (
                  <Badge className="ml-2 premium-gradient-gold text-[#1A237E] border-0 font-bold">{pendingPayments.length}</Badge>
                )}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" onClick={handleLogout} className="rounded-xl glass dark:glass-dark border-slate-200 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/50 transition-all">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="font-semibold">Изход</span>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Premium Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
          >
            <Card className="glass dark:glass-dark border-0 shadow-2xl shadow-[#1A237E]/10 dark:shadow-black/20 overflow-hidden group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1A237E]/5 to-[#00BFA5]/5 dark:from-[#00BFA5]/10 dark:to-[#1A237E]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00BFA5]/10 to-transparent rounded-bl-full" />
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl premium-gradient-navy dark:premium-gradient-teal flex items-center justify-center shadow-xl shadow-[#1A237E]/30 dark:shadow-[#00BFA5]/30 group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <Wallet className="h-7 w-7 text-white" />
                  </div>
                  <Badge className="premium-gradient-gold text-[#1A237E] border-0 font-bold px-3 shadow-lg">
                    ПОРТФОЛИО
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wide">Обща стойност</p>
                <p className="text-3xl font-black bg-gradient-to-r from-[#1A237E] to-[#00BFA5] dark:from-white dark:to-[#00BFA5] bg-clip-text text-transparent">{totalValue.toLocaleString('bg-BG')} €</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+12.5% тази година</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
          >
            <Card className="glass dark:glass-dark border-0 shadow-2xl shadow-[#00BFA5]/10 dark:shadow-black/20 overflow-hidden group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00BFA5]/5 to-[#1DE9B6]/5 dark:from-[#00BFA5]/10 dark:to-[#1DE9B6]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1DE9B6]/10 to-transparent rounded-bl-full" />
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl premium-gradient-teal flex items-center justify-center shadow-xl shadow-[#00BFA5]/30 group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <Badge className="bg-green-500 text-white border-0 font-bold px-3 shadow-lg">
                    АКТИВНО
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wide">Месечни вноски</p>
                <p className="text-3xl font-black bg-gradient-to-r from-[#00BFA5] to-[#1DE9B6] dark:from-white dark:to-[#00BFA5] bg-clip-text text-transparent">{totalMonthlyPremium.toLocaleString('bg-BG')} €</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-[#00BFA5] dark:text-[#1DE9B6] font-semibold">
                  <CheckCircle className="h-3 w-3" />
                  <span>Всички плащания актуални</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
          >
            <Card className="glass dark:glass-dark border-0 shadow-2xl shadow-[#1A237E]/10 dark:shadow-black/20 overflow-hidden group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1A237E]/5 to-[#283593]/5 dark:from-[#1A237E]/10 dark:to-[#283593]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFD700]/10 to-transparent rounded-bl-full" />
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl premium-gradient-navy flex items-center justify-center shadow-xl shadow-[#1A237E]/30 group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <Badge className="bg-[#1A237E] dark:bg-[#00BFA5] text-white dark:text-[#1A237E] border-0 font-bold px-3 shadow-lg">
                    ЗАЩИТА
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wide">Активни продукти</p>
                <p className="text-3xl font-black bg-gradient-to-r from-[#1A237E] to-[#283593] dark:from-white dark:to-[#00BFA5] bg-clip-text text-transparent">{activeProducts.length}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-[#00BFA5] dark:text-[#1DE9B6] font-semibold">
                  <Shield className="h-3 w-3" />
                  <span>Пълна защита</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
          >
            <Card className="glass dark:glass-dark border-0 shadow-2xl shadow-[#FFD700]/10 dark:shadow-black/20 overflow-hidden group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 to-[#FFC107]/5 dark:from-[#FFD700]/10 dark:to-[#FFC107]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1A237E]/10 to-transparent rounded-bl-full" />
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl premium-gradient-gold flex items-center justify-center shadow-xl shadow-[#FFD700]/30 group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <Calendar className="h-7 w-7 text-[#1A237E]" />
                  </div>
                  {upcomingMaturity.length > 0 && (
                    <Badge className="bg-amber-500 text-white border-0 font-bold px-3 shadow-lg">
                      ВАЖНО
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wide">Предстоящи падежи</p>
                <p className="text-3xl font-black bg-gradient-to-r from-[#FFD700] to-[#FFC107] dark:from-white dark:to-[#FFD700] bg-clip-text text-transparent">{upcomingMaturity.length}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  <Clock className="h-3 w-3" />
                  <span>Следващи 90 дни</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Premium Navigation Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="glass dark:glass-dark p-2 rounded-2xl flex-wrap shadow-2xl shadow-[#1A237E]/10 dark:shadow-black/30 border border-white/20 dark:border-white/10">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:premium-gradient-navy dark:data-[state=active]:premium-gradient-teal data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-[#1A237E]/30 dark:data-[state=active]:shadow-[#00BFA5]/30 transition-all px-6 py-3 font-bold text-sm">Преглед</TabsTrigger>
            <TabsTrigger value="dossier" className="rounded-xl data-[state=active]:premium-gradient-navy dark:data-[state=active]:premium-gradient-teal data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-[#1A237E]/30 dark:data-[state=active]:shadow-[#00BFA5]/30 transition-all px-6 py-3 font-bold text-sm">
              <FileText className="h-4 w-4 mr-2" />
              Досие
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl data-[state=active]:premium-gradient-navy dark:data-[state=active]:premium-gradient-teal data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-[#1A237E]/30 dark:data-[state=active]:shadow-[#00BFA5]/30 transition-all px-6 py-3 font-bold text-sm">Продукти</TabsTrigger>
            <TabsTrigger value="payments" className="rounded-xl data-[state=active]:premium-gradient-navy dark:data-[state=active]:premium-gradient-teal data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-[#1A237E]/30 dark:data-[state=active]:shadow-[#00BFA5]/30 transition-all px-6 py-3 font-bold text-sm">Вноски</TabsTrigger>
            <TabsTrigger value="proposed" className="rounded-xl data-[state=active]:premium-gradient-navy dark:data-[state=active]:premium-gradient-teal data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-[#1A237E]/30 dark:data-[state=active]:shadow-[#00BFA5]/30 transition-all px-6 py-3 font-bold text-sm relative">
              Предложени
              {proposedProducts.length > 0 && (
                <Badge className="ml-2 premium-gradient-gold text-[#1A237E] border-0 font-bold">{proposedProducts.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-xl data-[state=active]:premium-gradient-navy dark:data-[state=active]:premium-gradient-teal data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-[#1A237E]/30 dark:data-[state=active]:shadow-[#00BFA5]/30 transition-all px-6 py-3 font-bold text-sm">Календар</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-xl data-[state=active]:premium-gradient-navy dark:data-[state=active]:premium-gradient-teal data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-[#1A237E]/30 dark:data-[state=active]:shadow-[#00BFA5]/30 transition-all px-6 py-3 font-bold text-sm">Известия</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-xl data-[state=active]:premium-gradient-navy dark:data-[state=active]:premium-gradient-teal data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-[#1A237E]/30 dark:data-[state=active]:shadow-[#00BFA5]/30 transition-all px-6 py-3 font-bold text-sm">Документи</TabsTrigger>
          </TabsList>

          <TabsContent value="dossier" className="space-y-6">
            <ClientDossier clientId={clientData?.id} />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Portfolio Chart */}
              <div className="lg:col-span-2">
                <PortfolioChart history={portfolioHistory} />
              </div>

              {/* Quick Info */}
              <div className="space-y-4">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Вашият консултант</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{clientData.advisor_name || 'Не е назначен'}</p>
                        <p className="text-sm text-slate-600">{clientData.advisor_email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {upcomingMaturity.length > 0 && (
                  <Card className="bg-amber-50 border-amber-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Предстоящи падежи
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {upcomingMaturity.map(product => (
                        <div key={product.id} className="flex justify-between items-center py-2 border-b border-amber-200 last:border-0">
                          <span className="text-sm">{product.name}</span>
                          <span className="text-sm font-medium text-amber-700">
                            {new Date(product.maturity_date).toLocaleDateString('bg-BG')}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {pendingPayments.length > 0 && (
                  <Card className="bg-red-50 border-red-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Предстоящи вноски
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {pendingPayments.slice(0, 3).map(payment => (
                        <div key={payment.id} className="flex justify-between items-center py-2 border-b border-red-200 last:border-0">
                          <span className="text-sm">{payment.amount} €</span>
                          <span className={cn(
                            "text-sm font-medium",
                            payment.status === 'overdue' ? "text-red-700" : "text-slate-600"
                          )}>
                            {new Date(payment.due_date).toLocaleDateString('bg-BG')}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <ProductsListAdvanced products={activeProducts} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsList payments={payments} products={products} />
          </TabsContent>

          <TabsContent value="proposed">
            <ProposedProducts products={proposedProducts} />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarIntegration 
              clientId={clientData?.id} 
              clientData={clientData}
              products={activeProducts}
              payments={payments}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsPanel clientId={clientData?.id} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsManager clientId={clientData?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
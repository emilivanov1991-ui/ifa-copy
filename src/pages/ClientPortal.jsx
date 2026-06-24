import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
  Mail,
  Key,
  ArrowLeft,
  Timer
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

export default function ClientPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [clientData, setClientData] = useState(null);
  
  // OTP Login state
  const [loginStep, setLoginStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  // Check for saved session
  useEffect(() => {
    const savedSession = localStorage.getItem('clientPortalSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setCurrentUser(session.user);
        setClientData(session.clientData);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('clientPortalSession');
      }
    }
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSendingOTP(true);

    try {
      const response = await base44.functions.invoke('sendOTP', { email: email.toLowerCase() });
      
      if (response.data.success) {
        setOtpSessionId(response.data.otp_session_id);
        setLoginStep('otp');
        setCountdown(60); // 60 seconds resend cooldown
        setAttemptsRemaining(5);
      } else {
        setLoginError(response.data.error || 'Грешка при изпращане на код');
      }
    } catch (error) {
      console.error('SendOTP error:', error);
      setLoginError(error.response?.data?.error || 'Възникна грешка. Моля, опитайте отново.');
    }
    
    setIsSendingOTP(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsVerifyingOTP(true);

    try {
      const response = await base44.functions.invoke('verifyOTP', { 
        email: email.toLowerCase(), 
        otp_code: otpCode 
      });
      
      if (response.data.success) {
        // Success - save session
        const session = {
          user: { 
            email: response.data.client.email, 
            name: `${response.data.client.first_name} ${response.data.client.last_name}` 
          },
          clientData: response.data.client
        };
        localStorage.setItem('clientPortalSession', JSON.stringify(session));
        setCurrentUser(session.user);
        setClientData(session.clientData);
        setIsAuthenticated(true);
      } else {
        setLoginError(response.data.error || 'Невалиден код');
        if (response.data.attempts_remaining !== undefined) {
          setAttemptsRemaining(response.data.attempts_remaining);
        }
      }
    } catch (error) {
      console.error('VerifyOTP error:', error);
      setLoginError(error.response?.data?.error || 'Възникна грешка. Моля, опитайте отново.');
      if (error.response?.data?.attempts_remaining !== undefined) {
        setAttemptsRemaining(error.response.data.attempts_remaining);
      }
    }
    
    setIsVerifyingOTP(false);
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoginError('');
    setIsSendingOTP(true);
    
    try {
      const response = await base44.functions.invoke('sendOTP', { email: email.toLowerCase() });
      
      if (response.success) {
        setOtpSessionId(response.otp_session_id);
        setCountdown(60);
        setOtpCode('');
        setLoginStep('otp');
      } else {
        setLoginError(response.error || 'Грешка при изпращане на код');
      }
    } catch (error) {
      console.error('ResendOTP error:', error);
      setLoginError('Възникна грешка. Моля, опитайте отново.');
    }
    
    setIsSendingOTP(false);
  };

  const handleBackToEmail = () => {
    setLoginStep('email');
    setOtpCode('');
    setOtpSessionId(null);
    setLoginError('');
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
      <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="max-w-md mx-auto px-6 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20"
          >
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30"
              >
                {loginStep === 'email' ? (
                  <Mail className="h-10 w-10 text-white" />
                ) : (
                  <Key className="h-10 w-10 text-white" />
                )}
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Клиентски портал
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-blue-200"
              >
                {loginStep === 'email' 
                  ? 'Въведете имейл за вход' 
                  : 'Въведете кода от имейла'}
              </motion.p>
            </div>

            {loginStep === 'email' ? (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="text-blue-100">Имейл</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:ring-blue-400/20 h-12"
                    required
                  />
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
                  transition={{ delay: 0.6 }}
                >
                  <Button 
                    type="submit"
                    disabled={isSendingOTP}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl py-6 text-lg font-semibold shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]"
                  >
                    {isSendingOTP ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Изпращане на код...
                      </>
                    ) : (
                      'Изпрати код за вход'
                    )}
                  </Button>
                </motion.div>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm text-blue-300/70 text-center"
                >
                  Кодът ще бъде изпратен на вашия имейл
                </motion.p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  type="button"
                  onClick={handleBackToEmail}
                  className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors mx-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Назад към имейл
                </motion.button>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="otp" className="text-blue-100">Код за потвърждение</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:ring-blue-400/20 h-12 text-center text-2xl tracking-[0.5em] font-mono"
                    required
                  />
                </motion.div>

                {loginError && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span>{loginError}</span>
                      {attemptsRemaining < 5 && (
                        <span className="text-xs bg-red-500/30 px-2 py-1 rounded">
                          {attemptsRemaining} опита
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button 
                    type="submit"
                    disabled={isVerifyingOTP || otpCode.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl py-6 text-lg font-semibold shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]"
                  >
                    {isVerifyingOTP ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Проверка...
                      </>
                    ) : (
                      'Вход в портала'
                    )}
                  </Button>
                </motion.div>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={countdown > 0}
                    className="text-blue-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {countdown > 0 ? (
                      <>
                        <Timer className="h-4 w-4 mr-2" />
                        Изпрати нов код след {countdown}с
                      </>
                    ) : (
                      'Изпрати нов код'
                    )}
                  </Button>
                </div>
              </form>
            )}
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
    <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Здравейте, {clientData.first_name}! 👋
            </h1>
            <p className="text-slate-500 mt-1">
              Вашият личен финансов портал • {new Date().toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="rounded-xl bg-white/50 backdrop-blur-sm border-slate-200/50 hover:bg-white hover:shadow-lg transition-all">
                <Bell className="h-4 w-4 mr-2" />
                Известия
                {pendingPayments.length > 0 && (
                  <Badge className="ml-2 bg-gradient-to-r from-red-500 to-rose-500 border-0">{pendingPayments.length}</Badge>
                )}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" onClick={handleLogout} className="rounded-xl bg-white/50 backdrop-blur-sm border-slate-200/50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
                <LogOut className="h-4 w-4 mr-2" />
                Изход
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-blue-500/5 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Стойност на портфолио</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{totalValue.toLocaleString('bg-BG')} €</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <Wallet className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-green-500/5 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Месечни вноски</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{totalMonthlyPremium.toLocaleString('bg-BG')} €</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-purple-500/5 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Активни продукти</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{activeProducts.length}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-amber-500/5 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Предстоящи падежи</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{upcomingMaturity.length}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-sm p-1.5 rounded-2xl flex-wrap shadow-lg shadow-slate-200/50 border-0">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 transition-all px-4">Преглед</TabsTrigger>
            <TabsTrigger value="dossier" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 transition-all px-4">
              <FileText className="h-4 w-4 mr-2" />
              Досие
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 transition-all px-4">Продукти</TabsTrigger>
            <TabsTrigger value="payments" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 transition-all px-4">Вноски</TabsTrigger>
            <TabsTrigger value="proposed" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 transition-all px-4">
              Предложени
              {proposedProducts.length > 0 && (
                <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 border-0">{proposedProducts.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 transition-all px-4">Календар</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 transition-all px-4">Известия</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 transition-all px-4">Документи</TabsTrigger>
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
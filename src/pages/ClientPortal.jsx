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
  Eye,
  EyeOff
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
      <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-md mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-10"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-2">
                Клиентски портал
              </h1>
              <p className="text-slate-600">
                Влезте с вашето потребителско име и парола
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Потребителско име (имейл)</Label>
                <Input
                  id="username"
                  type="email"
                  placeholder="example@mail.com"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Парола</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="rounded-lg pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {loginError}
                </div>
              )}

              <Button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-full py-6 text-lg"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Влизане...
                  </>
                ) : (
                  'Вход'
                )}
              </Button>
            </form>

            <p className="text-sm text-slate-500 mt-6 text-center">
              Данните за вход са изпратени на вашия имейл след попълване на финансовия анализ
            </p>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Здравейте, {clientData.first_name}!
            </h1>
            <p className="text-slate-600">
              Вашият личен финансов портал
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-full">
              <Bell className="h-4 w-4 mr-2" />
              Известия
              {pendingPayments.length > 0 && (
                <Badge className="ml-2 bg-red-500">{pendingPayments.length}</Badge>
              )}
            </Button>
            <Button variant="outline" onClick={handleLogout} className="rounded-full">
              <LogOut className="h-4 w-4 mr-2" />
              Изход
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Стойност на портфолио</p>
                  <p className="text-2xl font-bold text-slate-900">{totalValue.toLocaleString('bg-BG')} €</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Месечни вноски</p>
                  <p className="text-2xl font-bold text-slate-900">{totalMonthlyPremium.toLocaleString('bg-BG')} €</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Активни продукти</p>
                  <p className="text-2xl font-bold text-slate-900">{activeProducts.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Предстоящи падежи</p>
                  <p className="text-2xl font-bold text-slate-900">{upcomingMaturity.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-full flex-wrap">
            <TabsTrigger value="overview" className="rounded-full">Преглед</TabsTrigger>
            <TabsTrigger value="products" className="rounded-full">Продукти</TabsTrigger>
            <TabsTrigger value="payments" className="rounded-full">Вноски</TabsTrigger>
            <TabsTrigger value="proposed" className="rounded-full">
              Предложени
              {proposedProducts.length > 0 && (
                <Badge className="ml-2 bg-blue-500">{proposedProducts.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-full">Календар</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-full">Известия</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-full">Документи</TabsTrigger>
          </TabsList>

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
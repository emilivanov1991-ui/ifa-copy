import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  TrendingUp, 
  Shield,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  PiggyBank,
  Users,
  Calendar,
  Euro,
  BarChart3
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function FinancialPlanView() {
  const [planId, setPlanId] = useState('');
  const [plan, setPlan] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const urlPlanId = urlParams.get('id');

  useEffect(() => {
    if (urlPlanId) {
      setPlanId(urlPlanId);
      loadPlan(urlPlanId);
    }
  }, [urlPlanId]);

  const loadPlan = async (id) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const planData = await base44.entities.FinancialPlan.filter({ id });
      if (planData && planData.length > 0) {
        setPlan(planData[0]);
        
        // Зареждаме офертите
        const offersData = await base44.entities.ProductOffer.filter({ plan_id: id });
        setOffers(offersData);
      } else {
        toast.error('Планът не е намерен');
      }
    } catch (error) {
      console.error(error);
      toast.error('Грешка при зареждане: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!plan && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Няма зареден финансов план</p>
        </div>
      </div>
    );
  }

  const productsByType = {};
  if (plan && plan.products) {
    plan.products.forEach(p => {
      if (!productsByType[p.product_type]) {
        productsByType[p.product_type] = [];
      }
      productsByType[p.product_type].push(p);
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white mb-6 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">Финансов план</h1>
                  <p className="text-blue-100">
                    Създаден на: {plan ? new Date(plan.created_date).toLocaleDateString('bg-BG') : ''}
                  </p>
                  <Badge className="bg-white/20 text-white border-white/30 mt-2">
                    {plan?.plan_status === 'calculated' ? 'Изчислен' :
                     plan?.plan_status === 'approved' ? 'Одобрен' :
                     plan?.plan_status === 'sent_to_client' ? 'Изпратен' : 'Чернова'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {plan && (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Euro className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Месечна премия</p>
                      <p className="text-xl font-bold text-slate-900">
                        {plan.total_monthly_premium?.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Обща защита</p>
                      <p className="text-xl font-bold text-slate-900">
                        {(plan.total_coverage / 1000).toFixed(0)}K €
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Възраст</p>
                      <p className="text-xl font-bold text-slate-900">
                        {plan.partner1_age} г
                        {plan.partner2_age > 0 && ` / ${plan.partner2_age} г`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Години до пенсия</p>
                      <p className="text-xl font-bold text-slate-900">
                        {plan.years_to_retirement_p1} г
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
                <TabsTrigger value="products">
                  <Shield className="w-4 h-4 mr-2" />
                  Продукти
                </TabsTrigger>
                <TabsTrigger value="summary">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Обобщение
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <FileText className="w-4 h-4 mr-2" />
                  Детайли
                </TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-4">
                {plan.products && plan.products.map((product, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {product.product_name}
                            </h3>
                            <Badge variant="outline">{product.provider}</Badge>
                          </div>
                          
                          <div className="text-sm text-slate-600 space-y-1">
                            <p>
                              <span className="text-slate-500">Бенефициент:</span> {product.beneficiary_name} ({product.beneficiary_age} г)
                            </p>
                            {product.coverage_amount > 0 && (
                              <p>
                                <span className="text-slate-500">Покритие:</span> {product.coverage_amount.toLocaleString()} EUR
                              </p>
                            )}
                            {product.term_years && (
                              <p>
                                <span className="text-slate-500">Срок:</span> {product.term_years} години
                              </p>
                            )}
                          </div>

                          {/* Coverage Details */}
                          {product.details?.coverages && (
                            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                              <p className="text-xs font-semibold text-slate-700 mb-2">Покрития:</p>
                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                {Object.entries(product.details.coverages).map(([key, value]) => {
                                  if (typeof value === 'boolean') {
                                    return value ? (
                                      <div key={key} className="flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                                        <span>{key}</span>
                                      </div>
                                    ) : null;
                                  }
                                  return (
                                    <div key={key}>
                                      <span className="text-slate-500">{key}:</span> {typeof value === 'number' ? value.toLocaleString() : value} EUR
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <p className="text-sm text-slate-600">Месечна премия</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {product.monthly_premium.toFixed(2)} €
                          </p>
                          {product.details?.daily_cost && (
                            <p className="text-xs text-slate-500 mt-1">
                              или {product.details.daily_cost} €/ден
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-4">
                <Card>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-4">
                    <CardTitle className="text-base text-blue-800">Финансов преглед</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-600">Общ месечен доход:</span>
                      <span className="font-semibold">{plan.total_monthly_income?.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-600">Общи месечни разходи:</span>
                      <span className="font-semibold">{plan.total_monthly_expenses?.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-600">Месечен баланс:</span>
                      <span className="font-semibold text-green-600">
                        {plan.available_for_investment?.toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-600">Премия по плана:</span>
                      <span className="font-semibold text-blue-600">
                        {plan.total_monthly_premium?.toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-lg">
                      <span>Остатък:</span>
                      <span className="text-green-700">
                        {((plan.available_for_investment || 0) - (plan.total_monthly_premium || 0)).toFixed(2)} €
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 py-4">
                    <CardTitle className="text-base text-purple-800">Нужди от защита</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-600">Защита клиент:</span>
                      <span className="font-semibold">
                        {(plan.protection_need_p1 / 1000).toFixed(0)}K €
                      </span>
                    </div>
                    {plan.protection_need_p2 > 0 && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-slate-600">Защита партньор:</span>
                        <span className="font-semibold">
                          {(plan.protection_need_p2 / 1000).toFixed(0)}K €
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-600">Нужда от резерв:</span>
                      <span className="font-semibold">
                        {(plan.reserve_need / 1000).toFixed(0)}K €
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes">
                <Card>
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 py-4">
                    <CardTitle className="text-base text-slate-800">Детайлна информация</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <pre className="text-xs bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto whitespace-pre-wrap font-mono">
                      {plan.notes}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Изтегли PDF
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Одобри плана
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
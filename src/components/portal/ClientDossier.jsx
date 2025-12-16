import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Package
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const statusConfig = {
  draft: { label: 'Чернова', color: 'bg-slate-100 text-slate-700', icon: Clock },
  calculated: { label: 'Изчислен', color: 'bg-blue-100 text-blue-700', icon: TrendingUp },
  approved: { label: 'Одобрен', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  sent_to_client: { label: 'Изпратен', color: 'bg-purple-100 text-purple-700', icon: CheckCircle2 },
  generated: { label: 'Генерирана', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Отхвърлена', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function ClientDossier({ clientId, analysisId = null, showAllClients = false }) {
  // Fetch financial analyses
  const { data: analyses = [] } = useQuery({
    queryKey: ['financial-analyses', clientId, analysisId],
    queryFn: async () => {
      if (analysisId) {
        const analysis = await base44.entities.FinancialAnalysisSubmission.filter({ id: analysisId });
        return analysis;
      }
      if (clientId) {
        return await base44.entities.FinancialAnalysisSubmission.filter({ 
          client_email: clientId 
        }, '-created_date');
      }
      return [];
    },
    enabled: !!(clientId || analysisId),
  });

  // Fetch financial plans
  const { data: plans = [] } = useQuery({
    queryKey: ['financial-plans', clientId, analysisId],
    queryFn: async () => {
      if (analysisId) {
        return await base44.entities.FinancialPlan.filter({ analysis_id: analysisId }, '-created_date');
      }
      if (clientId) {
        return await base44.entities.FinancialPlan.filter({ client_id: clientId }, '-created_date');
      }
      return [];
    },
    enabled: !!(clientId || analysisId),
  });

  // Fetch product offers
  const { data: offers = [] } = useQuery({
    queryKey: ['product-offers', clientId, analysisId],
    queryFn: async () => {
      if (analysisId) {
        return await base44.entities.ProductOffer.filter({ analysis_id: analysisId }, '-created_date');
      }
      if (clientId) {
        return await base44.entities.ProductOffer.filter({ client_id: clientId }, '-created_date');
      }
      return [];
    },
    enabled: !!(clientId || analysisId),
  });

  const totalOffers = offers.length;
  const approvedOffers = offers.filter(o => o.offer_status === 'generated' || o.offer_status === 'sent').length;
  const totalPlans = plans.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Финансови анализи</p>
                  <p className="text-3xl font-bold text-blue-600">{analyses.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Финансови планове</p>
                  <p className="text-3xl font-bold text-purple-600">{totalPlans}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Продуктови оферти</p>
                  <p className="text-3xl font-bold text-green-600">{totalOffers}</p>
                  <p className="text-xs text-green-600 mt-1">{approvedOffers} одобрени</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="analyses" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white shadow-md rounded-lg p-1">
          <TabsTrigger value="analyses" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md">
            Анализи
          </TabsTrigger>
          <TabsTrigger value="plans" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md">
            Планове
          </TabsTrigger>
          <TabsTrigger value="offers" className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md">
            Оферти
          </TabsTrigger>
        </TabsList>

        {/* Financial Analyses */}
        <TabsContent value="analyses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Финансови анализи
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyses.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>Няма налични финансови анализи</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analyses.map((analysis, idx) => (
                    <motion.div
                      key={analysis.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-slate-900">
                              {analysis.client_first_name} {analysis.client_last_name}
                            </h4>
                            {analysis.status && (
                              <Badge className={statusConfig[analysis.status]?.color || 'bg-slate-100'}>
                                {statusConfig[analysis.status]?.label || analysis.status}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
                            <div>
                              <span className="font-medium">Email:</span> {analysis.client_email}
                            </div>
                            <div>
                              <span className="font-medium">Телефон:</span> {analysis.client_phone}
                            </div>
                            <div>
                              <span className="font-medium">Възраст:</span> {analysis.client_age}
                            </div>
                            <div>
                              <span className="font-medium">Дата:</span> {new Date(analysis.created_date).toLocaleDateString('bg-BG')}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            <span className="font-medium">ID:</span> {analysis.id}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="ml-4">
                          <Eye className="h-4 w-4 mr-2" />
                          Преглед
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Plans */}
        <TabsContent value="plans" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Финансови планове
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plans.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>Няма налични финансови планове</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {plans.map((plan, idx) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-gradient-to-r from-purple-50 to-slate-50 rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-slate-900">Финансов план</h4>
                            {plan.plan_status && (
                              <Badge className={statusConfig[plan.plan_status]?.color || 'bg-slate-100'}>
                                {statusConfig[plan.plan_status]?.label || plan.plan_status}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
                            <div>
                              <span className="font-medium">Месечен доход:</span> {plan.total_monthly_income?.toLocaleString()} €
                            </div>
                            <div>
                              <span className="font-medium">За инвестиране:</span> {plan.available_for_investment?.toLocaleString()} €
                            </div>
                            <div>
                              <span className="font-medium">Общо премия:</span> {plan.total_monthly_premium?.toLocaleString()} €
                            </div>
                            <div>
                              <span className="font-medium">Дата:</span> {new Date(plan.created_date).toLocaleDateString('bg-BG')}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            <span className="font-medium">ID:</span> {plan.id} | <span className="font-medium">Analysis ID:</span> {plan.analysis_id}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Преглед
                          </Button>
                          {plan.pdf_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={plan.pdf_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Offers */}
        <TabsContent value="offers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Продуктови оферти
              </CardTitle>
            </CardHeader>
            <CardContent>
              {offers.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>Няма налични продуктови оферти</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {offers.map((offer, idx) => (
                    <motion.div
                      key={offer.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-gradient-to-r from-green-50 to-slate-50 rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-slate-900">{offer.product_name}</h4>
                            {offer.offer_status && (
                              <Badge className={statusConfig[offer.offer_status]?.color || 'bg-slate-100'}>
                                {statusConfig[offer.offer_status]?.label || offer.offer_status}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {offer.provider}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {offer.product_type}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600 mb-2">
                            <div>
                              <span className="font-medium">Бенефициент:</span> {offer.beneficiary_name || '-'}
                            </div>
                            <div>
                              <span className="font-medium">Месечна премия:</span> {offer.monthly_premium?.toFixed(2)} €
                            </div>
                            <div>
                              <span className="font-medium">Годишна премия:</span> {offer.annual_premium?.toFixed(2)} €
                            </div>
                            <div>
                              <span className="font-medium">Покритие:</span> {offer.coverage_amount?.toLocaleString()} €
                            </div>
                          </div>
                          {offer.ai_recommendation_reason && (
                            <div className="mt-2 text-xs text-purple-700 bg-purple-50 rounded-md p-2 border border-purple-100">
                              💡 {offer.ai_recommendation_reason}
                            </div>
                          )}
                          <div className="mt-2 text-xs text-slate-500">
                            <span className="font-medium">ID:</span> {offer.id} | 
                            <span className="font-medium"> Analysis ID:</span> {offer.analysis_id} | 
                            <span className="font-medium"> Дата:</span> {new Date(offer.created_date).toLocaleDateString('bg-BG')}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Детайли
                          </Button>
                          {offer.pdf_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={offer.pdf_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
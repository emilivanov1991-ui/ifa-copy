import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  User, 
  Calendar, 
  TrendingUp, 
  Shield,
  Home,
  Users,
  PiggyBank,
  Download,
  Eye,
  Sparkles,
  ArrowRight,
  X,
  Clock,
  CheckCircle2,
  PenLine,
  Lock
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FinancialPlanGeneratorV2 from '../financial-plan/FinancialPlanGeneratorV2';
import AutoPlanGenerator from '../financial-plan/AutoPlanGenerator';
import AnalysisDetailView from '../consultant/AnalysisDetailView';

export default function ClientDossierView({ clientId }) {
  const [client, setClient] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showPlanGenerator, setShowPlanGenerator] = useState(false);
  const [viewingAnalysisId, setViewingAnalysisId] = useState(null);
  const navigate = useNavigate();

  // Expose setViewingAnalysisId globally
  React.useEffect(() => {
    window.setViewAnalysisId = setViewingAnalysisId;
    return () => {
      delete window.setViewAnalysisId;
    };
  }, []);

  useEffect(() => {
    loadDossier();
  }, [clientId]);

  const loadDossier = async () => {
    setLoading(true);
    try {
      // Зареждаме клиента
      const clientData = await base44.entities.Client.filter({ id: clientId });
      setClient(clientData[0]);

      // Зареждаме анализите
      const analysesData = await base44.entities.FinancialAnalysisSubmission.filter({ 
        client_id: clientId 
      });
      setAnalyses(analysesData);

      // Зареждаме финансовите планове
      const plansData = await base44.entities.FinancialPlan.filter({ 
        client_id: clientId 
      });
      setPlans(plansData);

      // Зареждаме продуктите
      const productsData = await base44.entities.FinancialProduct.filter({ 
        client_id: clientId 
      });
      setProducts(productsData);

    } catch (error) {
      console.error(error);
      toast.error('Грешка при зареждане на досието');
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

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Клиентът не е намерен</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {client.first_name} {client.last_name}
                </h2>
                <p className="text-blue-100">{client.email}</p>
                <p className="text-blue-100">{client.phone}</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              {client.status === 'pending' ? 'Чакащ' : 
               client.status === 'active' ? 'Активен' : 'Неактивен'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
          <TabsTrigger value="analysis">
            <FileText className="w-4 h-4 mr-2" />
            Анализи
          </TabsTrigger>
          <TabsTrigger value="plans">
            <TrendingUp className="w-4 h-4 mr-2" />
            Планове
          </TabsTrigger>
          <TabsTrigger value="products">
            <Shield className="w-4 h-4 mr-2" />
            Продукти
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" />
            Документи
          </TabsTrigger>
        </TabsList>

        {/* Анализи */}
        <TabsContent value="analysis" className="space-y-4">
          {analyses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">Все още няма анализи</p>
                <Button 
                  onClick={() => {
                    const plannerData = {
                      client_id: client.id,
                      family_type: client.family_type,
                      client_first_name: client.first_name,
                      client_last_name: client.last_name,
                      client_phone: client.phone,
                      client_email: client.email,
                      partner_first_name: client.partner_first_name,
                      partner_last_name: client.partner_last_name,
                      partner_email: client.partner_email,
                      children_count: client.children_count,
                      children_names: client.children_names,
                      children_ages: client.children_ages,
                      gdpr_consent_a: client.gdpr_consent_a,
                      gdpr_consent_b: client.gdpr_consent_b,
                      gdpr_consent_c: client.gdpr_consent_c
                    };
                    localStorage.setItem('financialPlannerData', JSON.stringify(plannerData));
                    window.location.href = createPageUrl('FinancialAnalysis');
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Започни финансов анализ
                </Button>
              </CardContent>
            </Card>
          ) : (() => {
            // Sort by created_date descending; primary = most recent
            const sorted = [...analyses].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
            const primary = sorted[0];
            const serviceAnalyses = sorted.slice(1);
            const hasPlan = plans.some(p => p.analysis_id === primary.id);

            const isCompleted = primary.current_step >= 10;
            const daysSinceCreation = (Date.now() - new Date(primary.created_date).getTime()) / (1000 * 60 * 60 * 24);
            const canEdit = isCompleted && daysSinceCreation <= 30;
            const canServiceAnalysis = isCompleted && daysSinceCreation > 30;

            const openClientPlannerData = (forceNew = false) => {
              const pd = {
                client_id: client.id,
                family_type: client.family_type,
                client_first_name: client.first_name,
                client_last_name: client.last_name,
                client_phone: client.phone,
                client_email: client.email,
                partner_first_name: client.partner_first_name,
                partner_last_name: client.partner_last_name,
                partner_email: client.partner_email,
                children_count: client.children_count,
                children_names: client.children_names,
                children_ages: client.children_ages,
                gdpr_consent_a: client.gdpr_consent_a,
                gdpr_consent_b: client.gdpr_consent_b,
                gdpr_consent_c: client.gdpr_consent_c,
                ...(forceNew ? { forceNewAnalysis: true } : {})
              };
              localStorage.setItem('financialPlannerData', JSON.stringify(pd));
              window.location.href = createPageUrl('FinancialAnalysis');
            };

            const AnalysisInfoRow = ({ analysis }) => (
              <div className="grid md:grid-cols-3 gap-4 text-sm mt-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-600">{analysis.client_first_name} {analysis.client_last_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-600">{analysis.client_age} години</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-600">
                    {analysis.include_partner ? 'С партньор' : 'Без партньор'}
                    {analysis.children_count > 0 && `, ${analysis.children_count} деца`}
                  </span>
                </div>
              </div>
            );

            return (
              <div className="space-y-6">
                {/* PRIMARY ANALYSIS */}
                {isCompleted ? (
                  /* === ЗАВЪРШЕН АНАЛИЗ === */
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-700 text-sm uppercase tracking-wide">Завършен анализ</span>
                    </div>
                    <Card className="border-green-200 shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-semibold text-slate-900">Финансов анализ</h3>
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Завършен
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-1">
                          Създаден: {new Date(primary.created_date).toLocaleDateString('bg-BG')}
                        </p>
                        <AnalysisInfoRow analysis={primary} />

                        {/* Action buttons for completed */}
                        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 gap-2">
                          {/* 1. Прегледай анализа */}
                          <Button
                            variant="outline"
                            onClick={() => { if (window.setViewAnalysisId) window.setViewAnalysisId(primary.id); }}
                            className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Прегледай анализа
                          </Button>

                          {/* 2. Промени анализ (active ≤30 days) */}
                          <div className="relative">
                            <Button
                              variant="outline"
                              disabled={!canEdit}
                              onClick={() => {
                                localStorage.setItem('resumeAnalysisId', primary.id);
                                window.location.href = createPageUrl('FinancialAnalysis');
                              }}
                              className={`w-full ${canEdit ? 'border-blue-300 text-blue-700 hover:bg-blue-50' : 'border-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                              {canEdit ? <PenLine className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                              Промени анализ
                              {!canEdit && (
                                <span className="ml-2 text-xs text-slate-400">(изтекъл 30-дневен срок)</span>
                              )}
                            </Button>
                            {canEdit && (
                              <p className="text-xs text-slate-400 mt-1 text-center">
                                <Clock className="w-3 h-3 inline mr-1" />
                                Активен още {Math.max(0, 30 - Math.floor(daysSinceCreation))} дни
                              </p>
                            )}
                          </div>

                          {/* 3. Създай финансов план */}
                          {hasPlan && (
                            <Badge className="bg-green-100 text-green-700 border-green-300 w-fit">
                              ✓ Финансовият план е създаден
                            </Badge>
                          )}
                          <Button
                            onClick={() => { setSelectedAnalysis(primary); setShowPlanGenerator(true); }}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Създай финансов план
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>

                          {/* 4. Нов Сервизен анализ (active >30 days) */}
                          <div className="relative">
                            <Button
                              variant="outline"
                              disabled={!canServiceAnalysis}
                              onClick={() => openClientPlannerData(true)}
                              className={`w-full ${canServiceAnalysis ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : 'border-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                              {canServiceAnalysis ? <FileText className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                              Направи нов (Сервизен) анализ
                              {!canServiceAnalysis && (
                                <span className="ml-2 text-xs text-slate-400">
                                  (активен след {Math.max(0, 31 - Math.floor(daysSinceCreation))} дни)
                                </span>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  /* === ЗАПОЧНАТ АНАЛИЗ (незавършен) === */
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <span className="font-semibold text-amber-700 text-sm uppercase tracking-wide">Започнат анализ</span>
                    </div>
                    <Card className="border-amber-200 shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-semibold text-slate-900">Финансов анализ</h3>
                          <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                            <Clock className="w-3 h-3 mr-1" /> Незавършен — стъпка {primary.current_step || 1} от 9
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-1">
                          Започнат: {new Date(primary.created_date).toLocaleDateString('bg-BG')}
                        </p>
                        <AnalysisInfoRow analysis={primary} />

                        <div className="mt-5 pt-4 border-t border-slate-100">
                          <Button
                            onClick={() => {
                              localStorage.setItem('resumeAnalysisId', primary.id);
                              window.location.href = createPageUrl('FinancialAnalysis');
                            }}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-md"
                          >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Довърши анализ
                          </Button>
                          <p className="text-xs text-slate-500 text-center mt-2">
                            Анализът остава незавършен докато не бъде финализиран от стъпка "Обобщение"
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Service / Older Analyses */}
                {serviceAnalyses.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                      Предишни анализи ({serviceAnalyses.length})
                    </p>
                    {serviceAnalyses.map((analysis) => {
                      const isOldCompleted = analysis.current_step >= 10;
                      return (
                        <Card key={analysis.id} className="border-slate-200 bg-slate-50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500">
                                  {new Date(analysis.created_date).toLocaleDateString('bg-BG')}
                                </span>
                                {isOldCompleted ? (
                                  <Badge className="bg-green-100 text-green-700 text-xs">Завършен</Badge>
                                ) : (
                                  <Badge className="bg-amber-100 text-amber-700 text-xs">
                                    Незавършен — стъпка {analysis.current_step || 1}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm"
                                  onClick={() => {
                                    localStorage.setItem('resumeAnalysisId', analysis.id);
                                    window.location.href = createPageUrl('FinancialAnalysis');
                                  }}
                                >
                                  <ArrowRight className="h-3 w-3 mr-1" />
                                  {isOldCompleted ? 'Прегледай' : 'Довърши'}
                                </Button>
                                <Button variant="ghost" size="sm"
                                  onClick={() => { if (window.setViewAnalysisId) window.setViewAnalysisId(analysis.id); }}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Детайли
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Plan Generator Modal */}
          {showPlanGenerator && selectedAnalysis && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-slate-50 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
                  <h2 className="text-xl font-semibold text-slate-900">Генериране на финансов план</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setShowPlanGenerator(false);
                      setSelectedAnalysis(null);
                      loadDossier(); // Reload to show updated plan
                    }}
                  >
                    Затвори
                  </Button>
                </div>
                <div className="p-6">
                  <AutoPlanGenerator 
                    analysisId={selectedAnalysis.id}
                    analysisData={selectedAnalysis}
                    onComplete={() => {
                      setShowPlanGenerator(false);
                      setSelectedAnalysis(null);
                      loadDossier();
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Analysis Detail View Modal */}
          {viewingAnalysisId && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
                  <h2 className="text-xl font-semibold text-slate-900">Преглед на анализ</h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setViewingAnalysisId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <AnalysisDetailView analysis={analyses.find(a => a.id === viewingAnalysisId)} />
              </div>
            </div>
          )}
        </TabsContent>

        {/* Планове */}
        <TabsContent value="plans" className="space-y-4">
          {plans.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Все още няма създадени планове</p>
              </CardContent>
            </Card>
          ) : (
            plans.map((plan) => (
              <Card key={plan.id}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Финансов план
                  </h3>
                  <div className="text-sm text-slate-600">
                    Създаден на: {new Date(plan.created_date).toLocaleDateString('bg-BG')}
                  </div>
                  <Button className="mt-4">
                    <Eye className="w-4 h-4 mr-2" />
                    Преглед на плана
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Продукти */}
        <TabsContent value="products" className="space-y-4">
          {products.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Все още няма активни продукти</p>
              </CardContent>
            </Card>
          ) : (
            products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                      <p className="text-sm text-slate-600">{product.provider}</p>
                      <Badge className="mt-2">{product.status}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Месечна вноска</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {product.monthly_premium} лв
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Документи */}
        <TabsContent value="documents">
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Раздел за документи (скоро)</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
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
  X
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
                    // Запазваме client_id и отваряме анализа
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
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => {
                const hasPlan = plans.some(p => p.analysis_id === analysis.id);
                
                return (
                  <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              Финансов анализ
                            </h3>
                            <Badge variant="outline">
                              {new Date(analysis.created_date).toLocaleDateString('bg-BG')}
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 text-sm mt-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-600" />
                              <span className="text-slate-600">
                                {analysis.client_first_name} {analysis.client_last_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="text-slate-600">
                                {analysis.client_age} години
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="text-slate-600">
                                {analysis.include_partner ? 'С партньор' : 'Без партньор'}
                                {analysis.children_count > 0 && `, ${analysis.children_count} деца`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Load analysis and continue from where left off
                              localStorage.setItem('resumeAnalysisId', analysis.id);
                              window.location.href = createPageUrl('FinancialAnalysis');
                            }}
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            {analysis.current_step >= 9 ? 'Прегледай' : 'Довърши'} анализ
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (window.setViewAnalysisId) {
                                window.setViewAnalysisId(analysis.id);
                              }
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Детайли
                          </Button>
                        </div>
                      </div>

                      {/* Create Plan Button */}
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        {hasPlan && (
                          <Badge className="bg-green-100 text-green-700 border-green-300 mb-3">
                            ✓ Финансовият план е създаден
                          </Badge>
                        )}
                        <Button 
                          onClick={() => {
                            setSelectedAnalysis(analysis);
                            setShowPlanGenerator(true);
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Създай финансов план
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

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
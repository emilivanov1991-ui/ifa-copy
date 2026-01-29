import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Eye, 
  Search,
  User,
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FinancialPlanGeneratorV2 from '../financial-plan/FinancialPlanGeneratorV2';

export default function FinancialAnalysisTab() {
  const [analyses, setAnalyses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    setLoading(true);
    try {
      const analysesData = await base44.entities.FinancialAnalysisSubmission.list('-created_date', 100);
      setAnalyses(analysesData);

      // Зареждаме всички планове
      const plansData = await base44.entities.FinancialPlan.list('-created_date', 500);
      setPlans(plansData);
    } catch (error) {
      console.error(error);
      toast.error('Грешка при зареждане на анализите');
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const searchLower = searchTerm.toLowerCase();
    return (
      analysis.client_first_name?.toLowerCase().includes(searchLower) ||
      analysis.client_last_name?.toLowerCase().includes(searchLower) ||
      analysis.client_email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      {selectedAnalysis ? (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedAnalysis(null);
              loadAnalyses();
            }}
            className="mb-4"
          >
            ← Назад към списък
          </Button>
          <FinancialPlanGeneratorV2 
            analysisId={selectedAnalysis.id}
            analysisData={selectedAnalysis}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Card */}
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
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Търси анализ по име на клиент, имейл..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Analyses List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredAnalyses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Няма намерени анализи</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAnalyses.map((analysis) => {
                const hasPlan = plans.some(p => p.analysis_id === analysis.id);
                
                return (
                  <Card 
                    key={analysis.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {analysis.client_first_name} {analysis.client_last_name}
                            </h3>
                            <Badge variant="outline">
                              {new Date(analysis.created_date).toLocaleDateString('bg-BG')}
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 text-sm mt-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-600" />
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
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                              <span className="text-slate-600">
                                Доход: {((analysis.client_net_income || 0) + (analysis.partner_net_income || 0)).toLocaleString()} лв
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Create Plan Button */}
                      {!hasPlan && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <Button 
                            onClick={() => setSelectedAnalysis(analysis)}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Създай финансов план
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      )}

                      {hasPlan && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            ✓ Финансовият план е създаден
                          </Badge>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAnalysis(analysis)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Преглед
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, FileText, User, Calendar, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import FinancialPlanView from '../components/financial-plan/FinancialPlanView';

export default function FinancialPlanCreate() {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [planCreated, setPlanCreated] = useState(false);

  // Зареждане на всички анализи
  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ['analyses'],
    queryFn: () => base44.entities.FinancialAnalysisSubmission.list('-created_date', 50)
  });

  const filteredAnalyses = analyses.filter(a => {
    const searchLower = searchTerm.toLowerCase();
    return (
      a.client_first_name?.toLowerCase().includes(searchLower) ||
      a.client_last_name?.toLowerCase().includes(searchLower) ||
      a.client_email?.toLowerCase().includes(searchLower) ||
      a.client_phone?.includes(searchTerm)
    );
  });

  const handlePlanGenerated = (plan) => {
    setPlanCreated(true);
  };

  if (planCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="bg-white shadow-xl border-0">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Финансовият план е създаден успешно!
              </h2>
              <p className="text-slate-600 mb-8">
                Планът е запазен и готов за преглед от клиента.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedAnalysisId(null);
                    setPlanCreated(false);
                  }}
                >
                  Създай нов план
                </Button>
                <Link to={createPageUrl('ConsultantPortal')}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Към CRM портала
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Създаване на финансов план</h1>
          <p className="text-slate-600 mt-2">
            Изберете анализ, за да генерирате автоматичен финансов план
          </p>
        </div>

        {selectedAnalysisId ? (
          <div className="space-y-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedAnalysisId(null)}
              className="mb-4"
            >
              ← Назад към списъка
            </Button>
            <FinancialPlanView 
              analysisId={selectedAnalysisId}
              onPlanSaved={handlePlanGenerated}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Търсене по име, имейл или телефон..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Analyses List */}
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
                {filteredAnalyses.map((analysis) => (
                  <Card 
                    key={analysis.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedAnalysisId(analysis.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {analysis.client_first_name} {analysis.client_last_name}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {analysis.client_email} • {analysis.client_phone}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-400">
                                {new Date(analysis.created_date).toLocaleDateString('bg-BG')}
                              </span>
                              {analysis.include_partner && (
                                <Badge variant="outline" className="text-xs">
                                  + {analysis.partner_first_name}
                                </Badge>
                              )}
                              {analysis.children_count > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {analysis.children_count} деца
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge 
                              className={
                                analysis.status === 'converted' ? 'bg-green-100 text-green-700' :
                                analysis.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-700'
                              }
                            >
                              {analysis.status === 'converted' ? 'Конвертиран' :
                               analysis.status === 'in_progress' ? 'В процес' :
                               analysis.status === 'contacted' ? 'Контактуван' :
                               'Нов'}
                            </Badge>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Printer, Download, ChevronLeft, ChevronRight, Save, CheckCircle, Sparkles } from 'lucide-react';
import { calculateFinancialPlan } from './FinancialPlanCalculator';
import FinancialPlanPDF, { CoverPage, FinancialPlanMainPage, IncomeProtectionPage, PortfolioStructurePage } from './FinancialPlanPDF';
import AIProductRecommender from './AIProductRecommender';

export default function FinancialPlanView({ analysisId, onPlanSaved }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const printRef = useRef();
  const queryClient = useQueryClient();

  // Load analysis
  const { data: analysis, isLoading: loadingAnalysis } = useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: async () => {
      const analyses = await base44.entities.FinancialAnalysisSubmission.filter({ id: analysisId });
      return analyses[0];
    },
    enabled: !!analysisId
  });

  // Get current user as consultant
  const { data: consultant } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        return {
          name: user?.full_name || 'Консултант',
          email: user?.email || 'consultant@pgbg.bg',
          phone: ''
        };
      } catch {
        return { name: 'Консултант', email: 'consultant@pgbg.bg', phone: '' };
      }
    }
  });

  // Save plan mutation
  const savePlanMutation = useMutation({
    mutationFn: async (planData) => {
      return await base44.entities.FinancialPlan.create({
        analysis_id: analysisId,
        plan_status: 'calculated',
        ...planData
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['financial-plans']);
      if (onPlanSaved) onPlanSaved(data);
    }
  });

  // Generate plan when analysis loads
  useEffect(() => {
    if (analysis) {
      const plan = calculateFinancialPlan(analysis);
      setGeneratedPlan(plan);
    }
  }, [analysis]);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (generatedPlan) {
      savePlanMutation.mutate(generatedPlan);
    }
  };

  const [activeTab, setActiveTab] = useState('plan');

  const pages = [
    { name: 'Заглавна страница', component: CoverPage },
    { name: 'Финансов план', component: FinancialPlanMainPage },
    { name: 'Защита на дохода', component: IncomeProtectionPage },
    { name: 'Структура на портфейла', component: PortfolioStructurePage },
  ];

  if (loadingAnalysis || !generatedPlan) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Генериране на финансов план...</span>
      </div>
    );
  }

  const CurrentPageComponent = pages[currentPage].component;

  return (
    <div className="space-y-4">
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Финансов план
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Продуктови оферти
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="mt-4">
          <AIProductRecommender 
            analysisId={analysisId} 
            plan={generatedPlan}
          />
        </TabsContent>

        <TabsContent value="plan" className="mt-4 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-600 min-w-[200px] text-center">
            {pages[currentPage].name} ({currentPage + 1} / {pages.length})
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
            disabled={currentPage === pages.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Принтирай
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            size="sm"
            onClick={handleSave}
            disabled={savePlanMutation.isPending}
          >
            {savePlanMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : savePlanMutation.isSuccess ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {savePlanMutation.isSuccess ? 'Запазено' : 'Запази плана'}
          </Button>
        </div>
      </div>

      {/* Page Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {pages.map((page, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(idx)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              currentPage === idx
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {page.name}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="bg-slate-100 p-8 rounded-lg overflow-auto max-h-[800px]" ref={printRef}>
        <div className="bg-white shadow-xl mx-auto" style={{ maxWidth: '900px' }}>
          <CurrentPageComponent 
            plan={generatedPlan} 
            analysis={analysis} 
            consultant={consultant}
          />
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
        </TabsContent>
      </Tabs>
    </div>
  );
}
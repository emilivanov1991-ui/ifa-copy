import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  FolderOpen,
  Eye
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ClientDossierView from '../portal/ClientDossierView';
import AnalysisViewDialog from './AnalysisViewDialog';

export default function DossiersManager() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [viewAnalysisId, setViewAnalysisId] = useState(null);
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clientsData, analysesData] = await Promise.all([
        base44.entities.Client.list('-created_date', 100),
        base44.entities.FinancialAnalysisSubmission.list('-created_date', 200)
      ]);
      setClients(clientsData);
      setAnalyses(analysesData);
    } catch (error) {
      console.error(error);
      toast.error('Грешка при зареждане на данните');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine client stage
  const getClientStage = (client) => {
    const clientAnalyses = analyses.filter(a => a.client_id === client.id);
    
    if (clientAnalyses.length === 0) {
      return 'financial_planner';
    }
    
    const latestAnalysis = clientAnalyses.sort((a, b) => 
      new Date(b.created_date) - new Date(a.created_date)
    )[0];
    
    // Check if analysis is started (step 3 or higher) but not completed
    if (latestAnalysis.current_step >= 3 && latestAnalysis.current_step < 9) {
      return 'analysis_started';
    }
    
    // Check if analysis is completed (step 9)
    if (latestAnalysis.current_step >= 9 || latestAnalysis.status === 'converted') {
      // Check if plan is presented (slides viewed)
      if (client.plan_slides_viewed >= 7) {
        return 'plan_presented';
      }
      return 'analysis_completed';
    }
    
    // Check if client is signed and paid
    if (client.status === 'active' && client.has_active_products) {
      return 'signed_paid';
    }
    
    return 'financial_planner';
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.first_name?.toLowerCase().includes(searchLower) ||
      client.last_name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.includes(searchTerm)
    );
  });

  // Group clients by stage
  const groupedClients = {
    financial_planner: filteredClients.filter(c => getClientStage(c) === 'financial_planner'),
    analysis_started: filteredClients.filter(c => getClientStage(c) === 'analysis_started'),
    analysis_completed: filteredClients.filter(c => getClientStage(c) === 'analysis_completed'),
    plan_presented: filteredClients.filter(c => getClientStage(c) === 'plan_presented'),
    signed_paid: filteredClients.filter(c => getClientStage(c) === 'signed_paid'),
  };

  // Expose setViewAnalysisId to child components
  React.useEffect(() => {
    if (selectedClient) {
      window.setViewAnalysisId = setViewAnalysisId;
    }
    return () => {
      window.setViewAnalysisId = null;
    };
  }, [selectedClient]);

  if (selectedClient) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setSelectedClient(null)}
          className="mb-4"
        >
          ← Назад към списък
        </Button>

        <ClientDossierView clientId={selectedClient.id} />
        
        <AnalysisViewDialog
          analysisId={viewAnalysisId}
          open={!!viewAnalysisId}
          onOpenChange={(open) => !open && setViewAnalysisId(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Flow</h2>
              <p className="text-blue-100 text-sm">Следене на прогреса на клиентите</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Търси клиент по име, имейл или телефон..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid by Stage */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filteredClients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Няма намерени клиенти</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Financial Planner Column */}
          <div className="space-y-3">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 text-sm">Financial Planner</h3>
                <p className="text-xs text-blue-700 mt-1">{groupedClients.financial_planner.length} клиента</p>
              </CardContent>
            </Card>
            {groupedClients.financial_planner.map((client) => (
              <Card 
                key={client.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200"
                onClick={() => setSelectedClient(client)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow">
                      {client.first_name?.[0]}{client.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {client.first_name} {client.last_name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{client.email}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(client.created_date).toLocaleDateString('bg-BG')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analysis Started Column */}
          <div className="space-y-3">
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-amber-900 text-sm">Започнат анализ</h3>
                <p className="text-xs text-amber-700 mt-1">{groupedClients.analysis_started.length} клиента</p>
              </CardContent>
            </Card>
            {groupedClients.analysis_started.map((client) => (
              <Card 
                key={client.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-amber-200"
                onClick={() => setSelectedClient(client)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow">
                      {client.first_name?.[0]}{client.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {client.first_name} {client.last_name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{client.email}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(client.created_date).toLocaleDateString('bg-BG')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analysis Completed Column */}
          <div className="space-y-3">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-green-900 text-sm">Завършен анализ</h3>
                <p className="text-xs text-green-700 mt-1">{groupedClients.analysis_completed.length} клиента</p>
              </CardContent>
            </Card>
            {groupedClients.analysis_completed.map((client) => (
              <Card 
                key={client.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-green-200"
                onClick={() => setSelectedClient(client)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow">
                      {client.first_name?.[0]}{client.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {client.first_name} {client.last_name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{client.email}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(client.created_date).toLocaleDateString('bg-BG')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Plan Presented Column */}
          <div className="space-y-3">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-purple-900 text-sm">Презентиран план</h3>
                <p className="text-xs text-purple-700 mt-1">{groupedClients.plan_presented.length} клиента</p>
              </CardContent>
            </Card>
            {groupedClients.plan_presented.map((client) => (
              <Card 
                key={client.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200"
                onClick={() => setSelectedClient(client)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow">
                      {client.first_name?.[0]}{client.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {client.first_name} {client.last_name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{client.email}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(client.created_date).toLocaleDateString('bg-BG')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Signed & Paid Column */}
          <div className="space-y-3">
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-indigo-900 text-sm">Подписан и платен</h3>
                <p className="text-xs text-indigo-700 mt-1">{groupedClients.signed_paid.length} клиента</p>
              </CardContent>
            </Card>
            {groupedClients.signed_paid.map((client) => (
              <Card 
                key={client.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-indigo-200"
                onClick={() => setSelectedClient(client)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
                      {client.first_name?.[0]}{client.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {client.first_name} {client.last_name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{client.email}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(client.created_date).toLocaleDateString('bg-BG')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
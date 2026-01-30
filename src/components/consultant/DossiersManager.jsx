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

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.first_name?.toLowerCase().includes(searchLower) ||
      client.last_name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.includes(searchTerm)
    );
  });

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
              <h2 className="text-2xl font-bold">Клиентски досиета</h2>
              <p className="text-blue-100 text-sm">Преглед на анализи, планове и продукти</p>
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

      {/* Clients List */}
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
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <Card 
              key={client.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedClient(client)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
                      {client.first_name?.[0]}{client.last_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {client.first_name} {client.last_name}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {client.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(client.created_date).toLocaleDateString('bg-BG')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={
                      client.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      client.status === 'active' ? 'bg-green-100 text-green-700' :
                      'bg-slate-100 text-slate-700'
                    }>
                      {client.status === 'pending' ? 'Чакащ' : 
                       client.status === 'active' ? 'Активен' : 'Неактивен'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Досие
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
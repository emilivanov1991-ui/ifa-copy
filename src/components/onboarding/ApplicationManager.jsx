import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, CreditCard, Clock, CheckCircle2, XCircle, 
  Send, Download, RefreshCw, Bell, ChevronRight, Loader2,
  Calendar, Mail, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { generateApplicationPDF } from '../applications/ApplicationPDFGenerator';

const STATUS_CONFIG = {
  draft: { label: 'Чернова', color: 'bg-slate-100 text-slate-800', icon: FileText },
  pending_signature: { label: 'Очаква подпис', color: 'bg-amber-100 text-amber-800', icon: Clock },
  signed: { label: 'Подписано', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  submitted: { label: 'Изпратено', color: 'bg-purple-100 text-purple-800', icon: Send },
  approved: { label: 'Одобрено', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  rejected: { label: 'Отхвърлено', color: 'bg-red-100 text-red-800', icon: XCircle },
  cancelled: { label: 'Отменено', color: 'bg-slate-100 text-slate-500', icon: XCircle }
};

const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'Очаква плащане', color: 'text-amber-600' },
  paid: { label: 'Платено', color: 'text-green-600' },
  failed: { label: 'Неуспешно', color: 'text-red-600' }
};

export default function ApplicationManager({ analysisId, clientId }) {
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch applications
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['clientApplications', analysisId],
    queryFn: () => base44.entities.ClientApplication.filter({ analysis_id: analysisId }),
    enabled: !!analysisId
  });

  // Fetch analysis data
  const { data: analysis } = useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: async () => {
      const results = await base44.entities.FinancialAnalysisSubmission.filter({ id: analysisId });
      return results[0];
    },
    enabled: !!analysisId
  });

  // Create application mutation
  const createAppMutation = useMutation({
    mutationFn: (data) => base44.entities.ClientApplication.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientApplications'] });
      toast.success('Заявлението е създадено');
    }
  });

  // Update application mutation
  const updateAppMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ClientApplication.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientApplications'] });
      toast.success('Заявлението е обновено');
    }
  });

  // Generate application number
  const generateAppNumber = () => {
    const date = new Date();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `APP-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${random}`;
  };

  // Create new application from offer
  const createApplication = async (offer) => {
    const appData = {
      analysis_id: analysisId,
      client_id: clientId,
      offer_id: offer.id,
      application_number: generateAppNumber(),
      status: 'draft',
      product_type: offer.product_type,
      provider: offer.provider,
      product_name: offer.product_name,
      monthly_premium: offer.monthly_premium,
      annual_premium: offer.annual_premium || offer.monthly_premium * 12,
      coverage_amount: offer.coverage_amount,
      term_years: offer.term_years,
      payment_method: 'card',
      payment_frequency: 'monthly',
      initial_payment_status: 'pending'
    };

    createAppMutation.mutate(appData);
  };

  // Generate PDF application
  const generatePDF = async (app) => {
    toast.info('Генериране на PDF...');
    try {
      const pdfUrl = await generateApplicationPDF(app, analysis);
      
      updateAppMutation.mutate({
        id: app.id,
        data: {
          status: 'pending_signature',
          application_pdf_url: pdfUrl
        }
      });
      
      toast.success('PDF заявлението е генерирано успешно');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Грешка при генериране на PDF');
    }
  };

  // Send reminder
  const sendReminder = async (app) => {
    try {
      await base44.integrations.Core.SendEmail({
        to: analysis?.client_email,
        subject: `Напомняне: Заявление ${app.application_number}`,
        body: `
          Здравейте ${analysis?.client_first_name},
          
          Напомняме Ви, че имате незавършено заявление за ${app.product_name}.
          
          Моля, влезте в портала си, за да завършите процеса.
          
          С уважение,
          Вашият финансов консултант
        `
      });

      updateAppMutation.mutate({
        id: app.id,
        data: {
          reminder_count: (app.reminder_count || 0) + 1,
          next_reminder_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });

      toast.success('Напомнянето е изпратено');
    } catch (error) {
      toast.error('Грешка при изпращане на напомняне');
    }
  };

  // Filter applications by tab
  const filteredApps = applications.filter(app => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return ['draft', 'pending_signature'].includes(app.status);
    if (activeTab === 'submitted') return ['submitted', 'signed'].includes(app.status);
    if (activeTab === 'completed') return ['approved', 'rejected', 'cancelled'].includes(app.status);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Заявления и Onboarding</h2>
          <p className="text-sm text-slate-500">
            Управление на заявления, подписи и плащания
          </p>
        </div>
        <Button onClick={() => {}} className="gap-2">
          <FileText className="w-4 h-4" />
          Ново Заявление
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-xs text-slate-500">Общо заявления</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {applications.filter(a => ['draft', 'pending_signature'].includes(a.status)).length}
                </p>
                <p className="text-xs text-slate-500">Чакащи</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {applications.filter(a => a.status === 'approved').length}
                </p>
                <p className="text-xs text-slate-500">Одобрени</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {applications.filter(a => a.initial_payment_status === 'paid').length}
                </p>
                <p className="text-xs text-slate-500">Платени</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Всички</TabsTrigger>
              <TabsTrigger value="pending">Чакащи</TabsTrigger>
              <TabsTrigger value="submitted">Изпратени</TabsTrigger>
              <TabsTrigger value="completed">Завършени</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Няма заявления</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApps.map(app => {
                const statusConfig = STATUS_CONFIG[app.status];
                const StatusIcon = statusConfig.icon;
                const paymentConfig = PAYMENT_STATUS_CONFIG[app.initial_payment_status];

                return (
                  <div 
                    key={app.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig.color}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{app.application_number}</span>
                          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                          {app.product_name} • {app.provider}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                          <span>{app.monthly_premium} лв./мес</span>
                          <span className={paymentConfig?.color}>
                            {paymentConfig?.label}
                          </span>
                          {app.created_date && (
                            <span>
                              Създадено: {format(new Date(app.created_date), 'dd MMM yyyy', { locale: bg })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {app.status === 'draft' && (
                        <Button variant="outline" size="sm" onClick={() => generatePDF(app)}>
                          <FileText className="w-4 h-4 mr-1" />
                          Генерирай PDF
                        </Button>
                      )}
                      {app.status === 'pending_signature' && (
                        <Button variant="outline" size="sm" onClick={() => sendReminder(app)}>
                          <Bell className="w-4 h-4 mr-1" />
                          Напомни
                        </Button>
                      )}
                      {app.status === 'signed' && app.initial_payment_status === 'pending' && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedApp(app);
                            setIsPaymentDialogOpen(true);
                          }}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Плащане
                        </Button>
                      )}
                      {app.application_pdf_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={app.application_pdf_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Плащане на първоначална премия</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Заявление</p>
                <p className="font-medium">{selectedApp.application_number}</p>
                <p className="text-sm">{selectedApp.product_name}</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">Сума за плащане</p>
                <p className="text-2xl font-bold text-green-800">
                  {selectedApp.monthly_premium} лв.
                </p>
                <p className="text-xs text-green-600">Първоначална месечна премия</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Метод на плащане</label>
                <Select defaultValue="card">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Банкова карта</SelectItem>
                    <SelectItem value="bank_transfer">Банков превод</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-700">
                    След успешно плащане ще бъде настроено автоматично месечно плащане.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Отказ
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 gap-2">
                  <CreditCard className="w-4 h-4" />
                  Плати {selectedApp.monthly_premium} лв.
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
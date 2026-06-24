import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, Filter, Eye, DollarSign, CheckCircle2, Clock, AlertCircle,
  TrendingUp, Users, FileText, Calendar, CreditCard, Percent
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Journey stages mapping
const JOURNEY_STAGES = {
  discovery_not_started: { label: 'Няма започнат', color: 'bg-slate-100 text-slate-700', icon: Clock },
  discovery_intro_in_progress: { label: 'Въвеждане', color: 'bg-blue-100 text-blue-700', icon: FileText },
  discovery_collecting: { label: 'Събиране на данни', color: 'bg-blue-200 text-blue-800', icon: FileText },
  discovery_resumed_pending_reverification: { label: 'Пре-верификация', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  discovery_ready_for_review: { label: 'Готов за преглед', color: 'bg-blue-300 text-blue-900', icon: CheckCircle2 },
  discovery_blocked: { label: 'Блокиран', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  analysis_approved: { label: 'Анализ одобрен', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  plan_generating: { label: 'Генериране на план', color: 'bg-purple-100 text-purple-700', icon: TrendingUp },
  plan_ready: { label: 'План готов', color: 'bg-purple-200 text-purple-800', icon: FileText },
  plan_auto_sell_blocked: { label: 'Изисква преглед', color: 'bg-amber-200 text-amber-800', icon: AlertCircle },
  presentation_intro_pending: { label: 'Изчаква презентация', color: 'bg-indigo-100 text-indigo-700', icon: Clock },
  presentation_in_progress: { label: 'Презентация', color: 'bg-indigo-200 text-indigo-800', icon: TrendingUp },
  presentation_stopped_boundary: { label: 'Спряна презентация', color: 'bg-red-200 text-red-800', icon: AlertCircle },
  application_collecting: { label: 'Събиране на документи', color: 'bg-cyan-100 text-cyan-700', icon: FileText },
  application_incomplete: { label: 'Непълно заявление', color: 'bg-amber-300 text-amber-900', icon: AlertCircle },
  application_ready_for_signing: { label: 'Готов за подпис', color: 'bg-cyan-200 text-cyan-800', icon: CheckCircle2 },
  signing_in_progress: { label: 'Подписване', color: 'bg-cyan-300 text-cyan-900', icon: CreditCard },
  signing_failed: { label: 'Подпис неуспешен', color: 'bg-red-300 text-red-900', icon: AlertCircle },
  payment_in_progress: { label: 'Плащане', color: 'bg-green-200 text-green-800', icon: DollarSign },
  payment_failed: { label: 'Плащане неуспешно', color: 'bg-red-400 text-red-900', icon: AlertCircle },
  provider_submission_in_progress: { label: 'Изпращане към застраховател', color: 'bg-emerald-100 text-emerald-700', icon: FileText },
  completed: { label: 'Завършен', color: 'bg-green-300 text-green-900', icon: CheckCircle2 },
  graceful_stop: { label: 'Спрян', color: 'bg-slate-200 text-slate-700', icon: Clock },
};

// Stage groups for kanban
const STAGE_GROUPS = {
  'Discovery': ['discovery_not_started', 'discovery_intro_in_progress', 'discovery_collecting', 'discovery_resumed_pending_reverification', 'discovery_ready_for_review', 'discovery_blocked'],
  'Analysis & Plan': ['analysis_approved', 'plan_generating', 'plan_ready', 'plan_auto_sell_blocked'],
  'Presentation': ['presentation_intro_pending', 'presentation_in_progress', 'presentation_stopped_boundary'],
  'Application': ['application_collecting', 'application_incomplete', 'application_ready_for_signing'],
  'Signing & Payment': ['signing_in_progress', 'signing_failed', 'payment_in_progress', 'payment_failed'],
  'Completion': ['provider_submission_in_progress', 'completed', 'graceful_stop'],
};

export default function JourneyStagesCRM() {
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'

  useEffect(() => {
    loadJourneys();
  }, []);

  const loadJourneys = async () => {
    try {
      const data = await base44.entities.Journey.filter({}, '-created_date', 100);
      setJourneys(data);
    } catch (error) {
      console.error('Failed to load journeys:', error);
      toast.error('Грешка при зареждане на клиентите');
    } finally {
      setLoading(false);
    }
  };

  // Enrich journeys with client and payment data
  const enrichedJourneys = journeys.map(journey => {
    const stage = JOURNEY_STAGES[journey.journey_state] || JOURNEY_STAGES.discovery_not_started;
    return {
      ...journey,
      stageLabel: stage.label,
      stageColor: stage.color,
      stageIcon: stage.icon,
    };
  });

  // Filter journeys
  const filteredJourneys = enrichedJourneys.filter(journey => {
    const matchesSearch = journey.client_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          journey.user_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || journey.journey_state === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Group journeys by stage for kanban
  const journeysByStage = {};
  Object.keys(STAGE_GROUPS).forEach(group => {
    journeysByStage[group] = [];
  });

  filteredJourneys.forEach(journey => {
    const group = Object.keys(STAGE_GROUPS).find(g => 
      STAGE_GROUPS[g].includes(journey.journey_state)
    );
    if (group) {
      journeysByStage[group].push(journey);
    }
  });

  // Statistics
  const stats = {
    total: journeys.length,
    discovery: journeys.filter(j => j.journey_state?.includes('discovery')).length,
    presentation: journeys.filter(j => j.journey_state?.includes('presentation')).length,
    payment: journeys.filter(j => j.journey_state?.includes('payment')).length,
    completed: journeys.filter(j => j.journey_state === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-600">Зареждане на клиенти...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                <p className="text-xs text-blue-700">Всичко клиенти</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-900">{stats.discovery}</p>
                <p className="text-xs text-purple-700">Discovery</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold text-indigo-900">{stats.presentation}</p>
                <p className="text-xs text-indigo-700">Презентации</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-900">{stats.payment}</p>
                <p className="text-xs text-green-700">Плащания</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-emerald-900">{stats.completed}</p>
                <p className="text-xs text-emerald-700">Завършени</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Търси по ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-56">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Филтър по стадий" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички стадии</SelectItem>
              {Object.entries(JOURNEY_STAGES).map(([key, val]) => (
                <SelectItem key={key} value={key}>{val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            className={`rounded-none ${viewMode === 'kanban' ? 'bg-blue-600' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Kanban
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            className={`rounded-none ${viewMode === 'list' ? 'bg-blue-600' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FileText className="h-4 w-4 mr-1" />
            Списък
          </Button>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Object.entries(STAGE_GROUPS).map(([group, stages]) => (
            <div key={group} className="space-y-3">
              <h3 className="font-semibold text-slate-700 text-sm sticky top-0 bg-slate-50 py-2">
                {group} ({journeysByStage[group].length})
              </h3>
              <div className="space-y-2">
                {journeysByStage[group].map(journey => (
                  <JourneyCard
                    key={journey.id}
                    journey={journey}
                    onClick={() => setSelectedJourney(journey)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Клиент ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Стадий</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Прогрес</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Създаден</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Последна активност</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJourneys.map(journey => (
                    <tr key={journey.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-900 font-mono text-xs">{journey.client_id?.slice(-8)}</td>
                      <td className="py-3 px-4">
                        <Badge className={journey.stageColor}>
                          {journey.stageLabel}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${journey.discovery_progress_percent || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-600">{journey.discovery_progress_percent || 0}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {new Date(journey.created_date).toLocaleDateString('bg-BG')}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {new Date(journey.last_activity_at).toLocaleDateString('bg-BG')}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedJourney(journey)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Детайли
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journey Detail Modal */}
      {selectedJourney && (
        <JourneyDetailModal
          journey={selectedJourney}
          onClose={() => setSelectedJourney(null)}
        />
      )}
    </div>
  );
}

function JourneyCard({ journey, onClick }) {
  const StageIcon = journey.stageIcon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-lg border border-slate-200 p-3 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${journey.stageColor.split(' ')[0]}`}>
            <StageIcon className={`h-4 w-4 ${journey.stageColor.split(' ')[1]}`} />
          </div>
          <span className="text-xs font-mono text-slate-500">{journey.client_id?.slice(-8)}</span>
        </div>
        <Badge className={journey.stageColor}>{journey.stageLabel}</Badge>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Прогрес</span>
          <span>{journey.discovery_progress_percent || 0}%</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${journey.discovery_progress_percent || 0}%` }}
          />
        </div>
        <div className="text-xs text-slate-500">
          {new Date(journey.created_date).toLocaleDateString('bg-BG')}
        </div>
      </div>
    </motion.div>
  );
}

function JourneyDetailModal({ journey, onClose }) {
  const [client, setClient] = useState(null);
  const [paymentEvents, setPaymentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [journey.id]);

  const loadData = async () => {
    try {
      // Load client data
      if (journey.client_id) {
        const clients = await base44.entities.Client.filter({ id: journey.client_id });
        if (clients.length > 0) setClient(clients[0]);
      }

      // Load payment events
      const payments = await base44.entities.PaymentEvent.filter({ journey_id: journey.id });
      setPaymentEvents(payments);
    } catch (error) {
      console.error('Failed to load journey details:', error);
    } finally {
      setLoading(false);
    }
  };

  const StageIcon = journey.stageIcon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${journey.stageColor.split(' ')[0]}`}>
              <StageIcon className={`h-6 w-6 ${journey.stageColor.split(' ')[1]}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Детайли за клиент</h2>
              <p className="text-sm text-slate-500 font-mono">{journey.id}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>✕</Button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Client Info */}
              {client && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Информация за клиента
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Име</p>
                      <p className="font-medium">{client.first_name} {client.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium">{client.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Телефон</p>
                      <p className="font-medium">{client.phone || 'Няма'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Статус</p>
                      <Badge className={client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                        {client.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Journey Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Прогрес на Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Текущ стадий</span>
                    <Badge className={journey.stageColor}>{journey.stageLabel}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Прогрес</span>
                    <div className="flex items-center gap-2">
                      <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${journey.discovery_progress_percent || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{journey.discovery_progress_percent || 0}%</span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Създаден</p>
                      <p className="font-medium">{new Date(journey.created_date).toLocaleString('bg-BG')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Последна активност</p>
                      <p className="font-medium">{new Date(journey.last_activity_at).toLocaleString('bg-BG')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Език</p>
                      <p className="font-medium uppercase">{journey.language_code}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Events */}
              {paymentEvents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Плащания
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {paymentEvents.map(payment => (
                        <div key={payment.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-slate-500" />
                              <span className="font-medium">{payment.provider}</span>
                            </div>
                            <Badge className={
                              payment.status === 'succeeded' ? 'bg-green-100 text-green-700' :
                              payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }>
                              {payment.status}
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-slate-500">Сума: </span>
                              <span className="font-medium">{payment.amount} {payment.currency}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Дата: </span>
                              <span className="font-medium">{new Date(payment.initiated_at).toLocaleString('bg-BG')}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Опит: </span>
                              <span className="font-medium">#{payment.attempt_number}</span>
                            </div>
                          </div>
                          {payment.error_message && (
                            <p className="text-xs text-red-600 mt-2">{payment.error_message}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {journey.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Бележки
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{journey.notes}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
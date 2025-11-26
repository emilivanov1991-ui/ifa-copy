import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, Plus, Phone, Mail, Calendar, CheckCircle2, Clock, User,
  Video, Bell, AlertCircle, PhoneCall, Upload, Filter, UserPlus,
  Users, MapPin, CalendarCheck, LayoutGrid, List
} from 'lucide-react';
import { toast } from 'sonner';

import { CLIENT_TYPES, LEAD_TYPES, getStatusInfo, LEAD_STATUSES, OPPORTUNITY_STATUSES, CUSTOMER_STATUSES } from './crm/CRMConstants';
import ClientCard from './crm/ClientCard';
import MeetingOutcomeDialog from './crm/MeetingOutcomeDialog';
import LeadImportDialog from './crm/LeadImportDialog';
import CallOutcomeDialog from './CallOutcomeDialog';
import AICRMAssistant from './AICRMAssistant';
import KanbanBoard from './crm/KanbanBoard';

const mockClients = [
  { 
    id: 1, name: 'Иван Петров', firstName: 'Иван', lastName: 'Петров',
    email: 'ivan@example.com', phone: '+359 888 123 456', 
    type: 'customer', leadType: null, status: 'signed_and_paid',
    products: 3, value: 15000, score: 85, city: 'София',
    referrer: '', lastContact: '2024-01-20',
    tasks: [], reminders: [{ id: 1, text: 'Рожден ден на 15 февруари', date: '2024-02-15' }],
    communications: [
      { id: 1, type: 'call', date: '2024-01-20', notes: 'Обсъдихме нови инвестиционни възможности' },
    ]
  },
  { 
    id: 2, name: 'Мария Иванова', firstName: 'Мария', lastName: 'Иванова',
    email: 'maria@example.com', phone: '+359 888 234 567',
    type: 'lead', leadType: 'client', status: 'picked_up_arranged',
    products: 0, value: 0, score: 72, city: 'Пловдив',
    referrer: 'Петър Георгиев', lastContact: '2024-01-22',
    tasks: [{ id: 1, title: 'Life Planner среща', due: '2024-01-28', time: '14:00', status: 'pending', type: 'meeting' }],
    reminders: [],
    communications: [{ id: 1, type: 'call', date: '2024-01-22', notes: 'Насрочена LP среща', outcome: 'Picked Up - Arranged' }]
  },
  { 
    id: 3, name: 'Георги Димитров', firstName: 'Георги', lastName: 'Димитров',
    email: 'georgi@example.com', phone: '+359 888 345 678',
    type: 'lead', leadType: 'recruiting', status: 'new',
    products: 0, value: 0, score: 60, city: 'Варна',
    referrer: 'Анна Стоянова', lastContact: null,
    tasks: [], reminders: [], communications: []
  },
  { 
    id: 4, name: 'Елена Стоянова', firstName: 'Елена', lastName: 'Стоянова',
    email: 'elena@example.com', phone: '+359 888 456 789',
    type: 'opportunity', leadType: 'client', status: 'analysis_fpp_scheduled',
    products: 0, value: 0, score: 80, city: 'София',
    referrer: 'Иван Петров', lastContact: '2024-01-24',
    tasks: [{ id: 1, title: 'FPP Презентация', due: '2024-01-30', time: '10:00', status: 'pending', type: 'meeting' }],
    reminders: [],
    communications: [{ id: 1, type: 'meeting', date: '2024-01-24', notes: 'Анализ завършен, клиентът е заинтересован' }]
  },
];

const communicationIcons = { call: Phone, meeting: Video, email: Mail };

export default function ConsultantCRMAdvanced() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState(mockClients);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('kanban'); // 'list' or 'kanban'
  const [periodFilter, setPeriodFilter] = useState('all'); // 'all', '1m', '3m', '6m', '1y'
  
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isMeetingOutcomeOpen, setIsMeetingOutcomeOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddCommOpen, setIsAddCommOpen] = useState(false);
  
  const [callingClient, setCallingClient] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  
  const [newLead, setNewLead] = useState({
    firstName: '', lastName: '', phone: '', email: '', 
    city: '', referrer: '', additionalInfo: '', leadType: 'client'
  });

  // Handlers
  const handleCallClick = (client) => {
    window.location.href = `tel:${client.phone?.replace(/\s/g, '')}`;
    setCallingClient(client);
    setIsCallDialogOpen(true);
  };

  const handleCallOutcomeSave = (callData) => {
    setClients(prev => prev.map(client => {
      if (client.id === callData.clientId) {
        const updated = {
          ...client,
          status: callData.newStatus,
          lastContact: new Date().toISOString().split('T')[0],
          communications: [
            { id: Date.now(), type: 'call', date: new Date().toISOString().split('T')[0], 
              outcome: callData.outcomeLabel, notes: callData.notes },
            ...client.communications
          ]
        };
        
        // Add meeting task if required
        if (callData.meeting?.date) {
          updated.tasks = [
            { id: Date.now(), title: 'Life Planner среща', due: callData.meeting.date, 
              time: callData.meeting.time, status: 'pending', type: 'meeting' },
            ...(updated.tasks || [])
          ];
        }
        
        if (callData.followUp?.date) {
          updated.tasks = [
            { id: Date.now() + 1, title: callData.followUp.action || 'Последващо обаждане', 
              due: callData.followUp.date, status: 'pending' },
            ...(updated.tasks || [])
          ];
        }
        
        if (selectedClient?.id === client.id) setSelectedClient(updated);
        return updated;
      }
      return client;
    }));
    toast.success('Резултатът от обаждането е записан');
  };

  const handleMeetingClick = (client, meeting) => {
    setSelectedClient(client);
    setSelectedMeeting(meeting);
    setIsMeetingOutcomeOpen(true);
  };

  const handleMeetingOutcomeSave = (data) => {
    setClients(prev => prev.map(client => {
      if (client.id === data.clientId) {
        let updated = {
          ...client,
          status: data.newStatus,
          type: data.newType || client.type,
          lastContact: new Date().toISOString().split('T')[0],
        };

        // Mark meeting as completed
        if (data.meetingId) {
          updated.tasks = (client.tasks || []).map(t => 
            t.id === data.meetingId ? { ...t, status: 'completed', outcome: data.outcomeLabel } : t
          );
        }

        // Add next appointment task if required
        if (data.nextAppointment) {
          const meetingTitle = data.newStatus === 'lp_analysis_scheduled' ? 'Финансов анализ' :
                               data.newStatus === 'analysis_fpp_scheduled' ? 'FPP Презентация' :
                               data.newStatus === 'analysis_fpp_presented' ? 'Подписване на договор' :
                               'Следваща среща';
          updated.tasks = [
            { id: Date.now(), title: meetingTitle, due: data.nextAppointment.date, 
              time: data.nextAppointment.time, status: 'pending', type: 'meeting' },
            ...(updated.tasks || [])
          ];
        }

        // Add communication record
        updated.communications = [
          { id: Date.now(), type: 'meeting', date: new Date().toISOString().split('T')[0], 
            outcome: data.outcomeLabel, notes: data.notes },
          ...(client.communications || [])
        ];

        if (selectedClient?.id === client.id) setSelectedClient(updated);
        return updated;
      }
      return client;
    }));
    
    if (data.convertsTo) {
      toast.success(`Клиентът е преминал в ${data.convertsTo === 'opportunity' ? 'Opportunity' : 'Customer'}`);
    } else {
      toast.success('Резултатът от срещата е записан');
    }
  };

  const handleImportLeads = (leads) => {
    setClients(prev => [...leads, ...prev]);
  };

  const handleAddLead = () => {
    if (!newLead.firstName || !newLead.lastName) {
      toast.error('Моля, попълнете име и фамилия');
      return;
    }
    const lead = {
      id: Date.now(),
      name: `${newLead.firstName} ${newLead.lastName}`,
      ...newLead,
      type: 'lead',
      status: 'new',
      products: 0,
      value: 0,
      score: 50,
      tasks: [],
      reminders: [],
      communications: [],
      createdAt: new Date().toISOString()
    };
    setClients(prev => [lead, ...prev]);
    setNewLead({ firstName: '', lastName: '', phone: '', email: '', city: '', referrer: '', additionalInfo: '', leadType: 'client' });
    setIsAddLeadOpen(false);
    toast.success('Lead добавен успешно');
  };

  // Period filter helper
  const getFilterDate = (period) => {
    const now = new Date();
    switch (period) {
      case '1m': return new Date(now.setMonth(now.getMonth() - 1));
      case '3m': return new Date(now.setMonth(now.getMonth() - 3));
      case '6m': return new Date(now.setMonth(now.getMonth() - 6));
      case '1y': return new Date(now.setFullYear(now.getFullYear() - 1));
      default: return null;
    }
  };

  // Filters
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || client.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    // Period filter
    let matchesPeriod = true;
    if (periodFilter !== 'all') {
      const filterDate = getFilterDate(periodFilter);
      const clientDate = client.lastContact ? new Date(client.lastContact) : (client.createdAt ? new Date(client.createdAt) : null);
      if (filterDate && clientDate) {
        matchesPeriod = clientDate >= filterDate;
      }
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesPeriod;
  });

  // Pending meetings that need action
  const pendingMeetings = clients.flatMap(c => 
    (c.tasks || []).filter(t => t.type === 'meeting' && t.status === 'pending' && new Date(t.due) <= new Date())
      .map(t => ({ ...t, client: c }))
  );

  // Get all possible statuses for filter
  const allStatuses = { ...LEAD_STATUSES, ...OPPORTUNITY_STATUSES, ...CUSTOMER_STATUSES };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Търси клиент..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Импорт
            </Button>
            <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Нов Lead
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добави нов Lead</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Име *</Label>
                      <Input value={newLead.firstName} onChange={e => setNewLead({...newLead, firstName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Фамилия *</Label>
                      <Input value={newLead.lastName} onChange={e => setNewLead({...newLead, lastName: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Тип Lead</Label>
                    <Select value={newLead.leadType} onValueChange={v => setNewLead({...newLead, leadType: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Клиент</SelectItem>
                        <SelectItem value="recruiting">Рекрутинг</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Телефон</Label>
                      <Input value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Град</Label>
                      <Input value={newLead.city} onChange={e => setNewLead({...newLead, city: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Препоръчител</Label>
                      <Input value={newLead.referrer} onChange={e => setNewLead({...newLead, referrer: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Допълнителна информация</Label>
                    <Textarea value={newLead.additionalInfo} onChange={e => setNewLead({...newLead, additionalInfo: e.target.value})} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddLeadOpen(false)}>Отказ</Button>
                    <Button className="bg-blue-600" onClick={handleAddLead}>Добави</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички типове</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="opportunity">Opportunity</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички статуси</SelectItem>
                {Object.entries(allStatuses).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-36">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Период" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички</SelectItem>
                <SelectItem value="1m">1 месец</SelectItem>
                <SelectItem value="3m">3 месеца</SelectItem>
                <SelectItem value="6m">6 месеца</SelectItem>
                <SelectItem value="1y">1 година</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* View Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-none ${viewMode === 'list' ? 'bg-blue-600' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-1" />
              Списък
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-none ${viewMode === 'kanban' ? 'bg-blue-600' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Табло
            </Button>
          </div>
        </div>
      </div>

      {/* Pending Meetings Alert */}
      {pendingMeetings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CalendarCheck className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">{pendingMeetings.length} среща(и) чакат отчитане</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {pendingMeetings.slice(0, 3).map(m => (
                <div key={m.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <span className="text-sm">{m.client.name} - {m.title} ({m.due})</span>
                  <Button size="sm" onClick={() => handleMeetingClick(m.client, m)}>Отчети</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <KanbanBoard
          clients={filteredClients}
          onSelectClient={setSelectedClient}
          onCall={handleCallClick}
          selectedClient={selectedClient}
          onStatusChange={(client, newStatus, newType) => {
            setClients(prev => prev.map(c => {
              if (c.id === client.id) {
                const updated = { ...c, status: newStatus, type: newType };
                if (selectedClient?.id === c.id) setSelectedClient(updated);
                return updated;
              }
              return c;
            }));
          }}
        />
      )}

      <div className={`grid lg:grid-cols-3 gap-6 ${viewMode === 'kanban' ? 'mt-6' : ''}`}>
        {/* Clients List - Only show in list view */}
        {viewMode === 'list' && (
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-semibold text-slate-900">
              {typeFilter !== 'all' ? CLIENT_TYPES[typeFilter]?.label : 'Всички'} ({filteredClients.length})
            </h3>
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                isSelected={selectedClient?.id === client.id}
                onSelect={setSelectedClient}
                onCall={handleCallClick}
                onMeetingOutcome={handleMeetingClick}
              />
            ))}
          </div>
        )}

        {/* Client Detail */}
        <div className={viewMode === 'list' ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {selectedClient ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      selectedClient.type === 'lead' ? 'bg-amber-100' : 
                      selectedClient.type === 'opportunity' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      <span className={`text-xl font-medium ${
                        selectedClient.type === 'lead' ? 'text-amber-600' : 
                        selectedClient.type === 'opportunity' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {selectedClient.name?.split(' ').map(n => n?.[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{selectedClient.name}</h2>
                      <p className="text-slate-500">{selectedClient.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-slate-500">{selectedClient.phone}</p>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-7" onClick={() => handleCallClick(selectedClient)}>
                          <PhoneCall className="h-3.5 w-3.5 mr-1" />Обади се
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={CLIENT_TYPES[selectedClient.type]?.color}>
                      {CLIENT_TYPES[selectedClient.type]?.label}
                    </Badge>
                    <Badge className={getStatusInfo(selectedClient.type, selectedClient.status).color}>
                      {getStatusInfo(selectedClient.type, selectedClient.status).label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tasks">
                  <TabsList className="mb-4">
                    <TabsTrigger value="tasks">Задачи</TabsTrigger>
                    <TabsTrigger value="communications">Комуникация</TabsTrigger>
                    <TabsTrigger value="reminders">Напомняния</TabsTrigger>
                    <TabsTrigger value="ai">AI Асистент</TabsTrigger>
                  </TabsList>

                  <TabsContent value="tasks">
                    <div className="space-y-2">
                      {(selectedClient.tasks || []).length === 0 ? (
                        <p className="text-slate-500 text-center py-4">Няма задачи</p>
                      ) : (
                        selectedClient.tasks.map((task) => (
                          <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                            task.type === 'meeting' && task.status === 'pending' && new Date(task.due) <= new Date() 
                              ? 'border-amber-300 bg-amber-50' : 'border-slate-200'
                          }`}>
                            <div className="flex items-center gap-3">
                              {task.status === 'completed' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <Clock className="h-5 w-5 text-amber-500" />
                              )}
                              <div>
                                <p className={`font-medium ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                  {task.title}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {task.due} {task.time && `в ${task.time}`}
                                  {task.outcome && <Badge variant="outline" className="ml-2 text-xs">{task.outcome}</Badge>}
                                </p>
                              </div>
                            </div>
                            {task.type === 'meeting' && task.status === 'pending' && new Date(task.due) <= new Date() && (
                              <Button size="sm" onClick={() => handleMeetingClick(selectedClient, task)}>
                                Отчети
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="communications">
                    <div className="space-y-3">
                      {(selectedClient.communications || []).map((comm) => {
                        const Icon = communicationIcons[comm.type] || Phone;
                        return (
                          <div key={comm.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              comm.type === 'call' ? 'bg-green-100' : comm.type === 'meeting' ? 'bg-blue-100' : 'bg-purple-100'
                            }`}>
                              <Icon className={`h-4 w-4 ${
                                comm.type === 'call' ? 'text-green-600' : comm.type === 'meeting' ? 'text-blue-600' : 'text-purple-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-slate-900">
                                  {comm.type === 'call' ? 'Обаждане' : comm.type === 'meeting' ? 'Среща' : 'Имейл'}
                                </p>
                                <span className="text-xs text-slate-500">{comm.date}</span>
                              </div>
                              {comm.outcome && <Badge variant="outline" className="text-xs mt-1">{comm.outcome}</Badge>}
                              {comm.notes && <p className="text-sm text-slate-600 mt-1">{comm.notes}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="reminders">
                    <div className="space-y-2">
                      {(selectedClient.reminders || []).length === 0 ? (
                        <p className="text-slate-500 text-center py-4">Няма напомняния</p>
                      ) : (
                        selectedClient.reminders.map((reminder) => (
                          <div key={reminder.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                            <Bell className="h-5 w-5 text-blue-500" />
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{reminder.text}</p>
                              <p className="text-xs text-slate-500">{reminder.date}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="ai">
                    <AICRMAssistant 
                      client={selectedClient}
                      communications={selectedClient.communications}
                      onCreateTask={(task) => {
                        setClients(prev => prev.map(c => {
                          if (c.id === selectedClient.id) {
                            const newTask = { ...task, id: Date.now(), status: 'pending' };
                            const updated = { ...c, tasks: [newTask, ...(c.tasks || [])] };
                            setSelectedClient(updated);
                            return updated;
                          }
                          return c;
                        }));
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Изберете клиент от списъка</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CallOutcomeDialog 
        isOpen={isCallDialogOpen}
        onClose={() => { setIsCallDialogOpen(false); setCallingClient(null); }}
        client={callingClient}
        onSave={handleCallOutcomeSave}
      />

      <MeetingOutcomeDialog
        isOpen={isMeetingOutcomeOpen}
        onClose={() => { setIsMeetingOutcomeOpen(false); setSelectedMeeting(null); }}
        client={selectedClient}
        meeting={selectedMeeting}
        onSave={handleMeetingOutcomeSave}
      />

      <LeadImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportLeads}
      />
    </div>
  );
}
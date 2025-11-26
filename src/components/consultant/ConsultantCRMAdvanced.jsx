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
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar,
  CheckCircle2,
  Clock,
  User,
  MessageSquare,
  Video,
  Star,
  Bell,
  FileText,
  TrendingUp,
  AlertCircle,
  PhoneCall,
  Upload,
  Filter,
  UserPlus,
  Users,
  Briefcase,
  MapPin,
  CalendarCheck
} from 'lucide-react';
import CallOutcomeDialog from './CallOutcomeDialog';
import MeetingOutcomeDialog from './MeetingOutcomeDialog';
import LeadImportDialog from './LeadImportDialog';
import AICRMAssistant from './AICRMAssistant';
import { toast } from 'sonner';

// Client types
const CLIENT_TYPES = {
  lead: { label: 'Lead', color: 'bg-amber-100 text-amber-700' },
  prospect: { label: 'Prospect', color: 'bg-blue-100 text-blue-700' },
  client: { label: 'Клиент', color: 'bg-green-100 text-green-700' },
};

// Lead types
const LEAD_TYPES = {
  client: { label: 'Клиент', color: 'bg-blue-100 text-blue-700' },
  recruiting: { label: 'Рекрутинг', color: 'bg-purple-100 text-purple-700' },
};

// Lead/Call statuses
const LEAD_STATUSES = {
  new: { label: 'Нов', color: 'bg-slate-100 text-slate-700' },
  not_picked_up: { label: 'Not Picked Up', color: 'bg-red-100 text-red-700' },
  voice_mail: { label: 'Voice Mail', color: 'bg-amber-100 text-amber-700' },
  hung_up: { label: 'Hung Up', color: 'bg-orange-100 text-orange-700' },
  picked_up_not_arranged: { label: 'Picked Up - Not Arranged', color: 'bg-blue-100 text-blue-700' },
  picked_up_arranged: { label: 'Picked Up - Arranged', color: 'bg-green-100 text-green-700' },
  lp_not_interested: { label: 'LP - Analysis Not Interested', color: 'bg-red-100 text-red-700' },
  lp_analysis_scheduled: { label: 'LP - Analysis Scheduled', color: 'bg-green-100 text-green-700' },
};

const mockClients = [
  { 
    id: 1, 
    name: 'Иван Петров',
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan@example.com', 
    phone: '+359 888 123 456', 
    type: 'client',
    leadType: null,
    status: 'active',
    callStatus: null,
    products: 3, 
    value: 15000,
    score: 85,
    city: 'София',
    referrer: '',
    additionalInfo: '',
    lastContact: '2024-01-20',
    tasks: [
      { id: 1, title: 'Изпрати оферта за застраховка', due: '2024-01-26', status: 'pending' },
      { id: 2, title: 'Обаждане за преглед на портфолио', due: '2024-01-28', status: 'pending' }
    ],
    reminders: [
      { id: 1, text: 'Рожден ден на 15 февруари', date: '2024-02-15' }
    ],
    communications: [
      { id: 1, type: 'call', date: '2024-01-20', duration: '15 мин', notes: 'Обсъдихме нови инвестиционни възможности' },
      { id: 2, type: 'meeting', date: '2024-01-15', duration: '1 час', notes: 'Годишен преглед на портфолио' },
      { id: 3, type: 'email', date: '2024-01-10', notes: 'Изпратена информация за нови продукти' }
    ]
  },
  { 
    id: 2, 
    name: 'Мария Иванова',
    firstName: 'Мария',
    lastName: 'Иванова',
    email: 'maria@example.com', 
    phone: '+359 888 234 567',
    type: 'lead',
    leadType: 'client',
    status: 'picked_up_arranged',
    callStatus: 'picked_up_arranged',
    products: 0, 
    value: 0,
    score: 72,
    city: 'Пловдив',
    referrer: 'Петър Георгиев',
    additionalInfo: 'Среща през LinkedIn',
    lastContact: '2024-01-22',
    scheduledMeeting: { date: '2024-01-28', time: '14:00' },
    tasks: [
      { id: 1, title: 'Среща с Мария Иванова', due: '2024-01-28', time: '14:00', status: 'pending', type: 'meeting' }
    ],
    reminders: [],
    communications: [
      { id: 1, type: 'call', date: '2024-01-22', duration: '10 мин', notes: 'Първи контакт, интересува се от инвестиции', outcome: 'Picked Up - Arranged' }
    ]
  },
  { 
    id: 3, 
    name: 'Георги Димитров',
    firstName: 'Георги',
    lastName: 'Димитров',
    email: 'georgi@example.com', 
    phone: '+359 888 345 678',
    type: 'lead',
    leadType: 'recruiting',
    status: 'new',
    callStatus: null,
    products: 0, 
    value: 0,
    score: 60,
    city: 'Варна',
    referrer: 'Анна Стоянова',
    additionalInfo: 'Препоръка от колега',
    lastContact: null,
    tasks: [],
    reminders: [],
    communications: []
  },
  { 
    id: 4, 
    name: 'Стефан Николов',
    firstName: 'Стефан',
    lastName: 'Николов',
    email: 'stefan@example.com', 
    phone: '+359 888 456 789',
    type: 'client',
    leadType: null,
    status: 'active',
    callStatus: null,
    products: 2, 
    value: 8500,
    score: 68,
    city: 'Бургас',
    referrer: '',
    additionalInfo: '',
    lastContact: '2024-01-18',
    tasks: [],
    reminders: [
      { id: 1, text: 'Годишнина от договор на 1 март', date: '2024-03-01' }
    ],
    communications: [
      { id: 1, type: 'email', date: '2024-01-18', notes: 'Изпратен месечен отчет' }
    ]
  },
];

const getScoreColor = (score) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
};

const getScoreLabel = (score) => {
  if (score >= 80) return 'Горещ';
  if (score >= 60) return 'Топъл';
  return 'Студен';
};

const communicationIcons = {
  call: Phone,
  meeting: Video,
  email: Mail
};

export default function ConsultantCRMAdvanced() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddCommOpen, setIsAddCommOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [callingClient, setCallingClient] = useState(null);
  const [clients, setClients] = useState(mockClients);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isMeetingOutcomeOpen, setIsMeetingOutcomeOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [newLead, setNewLead] = useState({
    firstName: '', lastName: '', phone: '', email: '', 
    city: '', referrer: '', additionalInfo: '', leadType: 'client'
  });

  const handleCallClick = (client, e) => {
    e.stopPropagation();
    // Initiate call via tel: scheme
    window.location.href = `tel:${client.phone.replace(/\s/g, '')}`;
    // Open outcome dialog
    setCallingClient(client);
    setIsCallDialogOpen(true);
  };

  const handleCallOutcomeSave = (callData) => {
    // Update client status and add communication record
    setClients(prevClients => prevClients.map(client => {
      if (client.id === callData.clientId) {
        const newCommunication = {
          id: Date.now(),
          type: 'call',
          date: new Date().toISOString().split('T')[0],
          outcome: callData.outcomeLabel,
          notes: callData.notes,
          status: callData.newClientStatusLabel
        };

        const updatedClient = {
          ...client,
          status: callData.newClientStatus,
          lastContact: new Date().toISOString().split('T')[0],
          communications: [newCommunication, ...client.communications]
        };

        // Add follow-up task if specified
        if (callData.followUp?.date) {
          const newTask = {
            id: Date.now() + 1,
            title: callData.followUp.action || 'Последващо обаждане',
            due: callData.followUp.date,
            time: callData.followUp.time,
            status: 'pending'
          };
          updatedClient.tasks = [newTask, ...client.tasks];
        }

        // Add meeting task if arranged
        if (callData.meeting?.date) {
          const meetingTask = {
            id: Date.now() + 2,
            title: `Среща с ${client.name}${callData.meeting.location ? ` - ${callData.meeting.location}` : ''}`,
            due: callData.meeting.date,
            time: callData.meeting.time,
            status: 'pending',
            type: 'meeting'
          };
          updatedClient.tasks = [meetingTask, ...updatedClient.tasks];
        }

        // Update selectedClient if it's the same
        if (selectedClient?.id === client.id) {
          setSelectedClient(updatedClient);
        }

        return updatedClient;
      }
      return client;
    }));

    toast.success('Резултатът от обаждането е записан');
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
      callStatus: null,
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

  const handleMeetingClick = (client, task, e) => {
    e.stopPropagation();
    setSelectedClient(client);
    setSelectedMeeting(task);
    setIsMeetingOutcomeOpen(true);
  };

  const handleMeetingOutcomeSave = (data) => {
    setClients(prev => prev.map(client => {
      if (client.id === data.clientId) {
        const updated = {
          ...client,
          status: data.newClientStatus,
          callStatus: data.newClientStatus,
          lastContact: new Date().toISOString().split('T')[0],
        };

        // Mark meeting task as completed
        if (data.meetingId) {
          updated.tasks = client.tasks.map(t => 
            t.id === data.meetingId ? { ...t, status: 'completed', outcome: data.outcomeLabel } : t
          );
        }

        // Add analysis appointment task if scheduled
        if (data.analysisAppointment) {
          const analysisTask = {
            id: Date.now(),
            title: `Финансов анализ с ${client.name}`,
            due: data.analysisAppointment.date,
            time: data.analysisAppointment.time,
            status: 'pending',
            type: 'analysis'
          };
          updated.tasks = [analysisTask, ...updated.tasks];
          updated.analysisAppointment = data.analysisAppointment;
        }

        // Add communication record
        const comm = {
          id: Date.now(),
          type: 'meeting',
          date: new Date().toISOString().split('T')[0],
          outcome: data.outcomeLabel,
          notes: data.notes
        };
        updated.communications = [comm, ...client.communications];

        if (selectedClient?.id === client.id) {
          setSelectedClient(updated);
        }
        return updated;
      }
      return client;
    }));
    toast.success('Резултатът от срещата е записан');
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || client.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter || client.callStatus === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const allTasks = clients.flatMap(c => c.tasks.map(t => ({ ...t, clientName: c.name, clientId: c.id })));
  const pendingTasks = allTasks.filter(t => t.status === 'pending');

  // Check for meetings that need outcome
  const pendingMeetings = clients.flatMap(c => 
    c.tasks?.filter(t => t.type === 'meeting' && t.status === 'pending' && new Date(t.due) <= new Date())
      .map(t => ({ ...t, client: c })) || []
  );

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
                      <Input 
                        value={newLead.firstName} 
                        onChange={e => setNewLead({...newLead, firstName: e.target.value})}
                        placeholder="Име"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Фамилия *</Label>
                      <Input 
                        value={newLead.lastName} 
                        onChange={e => setNewLead({...newLead, lastName: e.target.value})}
                        placeholder="Фамилия"
                      />
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
                      <Input 
                        value={newLead.phone} 
                        onChange={e => setNewLead({...newLead, phone: e.target.value})}
                        placeholder="+359..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        type="email"
                        value={newLead.email} 
                        onChange={e => setNewLead({...newLead, email: e.target.value})}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Град</Label>
                      <Input 
                        value={newLead.city} 
                        onChange={e => setNewLead({...newLead, city: e.target.value})}
                        placeholder="Град"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Препоръчител</Label>
                      <Input 
                        value={newLead.referrer} 
                        onChange={e => setNewLead({...newLead, referrer: e.target.value})}
                        placeholder="Име на препоръчител"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Допълнителна информация</Label>
                    <Textarea 
                      value={newLead.additionalInfo} 
                      onChange={e => setNewLead({...newLead, additionalInfo: e.target.value})}
                      placeholder="Откъде е контактът, бележки..."
                    />
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

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички типове</SelectItem>
              <SelectItem value="lead">Leads</SelectItem>
              <SelectItem value="client">Клиенти</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички статуси</SelectItem>
              <SelectItem value="new">Нов</SelectItem>
              <SelectItem value="not_picked_up">Not Picked Up</SelectItem>
              <SelectItem value="voice_mail">Voice Mail</SelectItem>
              <SelectItem value="hung_up">Hung Up</SelectItem>
              <SelectItem value="picked_up_not_arranged">Picked Up - Not Arranged</SelectItem>
              <SelectItem value="picked_up_arranged">Picked Up - Arranged</SelectItem>
              <SelectItem value="lp_not_interested">LP - Not Interested</SelectItem>
              <SelectItem value="lp_analysis_scheduled">LP - Analysis Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pending Meetings Alert */}
      {pendingMeetings.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CalendarCheck className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-blue-800">Имате {pendingMeetings.length} среща(и) за отчитане</p>
                <p className="text-sm text-blue-600">Моля, отбележете резултата от проведените срещи</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {pendingMeetings.slice(0, 3).map(m => (
                <div key={m.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <span className="text-sm">{m.client.name} - {m.due}</span>
                  <Button size="sm" onClick={(e) => handleMeetingClick(m.client, m, e)}>
                    Отчети
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Tasks Alert */}
      {pendingTasks.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Имате {pendingTasks.length} чакащи задачи</p>
                <p className="text-sm text-amber-600">
                  {pendingTasks.slice(0, 2).map(t => t.title).join(', ')}
                  {pendingTasks.length > 2 && ` и още ${pendingTasks.length - 2}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Clients List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-semibold text-slate-900">
            {typeFilter === 'lead' ? 'Leads' : typeFilter === 'client' ? 'Клиенти' : 'Всички'} ({filteredClients.length})
          </h3>
          {filteredClients.map((client) => (
            <Card 
              key={client.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${selectedClient?.id === client.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedClient(client)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      client.type === 'lead' ? 'bg-amber-100' : 'bg-blue-100'
                    }`}>
                      <span className={`text-sm font-medium ${
                        client.type === 'lead' ? 'text-amber-600' : 'text-blue-600'
                      }`}>
                        {client.name?.split(' ').map(n => n?.[0] || '').join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{client.name}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        {client.city && <><MapPin className="h-3 w-3" /> {client.city}</>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={CLIENT_TYPES[client.type]?.color || 'bg-slate-100'}>
                      {CLIENT_TYPES[client.type]?.label}
                    </Badge>
                    {client.leadType && (
                      <Badge variant="outline" className={LEAD_TYPES[client.leadType]?.color}>
                        {LEAD_TYPES[client.leadType]?.label}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Status Badge */}
                {(client.callStatus || client.status) && LEAD_STATUSES[client.callStatus || client.status] && (
                  <div className="mt-2">
                    <Badge className={LEAD_STATUSES[client.callStatus || client.status]?.color}>
                      {LEAD_STATUSES[client.callStatus || client.status]?.label}
                    </Badge>
                  </div>
                )}

                {/* Referrer */}
                {client.referrer && (
                  <p className="text-xs text-slate-500 mt-2">
                    <Users className="h-3 w-3 inline mr-1" />
                    Препоръчител: {client.referrer}
                  </p>
                )}

                {/* Scheduled Meeting indicator */}
                {client.scheduledMeeting && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    Среща: {client.scheduledMeeting.date} {client.scheduledMeeting.time}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {client.type === 'client' && (
                    <>
                      <Badge variant="outline" className="text-xs">{client.products} продукта</Badge>
                      <Badge variant="outline" className="text-xs">{client.value?.toLocaleString() || 0} €</Badge>
                    </>
                  )}
                  {client.tasks?.filter(t => t.status === 'pending').length > 0 && (
                    <Badge className="bg-amber-100 text-amber-700 text-xs">
                      {client.tasks.filter(t => t.status === 'pending').length} задачи
                    </Badge>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={(e) => handleCallClick(client, e)}
                  >
                    <PhoneCall className="h-4 w-4 mr-1" />
                    Обади се
                  </Button>
                  {client.tasks?.some(t => t.type === 'meeting' && t.status === 'pending') && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        const meeting = client.tasks.find(t => t.type === 'meeting' && t.status === 'pending');
                        handleMeetingClick(client, meeting, e);
                      }}
                    >
                      <CalendarCheck className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Client Detail */}
        <div className="lg:col-span-2">
          {selectedClient ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xl font-medium text-blue-600">
                        {selectedClient.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{selectedClient.name}</h2>
                      <p className="text-slate-500">{selectedClient.email}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-slate-500">{selectedClient.phone}</p>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 h-7 px-2"
                          onClick={(e) => handleCallClick(selectedClient, e)}
                        >
                          <PhoneCall className="h-3.5 w-3.5 mr-1" />
                          Обади се
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full ${getScoreColor(selectedClient.score)} text-white text-sm font-medium`}>
                      Score: {selectedClient.score}
                    </div>
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
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Задачи ({selectedClient.tasks.length})</h4>
                      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" />
                            Добави
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Нова задача</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label>Заглавие</Label>
                              <Input placeholder="Опишете задачата" />
                            </div>
                            <div className="space-y-2">
                              <Label>Краен срок</Label>
                              <Input type="date" />
                            </div>
                            <div className="space-y-2">
                              <Label>Приоритет</Label>
                              <Select>
                                <SelectTrigger><SelectValue placeholder="Изберете" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="high">Висок</SelectItem>
                                  <SelectItem value="medium">Среден</SelectItem>
                                  <SelectItem value="low">Нисък</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>Отказ</Button>
                              <Button className="bg-blue-600">Запази</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="space-y-2">
                      {selectedClient.tasks.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">Няма задачи</p>
                      ) : (
                        selectedClient.tasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
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
                                <p className="text-xs text-slate-500">До: {task.due}</p>
                              </div>
                            </div>
                            {task.status !== 'completed' && (
                              <Button size="sm" variant="ghost">Завърши</Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="communications">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">История на комуникацията</h4>
                      <Dialog open={isAddCommOpen} onOpenChange={setIsAddCommOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" />
                            Добави
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Нова комуникация</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label>Тип</Label>
                              <Select>
                                <SelectTrigger><SelectValue placeholder="Изберете" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="call">Обаждане</SelectItem>
                                  <SelectItem value="meeting">Среща</SelectItem>
                                  <SelectItem value="email">Имейл</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Дата</Label>
                              <Input type="date" />
                            </div>
                            <div className="space-y-2">
                              <Label>Бележки</Label>
                              <Textarea placeholder="Опишете комуникацията..." />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setIsAddCommOpen(false)}>Отказ</Button>
                              <Button className="bg-blue-600">Запази</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="space-y-3">
                      {selectedClient.communications.map((comm) => {
                        const Icon = communicationIcons[comm.type];
                        return (
                          <div key={comm.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              comm.type === 'call' ? 'bg-green-100' : 
                              comm.type === 'meeting' ? 'bg-blue-100' : 'bg-purple-100'
                            }`}>
                              <Icon className={`h-4 w-4 ${
                                comm.type === 'call' ? 'text-green-600' : 
                                comm.type === 'meeting' ? 'text-blue-600' : 'text-purple-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-slate-900 capitalize">
                                  {comm.type === 'call' ? 'Обаждане' : comm.type === 'meeting' ? 'Среща' : 'Имейл'}
                                </p>
                                <span className="text-xs text-slate-500">{comm.date}</span>
                              </div>
                              {comm.duration && <p className="text-xs text-slate-500">Продължителност: {comm.duration}</p>}
                              {comm.outcome && (
                                <Badge variant="outline" className="text-xs mt-1">{comm.outcome}</Badge>
                              )}
                              {comm.status && (
                                <p className="text-xs text-slate-500 mt-1">Статус: {comm.status}</p>
                              )}
                              <p className="text-sm text-slate-600 mt-1">{comm.notes}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="reminders">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Напомняния</h4>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Добави
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {selectedClient.reminders.length === 0 ? (
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
                        // Add task to client
                        setClients(prev => prev.map(c => {
                          if (c.id === selectedClient.id) {
                            const newTask = { ...task, id: Date.now(), status: 'pending' };
                            const updated = { ...c, tasks: [newTask, ...c.tasks] };
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
      {/* Call Outcome Dialog */}
      <CallOutcomeDialog 
        isOpen={isCallDialogOpen}
        onClose={() => {
          setIsCallDialogOpen(false);
          setCallingClient(null);
        }}
        client={callingClient}
        onSave={handleCallOutcomeSave}
      />

      {/* Meeting Outcome Dialog */}
      <MeetingOutcomeDialog
        isOpen={isMeetingOutcomeOpen}
        onClose={() => {
          setIsMeetingOutcomeOpen(false);
          setSelectedMeeting(null);
        }}
        client={selectedClient}
        meeting={selectedMeeting}
        onSave={handleMeetingOutcomeSave}
      />

      {/* Lead Import Dialog */}
      <LeadImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportLeads}
      />
    </div>
  );
}
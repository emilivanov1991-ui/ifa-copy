import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Bell, 
  BellRing, 
  Calendar,
  MessageSquare,
  Trophy,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  Smartphone,
  Monitor,
  Mail,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';

const notificationSettings = [
  {
    category: 'Задачи и срещи',
    icon: Calendar,
    color: 'blue',
    settings: [
      { id: 'task_reminder', label: 'Напомняне за задачи', description: '30 мин преди крайния срок', enabled: true },
      { id: 'meeting_reminder', label: 'Напомняне за срещи', description: '15 мин преди срещата', enabled: true },
      { id: 'task_overdue', label: 'Просрочени задачи', description: 'Когато задача е просрочена', enabled: true },
    ]
  },
  {
    category: 'Съобщения',
    icon: MessageSquare,
    color: 'purple',
    settings: [
      { id: 'new_message', label: 'Нови съобщения', description: 'При получаване на ново съобщение', enabled: true },
      { id: 'client_reply', label: 'Отговор от клиент', description: 'Когато клиент отговори', enabled: true },
      { id: 'team_mention', label: 'Споменаване в екип', description: 'Когато ви споменат', enabled: false },
    ]
  },
  {
    category: 'Цели и комисионни',
    icon: Trophy,
    color: 'amber',
    settings: [
      { id: 'goal_achieved', label: 'Постигната цел', description: 'При достигане на цел', enabled: true },
      { id: 'commission_paid', label: 'Изплатена комисионна', description: 'При получаване на плащане', enabled: true },
      { id: 'milestone', label: 'Нов етап', description: 'При постигане на етап', enabled: true },
    ]
  },
  {
    category: 'Клиенти',
    icon: Users,
    color: 'green',
    settings: [
      { id: 'new_lead', label: 'Нов потенциален клиент', description: 'При нов lead', enabled: true },
      { id: 'client_birthday', label: 'Рожден ден на клиент', description: '1 ден преди', enabled: true },
      { id: 'contract_expiry', label: 'Изтичащ договор', description: '30 дни преди изтичане', enabled: true },
    ]
  },
];

const recentNotifications = [
  { id: 1, type: 'meeting', title: 'Среща след 15 мин', message: 'Среща с Иван Петров в 10:00', time: '09:45', read: false },
  { id: 2, type: 'commission', title: 'Нова комисионна', message: 'Получихте 350€ комисионна', time: '09:30', read: false },
  { id: 3, type: 'message', title: 'Ново съобщение', message: 'Мария Иванова ви изпрати съобщение', time: '09:15', read: true },
  { id: 4, type: 'goal', title: 'Цел постигната!', message: 'Достигнахте месечната цел за клиенти', time: 'Вчера', read: true },
  { id: 5, type: 'task', title: 'Задача наближава', message: 'Изпрати оферта на Георги - до 17:00', time: 'Вчера', read: true },
];

const notificationIcons = {
  meeting: Calendar,
  commission: DollarSign,
  message: MessageSquare,
  goal: Trophy,
  task: Clock,
};

export default function ConsultantNotifications() {
  const [settings, setSettings] = useState(
    notificationSettings.flatMap(cat => 
      cat.settings.map(s => ({ id: s.id, enabled: s.enabled }))
    ).reduce((acc, s) => ({ ...acc, [s.id]: s.enabled }), {})
  );
  const [channels, setChannels] = useState({
    push: true,
    email: true,
    desktop: true,
    sound: true,
  });
  const [quietHours, setQuietHours] = useState({ enabled: false, from: '22:00', to: '08:00' });

  const toggleSetting = (id) => {
    setSettings(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleChannel = (channel) => {
    setChannels(prev => ({ ...prev, [channel]: !prev[channel] }));
  };

  const unreadCount = recentNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Push известия</h2>
          <p className="text-slate-500">Управлявайте известията и настройките за PWA</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">
            <BellRing className="h-3 w-3 mr-1" />
            {unreadCount} нови
          </Badge>
          <Button variant="outline" size="sm">
            Маркирай всички като прочетени
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Notifications */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Последни известия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNotifications.map((notification) => {
                  const Icon = notificationIcons[notification.type];
                  return (
                    <div 
                      key={notification.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        notification.read ? 'bg-white' : 'bg-blue-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.type === 'meeting' ? 'bg-blue-100' :
                        notification.type === 'commission' ? 'bg-green-100' :
                        notification.type === 'message' ? 'bg-purple-100' :
                        notification.type === 'goal' ? 'bg-amber-100' : 'bg-slate-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          notification.type === 'meeting' ? 'text-blue-600' :
                          notification.type === 'commission' ? 'text-green-600' :
                          notification.type === 'message' ? 'text-purple-600' :
                          notification.type === 'goal' ? 'text-amber-600' : 'text-slate-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-slate-400">{notification.time}</span>
                        </div>
                        <p className="text-sm text-slate-500">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Channels */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Канали за известия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">Push известия</span>
                </div>
                <Switch checked={channels.push} onCheckedChange={() => toggleChannel('push')} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">Email</span>
                </div>
                <Switch checked={channels.email} onCheckedChange={() => toggleChannel('email')} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">Desktop</span>
                </div>
                <Switch checked={channels.desktop} onCheckedChange={() => toggleChannel('desktop')} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {channels.sound ? <Volume2 className="h-4 w-4 text-slate-500" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
                  <span className="text-sm">Звук</span>
                </div>
                <Switch checked={channels.sound} onCheckedChange={() => toggleChannel('sound')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Тих режим</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Активирай</span>
                <Switch 
                  checked={quietHours.enabled} 
                  onCheckedChange={(checked) => setQuietHours(prev => ({ ...prev, enabled: checked }))} 
                />
              </div>
              {quietHours.enabled && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">От</Label>
                    <Select value={quietHours.from} onValueChange={(v) => setQuietHours(prev => ({ ...prev, from: v }))}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['20:00', '21:00', '22:00', '23:00'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">До</Label>
                    <Select value={quietHours.to} onValueChange={(v) => setQuietHours(prev => ({ ...prev, to: v }))}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['06:00', '07:00', '08:00', '09:00'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notification Settings by Category */}
      <div className="grid md:grid-cols-2 gap-4">
        {notificationSettings.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className={`h-4 w-4 text-${category.color}-600`} />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.settings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{setting.label}</p>
                      <p className="text-xs text-slate-500">{setting.description}</p>
                    </div>
                    <Switch 
                      checked={settings[setting.id]} 
                      onCheckedChange={() => toggleSetting(setting.id)} 
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* PWA Install Prompt */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Инсталирайте приложението</h3>
              <p className="text-blue-100 text-sm">Добавете APEX Consultant към началния екран за бърз достъп и push известия</p>
            </div>
            <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
              <Smartphone className="h-4 w-4 mr-2" />
              Инсталирай
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Calendar,
  Mail,
  Database,
  Link2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Settings,
  ExternalLink,
  Clock,
  AlertCircle,
  Zap
} from 'lucide-react';

const integrations = [
  {
    id: 'outlook_calendar',
    name: 'Microsoft Outlook Calendar',
    description: 'Синхронизирайте събития и срещи с Outlook Calendar',
    icon: Calendar,
    status: 'connected',
    lastSync: '2024-01-25 10:30',
    events: 24,
    color: 'blue'
  },
  {
    id: 'outlook_mail',
    name: 'Microsoft Outlook Mail',
    description: 'Изпращайте и получавайте имейли директно от приложението',
    icon: Mail,
    status: 'connected',
    lastSync: '2024-01-25 10:28',
    emails: 156,
    color: 'purple'
  },
  {
    id: 'erp_system',
    name: 'ERP Система',
    description: 'Синхронизация на клиентски данни и поръчки',
    icon: Database,
    status: 'disconnected',
    lastSync: null,
    records: 0,
    color: 'green'
  },
  {
    id: 'bookings',
    name: 'Microsoft Bookings',
    description: 'Автоматично планиране на срещи с клиенти',
    icon: Clock,
    status: 'pending',
    lastSync: null,
    bookings: 0,
    color: 'amber'
  }
];

const syncLogs = [
  { time: '10:30', integration: 'Outlook Calendar', action: 'Синхронизирани 3 нови събития', status: 'success' },
  { time: '10:28', integration: 'Outlook Mail', action: 'Получени 5 нови имейла', status: 'success' },
  { time: '09:15', integration: 'Outlook Calendar', action: 'Актуализирана среща с Иван Петров', status: 'success' },
  { time: '09:00', integration: 'ERP Система', action: 'Неуспешна връзка', status: 'error' },
];

export default function ConsultantIntegrations() {
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [syncing, setSyncing] = useState({});

  const handleSync = async (id) => {
    setSyncing(prev => ({ ...prev, [id]: true }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncing(prev => ({ ...prev, [id]: false }));
  };

  const handleConnect = (integration) => {
    setSelectedIntegration(integration);
    setConnectDialogOpen(true);
  };

  const statusConfig = {
    connected: { label: 'Свързан', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    disconnected: { label: 'Несвързан', color: 'bg-slate-100 text-slate-700', icon: XCircle },
    pending: { label: 'Изчакващ', color: 'bg-amber-100 text-amber-700', icon: Clock },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Интеграции</h2>
          <p className="text-slate-500">Свържете външни системи за по-добра продуктивност</p>
        </div>
        <Badge variant="outline" className="h-fit">
          <Zap className="h-3 w-3 mr-1 text-green-500" />
          2 от 4 активни
        </Badge>
      </div>

      {/* Integration Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const status = statusConfig[integration.status];
          const StatusIcon = status.icon;

          return (
            <Card key={integration.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-${integration.color}-100 flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 text-${integration.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                      <Badge className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                  {integration.status === 'connected' && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleSync(integration.id)}
                      disabled={syncing[integration.id]}
                    >
                      <RefreshCw className={`h-4 w-4 ${syncing[integration.id] ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                </div>

                <p className="text-sm text-slate-500 mb-4">{integration.description}</p>

                {integration.status === 'connected' && (
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4 p-2 bg-slate-50 rounded-lg">
                    <span>Последна синхронизация: {integration.lastSync}</span>
                    {integration.events && <span>{integration.events} събития</span>}
                    {integration.emails && <span>{integration.emails} имейла</span>}
                  </div>
                )}

                <div className="flex gap-2">
                  {integration.status === 'connected' ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Настройки
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        Прекъсни
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700" 
                      size="sm"
                      onClick={() => handleConnect(integration)}
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Свържи
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Настройки за синхронизация</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
              <div>
                <p className="font-medium">Автоматична синхронизация</p>
                <p className="text-sm text-slate-500">Синхронизирай на всеки 15 минути</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
              <div>
                <p className="font-medium">Двупосочна синхронизация</p>
                <p className="text-sm text-slate-500">Промените се отразяват и в двете системи</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
              <div>
                <p className="font-medium">Известия за грешки</p>
                <p className="text-sm text-slate-500">Получавай известия при проблеми със синхронизацията</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Log */}
      <Card>
        <CardHeader>
          <CardTitle>Дневник на синхронизацията</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {syncLogs.map((log, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                {log.status === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-slate-500">{log.integration}</p>
                </div>
                <span className="text-xs text-slate-400">{log.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Свържи {selectedIntegration?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
              <p>За да свържете {selectedIntegration?.name}, ще бъдете пренасочени към Microsoft за оторизация.</p>
            </div>
            {selectedIntegration?.id === 'erp_system' && (
              <>
                <div className="space-y-2">
                  <Label>API Endpoint</Label>
                  <Input placeholder="https://your-erp.com/api" />
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input type="password" placeholder="Въведете API ключ" />
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>Отказ</Button>
              <Button className="bg-blue-600">
                <ExternalLink className="h-4 w-4 mr-2" />
                Свържи се
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
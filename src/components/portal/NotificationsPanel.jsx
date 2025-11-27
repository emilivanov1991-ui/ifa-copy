import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Wallet, 
  Calendar, 
  TrendingUp, 
  Package, 
  MessageSquare,
  Settings,
  Trash2,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const notificationIcons = {
  payment_reminder: { icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-100' },
  maturity_alert: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
  portfolio_change: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
  new_product: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
  advisor_message: { icon: MessageSquare, color: 'text-slate-600', bg: 'bg-slate-100' },
};

const notificationLabels = {
  payment_reminder: 'Напомняне за плащане',
  maturity_alert: 'Известие за падеж',
  portfolio_change: 'Промяна в портфолио',
  new_product: 'Нов продукт',
  advisor_message: 'Съобщение от консултант',
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-red-100 text-red-700',
};

export default function NotificationsPanel({ clientId }) {
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', clientId],
    queryFn: () => base44.entities.ClientNotification.filter({ client_id: clientId }, '-created_date'),
    enabled: !!clientId,
  });

  // Fetch settings
  const { data: settingsData } = useQuery({
    queryKey: ['notificationSettings', clientId],
    queryFn: async () => {
      const settings = await base44.entities.NotificationSettings.filter({ client_id: clientId });
      return settings[0] || null;
    },
    enabled: !!clientId,
  });

  const [settings, setSettings] = useState({
    payment_reminders: true,
    payment_reminder_days: 7,
    maturity_alerts: true,
    maturity_alert_days: 30,
    portfolio_changes: true,
    portfolio_change_threshold: 5,
    new_products: true,
    advisor_messages: true,
    email_notifications: true,
  });

  React.useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
    }
  }, [settingsData]);

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.ClientNotification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries(['notifications', clientId]),
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.ClientNotification.update(n.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries(['notifications', clientId]),
  });

  // Delete notification
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ClientNotification.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications', clientId]),
  });

  // Save settings
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings) => {
      if (settingsData?.id) {
        return base44.entities.NotificationSettings.update(settingsData.id, newSettings);
      } else {
        return base44.entities.NotificationSettings.create({ ...newSettings, client_id: clientId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notificationSettings', clientId]);
      setShowSettings(false);
    },
  });

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter !== 'all') return n.type === filter;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Известия</h2>
          {unreadCount > 0 && (
            <Badge className="bg-red-500">{unreadCount} непрочетени</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Маркирай всички
            </Button>
          )}
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Настройки
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Настройки за известия</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Payment Reminders */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Напомняния за плащания</Label>
                    <Switch 
                      checked={settings.payment_reminders}
                      onCheckedChange={(v) => setSettings({...settings, payment_reminders: v})}
                    />
                  </div>
                  {settings.payment_reminders && (
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-sm text-slate-600">Напомни ми</span>
                      <Input 
                        type="number" 
                        className="w-16 h-8" 
                        value={settings.payment_reminder_days}
                        onChange={(e) => setSettings({...settings, payment_reminder_days: parseInt(e.target.value) || 7})}
                      />
                      <span className="text-sm text-slate-600">дни преди падеж</span>
                    </div>
                  )}
                </div>

                {/* Maturity Alerts */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Известия за падежи на продукти</Label>
                    <Switch 
                      checked={settings.maturity_alerts}
                      onCheckedChange={(v) => setSettings({...settings, maturity_alerts: v})}
                    />
                  </div>
                  {settings.maturity_alerts && (
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-sm text-slate-600">Напомни ми</span>
                      <Input 
                        type="number" 
                        className="w-16 h-8" 
                        value={settings.maturity_alert_days}
                        onChange={(e) => setSettings({...settings, maturity_alert_days: parseInt(e.target.value) || 30})}
                      />
                      <span className="text-sm text-slate-600">дни преди падеж</span>
                    </div>
                  )}
                </div>

                {/* Portfolio Changes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Промени в стойността на портфолио</Label>
                    <Switch 
                      checked={settings.portfolio_changes}
                      onCheckedChange={(v) => setSettings({...settings, portfolio_changes: v})}
                    />
                  </div>
                  {settings.portfolio_changes && (
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-sm text-slate-600">При промяна над</span>
                      <Input 
                        type="number" 
                        className="w-16 h-8" 
                        value={settings.portfolio_change_threshold}
                        onChange={(e) => setSettings({...settings, portfolio_change_threshold: parseInt(e.target.value) || 5})}
                      />
                      <span className="text-sm text-slate-600">%</span>
                    </div>
                  )}
                </div>

                {/* New Products */}
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Нови предложени продукти</Label>
                  <Switch 
                    checked={settings.new_products}
                    onCheckedChange={(v) => setSettings({...settings, new_products: v})}
                  />
                </div>

                {/* Advisor Messages */}
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Съобщения от консултант</Label>
                  <Switch 
                    checked={settings.advisor_messages}
                    onCheckedChange={(v) => setSettings({...settings, advisor_messages: v})}
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Получавай известия по имейл</Label>
                    <Switch 
                      checked={settings.email_notifications}
                      onCheckedChange={(v) => setSettings({...settings, email_notifications: v})}
                    />
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => saveSettingsMutation.mutate(settings)}
                  disabled={saveSettingsMutation.isPending}
                >
                  {saveSettingsMutation.isPending ? 'Запазване...' : 'Запази настройките'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('all')}
          className="rounded-full"
        >
          Всички
        </Button>
        <Button 
          variant={filter === 'unread' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('unread')}
          className="rounded-full"
        >
          Непрочетени
        </Button>
        {Object.entries(notificationLabels).map(([key, label]) => (
          <Button 
            key={key}
            variant={filter === key ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter(key)}
            className="rounded-full"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="py-12 text-center">
            <BellOff className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Няма известия</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const config = notificationIcons[notification.type] || notificationIcons.advisor_message;
            const Icon = config.icon;
            
            return (
              <Card 
                key={notification.id} 
                className={cn(
                  "bg-white transition-all hover:shadow-md cursor-pointer",
                  !notification.is_read && "border-l-4 border-l-blue-500"
                )}
                onClick={() => !notification.is_read && markReadMutation.mutate(notification.id)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", config.bg)}>
                      <Icon className={cn("h-5 w-5", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={cn("font-medium", !notification.is_read && "text-slate-900")}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={priorityColors[notification.priority]}>
                            {notification.priority === 'high' ? 'Важно' : notification.priority === 'medium' ? 'Средно' : 'Ниско'}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(notification.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-400">
                          {new Date(notification.created_date).toLocaleString('bg-BG')}
                        </span>
                        {notification.is_read && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Прочетено
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
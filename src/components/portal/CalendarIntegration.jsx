import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  Building2,
  Download,
  Plus,
  Check,
  X,
  Loader2,
  CalendarPlus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const locationIcons = {
  office: { icon: Building2, label: 'В офиса' },
  online: { icon: Video, label: 'Онлайн' },
  phone: { icon: Phone, label: 'По телефон' },
};

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-slate-100 text-slate-700',
};

const statusLabels = {
  pending: 'Изчаква потвърждение',
  confirmed: 'Потвърдена',
  cancelled: 'Отказана',
  completed: 'Завършена',
};

export default function CalendarIntegration({ clientId, clientData, products = [], payments = [] }) {
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    datetime: '',
    duration_minutes: 60,
    location: 'office',
  });
  const queryClient = useQueryClient();

  // Fetch appointments
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', clientId],
    queryFn: () => base44.entities.ClientAppointment.filter({ client_id: clientId }, 'datetime'),
    enabled: !!clientId,
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: (data) => base44.entities.ClientAppointment.create({
      ...data,
      client_id: clientId,
      advisor_email: clientData?.advisor_email,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments', clientId]);
      setShowNewAppointment(false);
      setNewAppointment({
        title: '',
        description: '',
        datetime: '',
        duration_minutes: 60,
        location: 'office',
      });
    },
  });

  // Cancel appointment
  const cancelAppointmentMutation = useMutation({
    mutationFn: (id) => base44.entities.ClientAppointment.update(id, { status: 'cancelled' }),
    onSuccess: () => queryClient.invalidateQueries(['appointments', clientId]),
  });

  // Generate ICS for appointment
  const generateAppointmentICS = (appointment) => {
    const start = new Date(appointment.datetime);
    const end = new Date(start.getTime() + (appointment.duration_minutes || 60) * 60000);
    const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const locationText = locationIcons[appointment.location]?.label || appointment.location;
    
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//APEX Financial//Client Portal//BG
BEGIN:VEVENT
UID:appointment-${appointment.id}@apex-financial.bg
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${appointment.title}
DESCRIPTION:${appointment.description || 'Среща с финансов консултант'}
LOCATION:${locationText}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointment-${appointment.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate ICS for payment due date
  const generatePaymentICS = (payment, productName) => {
    const date = new Date(payment.due_date);
    const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//APEX Financial//Client Portal//BG
BEGIN:VEVENT
UID:payment-${payment.id}@apex-financial.bg
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(date)}
DTEND:${formatDate(new Date(date.getTime() + 3600000))}
SUMMARY:Плащане: ${productName}
DESCRIPTION:Дължима вноска от ${payment.amount} € за ${productName}
BEGIN:VALARM
TRIGGER:-P3D
ACTION:DISPLAY
DESCRIPTION:Напомняне за плащане
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-${payment.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate ICS for product maturity
  const generateMaturityICS = (product) => {
    if (!product.maturity_date) return;
    
    const date = new Date(product.maturity_date);
    const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//APEX Financial//Client Portal//BG
BEGIN:VEVENT
UID:maturity-${product.id}@apex-financial.bg
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(date)}
DTEND:${formatDate(new Date(date.getTime() + 3600000))}
SUMMARY:Падеж: ${product.name}
DESCRIPTION:Падеж на финансов продукт "${product.name}" от ${product.provider || 'N/A'}. Текуща стойност: ${product.current_value?.toLocaleString()} €
BEGIN:VALARM
TRIGGER:-P7D
ACTION:DISPLAY
DESCRIPTION:Напомняне за предстоящ падеж
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${product.name}-maturity.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export all important dates
  const exportAllDates = () => {
    let events = '';
    
    // Add product maturities
    products.filter(p => p.maturity_date).forEach(product => {
      const date = new Date(product.maturity_date);
      const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      events += `BEGIN:VEVENT
UID:maturity-${product.id}@apex-financial.bg
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(date)}
DTEND:${formatDate(new Date(date.getTime() + 3600000))}
SUMMARY:Падеж: ${product.name}
DESCRIPTION:Падеж на ${product.name}
END:VEVENT
`;
    });
    
    // Add pending payments
    payments.filter(p => p.status === 'pending' && p.due_date).forEach(payment => {
      const date = new Date(payment.due_date);
      const product = products.find(p => p.id === payment.product_id);
      const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      events += `BEGIN:VEVENT
UID:payment-${payment.id}@apex-financial.bg
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(date)}
DTEND:${formatDate(new Date(date.getTime() + 3600000))}
SUMMARY:Плащане: ${payment.amount} €
DESCRIPTION:Дължима вноска за ${product?.name || 'продукт'}
END:VEVENT
`;
    });
    
    // Add appointments
    appointments.filter(a => a.status !== 'cancelled').forEach(appointment => {
      const start = new Date(appointment.datetime);
      const end = new Date(start.getTime() + (appointment.duration_minutes || 60) * 60000);
      const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      events += `BEGIN:VEVENT
UID:appointment-${appointment.id}@apex-financial.bg
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${appointment.title}
DESCRIPTION:${appointment.description || ''}
END:VEVENT
`;
    });
    
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//APEX Financial//Client Portal//BG
${events}END:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apex-financial-calendar.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const upcomingAppointments = appointments.filter(a => 
    a.status !== 'cancelled' && a.status !== 'completed' && new Date(a.datetime) > new Date()
  );

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const upcomingMaturities = products.filter(p => {
    if (!p.maturity_date) return false;
    const maturity = new Date(p.maturity_date);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return maturity <= threeMonthsFromNow && maturity > new Date();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Календар и срещи</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAllDates}>
            <Download className="h-4 w-4 mr-2" />
            Експорт всички дати
          </Button>
          <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Насрочи среща
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Насрочване на нова среща</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Заглавие *</Label>
                  <Input
                    value={newAppointment.title}
                    onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                    placeholder="Например: Преглед на портфолио"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Дата и час *</Label>
                  <Input
                    type="datetime-local"
                    value={newAppointment.datetime}
                    onChange={(e) => setNewAppointment({...newAppointment, datetime: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Продължителност</Label>
                    <Select 
                      value={newAppointment.duration_minutes.toString()} 
                      onValueChange={(v) => setNewAppointment({...newAppointment, duration_minutes: parseInt(v)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 минути</SelectItem>
                        <SelectItem value="60">1 час</SelectItem>
                        <SelectItem value="90">1.5 часа</SelectItem>
                        <SelectItem value="120">2 часа</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Място</Label>
                    <Select 
                      value={newAppointment.location} 
                      onValueChange={(v) => setNewAppointment({...newAppointment, location: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="office">В офиса</SelectItem>
                        <SelectItem value="online">Онлайн</SelectItem>
                        <SelectItem value="phone">По телефон</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Бележки</Label>
                  <Textarea
                    value={newAppointment.description}
                    onChange={(e) => setNewAppointment({...newAppointment, description: e.target.value})}
                    placeholder="Добавете бележки към срещата..."
                  />
                </div>
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => createAppointmentMutation.mutate(newAppointment)}
                  disabled={!newAppointment.title || !newAppointment.datetime || createAppointmentMutation.isPending}
                >
                  {createAppointmentMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Запазване...
                    </>
                  ) : (
                    'Заяви среща'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Предстоящи срещи
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="text-slate-500 text-center py-6">Няма насрочени срещи</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => {
                  const LocationIcon = locationIcons[appointment.location]?.icon || Building2;
                  return (
                    <div key={appointment.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium">{appointment.title}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(appointment.datetime).toLocaleString('bg-BG')}
                            </span>
                            <span className="flex items-center gap-1">
                              <LocationIcon className="h-4 w-4" />
                              {locationIcons[appointment.location]?.label}
                            </span>
                          </div>
                        </div>
                        <Badge className={statusColors[appointment.status]}>
                          {statusLabels[appointment.status]}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => generateAppointmentICS(appointment)}
                        >
                          <CalendarPlus className="h-4 w-4 mr-1" />
                          Добави в календар
                        </Button>
                        {appointment.status === 'pending' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Откажи
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Important Dates */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Важни дати
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upcoming Payments */}
            {pendingPayments.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-slate-700 mb-2">Предстоящи плащания</h4>
                <div className="space-y-2">
                  {pendingPayments.slice(0, 3).map((payment) => {
                    const product = products.find(p => p.id === payment.product_id);
                    return (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{payment.amount} €</p>
                          <p className="text-xs text-slate-600">{product?.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">
                            {new Date(payment.due_date).toLocaleDateString('bg-BG')}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => generatePaymentICS(payment, product?.name || 'Плащане')}
                          >
                            <CalendarPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upcoming Maturities */}
            {upcomingMaturities.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-slate-700 mb-2">Предстоящи падежи</h4>
                <div className="space-y-2">
                  {upcomingMaturities.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-slate-600">{product.provider}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">
                          {new Date(product.maturity_date).toLocaleDateString('bg-BG')}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => generateMaturityICS(product)}
                        >
                          <CalendarPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingPayments.length === 0 && upcomingMaturities.length === 0 && (
              <p className="text-slate-500 text-center py-6">Няма предстоящи важни дати</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
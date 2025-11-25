import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  User,
  ChevronLeft,
  ChevronRight,
  Video,
  Phone
} from 'lucide-react';

const events = [
  { id: 1, title: 'Среща с Иван Петров', date: '2024-01-25', time: '10:00', duration: '1 час', type: 'meeting', client: 'Иван Петров', location: 'Офис' },
  { id: 2, title: 'Обаждане - Мария Иванова', date: '2024-01-25', time: '14:00', duration: '30 мин', type: 'call', client: 'Мария Иванова', location: 'Телефон' },
  { id: 3, title: 'Онлайн презентация', date: '2024-01-26', time: '11:00', duration: '1 час', type: 'online', client: 'Георги Димитров', location: 'Zoom' },
  { id: 4, title: 'Екипна среща', date: '2024-01-26', time: '16:00', duration: '2 часа', type: 'internal', client: '', location: 'Конферентна зала' },
  { id: 5, title: 'Преглед на портфолио', date: '2024-01-27', time: '09:00', duration: '1 час', type: 'meeting', client: 'Елена Стоянова', location: 'Офис' },
];

const typeConfig = {
  meeting: { label: 'Среща', color: 'bg-blue-100 text-blue-700', icon: User },
  call: { label: 'Обаждане', color: 'bg-green-100 text-green-700', icon: Phone },
  online: { label: 'Онлайн', color: 'bg-purple-100 text-purple-700', icon: Video },
  internal: { label: 'Вътрешна', color: 'bg-slate-100 text-slate-700', icon: CalendarIcon },
};

const daysOfWeek = ['Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб', 'Нед'];

export default function ConsultantCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 25));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [view, setView] = useState('week');

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  const todayEvents = events.filter(e => e.date === '2024-01-25');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => {
            const newDate = new Date(currentDate);
            newDate.setDate(newDate.getDate() - 7);
            setCurrentDate(newDate);
          }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-slate-900">
            {currentDate.toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="icon" onClick={() => {
            const newDate = new Date(currentDate);
            newDate.setDate(newDate.getDate() + 7);
            setCurrentDate(newDate);
          }}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <Button 
              variant={view === 'week' ? 'default' : 'ghost'} 
              size="sm"
              className={`rounded-none ${view === 'week' ? 'bg-blue-600' : ''}`}
              onClick={() => setView('week')}
            >
              Седмица
            </Button>
            <Button 
              variant={view === 'month' ? 'default' : 'ghost'} 
              size="sm"
              className={`rounded-none ${view === 'month' ? 'bg-blue-600' : ''}`}
              onClick={() => setView('month')}
            >
              Месец
            </Button>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Ново събитие
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добави събитие</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Заглавие</Label>
                  <Input placeholder="Въведете заглавие" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Дата</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Час</Label>
                    <Input type="time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Изберете тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Среща</SelectItem>
                      <SelectItem value="call">Обаждане</SelectItem>
                      <SelectItem value="online">Онлайн</SelectItem>
                      <SelectItem value="internal">Вътрешна</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Клиент</Label>
                  <Input placeholder="Име на клиент (по избор)" />
                </div>
                <div className="space-y-2">
                  <Label>Локация</Label>
                  <Input placeholder="Офис, Zoom, Телефон..." />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Отказ</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">Запази</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Week View */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b border-slate-200">
                {weekDates.map((date, index) => {
                  const isToday = date.toDateString() === new Date(2024, 0, 25).toDateString();
                  return (
                    <div 
                      key={index} 
                      className={`p-3 text-center border-r last:border-r-0 ${
                        isToday ? 'bg-blue-50' : ''
                      }`}
                    >
                      <p className="text-xs text-slate-500">{daysOfWeek[index]}</p>
                      <p className={`text-lg font-semibold ${
                        isToday ? 'text-blue-600' : 'text-slate-900'
                      }`}>
                        {date.getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-7 min-h-[400px]">
                {weekDates.map((date, index) => {
                  const dayEvents = getEventsForDate(date);
                  const isToday = date.toDateString() === new Date(2024, 0, 25).toDateString();
                  return (
                    <div 
                      key={index} 
                      className={`p-2 border-r last:border-r-0 ${
                        isToday ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      {dayEvents.map((event) => {
                        const TypeIcon = typeConfig[event.type].icon;
                        return (
                          <div 
                            key={event.id}
                            className={`p-2 rounded-lg mb-2 text-xs ${typeConfig[event.type].color}`}
                          >
                            <div className="flex items-center gap-1 font-medium">
                              <TypeIcon className="h-3 w-3" />
                              {event.time}
                            </div>
                            <p className="font-medium truncate mt-1">{event.title}</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Events */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Днес</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayEvents.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">Няма събития за днес</p>
                ) : (
                  todayEvents.map((event) => {
                    const TypeIcon = typeConfig[event.type].icon;
                    return (
                      <div key={event.id} className="p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={typeConfig[event.type].color}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {typeConfig[event.type].label}
                          </Badge>
                          <span className="text-sm text-slate-500">{event.time}</span>
                        </div>
                        <p className="font-medium text-slate-900">{event.title}</p>
                        {event.client && (
                          <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                            <User className="h-3 w-3" />
                            {event.client}
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
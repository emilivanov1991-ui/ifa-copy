import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Phone,
  Users,
  FileText,
  Heart,
  UserPlus,
  Wrench,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

// Meeting types with colors
const typeConfig = {
  fpp: { label: 'Financial Plan Presentation', color: 'bg-blue-500 text-white', borderColor: 'border-l-blue-500', icon: FileText },
  life_planner: { label: 'Life Planner', color: 'bg-purple-500 text-white', borderColor: 'border-l-purple-500', icon: Heart },
  recruiting: { label: 'Recruiting Meeting', color: 'bg-cyan-400 text-white', borderColor: 'border-l-cyan-400', icon: UserPlus },
  service: { label: 'Service Meeting', color: 'bg-orange-500 text-white', borderColor: 'border-l-orange-500', icon: Wrench },
  team: { label: 'Екипна среща', color: 'bg-green-500 text-white', borderColor: 'border-l-green-500', icon: Users },
  to_call: { label: 'To Call', color: 'bg-pink-400 text-white', borderColor: 'border-l-pink-400', icon: Phone },
};

const daysOfWeek = ['Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб', 'Нед'];
const daysOfWeekFull = ['Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота', 'Неделя'];

// Hours from 6:00 to 22:00
const hours = Array.from({ length: 17 }, (_, i) => i + 6);
const HOUR_HEIGHT = 35; // pixels per hour

export default function ConsultantCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [events, setEvents] = useState([
    { id: 1, title: 'FPP - Иван Петров', date: '2024-11-26', time: '10:00', duration: 60, type: 'fpp', client: 'Иван Петров', location: 'Офис', notes: 'Представяне на финансов план' },
    { id: 2, title: 'Life Planner - Мария', date: '2024-11-26', time: '14:00', duration: 90, type: 'life_planner', client: 'Мария Иванова', location: 'Zoom', notes: '' },
    { id: 3, title: 'Recruiting - Георги', date: '2024-11-27', time: '11:00', duration: 60, type: 'recruiting', client: 'Георги Димитров', location: 'Офис', notes: '' },
    { id: 4, title: 'Екипна среща', date: '2024-11-27', time: '16:00', duration: 120, type: 'team', client: '', location: 'Конферентна зала', notes: 'Седмичен преглед' },
    { id: 5, title: 'Service - Елена', date: '2024-11-28', time: '09:00', duration: 45, type: 'service', client: 'Елена Стоянова', location: 'Офис', notes: '' },
    { id: 6, title: 'Обаждане - Петър', date: '2024-11-28', time: '15:00', duration: 30, type: 'to_call', client: 'Петър Георгиев', location: 'Телефон', notes: 'Последващо обаждане' },
  ]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '09:00',
    duration: 60,
    type: 'fpp',
    client: '',
    location: '',
    notes: ''
  });

  // Get today's date string
  const getTodayStr = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dates = [];
    
    // Days from previous month
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      dates.push({ date, currentMonth: false });
    }
    
    // Days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push({ date: new Date(year, month, i), currentMonth: true });
    }
    
    // Days from next month to fill grid
    const remainingDays = 42 - dates.length;
    for (let i = 1; i <= remainingDays; i++) {
      dates.push({ date: new Date(year, month + 1, i), currentMonth: false });
    }
    
    return dates;
  };

  const weekDates = getWeekDates();
  const monthDates = getMonthDates();

  const formatDateStr = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date) => {
    const dateStr = formatDateStr(date);
    return events.filter(e => e.date === dateStr);
  };

  const getEventPosition = (event) => {
    const [h, minutes] = event.time.split(':').map(Number);
    const startMinutes = (h - 6) * 60 + minutes;
    const top = (startMinutes / 60) * HOUR_HEIGHT;
    const height = (event.duration / 60) * HOUR_HEIGHT;
    return { top, height };
  };

  const handleCellClick = (date, hour = null) => {
    setSelectedDate(formatDateStr(date));
    setSelectedTime(hour ? `${hour.toString().padStart(2, '0')}:00` : '09:00');
    setNewEvent({
      title: '',
      date: formatDateStr(date),
      time: hour ? `${hour.toString().padStart(2, '0')}:00` : '09:00',
      duration: 60,
      type: 'fpp',
      client: '',
      location: '',
      notes: ''
    });
    setIsEditing(false);
    setIsAddDialogOpen(true);
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const handleEditEvent = () => {
    setNewEvent({ ...selectedEvent });
    setIsViewDialogOpen(false);
    setIsEditing(true);
    setIsAddDialogOpen(true);
  };

  const handleDeleteEvent = () => {
    setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
    setIsViewDialogOpen(false);
    toast.success('Събитието е изтрито');
  };

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast.error('Моля попълнете задължителните полета');
      return;
    }

    if (isEditing) {
      setEvents(prev => prev.map(e => e.id === newEvent.id ? newEvent : e));
      toast.success('Събитието е обновено');
    } else {
      const event = {
        ...newEvent,
        id: Date.now()
      };
      setEvents(prev => [...prev, event]);
      toast.success('Събитието е добавено');
    }
    
    setIsAddDialogOpen(false);
    setNewEvent({
      title: '',
      date: '',
      time: '09:00',
      duration: 60,
      type: 'fpp',
      client: '',
      location: '',
      notes: ''
    });
    setIsEditing(false);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const todayStr = getTodayStr();
  const todayEvents = events.filter(e => e.date === todayStr);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => view === 'week' ? navigateWeek(-1) : navigateMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-slate-900 min-w-[200px] text-center">
            {currentDate.toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="icon" onClick={() => view === 'week' ? navigateWeek(1) : navigateMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Днес
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
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
            setNewEvent({
              title: '',
              date: todayStr,
              time: '09:00',
              duration: 60,
              type: 'fpp',
              client: '',
              location: '',
              notes: ''
            });
            setIsEditing(false);
            setIsAddDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Ново събитие
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(typeConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${config.color}`}></div>
            <span className="text-xs text-slate-600">{config.label}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              {view === 'week' ? (
                <>
                  {/* Week Header */}
                  <div className="grid grid-cols-8 border-b border-slate-200">
                    <div className="p-3 text-center border-r border-slate-200 bg-slate-50">
                      <p className="text-xs text-slate-500">Час</p>
                    </div>
                    {weekDates.map((date, index) => {
                      const isToday = formatDateStr(date) === todayStr;
                      return (
                        <div 
                          key={index} 
                          className={`p-3 text-center border-r last:border-r-0 cursor-pointer hover:bg-slate-50 ${
                            isToday ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleCellClick(date)}
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
                  
                  {/* Week Grid with Hours */}
                  <div className="grid grid-cols-8">
                    {/* Time Column */}
                    <div className="border-r border-slate-200 bg-slate-50">
                      {hours.map((hour) => (
                        <div key={hour} className="border-b border-slate-100 px-1 flex items-start justify-end pr-2" style={{ height: `${HOUR_HEIGHT}px` }}>
                          <span className="text-[10px] text-slate-400 -mt-1.5">
                            {hour.toString().padStart(2, '0')}:00
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Day Columns */}
                    {weekDates.map((date, dayIndex) => {
                      const dayEvents = getEventsForDate(date);
                      const isToday = formatDateStr(date) === todayStr;
                      
                      return (
                        <div 
                          key={dayIndex} 
                          className={`relative border-r last:border-r-0 ${isToday ? 'bg-blue-50/30' : ''}`}
                        >
                          {/* Hour cells */}
                          {hours.map((hour) => (
                            <div 
                              key={hour} 
                              className="border-b border-slate-100 cursor-pointer hover:bg-slate-100/50"
                              style={{ height: `${HOUR_HEIGHT}px` }}
                              onClick={() => handleCellClick(date, hour)}
                            />
                          ))}
                          
                          {/* Events */}
                          {dayEvents.map((event) => {
                            const { top, height } = getEventPosition(event);
                            const TypeIcon = typeConfig[event.type]?.icon || CalendarIcon;
                            return (
                              <div
                                key={event.id}
                                className={`absolute left-0.5 right-0.5 rounded px-1 py-0.5 cursor-pointer hover:opacity-90 transition-opacity border-l-2 overflow-hidden ${typeConfig[event.type]?.color || 'bg-slate-500 text-white'} ${typeConfig[event.type]?.borderColor || ''}`}
                                style={{ top: `${top}px`, height: `${Math.max(height, 18)}px` }}
                                onClick={(e) => handleEventClick(event, e)}
                              >
                                <div className="flex items-center gap-0.5">
                                  <span className="text-[10px] font-medium truncate">{event.time} {event.title}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Month View */
                <>
                  {/* Month Header */}
                  <div className="grid grid-cols-7 border-b border-slate-200">
                    {daysOfWeek.map((day, index) => (
                      <div key={index} className="p-3 text-center border-r last:border-r-0 bg-slate-50">
                        <p className="text-sm font-medium text-slate-600">{day}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Month Grid */}
                  <div className="grid grid-cols-7">
                    {monthDates.map(({ date, currentMonth }, index) => {
                      const dayEvents = getEventsForDate(date);
                      const isToday = formatDateStr(date) === todayStr;
                      
                      return (
                        <div 
                          key={index}
                          className={`min-h-[100px] p-2 border-r border-b last:border-r-0 cursor-pointer hover:bg-slate-50 ${
                            !currentMonth ? 'bg-slate-50/50' : ''
                          } ${isToday ? 'bg-blue-50' : ''}`}
                          onClick={() => handleCellClick(date)}
                        >
                          <p className={`text-sm font-medium mb-1 ${
                            !currentMonth ? 'text-slate-400' : isToday ? 'text-blue-600' : 'text-slate-900'
                          }`}>
                            {date.getDate()}
                          </p>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 3).map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer ${typeConfig[event.type]?.color || 'bg-slate-500 text-white'}`}
                                onClick={(e) => handleEventClick(event, e)}
                              >
                                {event.time} {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <p className="text-xs text-slate-500">+{dayEvents.length - 3} още</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Today's Events */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Днес - {new Date().toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayEvents.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">Няма събития за днес</p>
                ) : (
                  todayEvents.map((event) => {
                    const TypeIcon = typeConfig[event.type]?.icon || CalendarIcon;
                    return (
                      <div 
                        key={event.id} 
                        className={`p-3 rounded-lg border-l-4 bg-white border border-slate-200 cursor-pointer hover:shadow-md transition-shadow ${typeConfig[event.type]?.borderColor || 'border-l-slate-500'}`}
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={typeConfig[event.type]?.color || 'bg-slate-500'}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {typeConfig[event.type]?.label || 'Събитие'}
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

      {/* Add/Edit Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Редактирай събитие' : 'Добави събитие'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Заглавие *</Label>
              <Input 
                placeholder="Въведете заглавие" 
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Дата *</Label>
                <Input 
                  type="date" 
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Час *</Label>
                <Input 
                  type="time" 
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Тип среща</Label>
                <Select value={newEvent.type} onValueChange={(v) => setNewEvent({ ...newEvent, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${config.color}`}></div>
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Продължителност (мин)</Label>
                <Select value={newEvent.duration.toString()} onValueChange={(v) => setNewEvent({ ...newEvent, duration: parseInt(v) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 мин</SelectItem>
                    <SelectItem value="45">45 мин</SelectItem>
                    <SelectItem value="60">1 час</SelectItem>
                    <SelectItem value="90">1.5 часа</SelectItem>
                    <SelectItem value="120">2 часа</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Клиент</Label>
              <Input 
                placeholder="Име на клиент (по избор)" 
                value={newEvent.client}
                onChange={(e) => setNewEvent({ ...newEvent, client: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Локация</Label>
              <Input 
                placeholder="Офис, Zoom, Телефон..." 
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Бележки</Label>
              <Textarea 
                placeholder="Допълнителни бележки..." 
                value={newEvent.notes}
                onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Отказ</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveEvent}>
                {isEditing ? 'Обнови' : 'Запази'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg">{selectedEvent.title}</DialogTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleEditEvent}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={handleDeleteEvent}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Badge className={typeConfig[selectedEvent.type]?.color || 'bg-slate-500'}>
                  {typeConfig[selectedEvent.type]?.label || 'Събитие'}
                </Badge>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{new Date(selectedEvent.date).toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>{selectedEvent.time} ({selectedEvent.duration} мин)</span>
                  </div>
                  {selectedEvent.client && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <User className="h-4 w-4" />
                      <span>{selectedEvent.client}</span>
                    </div>
                  )}
                  {selectedEvent.location && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  {selectedEvent.notes && (
                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-sm text-slate-500 mb-1">Бележки:</p>
                      <p className="text-slate-700">{selectedEvent.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
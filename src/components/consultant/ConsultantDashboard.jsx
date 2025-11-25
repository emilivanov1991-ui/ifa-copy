import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const stats = [
  { label: 'Общо клиенти', value: '47', change: '+3', trend: 'up', icon: Users },
  { label: 'Активни анализи', value: '12', change: '+2', trend: 'up', icon: FileText },
  { label: 'Комисионни (месец)', value: '2,450 €', change: '+15%', trend: 'up', icon: DollarSign },
  { label: 'Конверсия', value: '68%', change: '-2%', trend: 'down', icon: TrendingUp },
];

const recentActivities = [
  { type: 'client', text: 'Нов клиент: Мария Иванова', time: 'Преди 2 часа', status: 'new' },
  { type: 'analysis', text: 'Завършен анализ: Петър Георгиев', time: 'Преди 4 часа', status: 'completed' },
  { type: 'meeting', text: 'Предстояща среща: Иван Димитров', time: 'Утре, 10:00', status: 'pending' },
  { type: 'commission', text: 'Получена комисионна: 350 €', time: 'Вчера', status: 'completed' },
  { type: 'reminder', text: 'Напомняне: Обади се на Стоян Петров', time: 'Днес, 15:00', status: 'pending' },
];

const upcomingTasks = [
  { title: 'Среща с Иван Димитров', date: '26 ное, 10:00', type: 'meeting' },
  { title: 'Изпрати оферта на Мария', date: '26 ное, 14:00', type: 'task' },
  { title: 'Обучение: Нови продукти', date: '27 ное, 09:00', type: 'training' },
  { title: 'Преглед на портфолио', date: '28 ное, 11:00', type: 'review' },
];

export default function ConsultantDashboard({ onNavigate }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    <div className={`flex items-center gap-1 mt-1 text-sm ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Последна активност</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.status === 'completed' ? 'bg-green-100' :
                    activity.status === 'new' ? 'bg-blue-100' : 'bg-amber-100'
                  }`}>
                    {activity.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : activity.status === 'new' ? (
                      <Users className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{activity.text}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Предстоящи задачи</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('calendar')}>
                Виж всички
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.date}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Бързи действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => onNavigate('crm')}>
              <Users className="h-5 w-5 text-blue-600" />
              <span>Добави клиент</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => onNavigate('analysis')}>
              <FileText className="h-5 w-5 text-green-600" />
              <span>Нов анализ</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => onNavigate('calendar')}>
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Планирай среща</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => onNavigate('elearning')}>
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span>Продължи обучение</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
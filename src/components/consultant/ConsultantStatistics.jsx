import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Target,
  Award,
  Calendar
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const monthlyData = [
  { month: 'Яну', clients: 4, revenue: 1200, conversions: 3 },
  { month: 'Фев', clients: 6, revenue: 1800, conversions: 4 },
  { month: 'Мар', clients: 5, revenue: 2200, conversions: 4 },
  { month: 'Апр', clients: 8, revenue: 2800, conversions: 6 },
  { month: 'Май', clients: 7, revenue: 2400, conversions: 5 },
  { month: 'Юни', clients: 9, revenue: 3200, conversions: 7 },
  { month: 'Юли', clients: 6, revenue: 2600, conversions: 5 },
  { month: 'Авг', clients: 8, revenue: 3000, conversions: 6 },
  { month: 'Сеп', clients: 10, revenue: 3500, conversions: 8 },
  { month: 'Окт', clients: 7, revenue: 2900, conversions: 5 },
  { month: 'Ное', clients: 9, revenue: 3400, conversions: 7 },
  { month: 'Дек', clients: 5, revenue: 2450, conversions: 4 },
];

const productDistribution = [
  { name: 'Инвестиции', value: 35, color: '#3B82F6' },
  { name: 'Застраховки', value: 28, color: '#10B981' },
  { name: 'Пенсионни', value: 22, color: '#F59E0B' },
  { name: 'Спестявания', value: 15, color: '#8B5CF6' },
];

const targets = [
  { label: 'Нови клиенти', current: 47, target: 60, unit: '' },
  { label: 'Приходи', current: 28500, target: 35000, unit: '€' },
  { label: 'Конверсия', current: 68, target: 75, unit: '%' },
  { label: 'Обучения', current: 8, target: 12, unit: '' },
];

export default function ConsultantStatistics() {
  const [period, setPeriod] = useState('year');

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">Статистики и отчети</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Този месец</SelectItem>
            <SelectItem value="quarter">Тримесечие</SelectItem>
            <SelectItem value="year">Тази година</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Targets */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {targets.map((target, index) => {
          const progress = (target.current / target.target) * 100;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">{target.label}</span>
                  <Target className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {target.current.toLocaleString()}{target.unit}
                  </span>
                  <span className="text-sm text-slate-500">
                    / {target.target.toLocaleString()}{target.unit}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        progress >= 100 ? 'bg-green-500' : 
                        progress >= 70 ? 'bg-blue-500' : 
                        progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{Math.round(progress)}% от целта</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Приходи по месеци
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Clients Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Нови клиенти по месеци
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="clients" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Разпределение по продукти
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-64 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {productDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              {productDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
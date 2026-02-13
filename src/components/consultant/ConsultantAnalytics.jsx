import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  TrendingUp, 
  Users, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  UserCheck,
  Zap
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
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

// Sales Forecast Data
const forecastData = [
  { month: 'Яну', actual: 2400, forecast: 2200, lower: 2000, upper: 2600 },
  { month: 'Фев', actual: 2800, forecast: 2600, lower: 2300, upper: 2900 },
  { month: 'Мар', actual: 3200, forecast: 3000, lower: 2700, upper: 3300 },
  { month: 'Апр', actual: 3000, forecast: 3200, lower: 2900, upper: 3500 },
  { month: 'Май', actual: 3500, forecast: 3400, lower: 3100, upper: 3700 },
  { month: 'Юни', actual: 3800, forecast: 3600, lower: 3300, upper: 3900 },
  { month: 'Юли', actual: null, forecast: 3900, lower: 3500, upper: 4300 },
  { month: 'Авг', actual: null, forecast: 4100, lower: 3700, upper: 4500 },
  { month: 'Сеп', actual: null, forecast: 4400, lower: 3900, upper: 4900 },
];

// Client Segments
const clientSegments = [
  { name: 'VIP клиенти', count: 12, value: 156000, avgValue: 13000, growth: 15, color: '#8B5CF6' },
  { name: 'Активни', count: 28, value: 84000, avgValue: 3000, growth: 8, color: '#3B82F6' },
  { name: 'Нови', count: 15, value: 22500, avgValue: 1500, growth: 25, color: '#10B981' },
  { name: 'Неактивни', count: 8, value: 12000, avgValue: 1500, growth: -5, color: '#F59E0B' },
  { name: 'Потенциални', count: 22, value: 0, avgValue: 0, growth: 0, color: '#6B7280' },
];

const segmentPieData = clientSegments.map(s => ({ name: s.name, value: s.count, color: s.color }));

// Consultant Performance
const consultantPerformance = {
  conversions: { current: 68, previous: 62, target: 75 },
  avgDealSize: { current: 2450, previous: 2100, target: 3000 },
  clientRetention: { current: 92, previous: 88, target: 95 },
  responseTime: { current: 2.5, previous: 3.2, target: 2 },
  satisfaction: { current: 4.6, previous: 4.4, target: 4.8 },
};

const monthlyPerformance = [
  { month: 'Яну', conversions: 65, deals: 8, revenue: 18000 },
  { month: 'Фев', conversions: 62, deals: 7, revenue: 16500 },
  { month: 'Мар', conversions: 70, deals: 10, revenue: 24000 },
  { month: 'Апр', conversions: 68, deals: 9, revenue: 21000 },
  { month: 'Май', conversions: 72, deals: 11, revenue: 27500 },
  { month: 'Юни', conversions: 68, deals: 9, revenue: 22000 },
];

// Demographics
const demographicsAge = [
  { range: '25-34', count: 18, percent: 21 },
  { range: '35-44', count: 32, percent: 38 },
  { range: '45-54', count: 22, percent: 26 },
  { range: '55+', count: 13, percent: 15 },
];

const demographicsIncome = [
  { range: 'До 2000€', count: 15, percent: 18 },
  { range: '2000-4000€', count: 35, percent: 41 },
  { range: '4000-6000€', count: 25, percent: 29 },
  { range: 'Над 6000€', count: 10, percent: 12 },
];

// Sales Funnel Data (mock)
const getFunnelData = (period) => {
  const dataByPeriod = {
    '1m': { calls: 100, answered: 65, scheduled: 45, held: 20, analysis: 12, presented: 9, signed: 4 },
    '3m': { calls: 300, answered: 190, scheduled: 130, held: 60, analysis: 35, presented: 27, signed: 12 },
    '6m': { calls: 550, answered: 350, scheduled: 230, held: 105, analysis: 62, presented: 48, signed: 21 },
    '1y': { calls: 1000, answered: 640, scheduled: 420, held: 190, analysis: 112, presented: 87, signed: 38 },
  };
  return dataByPeriod[period] || dataByPeriod['3m'];
};

const calculatePercentages = (currentValue, currentIndex, allStages) => {
  const percentages = [];
  // Calculate percentage from all previous stages
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (allStages[i].value > 0) {
      const percent = ((currentValue / allStages[i].value) * 100).toFixed(1);
      percentages.push({ label: allStages[i].label, percent });
    }
  }
  return percentages;
};

export default function ConsultantAnalytics() {
  const [period, setPeriod] = useState('3m');
  const [hoveredStage, setHoveredStage] = useState(null);

  const funnelData = getFunnelData(period);
  const stages = [
    { label: 'Обаждане', value: funnelData.calls, color: '#9333EA' },
    { label: 'Вдигнали', value: funnelData.answered, color: '#A855F7' },
    { label: 'Уговорена среща', value: funnelData.scheduled, color: '#C084FC' },
    { label: 'Осъществена среща (Financial Planner)', value: funnelData.held, color: '#D8B4FE' },
    { label: 'Финансов анализ', value: funnelData.analysis, color: '#E9D5FF' },
    { label: 'Финансов план презентиран', value: funnelData.presented, color: '#F3E8FF' },
    { label: 'Подписан клиент', value: funnelData.signed, color: '#FAF5FF' },
  ];

  const allValues = stages.map(s => s.value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Performance Formula</h2>
          <p className="text-slate-500">Анализ на продажбената фуния и ефективност</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">1 месец</SelectItem>
            <SelectItem value="3m">3 месеца</SelectItem>
            <SelectItem value="6m">6 месеца</SelectItem>
            <SelectItem value="1y">1 година</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="funnel">
        <TabsList>
          <TabsTrigger value="funnel">Sales Funnel</TabsTrigger>
          <TabsTrigger value="forecast">Прогнози</TabsTrigger>
          <TabsTrigger value="segments">Сегментация</TabsTrigger>
          <TabsTrigger value="performance">Ефективност</TabsTrigger>
        </TabsList>

        {/* Sales Funnel */}
        <TabsContent value="funnel" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Продажбена фуния
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Funnel SVG */}
                <svg viewBox="0 0 800 600" className="w-full h-auto">
                  <defs>
                    <linearGradient id="funnelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#9333EA" />
                      <stop offset="100%" stopColor="#FAF5FF" />
                    </linearGradient>
                  </defs>
                  
                  {stages.map((stage, index) => {
                    const y = 50 + index * 80;
                    const widthPercent = 100 - (index * 12);
                    const width = (widthPercent / 100) * 500;
                    const x = 150 + (500 - width) / 2;
                    const height = 70;
                    const percentages = calculatePercentages(stage.value, index, stages);
                    const tooltipHeight = index === 0 ? 50 : 30 + percentages.length * 20;
                    
                    return (
                      <g key={index}>
                        {/* Funnel section */}
                        <polygon
                          points={`${x},${y} ${x + width},${y} ${x + width - 30},${y + height} ${x + 30},${y + height}`}
                          fill={stage.color}
                          stroke="#ffffff"
                          strokeWidth="2"
                          onMouseEnter={() => setHoveredStage(index)}
                          onMouseLeave={() => setHoveredStage(null)}
                          className="cursor-pointer transition-opacity hover:opacity-80"
                        />
                        
                        {/* Value label */}
                        <text
                          x={x + width / 2}
                          y={y + height / 2 + 5}
                          textAnchor="middle"
                          className="fill-slate-900 font-bold text-2xl"
                        >
                          {stage.value}
                        </text>
                        
                        {/* Stage label */}
                        <text
                          x={x + width + 20}
                          y={y + height / 2 + 5}
                          className="fill-slate-700 text-sm font-medium"
                        >
                          {stage.label}
                        </text>
                        
                        {/* Tooltip on hover */}
                        {hoveredStage === index && percentages.length > 0 && (() => {
                          // Position tooltip to the right if it would go off-screen on the left
                          const tooltipWidth = 210;
                          const tooltipX = x - 220 < 0 ? x + stage.width + 20 : x - 220;
                          const textX = tooltipX + 8;
                          
                          return (
                            <g>
                              <rect
                                x={tooltipX}
                                y={y - 10}
                                width={tooltipWidth}
                                height={tooltipHeight}
                                fill="white"
                                stroke="#e2e8f0"
                                strokeWidth="2"
                                rx="8"
                                className="drop-shadow-xl"
                              />
                              <text x={textX} y={y + 8} className="fill-slate-900 font-bold text-sm">
                                {stage.value}
                              </text>
                              {percentages.map((item, pIndex) => (
                                <text key={pIndex} x={textX} y={y + 28 + pIndex * 20} className="fill-slate-600 text-xs">
                                  {item.percent}% от {item.label}
                                </text>
                              ))}
                            </g>
                          );
                        })()}
                        
                        {/* Tooltip for first stage (no percentages) */}
                        {hoveredStage === index && percentages.length === 0 && (
                          <g>
                            <rect
                              x={x - 100}
                              y={y - 10}
                              width="90"
                              height={40}
                              fill="white"
                              stroke="#e2e8f0"
                              strokeWidth="2"
                              rx="8"
                              className="drop-shadow-xl"
                            />
                            <text x={x - 92} y={y + 8} className="fill-slate-900 font-bold text-sm">
                              {stage.label}
                            </text>
                            <text x={x - 92} y={y + 25} className="fill-slate-600 text-xs">
                              {stage.value} обаждания
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              {/* Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{((funnelData.signed / funnelData.calls) * 100).toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">Обща конверсия</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{((funnelData.answered / funnelData.calls) * 100).toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">Процент отговорили</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{((funnelData.held / funnelData.scheduled) * 100).toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">Проведени срещи</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">{((funnelData.signed / funnelData.presented) * 100).toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">Подписани след презентация</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Forecast */}
        <TabsContent value="forecast" className="mt-6 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Прогноза Q3</p>
                <p className="text-2xl font-bold text-blue-600">12,400 €</p>
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <ArrowUpRight className="h-4 w-4" />
                  +18% vs Q2
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Точност на прогнозата</p>
                <p className="text-2xl font-bold text-green-600">94%</p>
                <p className="text-xs text-slate-500">Базирано на последните 6 месеца</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Очаквани нови клиенти</p>
                <p className="text-2xl font-bold">8-12</p>
                <p className="text-xs text-slate-500">През следващия месец</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Прогноза на приходите
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <defs>
                      <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="upper" stroke="transparent" fill="#E0E7FF" name="Горна граница" />
                    <Area type="monotone" dataKey="lower" stroke="transparent" fill="white" name="Долна граница" />
                    <Line type="monotone" dataKey="forecast" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" name="Прогноза" dot={false} />
                    <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} name="Реални" dot={{ fill: '#10B981' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Segmentation */}
        <TabsContent value="segments" className="mt-6 space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Сегменти по стойност</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientSegments.map((segment, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{segment.name}</span>
                          <span className="text-sm text-slate-500">{segment.count} клиенти</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Обща стойност: {segment.value.toLocaleString()} €</span>
                          <span className={segment.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {segment.growth >= 0 ? '+' : ''}{segment.growth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Разпределение</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie data={segmentPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={2}>
                        {segmentPieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demographics */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Възрастова структура</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demographicsAge} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis type="number" stroke="#94A3B8" fontSize={12} />
                      <YAxis dataKey="range" type="category" stroke="#94A3B8" fontSize={12} width={60} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Разпределение по доходи</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demographicsIncome} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis type="number" stroke="#94A3B8" fontSize={12} />
                      <YAxis dataKey="range" type="category" stroke="#94A3B8" fontSize={12} width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Consultant Performance */}
        <TabsContent value="performance" className="mt-6 space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(consultantPerformance).map(([key, data]) => {
              const labels = {
                conversions: { label: 'Конверсия', unit: '%', icon: Target },
                avgDealSize: { label: 'Ср. сделка', unit: '€', icon: DollarSign },
                clientRetention: { label: 'Задържане', unit: '%', icon: UserCheck },
                responseTime: { label: 'Време отговор', unit: 'ч', icon: Zap },
                satisfaction: { label: 'Удовлетвореност', unit: '/5', icon: Activity },
              };
              const config = labels[key];
              const Icon = config.icon;
              const progress = (data.current / data.target) * 100;
              const improved = data.current > data.previous;

              return (
                <Card key={key}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-4 w-4 text-slate-400" />
                      <span className={`text-xs ${improved ? 'text-green-600' : 'text-red-600'}`}>
                        {improved ? <ArrowUpRight className="h-3 w-3 inline" /> : <ArrowDownRight className="h-3 w-3 inline" />}
                        vs prev
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{config.label}</p>
                    <p className="text-xl font-bold">{data.current}{config.unit}</p>
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full">
                      <div className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : progress >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Цел: {data.target}{config.unit}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Месечна ефективност</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#94A3B8" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="deals" fill="#3B82F6" name="Сделки" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#10B981" name="Конверсия %" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
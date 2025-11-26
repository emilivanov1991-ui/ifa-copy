import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Phone,
  Calendar,
  Target,
  Zap,
  Settings,
  Plus,
  GripVertical,
  X,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts';
import { base44 } from '@/api/base44Client';

// Available widgets for dashboard customization
const availableWidgets = [
  { id: 'sales_trend', name: 'Тренд на продажби', icon: LineChart, category: 'sales' },
  { id: 'conversion_rate', name: 'Конверсия', icon: Target, category: 'sales' },
  { id: 'calls_stats', name: 'Статистика обаждания', icon: Phone, category: 'activity' },
  { id: 'client_segments', name: 'Сегменти клиенти', icon: PieChart, category: 'clients' },
  { id: 'top_clients', name: 'Топ клиенти', icon: Users, category: 'clients' },
  { id: 'anomalies', name: 'AI Аномалии', icon: AlertTriangle, category: 'ai' },
  { id: 'recommendations', name: 'AI Препоръки', icon: Lightbulb, category: 'ai' },
  { id: 'goals_progress', name: 'Прогрес цели', icon: Target, category: 'goals' },
];

// Mock data for anomalies
const mockAnomalies = [
  { 
    id: 1, 
    type: 'drop', 
    severity: 'high',
    title: 'Спад в продажбите', 
    description: 'Продажбите са намалели с 35% спрямо миналата седмица',
    metric: '-35%',
    suggestion: 'Препоръчваме преглед на последните оферти и контакт с неактивни клиенти'
  },
  { 
    id: 2, 
    type: 'pattern', 
    severity: 'medium',
    title: 'Необичаен модел на обаждания', 
    description: 'Клиент Иван Петров не е отговорил на 5 последователни обаждания',
    metric: '5 пропуснати',
    suggestion: 'Опитайте алтернативен канал за комуникация (имейл или SMS)'
  },
  { 
    id: 3, 
    type: 'opportunity', 
    severity: 'low',
    title: 'Потенциална възможност', 
    description: '3 клиента са посетили страницата с инвестиции повече от 5 пъти',
    metric: '3 клиента',
    suggestion: 'Свържете се с тях за персонализирана оферта'
  },
];

// Mock data for AI recommendations
const mockRecommendations = [
  {
    id: 1,
    priority: 'high',
    type: 'action',
    title: 'Обадете се на Мария Иванова',
    reason: 'Последният контакт е преди 14 дни, а клиентът има висок потенциал',
    expectedImpact: '+2500€ потенциална стойност',
    clientId: 2
  },
  {
    id: 2,
    priority: 'medium',
    type: 'upsell',
    title: 'Предложете застраховка на Георги Димитров',
    reason: 'Клиентът има само инвестиционни продукти, но профилът му подсказва нужда от застраховка',
    expectedImpact: '+800€ годишна премия',
    clientId: 3
  },
  {
    id: 3,
    priority: 'low',
    type: 'retention',
    title: 'Проверете удовлетвореността на 5 клиента',
    reason: 'Не са имали активност през последните 30 дни',
    expectedImpact: 'Намаляване на отлива с 15%',
    clientId: null
  },
];

const salesData = [
  { month: 'Яну', sales: 12000, target: 10000 },
  { month: 'Фев', sales: 15000, target: 12000 },
  { month: 'Мар', sales: 11000, target: 13000 },
  { month: 'Апр', sales: 18000, target: 14000 },
  { month: 'Май', sales: 14000, target: 15000 },
  { month: 'Юни', sales: 16500, target: 15000 },
];

const segmentData = [
  { name: 'Горещи', value: 25, color: '#22c55e' },
  { name: 'Топли', value: 45, color: '#f59e0b' },
  { name: 'Студени', value: 30, color: '#ef4444' },
];

export default function AIAnalyticsDashboard() {
  const [activeWidgets, setActiveWidgets] = useState(['sales_trend', 'anomalies', 'recommendations', 'client_segments']);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [period, setPeriod] = useState('month');

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Анализирай следните данни за продажби и клиенти на финансов консултант:
        
Продажби по месеци: ${JSON.stringify(salesData)}
Сегменти клиенти: ${JSON.stringify(segmentData)}
Текущи аномалии: ${JSON.stringify(mockAnomalies)}

Генерирай:
1. Кратък анализ на текущото състояние (2-3 изречения)
2. Топ 3 приоритетни действия за следващата седмица
3. Прогноза за следващия месец

Отговори на български език.`,
        response_json_schema: {
          type: "object",
          properties: {
            analysis: { type: "string" },
            priorityActions: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  action: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            forecast: { type: "string" }
          }
        }
      });
      setAiInsights(result);
    } catch (error) {
      console.error('AI Analysis error:', error);
    }
    setIsAnalyzing(false);
  };

  const toggleWidget = (widgetId) => {
    setActiveWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Аналитика
          </h2>
          <p className="text-slate-500">Персонализиран дашборд с AI прозрения</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Седмица</SelectItem>
              <SelectItem value="month">Месец</SelectItem>
              <SelectItem value="quarter">Тримесечие</SelectItem>
              <SelectItem value="year">Година</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={runAIAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            AI Анализ
          </Button>
          
          <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Персонализирай
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Персонализирай дашборда</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {Object.entries(
                  availableWidgets.reduce((acc, widget) => {
                    if (!acc[widget.category]) acc[widget.category] = [];
                    acc[widget.category].push(widget);
                    return acc;
                  }, {})
                ).map(([category, widgets]) => (
                  <div key={category}>
                    <h4 className="font-medium text-slate-700 mb-2 capitalize">
                      {category === 'sales' ? 'Продажби' : 
                       category === 'activity' ? 'Активност' :
                       category === 'clients' ? 'Клиенти' :
                       category === 'ai' ? 'AI Прозрения' :
                       category === 'goals' ? 'Цели' : category}
                    </h4>
                    <div className="space-y-2">
                      {widgets.map(widget => (
                        <label key={widget.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <Checkbox 
                            checked={activeWidgets.includes(widget.id)}
                            onCheckedChange={() => toggleWidget(widget.id)}
                          />
                          <widget.icon className="h-4 w-4 text-slate-500" />
                          <span className="text-sm">{widget.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Insights Card */}
      {aiInsights && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              AI Прозрения
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700">{aiInsights.analysis}</p>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Приоритетни действия:</h4>
              <div className="space-y-2">
                {aiInsights.priorityActions?.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-white rounded-lg">
                    <Zap className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{action.action}</p>
                      <p className="text-xs text-slate-500">{action.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-3 bg-white rounded-lg">
              <h4 className="font-medium text-slate-900 mb-1">Прогноза:</h4>
              <p className="text-sm text-slate-600">{aiInsights.forecast}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sales Trend Widget */}
        {activeWidgets.includes('sales_trend') && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <LineChart className="h-4 w-4 text-blue-600" />
                Тренд на продажби
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="#93c5fd" name="Продажби" />
                  <Area type="monotone" dataKey="target" stroke="#22c55e" fill="#bbf7d0" name="Цел" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Client Segments Widget */}
        {activeWidgets.includes('client_segments') && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="h-4 w-4 text-purple-600" />
                Сегменти клиенти
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Anomalies Widget */}
        {activeWidgets.includes('anomalies') && (
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                AI Откриване на аномалии
                <Badge variant="outline" className="ml-2">{mockAnomalies.length} открити</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAnomalies.map((anomaly) => (
                  <div 
                    key={anomaly.id} 
                    className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{anomaly.title}</h4>
                          <Badge variant="outline" className="text-xs">{anomaly.metric}</Badge>
                        </div>
                        <p className="text-sm opacity-80">{anomaly.description}</p>
                        <div className="mt-2 flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <p className="text-sm font-medium">{anomaly.suggestion}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="ml-4">
                        Действие
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Widget */}
        {activeWidgets.includes('recommendations') && (
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-green-600" />
                AI Препоръки за действие
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRecommendations.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(rec.priority)}`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{rec.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{rec.reason}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline" className="text-xs text-green-700 bg-green-50">
                            {rec.expectedImpact}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {rec.type === 'action' ? 'Действие' : 
                             rec.type === 'upsell' ? 'Допълнителна продажба' : 'Задържане'}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Изпълни
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
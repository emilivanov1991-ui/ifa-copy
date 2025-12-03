import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Shield, AlertTriangle, Info, BarChart3 } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

// Investment strategies
const STRATEGIES = {
  conservative: {
    name: 'Консервативна',
    expectedReturn: 4,
    stdDev: 5,
    minReturn: -5,
    maxReturn: 12,
    allocation: { bonds: 70, stocks: 20, cash: 10 },
    color: '#3b82f6',
    risk: 'Нисък'
  },
  balanced: {
    name: 'Балансирана',
    expectedReturn: 6,
    stdDev: 10,
    minReturn: -15,
    maxReturn: 20,
    allocation: { bonds: 40, stocks: 50, cash: 10 },
    color: '#8b5cf6',
    risk: 'Среден'
  },
  dynamic: {
    name: 'Динамична',
    expectedReturn: 8,
    stdDev: 15,
    minReturn: -25,
    maxReturn: 30,
    allocation: { bonds: 20, stocks: 70, cash: 10 },
    color: '#f59e0b',
    risk: 'Висок'
  },
  aggressive: {
    name: 'Агресивна',
    expectedReturn: 10,
    stdDev: 20,
    minReturn: -35,
    maxReturn: 45,
    allocation: { bonds: 5, stocks: 90, cash: 5 },
    color: '#ef4444',
    risk: 'Много висок'
  }
};

export default function InvestmentCalculatorAdvanced() {
  const [initialAmount, setInitialAmount] = useState(10000);
  const [monthlyAmount, setMonthlyAmount] = useState(200);
  const [years, setYears] = useState(15);
  const [selectedStrategy, setSelectedStrategy] = useState('balanced');
  const [entryFee, setEntryFee] = useState(2);
  const [managementFee, setManagementFee] = useState(1.5);

  const calculations = useMemo(() => {
    const strategy = STRATEGIES[selectedStrategy];
    const monthlyReturn = strategy.expectedReturn / 100 / 12;
    const monthlyFee = managementFee / 100 / 12;
    const effectiveMonthlyReturn = monthlyReturn - monthlyFee;
    const months = years * 12;
    
    // Apply entry fee
    const netInitial = initialAmount * (1 - entryFee / 100);
    const netMonthly = monthlyAmount * (1 - entryFee / 100);
    
    // Calculate projections for different scenarios
    const scenarios = {
      pessimistic: strategy.expectedReturn - strategy.stdDev,
      expected: strategy.expectedReturn,
      optimistic: strategy.expectedReturn + strategy.stdDev
    };
    
    const projections = {};
    
    Object.entries(scenarios).forEach(([key, annualReturn]) => {
      const monthlyRet = (annualReturn / 100 / 12) - monthlyFee;
      const data = [];
      let balance = netInitial;
      let totalInvested = initialAmount;
      
      for (let year = 0; year <= years; year++) {
        data.push({
          year,
          balance: balance,
          invested: totalInvested
        });
        
        for (let month = 0; month < 12; month++) {
          balance = balance * (1 + monthlyRet) + netMonthly;
          totalInvested += monthlyAmount;
        }
      }
      
      projections[key] = {
        data,
        finalBalance: balance,
        totalInvested
      };
    });
    
    // Risk metrics
    const totalInvested = initialAmount + monthlyAmount * months;
    const expectedValue = projections.expected.finalBalance;
    const pessimisticValue = projections.pessimistic.finalBalance;
    const optimisticValue = projections.optimistic.finalBalance;
    
    const roi = ((expectedValue - totalInvested) / totalInvested) * 100;
    const riskRewardRatio = (optimisticValue - expectedValue) / (expectedValue - pessimisticValue);
    
    // Combined chart data
    const chartData = projections.expected.data.map((d, i) => ({
      year: d.year,
      'Инвестирано': projections.expected.data[i]?.invested || 0,
      'Песимистичен': projections.pessimistic.data[i]?.balance || 0,
      'Очакван': projections.expected.data[i]?.balance || 0,
      'Оптимистичен': projections.optimistic.data[i]?.balance || 0,
    }));
    
    return {
      strategy,
      totalInvested,
      expectedValue,
      pessimisticValue,
      optimisticValue,
      roi,
      riskRewardRatio,
      chartData,
      projections
    };
  }, [initialAmount, monthlyAmount, years, selectedStrategy, entryFee, managementFee]);

  const riskData = [
    { subject: 'Доходност', A: STRATEGIES[selectedStrategy].expectedReturn * 5, fullMark: 50 },
    { subject: 'Волатилност', A: STRATEGIES[selectedStrategy].stdDev * 2, fullMark: 50 },
    { subject: 'Макс. загуба', A: Math.abs(STRATEGIES[selectedStrategy].minReturn) * 1.5, fullMark: 50 },
    { subject: 'Макс. печалба', A: STRATEGIES[selectedStrategy].maxReturn, fullMark: 50 },
    { subject: 'Акции', A: STRATEGIES[selectedStrategy].allocation.stocks / 2, fullMark: 50 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Инвестиционен калкулатор</h2>
        <p className="text-sm text-slate-500">Изчислете очаквана доходност и риск</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Label>Начална инвестиция (лв.)</Label>
              <Input 
                type="number" 
                value={initialAmount} 
                onChange={(e) => setInitialAmount(parseFloat(e.target.value) || 0)} 
              />
            </div>

            <div className="space-y-2">
              <Label>Месечна вноска (лв.)</Label>
              <Input 
                type="number" 
                value={monthlyAmount} 
                onChange={(e) => setMonthlyAmount(parseFloat(e.target.value) || 0)} 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Инвестиционен хоризонт</Label>
                <span className="text-sm font-medium text-blue-600">{years} години</span>
              </div>
              <Slider
                value={[years]}
                onValueChange={([v]) => setYears(v)}
                min={1}
                max={40}
                className="py-2"
              />
            </div>

            <div className="space-y-3">
              <Label>Инвестиционна стратегия</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STRATEGIES).map(([key, s]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedStrategy(key)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedStrategy === key 
                        ? 'border-2 border-blue-500 bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.expectedReturn}% год.</p>
                    <Badge variant="outline" className="mt-1 text-xs" style={{ borderColor: s.color, color: s.color }}>
                      {s.risk}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Входна такса (%)</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={entryFee} 
                  onChange={(e) => setEntryFee(parseFloat(e.target.value) || 0)} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Такса управление (%/год.)</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={managementFee} 
                  onChange={(e) => setManagementFee(parseFloat(e.target.value) || 0)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="pt-4">
                <div className="flex items-center gap-1 text-blue-100 text-xs mb-1">
                  <Target className="h-3 w-3" />
                  Очаквана стойност
                </div>
                <p className="text-xl font-bold">{calculations.expectedValue.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-1 text-slate-500 text-xs mb-1">
                  <BarChart3 className="h-3 w-3" />
                  Инвестирано
                </div>
                <p className="text-lg font-bold">{calculations.totalInvested.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-1 text-green-500 text-xs mb-1">
                  <TrendingUp className="h-3 w-3" />
                  ROI
                </div>
                <p className="text-lg font-bold text-green-600">+{calculations.roi.toFixed(1)}%</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-1 text-amber-500 text-xs mb-1">
                  <AlertTriangle className="h-3 w-3" />
                  Риск/Награда
                </div>
                <p className="text-lg font-bold">{calculations.riskRewardRatio.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Scenario Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4 text-center">
                <TrendingDown className="h-5 w-5 text-red-500 mx-auto mb-1" />
                <p className="text-xs text-red-600 mb-1">Песимистичен</p>
                <p className="text-lg font-bold text-red-700">{calculations.pessimisticValue.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4 text-center">
                <Target className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-blue-600 mb-1">Очакван</p>
                <p className="text-lg font-bold text-blue-700">{calculations.expectedValue.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4 text-center">
                <TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-xs text-green-600 mb-1">Оптимистичен</p>
                <p className="text-lg font-bold text-green-700">{calculations.optimisticValue.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 text-sm">Прогноза за стойността</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={calculations.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(v) => (v/1000).toFixed(0) + 'к'} />
                    <Tooltip formatter={(v) => v.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' лв.'} />
                    <Legend />
                    <Area type="monotone" dataKey="Инвестирано" stroke="#94a3b8" fill="#e2e8f0" />
                    <Area type="monotone" dataKey="Песимистичен" stroke="#ef4444" fill="#fecaca" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="Очакван" stroke="#3b82f6" fill="#93c5fd" />
                    <Area type="monotone" dataKey="Оптимистичен" stroke="#10b981" fill="#86efac" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 text-sm">Рисков профил</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={riskData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fontSize: 8 }} />
                    <Radar 
                      name="Стратегия" 
                      dataKey="A" 
                      stroke={calculations.strategy.color} 
                      fill={calculations.strategy.color} 
                      fillOpacity={0.5} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Strategy Info */}
          <Card className="bg-slate-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-slate-900 mb-1">{calculations.strategy.name} стратегия</p>
                  <p className="text-slate-600 mb-2">
                    Очаквана годишна доходност: {calculations.strategy.expectedReturn}% | 
                    Волатилност: ±{calculations.strategy.stdDev}% | 
                    Възможен диапазон: {calculations.strategy.minReturn}% до +{calculations.strategy.maxReturn}%
                  </p>
                  <div className="flex gap-4 text-xs">
                    <span><Badge variant="outline" className="bg-blue-100">Облигации: {calculations.strategy.allocation.bonds}%</Badge></span>
                    <span><Badge variant="outline" className="bg-green-100">Акции: {calculations.strategy.allocation.stocks}%</Badge></span>
                    <span><Badge variant="outline" className="bg-slate-100">Кеш: {calculations.strategy.allocation.cash}%</Badge></span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
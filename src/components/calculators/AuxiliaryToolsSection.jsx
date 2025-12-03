import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, TrendingUp, Calculator, Users, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Page 10 - Pension Demographics
const PensionDemographics = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Пенсионно осигуряване</h2>
      <p className="text-slate-600 text-sm">Възрастов състав на населението в България</p>
      
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-semibold mb-2 text-blue-600 text-sm">2016 година</h3>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Users className="w-10 h-10 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">1.56</p>
                <p className="text-xs text-slate-600">работещи на 1 пенсионер</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <h3 className="font-semibold mb-2 text-red-600 text-sm">2060 година (прогноза)</h3>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <Users className="w-10 h-10 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">1.00</p>
                <p className="text-xs text-slate-600">работещ на 1 пенсионер</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 text-sm mb-1">Демографска криза</p>
              <p className="text-xs text-amber-800">
                Застаряващото население означава, че държавните пенсии ще станат все по-трудни за поддържане.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Page 11 - How Rich People Invest
const RichInvestmentStrategy = () => {
  const portfolioData = [
    { category: 'Паричен пазар', percent: 25.6, color: '#ef4444' },
    { category: 'Облигации', percent: 16.9, color: '#94a3b8' },
    { category: 'Акции', percent: 26.8, color: '#60a5fa' },
    { category: 'Недвижими имоти', percent: 17.6, color: '#475569' },
    { category: 'Алтернативи', percent: 13.1, color: '#1e293b' },
  ];

  const pieData = portfolioData.map(item => ({ name: item.category, value: item.percent }));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Как инвестират богатите?</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={portfolioData[index].color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {portfolioData.map((item) => (
                <div key={item.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded" style={{ backgroundColor: item.color }} />
                    <span>{item.category}</span>
                  </div>
                  <span className="font-semibold">{item.percent}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-3 pb-3">
              <h3 className="font-semibold text-blue-900 text-sm">Разнообразие</h3>
              <p className="text-xs text-blue-800">Инвестициите са разпределени в множество активи</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-3 pb-3">
              <h3 className="font-semibold text-green-900 text-sm">Дългосрочна стратегия</h3>
              <p className="text-xs text-green-800">Минимални корекции във времето</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-3 pb-3">
              <h3 className="font-semibold text-purple-900 text-sm">Балансиран подход</h3>
              <p className="text-xs text-purple-800">Комбинация от сигурни и рискови активи</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Monthly Savings Table
const MonthlySavingsTable = () => {
  const [selectedRate, setSelectedRate] = useState(8);
  const rates = [1, 3, 5, 6, 8, 10];
  const years = [1, 5, 10, 15, 20, 25, 30];
  
  const calculateSavings = (monthlyAmount, ratePercent, years) => {
    const monthlyRate = ratePercent / 100 / 12;
    const months = years * 12;
    if (monthlyRate === 0) return monthlyAmount * months;
    return monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  };

  const chartData = years.map(year => ({
    year: `${year}г`,
    'Стойност': calculateSavings(50, selectedRate, year)
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Месечен депозит от 50 лв.</h2>
      
      <div className="flex gap-2 flex-wrap">
        {rates.map(r => (
          <button key={r} onClick={() => setSelectedRate(r)}
            className={cn("px-3 py-1 rounded-lg text-sm font-semibold transition-all",
              selectedRate === r ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
            {r}%
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString('bg-BG', { maximumFractionDigits: 0 }) + ' лв'} />
              <Bar dataKey="Стойност" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs border border-slate-200">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-2 text-left">Години</th>
              {rates.map(rate => (<th key={rate} className="p-2 text-right">{rate}%</th>))}
            </tr>
          </thead>
          <tbody>
            {years.map((year, idx) => (
              <tr key={year} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                <td className="p-2 font-semibold">{year}</td>
                {rates.map(rate => (
                  <td key={rate} className="p-2 text-right">
                    {Math.round(calculateSavings(50, rate, year)).toLocaleString('bg-BG')} лв
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Compound Interest Visual
const CompoundInterestVisual = () => {
  const earlyStartData = [];
  const lateStartData = [];
  
  for (let age = 20; age <= 59; age++) {
    const years = age - 20;
    const months = years * 12;
    const rate8 = 0.08 / 12;
    const value = months > 0 ? 50 * ((Math.pow(1 + rate8, months) - 1) / rate8) * (1 + rate8) : 0;
    earlyStartData.push({ age, value });
  }
  
  for (let age = 20; age <= 59; age++) {
    if (age < 30) {
      lateStartData.push({ age, value: 0 });
    } else {
      const years = age - 30;
      const months = years * 12;
      const rate8 = 0.08 / 12;
      const value = months > 0 ? 50 * ((Math.pow(1 + rate8, months) - 1) / rate8) * (1 + rate8) : 0;
      lateStartData.push({ age, value });
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Сложна лихва - Натрупване</h2>
      
      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold mb-2 text-sm">Започнали на 20 vs 30 год. (8% доходност)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" dataKey="age" domain={[20, 59]} />
              <YAxis tickFormatter={(v) => (v/1000).toFixed(0) + 'к'} />
              <Tooltip formatter={(v) => v.toLocaleString('bg-BG', { maximumFractionDigits: 0 }) + ' лв'} />
              <Legend />
              <Line data={earlyStartData} type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} name="Старт 20 год." />
              <Line data={lateStartData} type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} name="Старт 30 год." />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-3">
            <h3 className="font-semibold text-green-900 text-sm">Започнали на 20</h3>
            <p className="text-lg font-bold text-green-600">94,458 лв</p>
            <p className="text-xs text-slate-500">при 8% за 40 години</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-3">
            <h3 className="font-semibold text-red-900 text-sm">Започнали на 30</h3>
            <p className="text-lg font-bold text-red-600">73,408 лв</p>
            <p className="text-xs text-slate-500">при 8% за 30 години</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Rule 72
const Rule72 = () => {
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(8);
  
  const doublingTime = 72 / rate;
  const doublings = Math.floor(36 / doublingTime);
  const finalAmount = amount * Math.pow(2, doublings);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Правило 72</h2>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Calculator className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 text-sm">72 ÷ доходност = години за удвояване</h3>
              <p className="text-xs text-blue-800">Бърз начин да изчислите кога парите ви ще се удвоят</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-sm">Начална сума (лв)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Годишна доходност (%)</Label>
            <Input type="number" value={rate} onChange={(e) => setRate(parseFloat(e.target.value) || 1)} />
          </div>
        </div>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 space-y-2">
            <div>
              <p className="text-xs text-slate-600">Формула</p>
              <p className="text-lg font-bold text-blue-600">72 ÷ {rate} = {doublingTime.toFixed(1)} години</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Удвоявания за 36 години</p>
              <p className="text-2xl font-bold text-green-600">{doublings}x</p>
            </div>
            <div className="pt-2 border-t border-green-200">
              <p className="text-xs text-slate-600">Краен капитал</p>
              <p className="text-2xl font-bold text-emerald-600">{finalAmount.toLocaleString('bg-BG')} лв</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Income Protection
const IncomeProtection = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Видове обезщетения</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-3 text-center">
            <p className="text-xs text-slate-600">Безработица</p>
            <p className="text-xl font-bold text-blue-600">60%</p>
            <p className="text-xs text-slate-500">до 12 мес.</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-3 text-center">
            <p className="text-xs text-slate-600">Майчинство</p>
            <p className="text-xl font-bold text-green-600">90%</p>
            <p className="text-xs text-slate-500">410 дни</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-3 text-center">
            <p className="text-xs text-slate-600">Болест</p>
            <p className="text-xl font-bold text-purple-600">70-90%</p>
            <p className="text-xs text-slate-500">от случая</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-3 text-center">
            <p className="text-xs text-slate-600">Пенсия</p>
            <p className="text-xl font-bold text-red-600">~40%</p>
            <p className="text-xs text-slate-500">от дохода</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Защо е важна допълнителна защита?</p>
              <p className="text-xs text-amber-800">
                Държавните обезщетения често са недостатъчни за поддържане на стандарта на живот.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function AuxiliaryToolsSection() {
  return (
    <Tabs defaultValue="pension" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1">
        <TabsTrigger value="pension" className="text-xs">Пенсия</TabsTrigger>
        <TabsTrigger value="rich" className="text-xs">Богати</TabsTrigger>
        <TabsTrigger value="monthly" className="text-xs">Таблица</TabsTrigger>
        <TabsTrigger value="compound" className="text-xs">Сложна лихва</TabsTrigger>
        <TabsTrigger value="rule72" className="text-xs">Правило 72</TabsTrigger>
        <TabsTrigger value="income" className="text-xs">Обезщетения</TabsTrigger>
      </TabsList>

      <TabsContent value="pension"><PensionDemographics /></TabsContent>
      <TabsContent value="rich"><RichInvestmentStrategy /></TabsContent>
      <TabsContent value="monthly"><MonthlySavingsTable /></TabsContent>
      <TabsContent value="compound"><CompoundInterestVisual /></TabsContent>
      <TabsContent value="rule72"><Rule72 /></TabsContent>
      <TabsContent value="income"><IncomeProtection /></TabsContent>
    </Tabs>
  );
}
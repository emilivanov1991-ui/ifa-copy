import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Percent, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ConsumerLoanCalculator() {
  const [amount, setAmount] = useState(10000);
  const [term, setTerm] = useState(36); // months
  const [rate, setRate] = useState(8.5);
  const [fees, setFees] = useState(100); // одноразова такса

  const calculations = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    const months = term;
    
    // Месечна вноска (анюитет)
    let monthlyPayment;
    if (monthlyRate === 0) {
      monthlyPayment = amount / months;
    } else {
      monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                       (Math.pow(1 + monthlyRate, months) - 1);
    }
    
    // Общо за плащане
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - amount;
    
    // ГПР (опростена формула)
    // ГПР = ((Общо лихви + такси) / Сума) / (Срок в години) * 100
    const termYears = term / 12;
    const apr = ((totalInterest + fees) / amount / termYears) * 100 + rate;
    
    // Погасителен план
    const schedule = [];
    let balance = amount;
    
    for (let month = 1; month <= months; month++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance = Math.max(0, balance - principal);
      
      schedule.push({
        month,
        principal,
        interest,
        payment: monthlyPayment,
        balance
      });
    }
    
    // Данни за графика
    const chartData = schedule.filter((_, i) => i % 3 === 0 || i === schedule.length - 1).map(s => ({
      month: s.month,
      'Остатък': s.balance,
      'Платена главница': amount - s.balance
    }));
    
    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      apr,
      schedule,
      chartData
    };
  }, [amount, term, rate, fees]);

  const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6'];
  
  const pieData = [
    { name: 'Главница', value: amount },
    { name: 'Лихва', value: calculations.totalInterest },
    { name: 'Такси', value: fees }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Потребителски кредит</h2>
        <p className="text-sm text-slate-500">Изчислете месечна вноска и ГПР</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Сума на кредита</Label>
                  <span className="text-sm font-medium text-blue-600">{amount.toLocaleString()} лв.</span>
                </div>
                <Slider
                  value={[amount]}
                  onValueChange={([v]) => setAmount(v)}
                  min={1000}
                  max={50000}
                  step={500}
                  className="py-2"
                />
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Срок (месеци)</Label>
                  <span className="text-sm font-medium text-blue-600">{term} мес. ({(term/12).toFixed(1)} г.)</span>
                </div>
                <Slider
                  value={[term]}
                  onValueChange={([v]) => setTerm(v)}
                  min={6}
                  max={84}
                  step={6}
                  className="py-2"
                />
                <Input
                  type="number"
                  value={term}
                  onChange={(e) => setTerm(parseInt(e.target.value) || 6)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Годишна лихва (%)</Label>
                  <span className="text-sm font-medium text-blue-600">{rate}%</span>
                </div>
                <Slider
                  value={[rate]}
                  onValueChange={([v]) => setRate(v)}
                  min={3}
                  max={25}
                  step={0.1}
                  className="py-2"
                />
                <Input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label>Такси (еднократни)</Label>
                <Input
                  type="number"
                  value={fees}
                  onChange={(e) => setFees(parseFloat(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-blue-100 mb-1">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-xs">Месечна вноска</span>
                </div>
                <p className="text-2xl font-bold">{calculations.monthlyPayment.toFixed(2)} лв.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Общо за плащане</span>
                </div>
                <p className="text-xl font-bold">{calculations.totalPayment.toFixed(2)} лв.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-amber-500 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">Общо лихви</span>
                </div>
                <p className="text-xl font-bold text-amber-600">{calculations.totalInterest.toFixed(2)} лв.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-purple-100 mb-1">
                  <Percent className="h-4 w-4" />
                  <span className="text-xs">ГПР</span>
                </div>
                <p className="text-2xl font-bold">{calculations.apr.toFixed(2)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 text-sm">Разпределение на плащанията</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => v.toFixed(2) + ' лв.'} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 text-sm">Погасяване на кредита</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={calculations.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v) => v.toFixed(2) + ' лв.'} />
                    <Area type="monotone" dataKey="Платена главница" stroke="#10b981" fill="#86efac" />
                    <Area type="monotone" dataKey="Остатък" stroke="#3b82f6" fill="#93c5fd" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Info Box */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Какво е ГПР?</p>
                  <p>Годишен процент на разходите (ГПР) включва всички разходи по кредита - лихви, такси, комисионни. Това е реалната цена на кредита и е по-висока от обявената лихва.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
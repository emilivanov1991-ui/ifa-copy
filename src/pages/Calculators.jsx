import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Home, Plus, Trash2, ArrowRight, TrendingUp, PiggyBank, Percent, TrendingDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import TermDepositCalculator from '../components/calculators/TermDepositCalculator';
import SavingsCalculator from '../components/calculators/SavingsCalculator';
import InvestmentCalculator from '../components/calculators/InvestmentCalculator';
import InflationCalculator from '../components/calculators/InflationCalculator';

const MortgageCalculator = () => {
  const [offers, setOffers] = useState([
    { id: 1, name: 'Оферта 1', amount: 100000, term: 20, rate: 3.5 }
  ]);
  const [selectedOfferId, setSelectedOfferId] = useState(1);

  const calculateMonthlyPayment = (amount, termYears, annualRate) => {
    const monthlyRate = annualRate / 100 / 12;
    const months = termYears * 12;
    if (monthlyRate === 0) return amount / months;
    return (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  };

  const calculateTotalInterest = (amount, termYears, annualRate) => {
    const monthlyPayment = calculateMonthlyPayment(amount, termYears, annualRate);
    const totalPaid = monthlyPayment * termYears * 12;
    return totalPaid - amount;
  };

  // Generate amortization schedule for selected offer
  const generateAmortizationSchedule = (offer) => {
    const monthlyPayment = calculateMonthlyPayment(offer.amount, offer.term, offer.rate);
    const schedule = [];
    let balance = offer.amount;
    const monthlyRate = offer.rate / 100 / 12;
    
    for (let year = 1; year <= offer.term; year++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;
      
      for (let month = 1; month <= 12; month++) {
        const interest = balance * monthlyRate;
        const principal = monthlyPayment - interest;
        balance -= principal;
        yearlyInterest += interest;
        yearlyPrincipal += principal;
      }
      
      schedule.push({
        year,
        'Главница': yearlyPrincipal,
        'Лихва': yearlyInterest,
        'Остатък': Math.max(0, balance)
      });
    }
    return schedule;
  };

  const addOffer = () => {
    const newId = Math.max(...offers.map(o => o.id), 0) + 1;
    setOffers([...offers, { id: newId, name: `Оферта ${newId}`, amount: 100000, term: 20, rate: 3.5 }]);
  };

  const removeOffer = (id) => {
    if (offers.length > 1) {
      setOffers(offers.filter(o => o.id !== id));
    }
  };

  const updateOffer = (id, field, value) => {
    setOffers(offers.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const getBestOffer = () => {
    if (offers.length < 2) return null;
    let best = offers[0];
    let bestTotal = calculateTotalInterest(best.amount, best.term, best.rate);
    offers.forEach(o => {
      const total = calculateTotalInterest(o.amount, o.term, o.rate);
      if (total < bestTotal) {
        best = o;
        bestTotal = total;
      }
    });
    return best.id;
  };

  const bestOfferId = getBestOffer();
  const selectedOffer = offers.find(o => o.id === selectedOfferId) || offers[0];
  const amortizationData = generateAmortizationSchedule(selectedOffer);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Калкулатор за ипотечни кредити</h2>
        <Button onClick={addOffer} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Добави оферта
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => {
          const monthlyPayment = calculateMonthlyPayment(offer.amount, offer.term, offer.rate);
          const totalInterest = calculateTotalInterest(offer.amount, offer.term, offer.rate);
          const totalPayment = offer.amount + totalInterest;
          const isBest = offer.id === bestOfferId;

          return (
            <Card 
              key={offer.id} 
              className={cn(
                "relative transition-all",
                isBest && "ring-2 ring-green-500 shadow-lg"
              )}
            >
              {isBest && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Най-изгодна
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Input
                    value={offer.name}
                    onChange={(e) => updateOffer(offer.id, 'name', e.target.value)}
                    onFocus={() => setSelectedOfferId(offer.id)}
                    className="font-semibold text-lg border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
                  />
                  {offers.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-red-500"
                      onClick={() => removeOffer(offer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-600">Сума на кредита (€)</Label>
                  <Input
                    type="number"
                    min="1000"
                    value={offer.amount}
                    onChange={(e) => updateOffer(offer.id, 'amount', parseFloat(e.target.value) || 0)}
                    className="text-lg font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-600">Срок (години)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="35"
                      value={offer.term}
                      onChange={(e) => updateOffer(offer.id, 'term', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-600">Лихва (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={offer.rate}
                      onChange={(e) => updateOffer(offer.id, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Месечна вноска:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {monthlyPayment.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Общо лихви:</span>
                    <span className="text-lg font-semibold text-amber-600">
                      {totalInterest.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-slate-700 font-medium">Общо за плащане:</span>
                    <span className="text-lg font-bold text-slate-900">
                      {totalPayment.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {offers.length >= 2 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-4">Сравнение на офертите</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="text-left py-2 px-3 text-blue-700">Оферта</th>
                    <th className="text-right py-2 px-3 text-blue-700">Сума</th>
                    <th className="text-right py-2 px-3 text-blue-700">Срок</th>
                    <th className="text-right py-2 px-3 text-blue-700">Лихва</th>
                    <th className="text-right py-2 px-3 text-blue-700">Месечна вноска</th>
                    <th className="text-right py-2 px-3 text-blue-700">Общо лихви</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => {
                    const monthlyPayment = calculateMonthlyPayment(offer.amount, offer.term, offer.rate);
                    const totalInterest = calculateTotalInterest(offer.amount, offer.term, offer.rate);
                    const isBest = offer.id === bestOfferId;
                    
                    return (
                      <tr 
                        key={offer.id} 
                        className={cn(
                          "border-b border-blue-100",
                          isBest && "bg-green-100"
                        )}
                      >
                        <td className="py-2 px-3 font-medium">
                          {offer.name}
                          {isBest && <span className="ml-2 text-green-600 text-xs">✓ Най-изгодна</span>}
                        </td>
                        <td className="text-right py-2 px-3">{offer.amount.toLocaleString('bg-BG')} €</td>
                        <td className="text-right py-2 px-3">{offer.term} г.</td>
                        <td className="text-right py-2 px-3">{offer.rate}%</td>
                        <td className="text-right py-2 px-3 font-medium">{monthlyPayment.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €</td>
                        <td className="text-right py-2 px-3 font-medium text-amber-600">{totalInterest.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Amortization Chart for selected offer */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 text-slate-900">
            График на погасяване - {selectedOffer.name}
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={amortizationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" label={{ value: 'Година', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Сума (€)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value) => value.toLocaleString('bg-BG', { maximumFractionDigits: 2 }) + ' €'}
                labelFormatter={(label) => `Година ${label}`}
              />
              <Legend />
              <Area type="monotone" dataKey="Главница" stackId="1" stroke="#3b82f6" fill="#93c5fd" />
              <Area type="monotone" dataKey="Лихва" stackId="1" stroke="#f59e0b" fill="#fcd34d" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-400" />
              <span className="text-slate-600">Главница (погасен дълг)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-400" />
              <span className="text-slate-600">Лихва (цена на кредита)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Calculators() {
  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="text-blue-600 font-medium text-sm tracking-widest uppercase mb-4 block">
            Финансови инструменти
          </span>
          <h1 className="text-3xl md:text-4xl font-light text-slate-900 mb-4">
            Финансови <span className="font-semibold text-blue-600">Калкулатори</span>
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Използвайте нашите калкулатори за планиране на вашите финансови решения
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-10"
        >
          <Tabs defaultValue="mortgage" className="space-y-6">
            <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-2 md:grid-cols-5 gap-2">
              <TabsTrigger value="mortgage" className="gap-2">
                <Home className="h-4 w-4" />
                Ипотечен
              </TabsTrigger>
              <TabsTrigger value="deposit" className="gap-2">
                <Percent className="h-4 w-4" />
                Депозит
              </TabsTrigger>
              <TabsTrigger value="investment" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Инвестиции
              </TabsTrigger>
              <TabsTrigger value="savings" className="gap-2">
                <PiggyBank className="h-4 w-4" />
                Спестявания
              </TabsTrigger>
              <TabsTrigger value="inflation" className="gap-2">
                <TrendingDown className="h-4 w-4" />
                Инфлация
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mortgage">
              <MortgageCalculator />
            </TabsContent>
            <TabsContent value="deposit">
              <TermDepositCalculator />
            </TabsContent>
            <TabsContent value="investment">
              <InvestmentCalculator />
            </TabsContent>
            <TabsContent value="savings">
              <SavingsCalculator />
            </TabsContent>
            <TabsContent value="inflation">
              <InflationCalculator />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
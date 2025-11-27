import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Home, Plus, Trash2, ArrowRight, TrendingUp, PiggyBank } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const MortgageCalculator = () => {
  const [offers, setOffers] = useState([
    { id: 1, name: 'Оферта 1', amount: 100000, term: 20, rate: 3.5 }
  ]);

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
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-1">
              <TabsTrigger value="mortgage" className="gap-2">
                <Home className="h-4 w-4" />
                Ипотечни кредити
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mortgage">
              <MortgageCalculator />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
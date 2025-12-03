import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Building2, TrendingUp, Shield, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Insurance calculation based on provided data
const calculateLifeInsurance = (principal) => {
  // 1 лв. на 795.54 лв. остатък
  return principal / 795.54;
};

const calculatePropertyInsurance = (principal) => {
  // 1 лв. на 2785.53 лв. остатък
  return principal / 2785.53;
};

export default function MortgageCalculatorAdvanced() {
  const [offers, setOffers] = useState([
    { id: 1, name: 'Банка ДСК', bank: 'Банка ДСК', amount: 200000, term: 25, rate: 2.28, apr: 2.45 },
  ]);
  const [selectedOfferId, setSelectedOfferId] = useState(1);
  const [showAmortization, setShowAmortization] = useState(false);
  const [includeInsurance, setIncludeInsurance] = useState(true);

  // Fetch mortgage products from catalog
  const { data: mortgageProducts = [] } = useQuery({
    queryKey: ['mortgageProducts'],
    queryFn: async () => {
      const products = await base44.entities.ProductCatalog.filter({ product_type: 'mortgage_loan', is_active: true });
      return products;
    }
  });

  const banks = useMemo(() => {
    if (mortgageProducts.length > 0) {
      return mortgageProducts.map(p => ({
        name: p.provider,
        rate: p.expected_return_conservative || 2.28,
        apr: p.expected_return_balanced || 2.45,
        docFee: 250,
        evalFee: 300,
        monthlyFee: 5.87
      }));
    }
    return [
      { name: 'Банка ДСК', rate: 2.28, apr: 2.45, docFee: 250, evalFee: 300, monthlyFee: 5.87 },
      { name: 'ОББ', rate: 2.28, apr: 2.45, docFee: 250, evalFee: 300, monthlyFee: 5.87 },
      { name: 'Пощенска банка', rate: 2.28, apr: 2.45, docFee: 250, evalFee: 300, monthlyFee: 5.87 },
      { name: 'УниКредит', rate: 2.28, apr: 2.45, docFee: 250, evalFee: 300, monthlyFee: 5.87 },
    ];
  }, [mortgageProducts]);

  const calculateMonthlyPayment = (amount, termYears, annualRate) => {
    const monthlyRate = annualRate / 100 / 12;
    const months = termYears * 12;
    if (monthlyRate === 0) return amount / months;
    return (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  };

  const generateAmortizationSchedule = (offer) => {
    const monthlyPayment = calculateMonthlyPayment(offer.amount, offer.term, offer.rate);
    const schedule = [];
    let balance = offer.amount;
    const monthlyRate = offer.rate / 100 / 12;
    const monthlyServiceFee = 5.87;
    
    for (let month = 1; month <= offer.term * 12; month++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      const lifeIns = includeInsurance ? calculateLifeInsurance(balance) : 0;
      const propIns = includeInsurance ? calculatePropertyInsurance(balance) : 0;
      const totalPayment = monthlyPayment + lifeIns + propIns + monthlyServiceFee;
      
      schedule.push({
        month,
        year: Math.ceil(month / 12),
        principal: principal,
        interest: interest,
        balance: Math.max(0, balance - principal),
        lifeInsurance: lifeIns,
        propertyInsurance: propIns,
        serviceFee: monthlyServiceFee,
        totalPayment: totalPayment
      });
      
      balance -= principal;
    }
    return schedule;
  };

  const generateYearlySchedule = (offer) => {
    const monthlySchedule = generateAmortizationSchedule(offer);
    const yearlyData = [];
    
    for (let year = 1; year <= offer.term; year++) {
      const yearMonths = monthlySchedule.filter(m => m.year === year);
      yearlyData.push({
        year,
        'Главница': yearMonths.reduce((s, m) => s + m.principal, 0),
        'Лихва': yearMonths.reduce((s, m) => s + m.interest, 0),
        'Застраховки': yearMonths.reduce((s, m) => s + m.lifeInsurance + m.propertyInsurance, 0),
        'Такси': yearMonths.reduce((s, m) => s + m.serviceFee, 0),
        'Остатък': yearMonths[yearMonths.length - 1]?.balance || 0
      });
    }
    return yearlyData;
  };

  const addOffer = () => {
    const newId = Math.max(...offers.map(o => o.id), 0) + 1;
    const bank = banks[0];
    setOffers([...offers, { 
      id: newId, 
      name: bank.name, 
      bank: bank.name,
      amount: 200000, 
      term: 25, 
      rate: bank.rate,
      apr: bank.apr
    }]);
  };

  const removeOffer = (id) => {
    if (offers.length > 1) {
      setOffers(offers.filter(o => o.id !== id));
      if (selectedOfferId === id) {
        setSelectedOfferId(offers.find(o => o.id !== id)?.id || 1);
      }
    }
  };

  const updateOffer = (id, field, value) => {
    setOffers(offers.map(o => {
      if (o.id === id) {
        if (field === 'bank') {
          const bank = banks.find(b => b.name === value) || banks[0];
          return { ...o, bank: value, name: value, rate: bank.rate, apr: bank.apr };
        }
        return { ...o, [field]: value };
      }
      return o;
    }));
  };

  const calculateTotalCost = (offer) => {
    const schedule = generateAmortizationSchedule(offer);
    const totalPayments = schedule.reduce((sum, m) => sum + m.totalPayment, 0);
    const bank = banks.find(b => b.name === offer.bank) || banks[0];
    return totalPayments + bank.docFee + bank.evalFee;
  };

  const getBestOffer = () => {
    if (offers.length < 2) return null;
    let best = offers[0];
    let bestCost = calculateTotalCost(best);
    offers.forEach(o => {
      const cost = calculateTotalCost(o);
      if (cost < bestCost) {
        best = o;
        bestCost = cost;
      }
    });
    return best.id;
  };

  const bestOfferId = getBestOffer();
  const selectedOffer = offers.find(o => o.id === selectedOfferId) || offers[0];
  const selectedSchedule = generateAmortizationSchedule(selectedOffer);
  const yearlyData = generateYearlySchedule(selectedOffer);

  const selectedBank = banks.find(b => b.name === selectedOffer.bank) || banks[0];
  const firstMonthPayment = selectedSchedule[0];
  const totalCost = calculateTotalCost(selectedOffer);
  const totalInterest = selectedSchedule.reduce((s, m) => s + m.interest, 0);
  const totalInsurance = selectedSchedule.reduce((s, m) => s + m.lifeInsurance + m.propertyInsurance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Ипотечен калкулатор</h2>
          <p className="text-sm text-slate-500">Сравнете оферти от различни банки с пълен погасителен план</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={includeInsurance} onCheckedChange={setIncludeInsurance} />
            <Label className="text-sm">Включи застраховки</Label>
          </div>
          <Button onClick={addOffer} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Добави оферта
          </Button>
        </div>
      </div>

      {/* Offer Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => {
          const monthlyPayment = calculateMonthlyPayment(offer.amount, offer.term, offer.rate);
          const schedule = generateAmortizationSchedule(offer);
          const firstMonth = schedule[0];
          const isBest = offer.id === bestOfferId;
          const isSelected = offer.id === selectedOfferId;

          return (
            <Card 
              key={offer.id} 
              className={`relative cursor-pointer transition-all ${
                isBest ? 'ring-2 ring-green-500' : ''
              } ${isSelected ? 'border-blue-500 shadow-lg' : ''}`}
              onClick={() => setSelectedOfferId(offer.id)}
            >
              {isBest && (
                <Badge className="absolute -top-2 left-4 bg-green-500">Най-изгодна</Badge>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Select value={offer.bank} onValueChange={(v) => updateOffer(offer.id, 'bank', v)}>
                    <SelectTrigger className="w-[180px] font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map(b => (
                        <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {offers.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeOffer(offer.id); }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-slate-500">Сума (лв.)</Label>
                    <Input
                      type="number"
                      value={offer.amount}
                      onChange={(e) => updateOffer(offer.id, 'amount', parseFloat(e.target.value) || 0)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Срок (години)</Label>
                    <Input
                      type="number"
                      value={offer.term}
                      onChange={(e) => updateOffer(offer.id, 'term', parseInt(e.target.value) || 1)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-slate-500">Лихва (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={offer.rate}
                      onChange={(e) => updateOffer(offer.id, 'rate', parseFloat(e.target.value) || 0)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">ГПР (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={offer.apr}
                      onChange={(e) => updateOffer(offer.id, 'apr', parseFloat(e.target.value) || 0)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                
                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Вноска кредит:</span>
                    <span className="font-medium">{monthlyPayment.toFixed(2)} лв.</span>
                  </div>
                  {includeInsurance && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Застр. Живот:</span>
                        <span>{firstMonth?.lifeInsurance.toFixed(2)} лв.</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Застр. Имущество:</span>
                        <span>{firstMonth?.propertyInsurance.toFixed(2)} лв.</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Такса обслужване:</span>
                    <span>5.87 лв.</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Общо месечно:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {firstMonth?.totalPayment.toFixed(2)} лв.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Table */}
      {offers.length >= 2 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-4">Сравнение на офертите</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="text-left py-2 px-3">Банка</th>
                    <th className="text-right py-2 px-3">Сума</th>
                    <th className="text-right py-2 px-3">Лихва</th>
                    <th className="text-right py-2 px-3">Месечна вноска</th>
                    <th className="text-right py-2 px-3">Общо лихви</th>
                    <th className="text-right py-2 px-3">Общо разход</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => {
                    const schedule = generateAmortizationSchedule(offer);
                    const totalInt = schedule.reduce((s, m) => s + m.interest, 0);
                    const totalCost = calculateTotalCost(offer);
                    const isBest = offer.id === bestOfferId;
                    
                    return (
                      <tr key={offer.id} className={isBest ? 'bg-green-100' : ''}>
                        <td className="py-2 px-3 font-medium">
                          {offer.bank}
                          {isBest && <span className="ml-2 text-green-600 text-xs">✓</span>}
                        </td>
                        <td className="text-right py-2 px-3">{offer.amount.toLocaleString()} лв.</td>
                        <td className="text-right py-2 px-3">{offer.rate}%</td>
                        <td className="text-right py-2 px-3 font-medium">{schedule[0]?.totalPayment.toFixed(2)} лв.</td>
                        <td className="text-right py-2 px-3 text-amber-600">{totalInt.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</td>
                        <td className="text-right py-2 px-3 font-bold">{totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Building2 className="h-4 w-4" />
              <span className="text-xs">Главница</span>
            </div>
            <p className="text-xl font-bold">{selectedOffer.amount.toLocaleString()} лв.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Общо лихви</span>
            </div>
            <p className="text-xl font-bold text-amber-600">{totalInterest.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Shield className="h-4 w-4" />
              <span className="text-xs">Общо застраховки</span>
            </div>
            <p className="text-xl font-bold text-blue-600">{totalInsurance.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Общ разход</span>
            </div>
            <p className="text-xl font-bold">{totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</p>
          </CardContent>
        </Card>
      </div>

      {/* Amortization Chart */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">График на погасяване - {selectedOffer.bank}</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowAmortization(!showAmortization)}>
              {showAmortization ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showAmortization ? 'Скрий таблица' : 'Покажи таблица'}
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(v) => v.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' лв.'} />
              <Legend />
              <Area type="monotone" dataKey="Главница" stackId="1" stroke="#3b82f6" fill="#93c5fd" />
              <Area type="monotone" dataKey="Лихва" stackId="1" stroke="#f59e0b" fill="#fcd34d" />
              <Area type="monotone" dataKey="Застраховки" stackId="1" stroke="#10b981" fill="#86efac" />
              <Area type="monotone" dataKey="Такси" stackId="1" stroke="#8b5cf6" fill="#c4b5fd" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Amortization Table */}
      {showAmortization && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Подробен погасителен план (първите 24 месеца)</h3>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left">Месец</th>
                    <th className="py-2 px-2 text-right">Остатък</th>
                    <th className="py-2 px-2 text-right">Лихва</th>
                    <th className="py-2 px-2 text-right">Главница</th>
                    <th className="py-2 px-2 text-right">Вноска</th>
                    <th className="py-2 px-2 text-right">Застр. Имущество</th>
                    <th className="py-2 px-2 text-right">Застр. Живот</th>
                    <th className="py-2 px-2 text-right">Такса</th>
                    <th className="py-2 px-2 text-right font-bold">Общо</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSchedule.slice(0, 24).map((row, i) => (
                    <tr key={i} className="border-b hover:bg-slate-50">
                      <td className="py-1 px-2">{row.month}</td>
                      <td className="py-1 px-2 text-right">{row.balance.toFixed(2)}</td>
                      <td className="py-1 px-2 text-right text-amber-600">{row.interest.toFixed(2)}</td>
                      <td className="py-1 px-2 text-right text-blue-600">{row.principal.toFixed(2)}</td>
                      <td className="py-1 px-2 text-right">{(row.principal + row.interest).toFixed(2)}</td>
                      <td className="py-1 px-2 text-right">{row.propertyInsurance.toFixed(2)}</td>
                      <td className="py-1 px-2 text-right">{row.lifeInsurance.toFixed(2)}</td>
                      <td className="py-1 px-2 text-right">{row.serviceFee.toFixed(2)}</td>
                      <td className="py-1 px-2 text-right font-bold">{row.totalPayment.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
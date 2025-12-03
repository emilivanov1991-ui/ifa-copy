import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Landmark, TrendingUp, Calendar, PiggyBank, Percent, Users, Info } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Pension fund data
const PENSION_FUNDS = {
  'ОББ': { returnRate: 6.5, fee: 0.75, contributionFee: 3.75 },
  'ДСК': { returnRate: 5.8, fee: 0.80, contributionFee: 4.0 },
  'Алианц': { returnRate: 6.2, fee: 0.85, contributionFee: 3.9 },
  'ЦКБ': { returnRate: 5.5, fee: 0.90, contributionFee: 4.25 },
  'Доверие': { returnRate: 6.0, fee: 0.85, contributionFee: 4.0 },
};

export default function PensionCalculator() {
  const [activeTab, setActiveTab] = useState('upf');
  
  // УПФ state (II стълб)
  const [upfAge, setUpfAge] = useState(35);
  const [upfSalary, setUpfSalary] = useState(2500);
  const [upfFund, setUpfFund] = useState('ОББ');
  const [upfRetirementAge, setUpfRetirementAge] = useState(65);
  const [upfCurrentBalance, setUpfCurrentBalance] = useState(5000);
  
  // ДПФ state (III стълб)
  const [dpfAge, setDpfAge] = useState(35);
  const [dpfMonthlyContribution, setDpfMonthlyContribution] = useState(100);
  const [dpfFund, setDpfFund] = useState('ОББ');
  const [dpfRetirementAge, setDpfRetirementAge] = useState(65);
  const [dpfCurrentBalance, setDpfCurrentBalance] = useState(0);
  const [dpfUseTaxBenefit, setDpfUseTaxBenefit] = useState(true);

  // УПФ calculations
  const upfCalculations = useMemo(() => {
    const fund = PENSION_FUNDS[upfFund];
    const yearsToRetirement = upfRetirementAge - upfAge;
    const monthlyContribution = upfSalary * 0.05; // 5% от заплата
    const netContribution = monthlyContribution * (1 - fund.contributionFee / 100);
    const monthlyReturn = fund.returnRate / 100 / 12;
    const monthlyFee = fund.fee / 100 / 12;
    const effectiveMonthlyReturn = monthlyReturn - monthlyFee;
    
    // Projection
    const projection = [];
    let balance = upfCurrentBalance;
    
    for (let year = 0; year <= yearsToRetirement; year++) {
      projection.push({
        age: upfAge + year,
        year,
        balance: balance,
        contributions: netContribution * 12 * year,
      });
      
      for (let month = 0; month < 12; month++) {
        balance = balance * (1 + effectiveMonthlyReturn) + netContribution;
      }
    }
    
    const finalBalance = balance;
    const totalContributions = netContribution * 12 * yearsToRetirement + upfCurrentBalance;
    const totalEarnings = finalBalance - totalContributions;
    
    // Месечна пенсия (20 години изплащане)
    const monthlyPension = finalBalance / (20 * 12);
    
    return {
      monthlyContribution,
      netContribution,
      yearsToRetirement,
      finalBalance,
      totalContributions,
      totalEarnings,
      monthlyPension,
      projection
    };
  }, [upfAge, upfSalary, upfFund, upfRetirementAge, upfCurrentBalance]);

  // ДПФ calculations
  const dpfCalculations = useMemo(() => {
    const fund = PENSION_FUNDS[dpfFund];
    const yearsToRetirement = dpfRetirementAge - dpfAge;
    const netContribution = dpfMonthlyContribution * (1 - fund.contributionFee / 100);
    const monthlyReturn = fund.returnRate / 100 / 12;
    const monthlyFee = fund.fee / 100 / 12;
    const effectiveMonthlyReturn = monthlyReturn - monthlyFee;
    
    // Tax benefit (10% от данъчна основа, макс 10% от дохода)
    const annualTaxBenefit = dpfUseTaxBenefit ? dpfMonthlyContribution * 12 * 0.10 : 0;
    
    // Projection
    const projection = [];
    let balance = dpfCurrentBalance;
    
    for (let year = 0; year <= yearsToRetirement; year++) {
      projection.push({
        age: dpfAge + year,
        year,
        balance: balance,
        contributions: netContribution * 12 * year + dpfCurrentBalance,
        taxBenefit: annualTaxBenefit * year
      });
      
      for (let month = 0; month < 12; month++) {
        balance = balance * (1 + effectiveMonthlyReturn) + netContribution;
      }
    }
    
    const finalBalance = balance;
    const totalContributions = netContribution * 12 * yearsToRetirement + dpfCurrentBalance;
    const totalEarnings = finalBalance - totalContributions;
    const totalTaxBenefit = annualTaxBenefit * yearsToRetirement;
    
    // Месечна пенсия (20 години изплащане)
    const monthlyPension = finalBalance / (20 * 12);
    
    return {
      netContribution,
      yearsToRetirement,
      finalBalance,
      totalContributions,
      totalEarnings,
      monthlyPension,
      annualTaxBenefit,
      totalTaxBenefit,
      projection
    };
  }, [dpfAge, dpfMonthlyContribution, dpfFund, dpfRetirementAge, dpfCurrentBalance, dpfUseTaxBenefit]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Пенсионни спестявания</h2>
        <p className="text-sm text-slate-500">Прогноза за бъдеща пенсия от УПФ и ДПФ</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upf" className="gap-2">
            <Landmark className="h-4 w-4" />
            УПФ (II стълб)
          </TabsTrigger>
          <TabsTrigger value="dpf" className="gap-2">
            <PiggyBank className="h-4 w-4" />
            ДПФ (III стълб)
          </TabsTrigger>
        </TabsList>

        {/* УПФ Tab */}
        <TabsContent value="upf" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-2">
                  <Label>Възраст</Label>
                  <div className="flex gap-2">
                    <Slider value={[upfAge]} onValueChange={([v]) => setUpfAge(v)} min={20} max={60} />
                    <Input type="number" value={upfAge} onChange={(e) => setUpfAge(parseInt(e.target.value) || 20)} className="w-20" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Брутна заплата (лв.)</Label>
                  <Input type="number" value={upfSalary} onChange={(e) => setUpfSalary(parseFloat(e.target.value) || 0)} />
                  <p className="text-xs text-slate-500">Вноска УПФ: {(upfSalary * 0.05).toFixed(2)} лв./мес (5%)</p>
                </div>

                <div className="space-y-2">
                  <Label>Пенсионен фонд</Label>
                  <select 
                    value={upfFund} 
                    onChange={(e) => setUpfFund(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    {Object.keys(PENSION_FUNDS).map(f => (
                      <option key={f} value={f}>{f} ({PENSION_FUNDS[f].returnRate}% доходност)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Възраст на пенсиониране</Label>
                  <Slider value={[upfRetirementAge]} onValueChange={([v]) => setUpfRetirementAge(v)} min={60} max={70} />
                  <p className="text-xs text-slate-500">{upfRetirementAge} години ({upfCalculations.yearsToRetirement} години до пенсия)</p>
                </div>

                <div className="space-y-2">
                  <Label>Текуща партида (лв.)</Label>
                  <Input type="number" value={upfCurrentBalance} onChange={(e) => setUpfCurrentBalance(parseFloat(e.target.value) || 0)} />
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4 text-xs text-blue-800">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Универсален пенсионен фонд (II стълб)</p>
                        <p>Задължително осигуряване за родените след 31.12.1959 г. Вноската е 5% от брутната заплата.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              {/* Results */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="pt-4">
                    <div className="text-blue-100 text-xs mb-1">Очаквана сума</div>
                    <p className="text-xl font-bold">{upfCalculations.finalBalance.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-slate-500 text-xs mb-1">Общо вноски</div>
                    <p className="text-lg font-bold">{upfCalculations.totalContributions.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-green-500 text-xs mb-1">Доходност</div>
                    <p className="text-lg font-bold text-green-600">+{upfCalculations.totalEarnings.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="pt-4">
                    <div className="text-purple-100 text-xs mb-1">Месечна пенсия</div>
                    <p className="text-xl font-bold">{upfCalculations.monthlyPension.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-sm">Прогноза за натрупване</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={upfCalculations.projection}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="age" label={{ value: 'Възраст', position: 'insideBottom', offset: -5 }} />
                      <YAxis tickFormatter={(v) => (v/1000).toFixed(0) + 'к'} />
                      <Tooltip formatter={(v) => v.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' лв.'} />
                      <Legend />
                      <Area type="monotone" dataKey="contributions" name="Вноски" stroke="#94a3b8" fill="#cbd5e1" />
                      <Area type="monotone" dataKey="balance" name="Баланс" stroke="#3b82f6" fill="#93c5fd" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ДПФ Tab */}
        <TabsContent value="dpf" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-2">
                  <Label>Възраст</Label>
                  <div className="flex gap-2">
                    <Slider value={[dpfAge]} onValueChange={([v]) => setDpfAge(v)} min={18} max={60} />
                    <Input type="number" value={dpfAge} onChange={(e) => setDpfAge(parseInt(e.target.value) || 18)} className="w-20" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Месечна вноска (лв.)</Label>
                  <Input type="number" value={dpfMonthlyContribution} onChange={(e) => setDpfMonthlyContribution(parseFloat(e.target.value) || 0)} />
                </div>

                <div className="space-y-2">
                  <Label>Пенсионен фонд</Label>
                  <select 
                    value={dpfFund} 
                    onChange={(e) => setDpfFund(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    {Object.keys(PENSION_FUNDS).map(f => (
                      <option key={f} value={f}>{f} ({PENSION_FUNDS[f].returnRate}% доходност)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Възраст на пенсиониране</Label>
                  <Slider value={[dpfRetirementAge]} onValueChange={([v]) => setDpfRetirementAge(v)} min={55} max={70} />
                  <p className="text-xs text-slate-500">{dpfRetirementAge} години ({dpfCalculations.yearsToRetirement} години до пенсия)</p>
                </div>

                <div className="space-y-2">
                  <Label>Текуща партида (лв.)</Label>
                  <Input type="number" value={dpfCurrentBalance} onChange={(e) => setDpfCurrentBalance(parseFloat(e.target.value) || 0)} />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Данъчно облекчение (10%)</Label>
                  <Switch checked={dpfUseTaxBenefit} onCheckedChange={setDpfUseTaxBenefit} />
                </div>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4 text-xs text-green-800">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Доброволен пенсионен фонд (III стълб)</p>
                        <p>Данъчно облекчение до 10% от годишната данъчна основа. Гъвкави вноски без ограничения.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              {/* Results */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="pt-4">
                    <div className="text-green-100 text-xs mb-1">Очаквана сума</div>
                    <p className="text-xl font-bold">{dpfCalculations.finalBalance.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-slate-500 text-xs mb-1">Общо вноски</div>
                    <p className="text-lg font-bold">{dpfCalculations.totalContributions.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-amber-500 text-xs mb-1">Данъчна спестовка</div>
                    <p className="text-lg font-bold text-amber-600">+{dpfCalculations.totalTaxBenefit.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="pt-4">
                    <div className="text-purple-100 text-xs mb-1">Месечна пенсия</div>
                    <p className="text-xl font-bold">{dpfCalculations.monthlyPension.toLocaleString(undefined, {maximumFractionDigits: 0})} лв.</p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-sm">Прогноза за натрупване</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dpfCalculations.projection}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="age" label={{ value: 'Възраст', position: 'insideBottom', offset: -5 }} />
                      <YAxis tickFormatter={(v) => (v/1000).toFixed(0) + 'к'} />
                      <Tooltip formatter={(v) => v.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' лв.'} />
                      <Legend />
                      <Area type="monotone" dataKey="contributions" name="Вноски" stroke="#94a3b8" fill="#cbd5e1" />
                      <Area type="monotone" dataKey="balance" name="Баланс" stroke="#10b981" fill="#86efac" />
                      {dpfUseTaxBenefit && <Area type="monotone" dataKey="taxBenefit" name="Данъчна спестовка" stroke="#f59e0b" fill="#fcd34d" />}
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
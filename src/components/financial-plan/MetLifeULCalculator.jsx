import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calculator, Shield, TrendingUp, Info, Save, Zap, PieChart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  METLIFE_UL_FUND_ALLOCATION,
  TERM_LIFE_RIDER_RATES,
  METLIFE_PA_RISK_CLASSES,
  METLIFE_PA_SECURITY_PLUS_COEFFICIENTS,
  getPremiumBonus,
  getAVCharge,
  getSurrenderCharge,
  getInvestiblePremiumRate,
  getMonthlyMortalityRate,
  calculateStrategyReturn
} from './FinancialPlanConstants';

export default function MetLifeULCalculator({ initialData = {}, onSave, analysisId, clientId }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    clientName: initialData.clientName || '',
    age: initialData.age || 35,
    riskClass: initialData.riskClass || 1,
    annualSavings: initialData.annualSavings || 1500,
    integratedLifeCoverage: initialData.integratedLifeCoverage || 2500,
    
    // Fund allocation
    globalStock: initialData.globalStock || 0.5,
    emergingMarkets: initialData.emergingMarkets || 0.5,
    globalBond: initialData.globalBond || 0,
    expectedReturn: initialData.expectedReturn || 0.08,
    
    // Additional coverages
    termLifeCoverage: initialData.termLifeCoverage || 0,
    termLifeYears: initialData.termLifeYears || 10,
    accidentalDeathCoverage: initialData.accidentalDeathCoverage || 0,
    ptdCoverage: initialData.ptdCoverage || 0,
    hospitalDailyBenefit: initialData.hospitalDailyBenefit || 0,
    surgicalBenefit: initialData.surgicalBenefit || 0,
    fracturesCoverage: initialData.fracturesCoverage || 0,
    criticalIllness40Coverage: initialData.criticalIllness40Coverage || 0,
    telemedicine: initialData.telemedicine || false,
    premiumWaiver: initialData.premiumWaiver || false
  });

  // Calculate premium breakdown
  const premiumBreakdown = useMemo(() => {
    const breakdown = {
      savings: formData.annualSavings,
      coverages: {}
    };

    // Term Life Rider
    if (formData.termLifeCoverage > 0) {
      const termRate = TERM_LIFE_RIDER_RATES[formData.age]?.[formData.termLifeYears] || 0;
      breakdown.coverages.termLife = (formData.termLifeCoverage / 1000) * termRate;
    }

    // Accidental Death
    if (formData.accidentalDeathCoverage > 0) {
      const riskData = METLIFE_PA_RISK_CLASSES[formData.riskClass];
      breakdown.coverages.accidentalDeath = (formData.accidentalDeathCoverage / 1000) * riskData.accidentalDeath;
    }

    // PTD (PI)
    if (formData.ptdCoverage > 0) {
      const riskData = METLIFE_PA_RISK_CLASSES[formData.riskClass];
      breakdown.coverages.ptd = (formData.ptdCoverage / 1000) * riskData.pi;
    }

    // Hospital Daily Benefit
    if (formData.hospitalDailyBenefit > 0) {
      breakdown.coverages.hospitalDaily = formData.hospitalDailyBenefit * 4.25;
    }

    // Surgical Benefit
    if (formData.surgicalBenefit > 0) {
      breakdown.coverages.surgical = (formData.surgicalBenefit / 100) * 8.32;
    }

    // Fractures and Burns
    if (formData.fracturesCoverage > 0) {
      const riskData = METLIFE_PA_RISK_CLASSES[formData.riskClass];
      breakdown.coverages.fractures = (formData.fracturesCoverage / 1000) * riskData.fracturesAndBurns;
    }

    // 40 Critical Illnesses
    if (formData.criticalIllness40Coverage > 0) {
      const coefficient = METLIFE_PA_SECURITY_PLUS_COEFFICIENTS[formData.age] || 50;
      breakdown.coverages.criticalIllness40 = formData.criticalIllness40Coverage / coefficient;
    }

    // Telemedicine
    if (formData.telemedicine && formData.age < 65) {
      breakdown.coverages.telemedicine = 15;
    }

    const totalCoverages = Object.values(breakdown.coverages).reduce((sum, val) => sum + val, 0);
    
    // Premium Waiver
    if (formData.premiumWaiver && formData.age <= 55) {
      const waiverRate = formData.riskClass === 1 ? 0.0438 : formData.riskClass === 2 ? 0.0525 : 0.07;
      breakdown.coverages.premiumWaiver = (formData.annualSavings + totalCoverages) * waiverRate;
    }

    breakdown.totalCoverages = Object.values(breakdown.coverages).reduce((sum, val) => sum + val, 0);
    breakdown.adminFee = 15;
    breakdown.totalAnnual = formData.annualSavings + breakdown.totalCoverages + 15;
    breakdown.monthly = breakdown.totalAnnual / 12;
    breakdown.quarterly = breakdown.totalAnnual / 4;
    breakdown.semiAnnual = breakdown.totalAnnual / 2;

    return breakdown;
  }, [formData]);

  // Generate detailed monthly projection
  const projection = useMemo(() => {
    const maxYears = Math.min(80 - formData.age, 49);
    const data = [];
    
    const premiumBonus = getPremiumBonus(formData.annualSavings, false);
    const avChargeRate = getAVCharge(formData.annualSavings, false);
    const monthlyReturn = formData.expectedReturn / 12;
    
    let accountValue = 0;
    let totalPremiumsPaid = 0;
    
    // Track fund units
    let units = { f1: 0, f2: 0, f3: 0, f4: 0 };
    let fundPrices = { f1: 1, f2: 1, f3: 1, f4: 1 };
    
    const allocation = {
      f1: formData.globalStock,
      f2: formData.emergingMarkets,
      f3: formData.globalBond,
      f4: 0
    };

    for (let year = 1; year <= maxYears; year++) {
      const currentAge = formData.age + year - 1;
      let yearlyPremiumPaid = 0;
      
      for (let month = 1; month <= 12; month++) {
        const monthNum = (year - 1) * 12 + month;
        
        // Premium payment
        let monthlyPremium = 0;
        if (year <= maxYears) {
          monthlyPremium = formData.annualSavings / 12;
          yearlyPremiumPaid += monthlyPremium;
        }
        
        // Investible premium
        const investibleRate = getInvestiblePremiumRate(year, false);
        let investiblePremium = monthlyPremium * investibleRate;
        
        // Premium bonus (only on first payment)
        if (month === 1 && year === 1) {
          investiblePremium += formData.annualSavings * premiumBonus;
        }
        
        // Allocate to funds
        if (investiblePremium > 0) {
          units.f1 += (investiblePremium * allocation.f1) / fundPrices.f1;
          units.f2 += (investiblePremium * allocation.f2) / fundPrices.f2;
          units.f3 += (investiblePremium * allocation.f3) / fundPrices.f3;
          units.f4 += (investiblePremium * allocation.f4) / fundPrices.f4;
        }
        
        // Apply growth to fund prices
        const monthlyGrowth = 1 + monthlyReturn;
        fundPrices.f1 *= monthlyGrowth;
        fundPrices.f2 *= monthlyGrowth;
        fundPrices.f3 *= monthlyGrowth;
        fundPrices.f4 *= monthlyGrowth;
        
        // Calculate AV
        accountValue = units.f1 * fundPrices.f1 + units.f2 * fundPrices.f2 + 
                       units.f3 * fundPrices.f3 + units.f4 * fundPrices.f4;
        
        // Deduct charges
        const fixedFee = 0; // €0/month
        const variableFee = accountValue * (avChargeRate / 12);
        const coiRate = getMonthlyMortalityRate(currentAge);
        const coi = accountValue * coiRate * (formData.integratedLifeCoverage / 1000);
        const policyFee = 15 / 12;
        
        const totalCharges = fixedFee + variableFee + coi + policyFee;
        
        // Deduct charges from units proportionally
        if (accountValue > 0) {
          const chargeRatio = totalCharges / accountValue;
          units.f1 *= (1 - chargeRatio);
          units.f2 *= (1 - chargeRatio);
          units.f3 *= (1 - chargeRatio);
          units.f4 *= (1 - chargeRatio);
        }
        
        accountValue = Math.max(0, accountValue - totalCharges);
      }
      
      totalPremiumsPaid += yearlyPremiumPaid;
      
      // Year-end summary
      const surrenderCharge = getSurrenderCharge(year, false);
      const netSurrenderValue = accountValue * (1 - surrenderCharge);
      const deathBenefit = Math.max(formData.integratedLifeCoverage, accountValue);
      
      data.push({
        year,
        age: currentAge + 1,
        premiumPaid: Math.round(yearlyPremiumPaid),
        totalPremiumsPaid: Math.round(totalPremiumsPaid),
        faceAmount: formData.integratedLifeCoverage,
        deathBenefit: Math.round(deathBenefit),
        accountValue: Math.round(accountValue),
        netSurrenderValue: Math.round(netSurrenderValue),
        surrenderChargePercent: Math.round(surrenderCharge * 100)
      });
    }
    
    return data;
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validation warnings
  const warnings = [];
  
  // Check fund allocation
  const totalAllocation = formData.globalStock + formData.emergingMarkets + formData.globalBond;
  if (Math.abs(totalAllocation - 1) > 0.001) {
    warnings.push('Разпределението на фондовете трябва да е 100%');
  }
  
  // Check face amount limits by age
  const maxFaceMultiplier = formData.age >= 56 ? 6 : formData.age >= 46 ? 10 : formData.age >= 36 ? 15 : formData.age >= 26 ? 20 : 30;
  const maxFace = formData.annualSavings * maxFaceMultiplier;
  if (formData.integratedLifeCoverage > maxFace) {
    warnings.push(`Интегрираното покритие (${formData.integratedLifeCoverage}€) надвишава лимита (${Math.round(maxFace)}€)`);
  }
  
  if (formData.integratedLifeCoverage > 14999) {
    warnings.push('За покритие над 15 000€ е необходим здравен въпросник');
  }

  const handleSaveOffer = async () => {
    if (!analysisId || warnings.length > 0) return;
    
    setSaving(true);
    try {
      await base44.entities.ProductOffer.create({
        analysis_id: analysisId,
        client_id: clientId,
        provider: 'MetLife',
        product_name: 'MetLife Предимство',
        product_type: 'ul_investment',
        beneficiary_name: formData.clientName,
        beneficiary_age: formData.age,
        strategy: 'custom',
        monthly_premium: premiumBreakdown.monthly,
        annual_premium: premiumBreakdown.totalAnnual,
        coverage_amount: formData.integratedLifeCoverage,
        risk_class: formData.riskClass,
        offer_status: 'generated',
        ai_recommendation_reason: `UL инвестиция с очаквана доходност ${(formData.expectedReturn * 100).toFixed(1)}%`
      });
      
      toast.success('Офертата е запазена успешно');
      if (onSave) onSave(formData, premiumBreakdown, projection);
    } catch (error) {
      toast.error('Грешка при записване: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/d26d48d16_image.png" 
              alt="MetLife" 
              className="h-12 bg-white px-4 py-2 rounded-xl shadow-lg"
            />
            <div>
              <CardTitle className="text-white text-2xl font-bold tracking-wide">MetLife Предимство</CardTitle>
              <p className="text-blue-100 text-sm font-medium">Unit Linked - Инвестиционна застраховка</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="input" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-gradient-to-r from-blue-100 to-purple-100 p-1 rounded-lg">
          <TabsTrigger value="input" className="data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300">Данни</TabsTrigger>
          <TabsTrigger value="offer" className="data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300">Оферта</TabsTrigger>
          <TabsTrigger value="projection" className="data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300">Проекция</TabsTrigger>
        </TabsList>

        {/* Input Tab */}
        <TabsContent value="input" className="space-y-6">
          {/* Warnings */}
          {warnings.length > 0 && (
            <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg">
              <CardContent className="pt-6">
                {warnings.map((warning, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-amber-800">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium">{warning}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Basic Info */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-4">
              <CardTitle className="text-lg font-semibold text-blue-800">Основна информация</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Застраховано лице</Label>
                <Input 
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Име на клиента"
                />
              </div>
              <div>
                <Label>Възраст</Label>
                <Input 
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                  min={15}
                  max={65}
                />
              </div>
              <div>
                <Label>Рисков клас</Label>
                <Select value={formData.riskClass.toString()} onValueChange={(v) => handleInputChange('riskClass', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">I рисков клас</SelectItem>
                    <SelectItem value="2">II рисков клас</SelectItem>
                    <SelectItem value="3">III рисков клас</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Годишна сума за спестяване (€)</Label>
                <Input 
                  type="number"
                  value={formData.annualSavings}
                  onChange={(e) => handleInputChange('annualSavings', parseFloat(e.target.value) || 0)}
                  min={300}
                />
              </div>
              <div>
                <Label>Интегрирано покритие Живот (€)</Label>
                <Input 
                  type="number"
                  value={formData.integratedLifeCoverage}
                  onChange={(e) => handleInputChange('integratedLifeCoverage', parseFloat(e.target.value) || 0)}
                  min={0}
                  max={15000}
                />
              </div>
            </CardContent>
          </Card>

          {/* Investment Funds */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 py-4">
              <CardTitle className="text-lg font-semibold text-indigo-800 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Инвестиционни фондове
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Световни акции (%)</Label>
                  <Input 
                    type="number"
                    value={Math.round(formData.globalStock * 100)}
                    onChange={(e) => handleInputChange('globalStock', (parseFloat(e.target.value) || 0) / 100)}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
                <div>
                  <Label>Акции развиващи се пазари (%)</Label>
                  <Input 
                    type="number"
                    value={Math.round(formData.emergingMarkets * 100)}
                    onChange={(e) => handleInputChange('emergingMarkets', (parseFloat(e.target.value) || 0) / 100)}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
                <div>
                  <Label>Световни ценни книжа (%)</Label>
                  <Input 
                    type="number"
                    value={Math.round(formData.globalBond * 100)}
                    onChange={(e) => handleInputChange('globalBond', (parseFloat(e.target.value) || 0) / 100)}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
                <div>
                  <Label>Очаквана годишна доходност (%)</Label>
                  <Input 
                    type="number"
                    value={Math.round(formData.expectedReturn * 100)}
                    onChange={(e) => handleInputChange('expectedReturn', (parseFloat(e.target.value) || 0) / 100)}
                    step={0.5}
                  />
                </div>
              </div>
              <div className={`bg-gradient-to-r p-4 rounded-lg border ${Math.abs(totalAllocation - 1) < 0.001 ? 'from-green-50 to-emerald-50 border-green-200' : 'from-red-50 to-rose-50 border-red-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Общо разпределение:</span>
                  <span className={`text-2xl font-bold ${Math.abs(totalAllocation - 1) < 0.001 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.round(totalAllocation * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Coverages */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 py-4">
              <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Допълнителни застрахователни покрития
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Допълнително покритие срочен Живот (€)</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number"
                      value={formData.termLifeCoverage}
                      onChange={(e) => handleInputChange('termLifeCoverage', parseFloat(e.target.value) || 0)}
                      placeholder="Минимум 3000€"
                      min={0}
                    />
                    <Select value={formData.termLifeYears.toString()} onValueChange={(v) => handleInputChange('termLifeYears', parseInt(v))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 год.</SelectItem>
                        <SelectItem value="10">10 год.</SelectItem>
                        <SelectItem value="15">15 год.</SelectItem>
                        <SelectItem value="20">20 год.</SelectItem>
                        <SelectItem value="25">25 год.</SelectItem>
                        <SelectItem value="30">30 год.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>Смърт от злополука (€)</Label>
                  <Input 
                    type="number"
                    value={formData.accidentalDeathCoverage}
                    onChange={(e) => handleInputChange('accidentalDeathCoverage', parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                
                <div>
                  <Label>Пълна/Частична ТН от злополука (€)</Label>
                  <Input 
                    type="number"
                    value={formData.ptdCoverage}
                    onChange={(e) => handleInputChange('ptdCoverage', parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                
                <div>
                  <Label>Дневно обезщетение при хоспитализация (€)</Label>
                  <Input 
                    type="number"
                    value={formData.hospitalDailyBenefit}
                    onChange={(e) => handleInputChange('hospitalDailyBenefit', parseFloat(e.target.value) || 0)}
                    placeholder="5-300€"
                    min={0}
                    max={300}
                  />
                </div>
                
                <div>
                  <Label>Хирургическа намеса (€)</Label>
                  <Input 
                    type="number"
                    value={formData.surgicalBenefit}
                    onChange={(e) => handleInputChange('surgicalBenefit', parseFloat(e.target.value) || 0)}
                    placeholder="150-5000€"
                    min={0}
                    max={5000}
                  />
                </div>
                
                <div>
                  <Label>Фрактури и изгаряния (€)</Label>
                  <Input 
                    type="number"
                    value={formData.fracturesCoverage}
                    onChange={(e) => handleInputChange('fracturesCoverage', parseFloat(e.target.value) || 0)}
                    placeholder="500-1500€"
                    min={0}
                    max={1500}
                  />
                </div>
                
                <div>
                  <Label>40 Тежки Заболявания (€)</Label>
                  <Input 
                    type="number"
                    value={formData.criticalIllness40Coverage}
                    onChange={(e) => handleInputChange('criticalIllness40Coverage', parseFloat(e.target.value) || 0)}
                    placeholder="5000-500000€"
                    min={0}
                  />
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={formData.telemedicine}
                    onCheckedChange={(checked) => handleInputChange('telemedicine', checked)}
                    disabled={formData.age >= 65}
                  />
                  <Label>Телемедицина / Второ медицинско мнение (+15€/год)</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={formData.premiumWaiver}
                    onCheckedChange={(checked) => handleInputChange('premiumWaiver', checked)}
                    disabled={formData.age > 55}
                  />
                  <Label>Отказ от премия</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offer Tab */}
        <TabsContent value="offer" className="space-y-6">
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 py-5">
              <CardTitle className="text-xl font-bold text-slate-900">Застрахователна оферта - {formData.clientName}</CardTitle>
              <div className="text-sm text-slate-600 mt-2">
                Възраст: {formData.age} г. | Рисков клас: {formData.riskClass === 1 ? 'I' : formData.riskClass === 2 ? 'II' : 'III'}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Savings Program */}
              <div>
                <h3 className="font-semibold text-lg mb-4 text-blue-600 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  СПЕСТОВНА ПРОГРАМА
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                    <h4 className="font-semibold mb-3 text-blue-800">Основни характеристики</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Годишна вноска:</span>
                        <span className="font-semibold">{formData.annualSavings.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Полугодишна вноска:</span>
                        <span className="font-semibold">{(formData.annualSavings / 2).toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Интегрирано покритие:</span>
                        <span className="font-semibold">{formData.integratedLifeCoverage.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Премиен бонус:</span>
                        <span className="font-semibold">{(getPremiumBonus(formData.annualSavings, false) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                    <h4 className="font-semibold mb-3 text-purple-800">Инвестиционни фондове</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Световни акции:</span>
                        <span className="font-semibold">{Math.round(formData.globalStock * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Развиващи се пазари:</span>
                        <span className="font-semibold">{Math.round(formData.emergingMarkets * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Световни ценни книжа:</span>
                        <span className="font-semibold">{Math.round(formData.globalBond * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Очаквана доходност:</span>
                        <span className="font-semibold">{(formData.expectedReturn * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coverages */}
              <div>
                <h3 className="font-semibold text-lg mb-4 text-green-600 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  ДОПЪЛНИТЕЛНИ ПОКРИТИЯ И ОБЕЗЩЕТЕНИЯ
                </h3>
                <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-slate-700">Застрахователно покритие</th>
                        <th className="text-right p-4 font-semibold text-slate-700">Обезщетение</th>
                        <th className="text-right p-4 font-semibold text-slate-700">Цена (€/год)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {formData.termLifeCoverage > 0 && (
                        <tr>
                          <td className="p-3">Загуба на живот (срок {formData.termLifeYears} год.)</td>
                          <td className="text-right p-3">{formData.termLifeCoverage.toFixed(0)} €</td>
                          <td className="text-right p-3">{(premiumBreakdown.coverages.termLife || 0).toFixed(2)}</td>
                        </tr>
                      )}
                      {formData.accidentalDeathCoverage > 0 && (
                        <tr>
                          <td className="p-3">Загуба на живот при злополука</td>
                          <td className="text-right p-3">{formData.accidentalDeathCoverage.toFixed(0)} €</td>
                          <td className="text-right p-3">{(premiumBreakdown.coverages.accidentalDeath || 0).toFixed(2)}</td>
                        </tr>
                      )}
                      {formData.ptdCoverage > 0 && (
                        <tr>
                          <td className="p-3">Пълна Трайна Нетрудоспособност</td>
                          <td className="text-right p-3">{formData.ptdCoverage.toFixed(0)} €</td>
                          <td className="text-right p-3">{((premiumBreakdown.coverages.ptd || 0) / 2).toFixed(2)}</td>
                        </tr>
                      )}
                      {formData.criticalIllness40Coverage > 0 && (
                        <tr>
                          <td className="p-3">Диагностициране на 40 Тежки Заболявания</td>
                          <td className="text-right p-3">{formData.criticalIllness40Coverage.toFixed(0)} €</td>
                          <td className="text-right p-3">{(premiumBreakdown.coverages.criticalIllness40 || 0).toFixed(2)}</td>
                        </tr>
                      )}
                      {formData.hospitalDailyBenefit > 0 && (
                        <tr>
                          <td className="p-3">Дневно обезщетение при хоспитализация</td>
                          <td className="text-right p-3">{formData.hospitalDailyBenefit.toFixed(0)} €/ден</td>
                          <td className="text-right p-3">{(premiumBreakdown.coverages.hospitalDaily || 0).toFixed(2)}</td>
                        </tr>
                      )}
                      {formData.surgicalBenefit > 0 && (
                        <tr>
                          <td className="p-3">Хирургическа намеса</td>
                          <td className="text-right p-3">{formData.surgicalBenefit.toFixed(0)} €</td>
                          <td className="text-right p-3">{(premiumBreakdown.coverages.surgical || 0).toFixed(2)}</td>
                        </tr>
                      )}
                      {formData.fracturesCoverage > 0 && (
                        <tr>
                          <td className="p-3">Фрактури и изгаряния</td>
                          <td className="text-right p-3">{formData.fracturesCoverage.toFixed(0)} €</td>
                          <td className="text-right p-3">{(premiumBreakdown.coverages.fractures || 0).toFixed(2)}</td>
                        </tr>
                      )}
                      {formData.telemedicine && (
                        <tr>
                          <td className="p-3">Телемедицина / Второ медицинско мнение</td>
                          <td className="text-right p-3">Включено</td>
                          <td className="text-right p-3">15.00</td>
                        </tr>
                      )}
                      {formData.premiumWaiver && (
                        <tr>
                          <td className="p-3">Отказ от премия</td>
                          <td className="text-right p-3">Включено</td>
                          <td className="text-right p-3">{(premiumBreakdown.coverages.premiumWaiver || 0).toFixed(2)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4 text-blue-600 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  ЦЕНА И НАЧИНИ НА ПЛАЩАНЕ
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3 bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Нетна сума за спестяване:</span>
                      <span className="font-semibold text-slate-900">{formData.annualSavings.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Покрития:</span>
                      <span className="font-semibold text-slate-900">{premiumBreakdown.totalCoverages.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Административна такса:</span>
                      <span className="font-semibold text-slate-900">15.00 €</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 p-5 rounded-xl border border-blue-300 shadow-md">
                    <div className="flex justify-between font-bold text-blue-900">
                      <span>Годишно плащане:</span>
                      <span className="text-xl">{premiumBreakdown.totalAnnual.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Полугодишно:</span>
                      <span className="font-semibold">{premiumBreakdown.semiAnnual.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Тримесечно:</span>
                      <span className="font-semibold">{premiumBreakdown.quarterly.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Месечно:</span>
                      <span className="font-semibold">{premiumBreakdown.monthly.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </div>

              {analysisId && (
                <Button 
                  onClick={handleSaveOffer} 
                  disabled={saving || warnings.length > 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base font-semibold"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {saving ? 'Записване...' : 'Запази офертата'}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projection Tab */}
        <TabsContent value="projection" className="space-y-6">
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-5">
              <CardTitle className="text-white text-xl font-bold">Проекция за развитието на клиентска сметка</CardTitle>
              <p className="text-purple-100 text-sm mt-1">Детайлна финансова симулация за {Math.min(80 - formData.age, 49)} години</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-96 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projection}>
                    <defs>
                      <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAccount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDeath" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" label={{ value: 'Година', position: 'insideBottom', offset: -5 }} stroke="#64748b" />
                    <YAxis label={{ value: '€', angle: -90, position: 'insideLeft' }} stroke="#64748b" />
                    <Tooltip 
                      formatter={(value) => `${Math.round(value).toLocaleString()} €`}
                      labelFormatter={(label) => `Година ${label}`}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="totalPremiumsPaid" stroke="#94a3b8" fill="url(#colorPaid)" name="Платени премии" strokeWidth={2} />
                    <Area type="monotone" dataKey="accountValue" stroke="#3b82f6" fill="url(#colorAccount)" name="Стойност на сметката" strokeWidth={3} />
                    <Area type="monotone" dataKey="deathBenefit" stroke="#10b981" fill="url(#colorDeath)" name="Обезщетение при смърт" strokeWidth={2} />
                    <Line type="monotone" dataKey="netSurrenderValue" stroke="#f59e0b" name="Нетна откупна стойност" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-slate-100 to-blue-100 sticky top-0">
                    <tr>
                      <th className="text-left p-3 font-semibold text-slate-700">Година</th>
                      <th className="text-right p-3 font-semibold text-slate-700">Възраст</th>
                      <th className="text-right p-3 font-semibold text-slate-700">Платени премии</th>
                      <th className="text-right p-3 font-semibold text-slate-700">Обезщетение при смърт</th>
                      <th className="text-right p-3 font-semibold text-slate-700">Стойност на сметката</th>
                      <th className="text-right p-3 font-semibold text-slate-700">Нетна откупна стойност</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projection.map((row) => (
                      <tr key={row.year} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                        <td className="p-3 font-medium">{row.year}</td>
                        <td className="text-right p-3">{row.age}</td>
                        <td className="text-right p-3 text-slate-600">{row.totalPremiumsPaid.toLocaleString()} €</td>
                        <td className="text-right p-3 text-green-600 font-medium">{row.deathBenefit.toLocaleString()} €</td>
                        <td className="text-right p-3 font-bold text-blue-600">{row.accountValue.toLocaleString()} €</td>
                        <td className="text-right p-3 text-amber-600 font-medium">{row.netSurrenderValue.toLocaleString()} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {analysisId && (
                <Button 
                  onClick={handleSaveOffer} 
                  disabled={saving || warnings.length > 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base font-semibold mt-6"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {saving ? 'Записване...' : 'Запази офертата'}
                </Button>
              )}

              <div className="mt-6 p-5 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                  <p>При изготвянето на тази проекция са калкулирани всички бонуси и разходи на база общите условия на спестовно-инвестиционната програма.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                  <p>Информацията и числата в тази проекция са базирани на допускания за бъдещ период. Те се предоставят с информационна цел и не представляват обещание или гаранция за бъдещи финансови резултати.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                  <p>Всички права и задължения на МетЛайф и на застрахованото лице ще бъдат определени в разпоредбите на конкретен застрахователен договор.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
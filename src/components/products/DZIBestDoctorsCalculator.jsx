import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Save, Heart, Globe, Shield, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Тарифи за индивидуални и семейни застраховки (EUR)
const INDIVIDUAL_FAMILY_TARIFFS = {
  '0-18': { annual: 121.60, semiannual: 60.80, quarterly: 30.40, monthly: 10.20 },
  '19-44': { annual: 246.20, semiannual: 123.10, quarterly: 61.60, monthly: 20.60 },
  '45-49': { annual: 350.90, semiannual: 175.50, quarterly: 87.80, monthly: 29.30 },
  '50-54': { annual: 403.60, semiannual: 201.80, quarterly: 100.90, monthly: 33.70 },
  '55-64': { annual: 507.50, semiannual: 253.80, quarterly: 126.90, monthly: 42.30 }
};

// Тарифи за индивидуални групови застраховки (EUR)
const GROUP_TARIFFS = {
  '0-18': { annual: 111.90, semiannual: 56.00, quarterly: 28.00, monthly: 9.40 },
  '19-44': { annual: 226.70, semiannual: 113.40, quarterly: 56.70, monthly: 18.90 },
  '45-49': { annual: 323.10, semiannual: 161.60, quarterly: 80.80, monthly: 27.00 },
  '50-54': { annual: 371.60, semiannual: 185.80, quarterly: 92.90, monthly: 31.00 },
  '55-64': { annual: 467.30, semiannual: 233.70, quarterly: 116.90, monthly: 39.00 }
};

export default function DZIBestDoctorsCalculator({ analysisId, clientId }) {
  const [inputs, setInputs] = useState({
    insuranceType: 'individual_family', // individual_family / group
    age: 35,
    paymentFrequency: 'annual', // annual / semiannual / quarterly / monthly
    familyMembersCount: 1 // for display purposes
  });

  const [result, setResult] = useState(null);

  const getAgeGroup = (age) => {
    if (age <= 18) return '0-18';
    if (age <= 44) return '19-44';
    if (age <= 49) return '45-49';
    if (age <= 54) return '50-54';
    return '55-64';
  };

  const calculate = () => {
    if (inputs.age > 64) {
      toast.error('Застраховката не покрива лица над 64 години');
      return;
    }

    const ageGroup = getAgeGroup(inputs.age);
    const tariffs = inputs.insuranceType === 'group' ? GROUP_TARIFFS : INDIVIDUAL_FAMILY_TARIFFS;
    const basePremium = tariffs[ageGroup][inputs.paymentFrequency];

    // Add 2% insurance tax
    const insuranceTax = basePremium * 0.02;
    const totalPremium = basePremium + insuranceTax;

    // Convert to BGN (using approximate rate)
    const bgnRate = 1.95583;
    const totalPremiumBGN = totalPremium * bgnRate;

    setResult({
      basePremiumEUR: basePremium.toFixed(2),
      insuranceTaxEUR: insuranceTax.toFixed(2),
      totalPremiumEUR: totalPremium.toFixed(2),
      totalPremiumBGN: totalPremiumBGN.toFixed(2),
      ageGroup: ageGroup,
      coverage: {
        annual: 1000000,
        lifetime: 2000000
      }
    });
  };

  const handleSaveOffer = async () => {
    if (!result) {
      toast.error('Моля първо изчислете премията');
      return;
    }

    if (!analysisId) {
      toast.error('Моля въведете Analysis ID');
      return;
    }

    const annualPremiumEUR = inputs.paymentFrequency === 'annual' 
      ? parseFloat(result.totalPremiumEUR)
      : inputs.paymentFrequency === 'semiannual'
        ? parseFloat(result.totalPremiumEUR) * 2
        : inputs.paymentFrequency === 'quarterly'
          ? parseFloat(result.totalPremiumEUR) * 4
          : parseFloat(result.totalPremiumEUR) * 12;

    const offerData = {
      analysis_id: analysisId,
      client_id: clientId || null,
      provider: 'ДЗИ',
      product_name: 'Лечение без граници (Бест Докторс)',
      product_type: 'health_insurance',
      beneficiary: 'client',
      beneficiary_name: 'Застрахован',
      beneficiary_age: inputs.age,
      monthly_premium: annualPremiumEUR / 12,
      annual_premium: annualPremiumEUR,
      coverage_amount: result.coverage.annual,
      offer_status: 'generated',
      ai_recommendation_reason: `Медицинска застраховка "Лечение без граници" за ${inputs.insuranceType === 'group' ? 'групово' : 'индивидуално/семейно'} покритие, възраст ${inputs.age} год. Покритие до ${result.coverage.annual.toLocaleString()} EUR/год и ${result.coverage.lifetime.toLocaleString()} EUR за целия живот. Включва второ лекарско мнение и лечение в чужбина при рак, кардиоваскуларни процедури, неврохирургия и трансплантации.`
    };

    try {
      await base44.entities.ProductOffer.create(offerData);
      toast.success('✓ Офертата е запазена успешно');
    } catch (error) {
      toast.error('Грешка при запазване: ' + error.message);
    }
  };

  const coverageModules = [
    { icon: '🎗️', title: 'Модул 1: Лечение на рак', desc: 'Злокачествени новообразувания' },
    { icon: '❤️', title: 'Модул 2: Кардиоваскуларни', desc: 'Байпас, смяна на клапа' },
    { icon: '🧠', title: 'Модул 3: Неврохирургия', desc: 'Вътречерепна и гръбначна хирургия' },
    { icon: '🫀', title: 'Модул 4: Трансплантации', desc: 'Органи и костен мозък' }
  ];

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="flex items-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/2485fdb3e_image.png" 
            alt="ДЗИ" 
            className="h-10 bg-white p-1 rounded"
          />
          <div>
            <CardTitle className="text-xl">Лечение без граници (Бест Докторс)</CardTitle>
            <p className="text-xs text-blue-100 mt-1">Медицинска застраховка с второ мнение и лечение в чужбина</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Тип застраховка</Label>
            <Select value={inputs.insuranceType} onValueChange={(v) => setInputs({...inputs, insuranceType: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual_family">Индивидуална / Семейна</SelectItem>
                <SelectItem value="group">Групова (10+ души)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              {inputs.insuranceType === 'group' ? 'За 10+ служители от работодател' : 'За физически лица и семейства'}
            </p>
          </div>

          <div>
            <Label>Възраст на застрахования</Label>
            <Input
              type="number"
              value={inputs.age}
              onChange={(e) => setInputs({...inputs, age: parseInt(e.target.value) || 0})}
              min="0"
              max="64"
            />
            <p className="text-xs text-slate-500 mt-1">От 0 до 64 години (покритието е до 85 години)</p>
          </div>

          <div className="md:col-span-2">
            <Label>Честота на плащане</Label>
            <Select value={inputs.paymentFrequency} onValueChange={(v) => setInputs({...inputs, paymentFrequency: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Годишно (най-изгодно)</SelectItem>
                <SelectItem value="semiannual">Шестмесечно</SelectItem>
                <SelectItem value="quarterly">Тримесечно</SelectItem>
                <SelectItem value="monthly">Месечно</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={calculate} className="flex-1 bg-purple-600 hover:bg-purple-700">
            <Calculator className="w-4 h-4 mr-2" />
            Изчисли премия
          </Button>
          {result && analysisId && (
            <Button onClick={handleSaveOffer} variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-50">
              <Save className="w-4 h-4 mr-2" />
              Запази оферта
            </Button>
          )}
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-slate-900">Изчислена премия</h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Базова премия:</span>
                  <span className="font-semibold">{result.basePremiumEUR} EUR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Застрахователен данък (2%):</span>
                  <span className="font-semibold">{result.insuranceTaxEUR} EUR</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold text-slate-900">Обща премия:</span>
                  <span className="font-bold text-purple-600">{result.totalPremiumEUR} EUR</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>В лева (ориентировъчно):</span>
                  <span>{result.totalPremiumBGN} лв</span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-white rounded-lg">
                <div className="flex items-start gap-2 mb-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Лимити на покритие:</p>
                    <ul className="text-xs text-slate-600 mt-1 space-y-1">
                      <li>• Годишен лимит: {result.coverage.annual.toLocaleString()} EUR</li>
                      <li>• Доживотен лимит: {result.coverage.lifetime.toLocaleString()} EUR</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Териториално покритие:</p>
                    <p className="text-xs text-slate-600 mt-1">Цял свят (без САЩ, Япония, Швейцария)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {coverageModules.map((module, idx) => (
                <div key={idx} className="bg-white border border-purple-100 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{module.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{module.title}</p>
                      <p className="text-xs text-slate-600">{module.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800 space-y-2">
                  <p className="font-semibold">Важна информация:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Отлагателен период: {inputs.insuranceType === 'group' ? '3 месеца' : '6 месеца'}</li>
                    <li>• Включва услуга за второ лекарско мнение от водещи световни специалисти</li>
                    <li>• Покрива медицински разходи, пътни разходи, настаняване, репатриране</li>
                    <li>• Дневно обезщетение: 100 EUR/ден (макс 60 дни)</li>
                    <li>• Разходи за медикаменти в България: до 50,000 EUR доживотно</li>
                    <li>• Не се покриват предишни заболявания</li>
                    <li>• Застраховката е валидна до навършване на 85 години</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-900 mb-2">✓ Покрити услуги и разходи:</p>
              <div className="grid md:grid-cols-2 gap-2 text-xs text-purple-800">
                <div>
                  <p className="font-semibold">Преди лечение:</p>
                  <ul className="ml-4 space-y-0.5">
                    <li>• Второ лекарско мнение</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">По време на лечение:</p>
                  <ul className="ml-4 space-y-0.5">
                    <li>• Медицински разходи</li>
                    <li>• Пътни разходи (икономична класа)</li>
                    <li>• Настаняване (3-4★ хотел)</li>
                    <li>• Репатриране</li>
                    <li>• Дневно обезщетение</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">След лечение:</p>
                  <ul className="ml-4 space-y-0.5">
                    <li>• Лекарства (до 180 дни)</li>
                    <li>• Последваща грижа (до 180 дни)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Покритие за донор:</p>
                  <ul className="ml-4 space-y-0.5">
                    <li>• Разходи за жив донор</li>
                    <li>• Пътни разходи донор</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
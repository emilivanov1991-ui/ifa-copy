import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, Save, Home, Shield, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function UniqaHomeCalculator({ analysisId, clientId }) {
  const [inputs, setInputs] = useState({
    propertyType: 'apartment', // apartment / house
    buildingSum: 50000, // BGN
    contentsSum: 20000, // BGN
    package: 'comfort', // basic / standard / comfort / prestige
    
    // Допълнителни покрития
    includeLiability: false, // ОГО
    liabilitySum: 50000,
    includeAccident: false, // Злополука
    accidentSum: 10000,
    includePowerSurge: false, // Токов удар
    includeTravel: false, // Пътуване
    includePet: false, // Домашен любимец
    
    // Отстъпки
    isNewPolicy: true,
    isRenewalNoClaims: false,
    payFullYear: true
  });

  const [result, setResult] = useState(null);

  const calculate = () => {
    // PLACEHOLDER - ЛИПСВАТ ТАРИФИ
    // Ориентировъчно изчисление за демонстрация
    
    const buildingRate = 0.002; // 0.2% от стойността
    const contentsRate = 0.004; // 0.4% от стойността
    
    let packageMultiplier = 1.0;
    if (inputs.package === 'standard') packageMultiplier = 1.3;
    else if (inputs.package === 'comfort') packageMultiplier = 1.6;
    else if (inputs.package === 'prestige') packageMultiplier = 2.0;
    
    let basePremium = (inputs.buildingSum * buildingRate + inputs.contentsSum * contentsRate) * packageMultiplier;
    
    const breakdown = [
      { name: `Сграда (${inputs.buildingSum.toLocaleString()} лв)`, premium: inputs.buildingSum * buildingRate * packageMultiplier },
      { name: `Движимо имущество (${inputs.contentsSum.toLocaleString()} лв)`, premium: inputs.contentsSum * contentsRate * packageMultiplier }
    ];
    
    // Допълнителни покрития
    if (inputs.includeLiability) {
      const liabilityPremium = inputs.liabilitySum * 0.0005;
      basePremium += liabilityPremium;
      breakdown.push({ name: `ОГО (${inputs.liabilitySum.toLocaleString()} лв)`, premium: liabilityPremium });
    }
    
    if (inputs.includeAccident) {
      const accidentPremium = inputs.accidentSum * 0.001;
      basePremium += accidentPremium;
      breakdown.push({ name: `Злополука (${inputs.accidentSum.toLocaleString()} лв)`, premium: accidentPremium });
    }
    
    if (inputs.includePowerSurge) {
      basePremium += 30;
      breakdown.push({ name: 'Токов удар', premium: 30 });
    }
    
    if (inputs.includeTravel) {
      basePremium += 40;
      breakdown.push({ name: 'Пътуване', premium: 40 });
    }
    
    if (inputs.includePet) {
      basePremium += 50;
      breakdown.push({ name: 'Домашен любимец', premium: 50 });
    }
    
    // Отстъпки
    let totalDiscount = 0;
    const discounts = [];
    
    if (inputs.isNewPolicy) {
      totalDiscount += 0.20;
      discounts.push('Нов бизнес: 20%');
    }
    
    if (inputs.isRenewalNoClaims) {
      totalDiscount += 0.25;
      discounts.push('Подновяване без щети: 25%');
    }
    
    if (inputs.payFullYear) {
      totalDiscount += 0.05;
      discounts.push('Еднократно плащане: 5%');
    }
    
    // Максимална отстъпка 30%
    if (totalDiscount > 0.30) totalDiscount = 0.30;
    
    const discountAmount = basePremium * totalDiscount;
    const premiumAfterDiscount = basePremium - discountAmount;
    
    setResult({
      basePremium: basePremium.toFixed(2),
      breakdown: breakdown,
      totalDiscount: (totalDiscount * 100).toFixed(0),
      discountAmount: discountAmount.toFixed(2),
      discounts: discounts,
      totalPremium: premiumAfterDiscount.toFixed(2),
      isPlaceholder: true
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

    const selectedCoverages = [];
    if (inputs.includeLiability) selectedCoverages.push('ОГО');
    if (inputs.includeAccident) selectedCoverages.push('Злополука');
    if (inputs.includePowerSurge) selectedCoverages.push('Токов удар');
    if (inputs.includeTravel) selectedCoverages.push('Пътуване');
    if (inputs.includePet) selectedCoverages.push('Домашен любимец');

    const offerData = {
      analysis_id: analysisId,
      client_id: clientId || null,
      provider: 'УНИКА',
      product_name: 'У дома и щастлив',
      product_type: 'home_insurance',
      beneficiary: 'client',
      beneficiary_name: 'Собственик',
      monthly_premium: parseFloat(result.totalPremium) / 12,
      annual_premium: parseFloat(result.totalPremium),
      coverage_amount: inputs.buildingSum + inputs.contentsSum,
      offer_status: 'generated',
      ai_recommendation_reason: `Имуществена застраховка УНИКА "У дома и щастлив", пакет "${inputs.package}", ${inputs.propertyType === 'apartment' ? 'Апартамент' : 'Къща'}. Сграда: ${inputs.buildingSum.toLocaleString()} лв, Обзавеждане: ${inputs.contentsSum.toLocaleString()} лв. ${selectedCoverages.length > 0 ? 'Допълнителни покрития: ' + selectedCoverages.join(', ') + '.' : ''} Включва "Домашен асистанс" 24/7. ${result.discounts.length > 0 ? 'Отстъпки: ' + result.discounts.join(', ') : ''}`
    };

    try {
      await base44.entities.ProductOffer.create(offerData);
      toast.success('✓ Офертата е запазена успешно');
    } catch (error) {
      toast.error('Грешка при запазване: ' + error.message);
    }
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="flex items-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/c923181b0_image.png" 
            alt="УНИКА" 
            className="h-10 bg-white p-1 rounded"
          />
          <div>
            <CardTitle className="text-xl">УНИКА - У дома и щастлив</CardTitle>
            <p className="text-xs text-orange-100 mt-1">Имуществена застраховка с Домашен асистанс</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">⚠️ Липсва тарифна информация</p>
              <p>Моля предоставете официалните тарифи за премия на квадратен метър или тарифи по стойност на имуществото за точно изчисление. Текущите цифри са ориентировъчни.</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Тип имот</Label>
            <Select value={inputs.propertyType} onValueChange={(v) => setInputs({...inputs, propertyType: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Апартамент</SelectItem>
                <SelectItem value="house">Къща</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Пакет</Label>
            <Select value={inputs.package} onValueChange={(v) => setInputs({...inputs, package: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Основен</SelectItem>
                <SelectItem value="standard">Стандарт - Защита за дома</SelectItem>
                <SelectItem value="comfort">Комфорт - Спокойствие за семейството</SelectItem>
                <SelectItem value="prestige">Престиж - Сигурност и защита</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Застрахователна сума - Сграда (BGN)</Label>
            <Input
              type="number"
              value={inputs.buildingSum}
              onChange={(e) => setInputs({...inputs, buildingSum: parseInt(e.target.value) || 0})}
              min="0"
              step="1000"
            />
          </div>

          <div>
            <Label>Застрахователна сума - Обзавеждане (BGN)</Label>
            <Input
              type="number"
              value={inputs.contentsSum}
              onChange={(e) => setInputs({...inputs, contentsSum: parseInt(e.target.value) || 0})}
              min="0"
              step="1000"
            />
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <h4 className="font-semibold text-slate-900">Допълнителни покрития</h4>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                checked={inputs.includeLiability}
                onCheckedChange={(checked) => setInputs({...inputs, includeLiability: checked})}
                id="liability"
              />
              <div className="flex-1">
                <label htmlFor="liability" className="text-sm font-medium cursor-pointer">
                  Обща гражданска отговорност (ОГО)
                </label>
                {inputs.includeLiability && (
                  <Input
                    type="number"
                    value={inputs.liabilitySum}
                    onChange={(e) => setInputs({...inputs, liabilitySum: parseInt(e.target.value) || 0})}
                    min="10000"
                    max="500000"
                    step="10000"
                    className="mt-2"
                    placeholder="Застр. сума BGN"
                  />
                )}
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                checked={inputs.includeAccident}
                onCheckedChange={(checked) => setInputs({...inputs, includeAccident: checked})}
                id="accident"
              />
              <div className="flex-1">
                <label htmlFor="accident" className="text-sm font-medium cursor-pointer">
                  Злополука
                </label>
                {inputs.includeAccident && (
                  <Input
                    type="number"
                    value={inputs.accidentSum}
                    onChange={(e) => setInputs({...inputs, accidentSum: parseInt(e.target.value) || 0})}
                    min="5000"
                    max="100000"
                    step="5000"
                    className="mt-2"
                    placeholder="Застр. сума BGN"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={inputs.includePowerSurge}
                onCheckedChange={(checked) => setInputs({...inputs, includePowerSurge: checked})}
                id="power"
              />
              <label htmlFor="power" className="text-sm font-medium cursor-pointer">
                Късо съединение / Токов удар
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={inputs.includeTravel}
                onCheckedChange={(checked) => setInputs({...inputs, includeTravel: checked})}
                id="travel"
              />
              <label htmlFor="travel" className="text-sm font-medium cursor-pointer">
                Пътуване
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={inputs.includePet}
                onCheckedChange={(checked) => setInputs({...inputs, includePet: checked})}
                id="pet"
              />
              <label htmlFor="pet" className="text-sm font-medium cursor-pointer">
                Домашен любимец
              </label>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <h4 className="font-semibold text-slate-900">Отстъпки</h4>
          
          <div className="space-y-3 bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={inputs.isNewPolicy}
                onCheckedChange={(checked) => setInputs({...inputs, isNewPolicy: checked, isRenewalNoClaims: false})}
                id="new"
              />
              <label htmlFor="new" className="text-sm font-medium cursor-pointer text-green-800">
                Нова полица (отстъпка до 20%)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={inputs.isRenewalNoClaims}
                onCheckedChange={(checked) => setInputs({...inputs, isRenewalNoClaims: checked, isNewPolicy: false})}
                id="renewal"
              />
              <label htmlFor="renewal" className="text-sm font-medium cursor-pointer text-green-800">
                Подновяване без щети (отстъпка до 25%)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={inputs.payFullYear}
                onCheckedChange={(checked) => setInputs({...inputs, payFullYear: checked})}
                id="full-year"
              />
              <label htmlFor="full-year" className="text-sm font-medium cursor-pointer text-green-800">
                Еднократно плащане (отстъпка 5%)
              </label>
            </div>

            <p className="text-xs text-green-700 mt-2">
              💡 Максимална комбинирана отстъпка: до 30%
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={calculate} className="flex-1 bg-orange-600 hover:bg-orange-700">
            <Calculator className="w-4 h-4 mr-2" />
            Изчисли премия
          </Button>
          {result && analysisId && !result.isPlaceholder && (
            <Button onClick={handleSaveOffer} variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-50">
              <Save className="w-4 h-4 mr-2" />
              Запази оферта
            </Button>
          )}
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-slate-900">Ориентировъчна премия</h4>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                {result.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span>{item.name}:</span>
                    <span className="font-medium">{item.premium.toFixed(2)} лв</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Базова премия:</span>
                  <span className="font-semibold">{result.basePremium} лв</span>
                </div>
                
                {parseFloat(result.totalDiscount) > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Обща отстъпка ({result.totalDiscount}%):</span>
                      <span className="font-semibold">-{result.discountAmount} лв</span>
                    </div>
                    <div className="text-xs text-green-700 ml-4">
                      {result.discounts.map((d, idx) => (
                        <div key={idx}>• {d}</div>
                      ))}
                    </div>
                  </>
                )}

                <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold text-slate-900">Годишна премия:</span>
                  <span className="font-bold text-orange-600">{result.totalPremium} лв</span>
                </div>
                {!inputs.payFullYear && (
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Месечна вноска:</span>
                    <span>{(parseFloat(result.totalPremium) / 12).toFixed(2)} лв</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800 space-y-2">
                  <p className="font-semibold">✓ Включено в пакет "{inputs.package}":</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Пожар, мълния, експлозия</li>
                    <li>• Буря, градушка, пороен дъжд</li>
                    <li>• Наводнение, земетресение</li>
                    <li>• ВиК авария, счупване на стъкла</li>
                    <li>• Кражба чрез взлом, грабеж</li>
                    <li>• Злоумишлени действия, вандализъм</li>
                    <li>• <strong>Домашен асистанс 24/7</strong> (лимит 140 EUR/събитие, до 3 пъти/год)</li>
                    {inputs.package === 'comfort' || inputs.package === 'prestige' ? (
                      <>
                        <li>• Разходи за алтернативно жилище</li>
                        <li>• Развала на храна при авария</li>
                      </>
                    ) : null}
                    {inputs.package === 'prestige' && (
                      <>
                        <li>• Счупване на санитарен фаянс</li>
                        <li>• Счупване на керамични плотове</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="font-semibold text-slate-900 mb-2">💡 Предимства:</p>
                <ul className="text-slate-600 space-y-1 ml-3">
                  <li>• Без опис/оценка при сключване</li>
                  <li>• Подобрения до 10% покрити без доплащане</li>
                  <li>• Ново имущество до 3% автоматично покрито</li>
                  <li>• Разсрочено плащане без оскъпяване</li>
                  <li>• 24/7 Домашен асистанс при авария</li>
                </ul>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="font-semibold text-slate-900 mb-2">✗ Не се покрива:</p>
                <ul className="text-slate-600 space-y-1 ml-3">
                  <li>• Умишлени действия</li>
                  <li>• Нормално износване</li>
                  <li>• Сгради в строеж/ремонт</li>
                  <li>• Военни действия, тероризъм</li>
                  <li>• Подпочвени води</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
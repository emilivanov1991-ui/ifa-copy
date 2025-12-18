import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, Save, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const DZI_GO_TARIFFS = {
  region1: { // София
    individual: {
      age_under_25: { up_to_1400: 618.02, up_to_1600: 648.47, up_to_1800: 696.76, up_to_2000: 731.83, up_to_2500: 840.93, over_2500: 986.00 },
      age_25_35: { up_to_1400: 329.31, up_to_1600: 339.46, up_to_1800: 419.64, up_to_2000: 456.97, up_to_2500: 486.20, over_2500: 613.13 },
      age_35_40: { up_to_1400: 284.20, up_to_1600: 285.33, up_to_1800: 299.74, up_to_2000: 331.42, up_to_2500: 377.40, over_2500: 435.20 },
      age_40_60_70: { up_to_1400: 283.07, up_to_1600: 284.20, up_to_1800: 298.61, up_to_2000: 308.79, up_to_2500: 350.77, over_2500: 385.33 },
      age_60_70: { up_to_1400: 278.56, up_to_1600: 279.69, up_to_1800: 288.43, up_to_2000: 302.01, up_to_2500: 350.20, over_2500: 384.20 }
    },
    company: {
      up_to_1400: 367.14, up_to_1600: 402.86, up_to_1800: 424.29, up_to_2000: 467.14, up_to_2500: 534.29, over_2500: 600.00
    }
  },
  region2: { // Варна
    individual: {
      age_under_25: { up_to_1400: 578.55, up_to_1600: 604.49, up_to_1800: 652.65, up_to_2000: 684.32, up_to_2500: 791.07, over_2500: 927.07 },
      age_25_35: { up_to_1400: 319.16, up_to_1600: 321.42, up_to_1800: 367.61, up_to_2000: 402.68, up_to_2500: 460.13, over_2500: 583.67 },
      age_35_40: { up_to_1400: 267.28, up_to_1600: 268.41, up_to_1800: 279.38, up_to_2000: 311.06, up_to_2500: 347.93, over_2500: 384.20 },
      age_40_60_70: { up_to_1400: 266.16, up_to_1600: 267.28, up_to_1800: 269.20, up_to_2000: 270.34, up_to_2500: 319.60, over_2500: 379.67 },
      age_60_70: { up_to_1400: 259.39, up_to_1600: 260.52, up_to_1800: 262.42, up_to_2000: 265.81, up_to_2500: 318.47, over_2500: 378.53 }
    },
    company: {
      up_to_1400: 341.43, up_to_1600: 348.57, up_to_1800: 360.00, up_to_2000: 435.71, up_to_2500: 485.71, over_2500: 560.00
    }
  },
  region3: { // Пловдив
    individual: {
      age_under_25: { up_to_1400: 528.93, up_to_1600: 580.81, up_to_1800: 605.62, up_to_2000: 633.81, up_to_2500: 698.13, over_2500: 800.13 },
      age_25_35: { up_to_1400: 310.14, up_to_1600: 319.16, up_to_1800: 322.54, up_to_2000: 350.74, up_to_2500: 421.60, over_2500: 541.73 },
      age_35_40: { up_to_1400: 269.54, up_to_1600: 270.67, up_to_1800: 314.65, up_to_2000: 325.93, up_to_2500: 352.47, over_2500: 446.53 },
      age_40_60_70: { up_to_1400: 267.28, up_to_1600: 269.54, up_to_1800: 299.99, up_to_2000: 309.01, up_to_2500: 340.00, over_2500: 404.60 },
      age_60_70: { up_to_1400: 266.16, up_to_1600: 268.41, up_to_1800: 298.86, up_to_2000: 307.88, up_to_2500: 342.27, over_2500: 403.47 }
    },
    company: {
      up_to_1400: 318.67, up_to_1600: 372.00, up_to_1800: 386.67, up_to_2000: 410.67, up_to_2500: 441.33, over_2500: 522.67
    }
  },
  region4: { // Бургас
    individual: {
      age_under_25: { up_to_1400: 514.27, up_to_1600: 566.14, up_to_1800: 589.83, up_to_2000: 618.02, up_to_2500: 698.13, over_2500: 800.13 },
      age_25_35: { up_to_1400: 309.01, up_to_1600: 316.91, up_to_1800: 320.29, up_to_2000: 349.61, up_to_2500: 412.53, over_2500: 539.47 },
      age_35_40: { up_to_1400: 248.11, up_to_1600: 249.24, up_to_1800: 265.03, up_to_2000: 287.58, up_to_2500: 320.73, over_2500: 384.20 },
      age_40_60_70: { up_to_1400: 246.98, up_to_1600: 248.11, up_to_1800: 250.37, up_to_2000: 267.28, up_to_2500: 291.27, over_2500: 381.93 },
      age_60_70: { up_to_1400: 243.60, up_to_1600: 244.73, up_to_1800: 245.86, up_to_2000: 261.64, up_to_2500: 290.13, over_2500: 379.67 }
    },
    company: {
      up_to_1400: 297.33, up_to_1600: 298.67, up_to_1800: 313.33, up_to_2000: 362.67, up_to_2500: 384.00, over_2500: 462.67
    }
  },
  region5: { // Добрич, Благоевград, Перник, Кюстендил, Русе, Ловеч, В.Търново, Габрово
    individual: {
      age_under_25: { up_to_1400: 528.93, up_to_1600: 580.81, up_to_1800: 605.62, up_to_2000: 633.81, up_to_2500: 698.13, over_2500: 800.13 },
      age_25_35: { up_to_1400: 310.14, up_to_1600: 319.16, up_to_1800: 322.54, up_to_2000: 350.74, up_to_2500: 421.60, over_2500: 541.73 },
      age_35_40: { up_to_1400: 249.24, up_to_1600: 250.37, up_to_1800: 301.12, up_to_2000: 334.95, up_to_2500: 355.87, over_2500: 387.60 },
      age_40_60_70: { up_to_1400: 246.98, up_to_1600: 249.24, up_to_1800: 295.48, up_to_2000: 316.91, up_to_2500: 342.27, over_2500: 377.40 },
      age_60_70: { up_to_1400: 245.86, up_to_1600: 248.11, up_to_1800: 293.22, up_to_2000: 315.78, up_to_2500: 333.20, over_2500: 376.27 }
    },
    company: {
      up_to_1400: 276.25, up_to_1600: 348.75, up_to_1800: 373.75, up_to_2000: 398.75, up_to_2500: 431.25, over_2500: 502.50
    }
  },
  region6: { // Разград, Ст.Загора, Ямбол, Казанлък, Димитровград + области
    individual: {
      age_under_25: { up_to_1400: 514.27, up_to_1600: 566.14, up_to_1800: 589.83, up_to_2000: 619.15, up_to_2500: 682.31, over_2500: 850.34 },
      age_25_35: { up_to_1400: 306.76, up_to_1600: 314.65, up_to_1800: 318.03, up_to_2000: 347.36, up_to_2500: 401.49, over_2500: 533.44 },
      age_35_40: { up_to_1400: 249.24, up_to_1600: 250.37, up_to_1800: 281.94, up_to_2000: 286.46, up_to_2500: 315.78, over_2500: 362.02 },
      age_40_60_70: { up_to_1400: 246.98, up_to_1600: 249.24, up_to_1800: 250.37, up_to_2000: 285.33, up_to_2500: 290.40, over_2500: 360.89 },
      age_60_70: { up_to_1400: 245.86, up_to_1600: 248.11, up_to_1800: 249.24, up_to_2000: 284.20, up_to_2500: 289.84, over_2500: 359.76 }
    },
    company: {
      up_to_1400: 294.67, up_to_1600: 342.67, up_to_1800: 362.67, up_to_2000: 396.00, up_to_2500: 429.33, over_2500: 509.33
    }
  },
  region7: { // Враца, Плевен, София-област, Смолян, Монтана, Търговище, Кърджали + области
    individual: {
      age_under_25: { up_to_1400: 514.27, up_to_1600: 566.14, up_to_1800: 589.83, up_to_2000: 618.02, up_to_2500: 694.71, over_2500: 796.21 },
      age_25_35: { up_to_1400: 292.09, up_to_1600: 295.48, up_to_1800: 302.24, up_to_2000: 343.97, up_to_2500: 412.77, over_2500: 537.95 },
      age_35_40: { up_to_1400: 248.11, up_to_1600: 249.24, up_to_1800: 251.49, up_to_2000: 267.28, up_to_2500: 304.50, over_2500: 374.42 },
      age_40_60_70: { up_to_1400: 246.98, up_to_1600: 248.11, up_to_1800: 250.37, up_to_2000: 267.28, up_to_2500: 289.84, over_2500: 373.29 },
      age_60_70: { up_to_1400: 243.60, up_to_1600: 244.73, up_to_1800: 245.86, up_to_2000: 261.64, up_to_2500: 288.71, over_2500: 363.14 }
    },
    company: {
      up_to_1400: 278.75, up_to_1600: 280.00, up_to_1800: 293.75, up_to_2000: 315.00, up_to_2500: 358.75, over_2500: 432.50
    }
  }
};

export default function DZIGOCalculator({ analysisId, clientId }) {
  const [inputs, setInputs] = useState({
    registrationNumber: '',
    ownerType: 'individual', // individual / company
    ownerAge: 35,
    engineSize: 'up_to_1400',
    region: 'region1',
    vehicleAge: 5,
    hasKasko: false,
    paymentType: 'single', // single / 2_installments / 4_installments
    addRoadAssistance: true,
    roadAssistancePackage: 'premium', // premium / vip / abroad
    addAccidentInsurance: false,
    accidentCoveragePerPerson: 1000,
    seatsCount: 1
  });

  const [result, setResult] = useState(null);

  const getBasePremium = () => {
    const region = DZI_GO_TARIFFS[inputs.region];
    if (!region) return 0;

    if (inputs.ownerType === 'company') {
      return region.company[inputs.engineSize] || 0;
    }

    // Individual owner - age groups
    let ageGroup = 'age_40_60_70';
    if (inputs.ownerAge <= 25) ageGroup = 'age_under_25';
    else if (inputs.ownerAge <= 35) ageGroup = 'age_25_35';
    else if (inputs.ownerAge <= 40) ageGroup = 'age_35_40';
    else if (inputs.ownerAge <= 70 && inputs.ownerAge > 60) ageGroup = 'age_60_70';

    return region.individual[ageGroup]?.[inputs.engineSize] || 0;
  };

  const calculate = () => {
    let premium = getBasePremium();

    // Apply discounts
    let discount = 0;
    if (inputs.hasKasko) {
      discount = inputs.ownerType === 'company' ? 0.25 : 0.10;
    } else if (inputs.vehicleAge > 15) {
      discount = inputs.ownerType === 'company' ? 0.30 : 0.10;
    } else if (inputs.vehicleAge > 20) {
      discount = 0.10;
    }

    premium = premium * (1 - discount);

    // Payment type multiplier
    let installmentMultiplier = 1.0;
    if (inputs.paymentType === '2_installments') installmentMultiplier = 1.03;
    if (inputs.paymentType === '4_installments') installmentMultiplier = 1.046;

    premium = premium * installmentMultiplier;

    // Add 2% tax
    const dzp = premium * 0.02;
    
    // Road assistance
    let roadAssistancePremium = 0;
    if (inputs.addRoadAssistance) {
      if (inputs.roadAssistancePackage === 'premium') roadAssistancePremium = 25;
      else if (inputs.roadAssistancePackage === 'vip') roadAssistancePremium = 80;
      else if (inputs.roadAssistancePackage === 'abroad') roadAssistancePremium = 420;
    }

    // Accident insurance
    let accidentPremium = 0;
    if (inputs.addAccidentInsurance) {
      accidentPremium = (inputs.accidentCoveragePerPerson / 1000) * inputs.seatsCount;
    }

    const gfOf = 12; // ГФ + ОФ
    const totalPremium = premium + dzp + roadAssistancePremium + accidentPremium + gfOf;

    setResult({
      basePremium: premium.toFixed(2),
      dzp: dzp.toFixed(2),
      roadAssistance: roadAssistancePremium.toFixed(2),
      accidentInsurance: accidentPremium.toFixed(2),
      gfOf: gfOf.toFixed(2),
      totalPremium: totalPremium.toFixed(2),
      discount: (discount * 100).toFixed(0)
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

    const offerData = {
      analysis_id: analysisId,
      client_id: clientId || null,
      provider: 'ДЗИ',
      product_name: 'Гражданска отговорност',
      product_type: 'car_insurance',
      beneficiary: 'client',
      beneficiary_name: 'Собственик на МПС',
      monthly_premium: parseFloat(result.totalPremium) / 12,
      annual_premium: parseFloat(result.totalPremium),
      offer_status: 'generated',
      ai_recommendation_reason: `ГО застраховка за регион ${inputs.region}, ${inputs.ownerType === 'company' ? 'юридическо лице' : 'физическо лице на ' + inputs.ownerAge + ' години'}, двигател ${inputs.engineSize.replace('_', ' ')}, МПС на ${inputs.vehicleAge} години${inputs.hasKasko ? ' с валидно Каско' : ''}. ${inputs.addRoadAssistance ? 'Включена Помощ на пътя (' + inputs.roadAssistancePackage + ').' : ''} ${inputs.addAccidentInsurance ? `Включена Злополука (${inputs.accidentCoveragePerPerson} лв/място x ${inputs.seatsCount} места).` : ''}`
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
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/2485fdb3e_image.png" 
            alt="ДЗИ" 
            className="h-10 bg-white p-1 rounded"
          />
          <div>
            <CardTitle className="text-xl">Гражданска отговорност - ДЗИ</CardTitle>
            <p className="text-xs text-blue-100 mt-1">Задължителна застраховка за автомобили</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Регистрационен номер</Label>
            <Input
              value={inputs.registrationNumber}
              onChange={(e) => setInputs({...inputs, registrationNumber: e.target.value.toUpperCase()})}
              placeholder="СА 1234 АВ"
              className="uppercase"
            />
            <p className="text-xs text-slate-500 mt-1">По номера се определя регионът автоматично</p>
          </div>

          <div>
            <Label>Регион</Label>
            <Select value={inputs.region} onValueChange={(v) => setInputs({...inputs, region: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="region1">Регион 1 - София</SelectItem>
                <SelectItem value="region2">Регион 2 - Варна</SelectItem>
                <SelectItem value="region3">Регион 3 - Пловдив</SelectItem>
                <SelectItem value="region4">Регион 4 - Бургас</SelectItem>
                <SelectItem value="region5">Регион 5 - Добрич, Благоевград, Перник, Кюстендил, Русе, Ловеч, В.Търново, Габрово</SelectItem>
                <SelectItem value="region6">Регион 6 - Разград, Ст.Загора, Ямбол, Казанлък, Димитровград + области</SelectItem>
                <SelectItem value="region7">Регион 7 - Враца, Плевен, София-обл, Смолян, Монтана, Търговище, Кърджали + области</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Тип собственик</Label>
            <Select value={inputs.ownerType} onValueChange={(v) => setInputs({...inputs, ownerType: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Физическо лице</SelectItem>
                <SelectItem value="company">Юридическо лице / ЕТ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {inputs.ownerType === 'individual' && (
            <div>
              <Label>Възраст на собственика</Label>
              <Input
                type="number"
                value={inputs.ownerAge}
                onChange={(e) => setInputs({...inputs, ownerAge: parseInt(e.target.value) || 0})}
                min="18"
                max="99"
              />
            </div>
          )}

          <div>
            <Label>Обем на двигателя</Label>
            <Select value={inputs.engineSize} onValueChange={(v) => setInputs({...inputs, engineSize: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="up_to_1400">До 1400 куб.см</SelectItem>
                <SelectItem value="up_to_1600">1401-1600 куб.см</SelectItem>
                <SelectItem value="up_to_1800">1601-1800 куб.см</SelectItem>
                <SelectItem value="up_to_2000">1801-2000 куб.см</SelectItem>
                <SelectItem value="up_to_2500">2001-2500 куб.см</SelectItem>
                <SelectItem value="over_2500">Над 2500 куб.см</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Възраст на МПС (години)</Label>
            <Input
              type="number"
              value={inputs.vehicleAge}
              onChange={(e) => setInputs({...inputs, vehicleAge: parseInt(e.target.value) || 0})}
              min="0"
              max="50"
            />
            <p className="text-xs text-slate-500 mt-1">Над 15г и над 20г има отстъпки</p>
          </div>

          <div>
            <Label>Начин на плащане</Label>
            <Select value={inputs.paymentType} onValueChange={(v) => setInputs({...inputs, paymentType: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Еднократно</SelectItem>
                <SelectItem value="2_installments">2 вноски</SelectItem>
                <SelectItem value="4_installments">4 вноски</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              checked={inputs.hasKasko}
              onCheckedChange={(checked) => setInputs({...inputs, hasKasko: checked})}
              id="kasko"
            />
            <label htmlFor="kasko" className="text-sm font-medium cursor-pointer">
              Има валидно Каско (отстъпка {inputs.ownerType === 'company' ? '25%' : '10%'})
            </label>
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <h4 className="font-semibold text-slate-900">Допълнителни покрития</h4>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                checked={inputs.addRoadAssistance}
                onCheckedChange={(checked) => setInputs({...inputs, addRoadAssistance: checked})}
                id="road-assist"
              />
              <div className="flex-1">
                <label htmlFor="road-assist" className="text-sm font-medium cursor-pointer">
                  Помощ на пътя
                </label>
                {inputs.addRoadAssistance && (
                  <Select 
                    value={inputs.roadAssistancePackage} 
                    onValueChange={(v) => setInputs({...inputs, roadAssistancePackage: v})}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">Премиум - 25 лв/год</SelectItem>
                      <SelectItem value="vip">ВИП - 80 лв/год</SelectItem>
                      <SelectItem value="abroad">Чужбина - 420 лв/год</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                checked={inputs.addAccidentInsurance}
                onCheckedChange={(checked) => setInputs({...inputs, addAccidentInsurance: checked})}
                id="accident"
              />
              <div className="flex-1">
                <label htmlFor="accident" className="text-sm font-medium cursor-pointer">
                  Злополука на лицата в МПС
                </label>
                {inputs.addAccidentInsurance && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <Label className="text-xs">Покритие/място (лв)</Label>
                      <Select 
                        value={inputs.accidentCoveragePerPerson.toString()} 
                        onValueChange={(v) => setInputs({...inputs, accidentCoveragePerPerson: parseInt(v)})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000">1,000 лв</SelectItem>
                          <SelectItem value="3000">3,000 лв</SelectItem>
                          <SelectItem value="5000">5,000 лв</SelectItem>
                          <SelectItem value="10000">10,000 лв</SelectItem>
                          <SelectItem value="20000">20,000 лв</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Брой места</Label>
                      <Input
                        type="number"
                        value={inputs.seatsCount}
                        onChange={(e) => setInputs({...inputs, seatsCount: parseInt(e.target.value) || 1})}
                        min="1"
                        max="9"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={calculate} className="flex-1 bg-blue-600 hover:bg-blue-700">
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
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-slate-900">Резултат от изчислението</h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Базова премия ГО:</span>
                <span className="font-semibold">{result.basePremium} лв</span>
              </div>
              {result.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Отстъпка:</span>
                  <span className="font-semibold">-{result.discount}%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">ДЗП (2%):</span>
                <span className="font-semibold">{result.dzp} лв</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">ГФ + ОФ:</span>
                <span className="font-semibold">{result.gfOf} лв</span>
              </div>
              {parseFloat(result.roadAssistance) > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>Помощ на пътя ({inputs.roadAssistancePackage}):</span>
                  <span className="font-semibold">{result.roadAssistance} лв</span>
                </div>
              )}
              {parseFloat(result.accidentInsurance) > 0 && (
                <div className="flex justify-between text-purple-600">
                  <span>Злополука ({inputs.seatsCount} места x {inputs.accidentCoveragePerPerson} лв):</span>
                  <span className="font-semibold">{result.accidentInsurance} лв</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                <span className="font-bold text-slate-900">Обща годишна премия:</span>
                <span className="font-bold text-blue-600">{result.totalPremium} лв</span>
              </div>
              {inputs.paymentType !== 'single' && (
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Вноска ({inputs.paymentType === '2_installments' ? '2 вноски' : '4 вноски'}):</span>
                  <span>{(parseFloat(result.totalPremium) / (inputs.paymentType === '2_installments' ? 2 : 4)).toFixed(2)} лв</span>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-white rounded-lg text-xs text-slate-600">
              <strong>Лимити на покритие:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Телесни увреждания/смърт: 10,420,000 лв</li>
                <li>• Имуществени вреди: 2,100,000 лв</li>
                <li>• Безплатен сертификат "Зелена карта"</li>
                <li>• Покритие: България + ЕС + Зелена карта</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
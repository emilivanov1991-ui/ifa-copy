import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import BulgarianDateInput from '@/components/ui/BulgarianDateInput';
import { Car, Shield, CheckCircle2, Phone, Info } from 'lucide-react';

// Тарифни коефициенти по възраст на МПС и стойност (Пълно каско)
const CASCO_RATES = {
  light: {
    '0-1': { 50000: 4.50, over50000: 4.30 },
    '1-3': { 50000: 5.40, over50000: 5.20 },
    '3-5': { 20000: 6.30, 50000: 6.00, over50000: 5.80 },
    '5-8': { 15000: 6.90, 20000: 6.50, 50000: 6.20, over50000: 6.00 },
    'over8': { 5000: 9.10, 10000: 8.30, 15000: 7.70, over15000: 6.40 }
  }
};

const MIN_ANNUAL_PREMIUM = 260;

function getAgeGroup(year) {
  const age = new Date().getFullYear() - year;
  if (age <= 1) return '0-1';
  if (age <= 3) return '1-3';
  if (age <= 5) return '3-5';
  if (age <= 8) return '5-8';
  return 'over8';
}

function getRate(year, valueBGN) {
  const ageGroup = getAgeGroup(year);
  const rates = CASCO_RATES.light[ageGroup];
  if (!rates) return 5.00;
  const thresholds = Object.keys(rates).filter(k => !k.startsWith('over')).map(Number).sort((a, b) => a - b);
  for (const threshold of thresholds) {
    if (valueBGN <= threshold) return rates[threshold];
  }
  if (rates.over50000) return rates.over50000;
  if (rates.over15000) return rates.over15000;
  return 5.00;
}

export function calculateDZICascoOffer(carData) {
  const { brand, model, year, valueEUR, valueBGN, hasCasco = false, cascoExpiry = null } = carData;
  const insuranceValueBGN = valueBGN || (valueEUR * 1.956);
  const insuranceValueEUR = valueEUR || (valueBGN / 1.956);

  if (insuranceValueEUR < 4000) {
    return { eligible: false, reason: 'Стойността на автомобила е под 4000 EUR — не се препоръчва Каско' };
  }

  const ratePercent = getRate(year, insuranceValueBGN);
  const ageGroup = getAgeGroup(year);
  let basePremium = Math.max(insuranceValueBGN * (ratePercent / 100), MIN_ANNUAL_PREMIUM);
  const roadsidePremium = 20;
  const totalAnnualPremium = basePremium + roadsidePremium;
  const monthlyPremium = totalAnnualPremium / 12;

  let startDate = new Date();
  let isFuture = false;
  if (hasCasco && cascoExpiry) {
    const parts = cascoExpiry.split('.');
    if (parts.length === 3) {
      const expiryDate = new Date(parts[2], parts[1] - 1, parts[0]);
      if (expiryDate > new Date()) {
        startDate = new Date(expiryDate);
        startDate.setDate(startDate.getDate() + 1);
        isFuture = true;
      }
    }
  }

  return {
    eligible: true,
    carInfo: { brand, model, year, ageGroup, valueEUR: Math.round(insuranceValueEUR), valueBGN: Math.round(insuranceValueBGN) },
    coverage: { type: 'Пълно каско', description: 'ПТП, природни бедствия, пожар, злоумишлени действия, кражба на цяло МПС и части' },
    pricing: {
      ratePercent,
      basePremium: Math.round(basePremium * 100) / 100,
      roadsidePremium,
      totalAnnualPremium: Math.round(totalAnnualPremium * 100) / 100,
      monthlyPremium: Math.round(monthlyPremium * 100) / 100
    },
    additionalCoverages: [
      { name: 'Помощ на пътя Премиум', premium: roadsidePremium },
      { name: 'Доверен сервиз', premium: 0 },
      { name: 'Асистанс България', premium: 0 },
      { name: 'Асистанс чужбина (при ПТП)', premium: 0 }
    ],
    dates: { startDate: startDate.toLocaleDateString('bg-BG'), isFuture, term: '1 година' },
    provider: 'ДЗИ',
    productName: 'Каско+'
  };
}

export default function DZICascoCalculator({ carData: initialCarData, showDetailed = true }) {
  const [inputs, setInputs] = useState({
    brand: initialCarData?.brand || '',
    model: initialCarData?.model || '',
    year: initialCarData?.year || 2020,
    valueEUR: initialCarData?.valueEUR || 0,
    hasCasco: initialCarData?.hasCasco || false,
    cascoExpiry: initialCarData?.cascoExpiry || ''
  });

  const offer = useMemo(() => calculateDZICascoOffer(inputs), [inputs]);

  return (
    <Card className="border-blue-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-4">
        <div className="flex items-center gap-3">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/2485fdb3e_image.png"
            alt="ДЗИ" className="h-10 bg-white px-3 py-1 rounded-lg shadow-lg"
          />
          <div>
            <CardTitle className="text-lg">ДЗИ Каско+</CardTitle>
            <p className="text-blue-100 text-sm">Пълно каско за леки автомобили</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Input Form */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-sm">Марка</Label>
            <Input value={inputs.brand} onChange={e => setInputs(p => ({...p, brand: e.target.value}))} placeholder="напр. BMW" className="rounded-lg" />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Модел</Label>
            <Input value={inputs.model} onChange={e => setInputs(p => ({...p, model: e.target.value}))} placeholder="напр. X5" className="rounded-lg" />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Година на производство</Label>
            <Input type="number" min="2000" max={new Date().getFullYear()} value={inputs.year}
              onChange={e => setInputs(p => ({...p, year: parseInt(e.target.value) || 2020}))} className="rounded-lg" />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Стойност (EUR)</Label>
            <Input type="number" min="0" value={inputs.valueEUR}
              onChange={e => setInputs(p => ({...p, valueEUR: parseFloat(e.target.value) || 0}))} className="rounded-lg" />
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <Checkbox checked={inputs.hasCasco} onCheckedChange={v => setInputs(p => ({...p, hasCasco: v}))} id="has-casco" />
            <label htmlFor="has-casco" className="text-sm font-medium cursor-pointer">Има текущо валидно Каско</label>
          </div>
          {inputs.hasCasco && (
            <div className="space-y-1">
              <Label className="text-sm">Изтичане на текущото Каско (дд.мм.гггг)</Label>
              <BulgarianDateInput value={inputs.cascoExpiry} onChange={v => setInputs(p => ({...p, cascoExpiry: v}))} className="rounded-lg w-48" />
            </div>
          )}
        </div>

        {/* Cross-sell note */}
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>При комбинация с <strong>ДЗИ ГО</strong> → <strong>10% отстъпка</strong> за ГО застраховката (полето "Има валидно Каско" в ГО калкулатора)</span>
        </div>

        {/* Result */}
        {!offer.eligible ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-2">
            <Car className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-700 text-sm">{offer.reason}</p>
          </div>
        ) : (
          <>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Car className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-700">Застраховано МПС</span>
                {offer.dates.isFuture && <Badge className="bg-amber-500 text-white text-xs">Бъдеща полица</Badge>}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {offer.carInfo.brand && <div><span className="text-slate-500">Марка/Модел:</span><p className="font-medium">{offer.carInfo.brand} {offer.carInfo.model}</p></div>}
                <div><span className="text-slate-500">Година:</span><p className="font-medium">{offer.carInfo.year} (група: {offer.carInfo.ageGroup})</p></div>
                <div><span className="text-slate-500">Застрах. стойност:</span><p className="font-medium">{offer.carInfo.valueBGN.toLocaleString('bg-BG')} лв.</p></div>
                <div><span className="text-slate-500">Тарифа:</span><p className="font-medium">{offer.pricing.ratePercent}%</p></div>
              </div>
            </div>

            {showDetailed && (
              <div>
                <h4 className="font-medium text-slate-700 mb-3">Включени покрития</h4>
                <div className="space-y-2">
                  {offer.additionalCoverages.map((cov, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>{cov.name}</span>
                      </div>
                      {cov.premium > 0 && <span className="text-slate-500">+{cov.premium} лв.</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Основна премия (Пълно каско):</span>
                <span className="font-medium">{offer.pricing.basePremium.toLocaleString('bg-BG')} лв.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Помощ на пътя Премиум:</span>
                <span className="font-medium">+{offer.pricing.roadsidePremium} лв.</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="font-semibold text-lg">Годишна премия:</span>
                <span className="text-2xl font-bold text-blue-600">{offer.pricing.totalAnnualPremium.toLocaleString('bg-BG')} лв.</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>или месечно:</span>
                <span>{offer.pricing.monthlyPremium.toLocaleString('bg-BG')} лв./мес.</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Начало на покритието:</span>
                <span className="font-medium text-blue-900">{offer.dates.startDate}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-blue-700">Срок:</span>
                <span className="font-medium text-blue-900">{offer.dates.term}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Phone className="h-4 w-4" />
              <span>Денонощна линия за асистанс: 0700 10 104</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
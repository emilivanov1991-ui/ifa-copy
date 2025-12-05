import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Shield, Clock, CheckCircle2, Phone } from 'lucide-react';

// Тарифни коефициенти по възраст на МПС и стойност (Пълно каско)
const CASCO_RATES = {
  // Леки автомобили до 9 места
  light: {
    // възраст: { стойностен_праг: тарифа% }
    '0-1': { 50000: 4.50, over50000: 4.30 },
    '1-3': { 50000: 5.40, over50000: 5.20 },
    '3-5': { 20000: 6.30, 50000: 6.00, over50000: 5.80 },
    '5-8': { 15000: 6.90, 20000: 6.50, 50000: 6.20, over50000: 6.00 },
    'over8': { 5000: 9.10, 10000: 8.30, 15000: 7.70, over15000: 6.40 }
  }
};

// Допълнителни покрития
const ADDITIONAL_COVERAGES = {
  roadside_premium: { name: 'Помощ на пътя Премиум', premium: 20 },
  roadside_vip: { name: 'Помощ на пътя ВИП', premium: 65 },
  trusted_service: { name: 'Доверен сервиз', minPremium: 490 }
};

// Минимална годишна премия
const MIN_ANNUAL_PREMIUM = 260;

/**
 * Изчислява възрастовата група на автомобила
 */
function getAgeGroup(year) {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  
  if (age <= 1) return '0-1';
  if (age <= 3) return '1-3';
  if (age <= 5) return '3-5';
  if (age <= 8) return '5-8';
  return 'over8';
}

/**
 * Изчислява тарифния процент за Пълно каско
 */
function getRate(year, valueBGN) {
  const ageGroup = getAgeGroup(year);
  const rates = CASCO_RATES.light[ageGroup];
  
  if (!rates) return 5.00; // fallback
  
  // Намери подходящия праг
  const thresholds = Object.keys(rates).filter(k => k !== 'over50000' && k !== 'over15000');
  const sortedThresholds = thresholds.map(Number).sort((a, b) => a - b);
  
  for (const threshold of sortedThresholds) {
    if (valueBGN <= threshold) {
      return rates[threshold];
    }
  }
  
  // Ако е над всички прагове
  if (rates.over50000) return rates.over50000;
  if (rates.over15000) return rates.over15000;
  
  return sortedThresholds.length > 0 ? rates[sortedThresholds[sortedThresholds.length - 1]] : 5.00;
}

/**
 * Калкулира оферта за ДЗИ Каско+
 */
export function calculateDZICascoOffer(carData) {
  const {
    brand,
    model,
    year,
    valueEUR, // стойност в EUR
    valueBGN, // стойност в BGN (ако е подадена директно)
    hasCasco = false,
    cascoExpiry = null
  } = carData;

  // Конвертиране в BGN ако е нужно
  const insuranceValueBGN = valueBGN || (valueEUR * 1.956);
  const insuranceValueEUR = valueEUR || (valueBGN / 1.956);

  // Проверка за минимална стойност (4000 EUR)
  if (insuranceValueEUR < 4000) {
    return {
      eligible: false,
      reason: 'Стойността на автомобила е под 4000 EUR - не се препоръчва Каско'
    };
  }

  // Изчисляване на тарифа
  const ratePercent = getRate(year, insuranceValueBGN);
  const ageGroup = getAgeGroup(year);
  
  // Основна премия (Пълно каско)
  let basePremium = insuranceValueBGN * (ratePercent / 100);
  
  // Минимална премия
  basePremium = Math.max(basePremium, MIN_ANNUAL_PREMIUM);
  
  // Допълнителни покрития (винаги включваме)
  const roadsidePremium = ADDITIONAL_COVERAGES.roadside_premium.premium;
  const trustedServicePremium = Math.max(basePremium * 0.05, 0); // Включено в базата при доверен сервиз

  // Обща годишна премия
  const totalAnnualPremium = basePremium + roadsidePremium;
  const monthlyPremium = totalAnnualPremium / 12;

  // Определяне на начална дата
  let startDate = new Date();
  let isFuture = false;
  
  if (hasCasco && cascoExpiry) {
    // Парсване на датата (дд.мм.гггг)
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
    carInfo: {
      brand,
      model,
      year,
      ageGroup,
      valueEUR: Math.round(insuranceValueEUR),
      valueBGN: Math.round(insuranceValueBGN)
    },
    coverage: {
      type: 'Пълно каско',
      code: 'FULL_CASCO',
      description: 'Покрива всички рискове: ПТП, природни бедствия, пожар, злоумишлени действия, кражба на цяло МПС, кражба на части'
    },
    pricing: {
      ratePercent,
      basePremium: Math.round(basePremium * 100) / 100,
      roadsidePremium,
      totalAnnualPremium: Math.round(totalAnnualPremium * 100) / 100,
      monthlyPremium: Math.round(monthlyPremium * 100) / 100
    },
    additionalCoverages: [
      { name: 'Помощ на пътя Премиум', included: true, premium: roadsidePremium },
      { name: 'Доверен сервиз', included: true, premium: 0 },
      { name: 'Асистанс България', included: true, premium: 0 },
      { name: 'Асистанс чужбина (при ПТП)', included: true, premium: 0 }
    ],
    dates: {
      startDate: startDate.toLocaleDateString('bg-BG'),
      isFuture,
      term: '1 година'
    },
    provider: 'ДЗИ',
    productName: 'Каско+'
  };
}

/**
 * Компонент за визуализация на Каско оферта
 */
export default function DZICascoCalculator({ carData, showDetailed = true }) {
  const offer = useMemo(() => calculateDZICascoOffer(carData), [carData]);

  if (!offer.eligible) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-amber-700">
            <Car className="h-5 w-5" />
            <p>{offer.reason}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">{offer.provider} {offer.productName}</CardTitle>
              <p className="text-blue-100 text-sm">{offer.coverage.type}</p>
            </div>
          </div>
          {offer.dates.isFuture && (
            <Badge className="bg-amber-500 text-white">
              <Clock className="h-3 w-3 mr-1" />
              Бъдеща
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Информация за автомобила */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Car className="h-4 w-4 text-slate-500" />
            <span className="font-medium text-slate-700">Застраховано МПС</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Марка/Модел:</span>
              <p className="font-medium">{offer.carInfo.brand} {offer.carInfo.model}</p>
            </div>
            <div>
              <span className="text-slate-500">Година:</span>
              <p className="font-medium">{offer.carInfo.year} ({offer.carInfo.ageGroup} г.)</p>
            </div>
            <div>
              <span className="text-slate-500">Застрахователна сума:</span>
              <p className="font-medium">{offer.carInfo.valueBGN.toLocaleString('bg-BG')} лв.</p>
            </div>
            <div>
              <span className="text-slate-500">Тарифа:</span>
              <p className="font-medium">{offer.pricing.ratePercent}%</p>
            </div>
          </div>
        </div>

        {/* Покрития */}
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
                  {cov.premium > 0 && (
                    <span className="text-slate-500">+{cov.premium} лв.</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Цена */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Основна премия ({offer.coverage.type}):</span>
            <span className="font-medium">{offer.pricing.basePremium.toLocaleString('bg-BG')} лв.</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Помощ на пътя Премиум:</span>
            <span className="font-medium">+{offer.pricing.roadsidePremium} лв.</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="font-semibold text-lg">Годишна премия:</span>
            <span className="text-2xl font-bold text-blue-600">
              {offer.pricing.totalAnnualPremium.toLocaleString('bg-BG')} лв.
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-500 mt-1">
            <span>или месечно:</span>
            <span>{offer.pricing.monthlyPremium.toLocaleString('bg-BG')} лв./мес.</span>
          </div>
        </div>

        {/* Дати */}
        <div className="bg-blue-50 rounded-lg p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-blue-700">Начало на покритието:</span>
            <span className="font-medium text-blue-900">{offer.dates.startDate}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-blue-700">Срок:</span>
            <span className="font-medium text-blue-900">{offer.dates.term}</span>
          </div>
        </div>

        {/* Контакт */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Phone className="h-4 w-4" />
          <span>Денонощна линия за асистанс: 0700 10 104</span>
        </div>
      </CardContent>
    </Card>
  );
}
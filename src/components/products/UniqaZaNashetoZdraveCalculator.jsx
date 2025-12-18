import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, Save, Heart, Shield, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Тарифи за Извънболнично лечение (EUR)
const OUTPATIENT_TARIFFS = {
  individual: {
    '0-17': { annual: 147.36, semiannual: 75.18 },
    '18-30': { annual: 102.41, semiannual: 52.25 },
    '31-40': { annual: 139.15, semiannual: 70.99 },
    '41-45': { annual: 170.39, semiannual: 86.93 },
    '46-50': { annual: 197.01, semiannual: 100.52 },
    '51-55': { annual: 228.80, semiannual: 116.73 },
    '56-60': { annual: 266.42, semiannual: 135.93 },
    '61-70': { annual: 310.53, semiannual: 158.43 }
  },
  comfort: {
    '0-17': { annual: 184.24, semiannual: 94.00 },
    '18-30': { annual: 170.92, semiannual: 87.20 },
    '31-40': { annual: 209.39, semiannual: 106.83 },
    '41-45': { annual: 226.71, semiannual: 115.67 },
    '46-50': { annual: 254.43, semiannual: 129.81 },
    '51-55': { annual: 286.00, semiannual: 145.92 },
    '56-60': { annual: 333.08, semiannual: 169.94 },
    '61-70': { annual: 388.19, semiannual: 198.06 }
  },
  prestige: {
    '0-17': { annual: 291.06, semiannual: 148.50 },
    '18-30': { annual: 344.52, semiannual: 175.78 },
    '31-40': { annual: 396.04, semiannual: 202.06 },
    '41-45': { annual: 404.18, semiannual: 206.22 },
    '46-50': { annual: 413.71, semiannual: 211.08 },
    '51-55': { annual: 451.88, semiannual: 230.55 },
    '56-60': { annual: 526.13, semiannual: 268.43 },
    '61-70': { annual: 613.25, semiannual: 312.88 }
  },
  group: {
    standard: { annual: 124.90, semiannual: 63.72, quarterly: 32.19, monthly: 10.96 },
    comfort: { annual: 157.80, semiannual: 80.51, quarterly: 40.67, monthly: 13.84 },
    prestige: { annual: 262.96, semiannual: 134.16, quarterly: 67.77, monthly: 23.07 }
  }
};

// Тарифи за Болнично лечение (EUR)
const INPATIENT_TARIFFS = {
  individual: {
    '0-17': { annual: 36.30, semiannual: 18.52 },
    '18-30': { annual: 44.33, semiannual: 22.62 },
    '31-40': { annual: 47.30, semiannual: 24.13 },
    '41-45': { annual: 58.96, semiannual: 30.08 },
    '46-50': { annual: 73.04, semiannual: 37.27 },
    '51-55': { annual: 91.85, semiannual: 46.86 },
    '56-60': { annual: 115.50, semiannual: 58.93 },
    '61-70': { annual: 143.77, semiannual: 73.35 }
  },
  comfort: {
    '0-17': { annual: 53.68, semiannual: 27.39 },
    '18-30': { annual: 109.34, semiannual: 55.79 },
    '31-40': { annual: 111.21, semiannual: 56.74 },
    '41-45': { annual: 113.52, semiannual: 57.92 },
    '46-50': { annual: 115.83, semiannual: 59.10 },
    '51-55': { annual: 135.96, semiannual: 69.37 },
    '56-60': { annual: 170.94, semiannual: 87.21 },
    '61-70': { annual: 212.74, semiannual: 108.54 }
  },
  prestige: {
    '0-17': { annual: 89.87, semiannual: 45.85 },
    '18-30': { annual: 187.55, semiannual: 95.69 },
    '31-40': { annual: 195.91, semiannual: 99.95 },
    '41-45': { annual: 204.27, semiannual: 104.22 },
    '46-50': { annual: 211.53, semiannual: 107.92 },
    '51-55': { annual: 227.37, semiannual: 116.01 },
    '56-60': { annual: 285.89, semiannual: 145.86 },
    '61-70': { annual: 355.85, semiannual: 181.56 }
  },
  group: {
    standard: { annual: 43.10, semiannual: 21.99, quarterly: 11.11, monthly: 3.78 },
    comfort: { annual: 72.45, semiannual: 36.96, quarterly: 18.67, monthly: 6.36 },
    prestige: { annual: 156.24, semiannual: 79.71, quarterly: 40.27, monthly: 13.71 }
  }
};

// Тарифи за Дентално лечение (EUR)
const DENTAL_TARIFFS = {
  individual: {
    '0-17': { annual: 68.75, semiannual: 35.08 },
    '18-30': { annual: 85.80, semiannual: 43.78 },
    '31-40': { annual: 138.82, semiannual: 70.83 },
    '41-45': { annual: 170.72, semiannual: 87.10 },
    '46-50': { annual: 185.35, semiannual: 94.57 },
    '51-55': { annual: 193.27, semiannual: 98.61 },
    '56-60': { annual: 193.93, semiannual: 98.94 },
    '61-70': { annual: 187.33, semiannual: 95.58 }
  },
  comfort: {
    '0-17': { annual: 80.08, semiannual: 40.85 },
    '18-30': { annual: 105.71, semiannual: 53.93 },
    '31-40': { annual: 185.13, semiannual: 94.45 },
    '41-45': { annual: 232.98, semiannual: 118.87 },
    '46-50': { annual: 254.87, semiannual: 130.04 },
    '51-55': { annual: 266.75, semiannual: 136.10 },
    '56-60': { annual: 267.85, semiannual: 136.66 },
    '61-70': { annual: 257.84, semiannual: 131.55 }
  },
  prestige: {
    '0-17': { annual: 120.23, semiannual: 61.34 },
    '18-30': { annual: 158.51, semiannual: 80.87 },
    '31-40': { annual: 277.64, semiannual: 141.65 },
    '41-45': { annual: 349.47, semiannual: 178.30 },
    '46-50': { annual: 382.25, semiannual: 195.03 },
    '51-55': { annual: 400.18, semiannual: 204.17 },
    '56-60': { annual: 401.83, semiannual: 205.02 },
    '61-70': { annual: 386.87, semiannual: 197.38 }
  },
  group: {
    standard: { annual: 139.80, semiannual: 71.33, quarterly: 36.03, monthly: 12.26 },
    comfort: { annual: 188.70, semiannual: 96.28, quarterly: 48.63, monthly: 16.55 },
    prestige: { annual: 283.10, semiannual: 144.44, quarterly: 72.96, monthly: 24.83 }
  }
};

// Тарифи за Медицински средства (EUR)
const MEDICAL_DEVICES_TARIFFS = {
  individual: {
    '0-17': { annual: 41.27, semiannual: 21.05 },
    '18-30': { annual: 28.71, semiannual: 14.65 },
    '31-40': { annual: 38.94, semiannual: 19.87 },
    '41-45': { annual: 47.74, semiannual: 24.36 },
    '46-50': { annual: 55.22, semiannual: 28.17 },
    '51-55': { annual: 64.13, semiannual: 32.72 },
    '56-60': { annual: 74.58, semiannual: 38.05 },
    '61-70': { annual: 87.01, semiannual: 44.39 }
  },
  comfort: {
    '0-17': { annual: 57.70, semiannual: 29.44 },
    '18-30': { annual: 40.15, semiannual: 20.48 },
    '31-40': { annual: 54.56, semiannual: 27.84 },
    '41-45': { annual: 66.88, semiannual: 34.12 },
    '46-50': { annual: 77.33, semiannual: 39.45 },
    '51-55': { annual: 89.76, semiannual: 45.80 },
    '56-60': { annual: 104.39, semiannual: 53.26 },
    '61-70': { annual: 121.77, semiannual: 62.13 }
  },
  prestige: {
    '0-17': { annual: 90.75, semiannual: 46.30 },
    '18-30': { annual: 63.14, semiannual: 32.21 },
    '31-40': { annual: 85.69, semiannual: 43.72 },
    '41-45': { annual: 105.05, semiannual: 53.60 },
    '46-50': { annual: 121.44, semiannual: 61.96 },
    '51-55': { annual: 141.13, semiannual: 72.01 },
    '56-60': { annual: 164.12, semiannual: 83.73 },
    '61-70': { annual: 191.40, semiannual: 97.65 }
  },
  group: {
    standard: { annual: 32.30, semiannual: 16.48, quarterly: 8.32, monthly: 2.83 },
    comfort: { annual: 45.20, semiannual: 23.06, quarterly: 11.65, monthly: 3.96 },
    prestige: { annual: 69.60, semiannual: 35.51, quarterly: 17.94, monthly: 6.11 }
  }
};

// Тарифи за Услуги свързани с битови условия (EUR)
const LIVING_CONDITIONS_TARIFFS = {
  individual: {
    '0-17': { annual: 9.35, semiannual: 4.77 },
    '18-30': { annual: 17.71, semiannual: 9.04 },
    '31-40': { annual: 18.48, semiannual: 9.43 },
    '41-45': { annual: 23.54, semiannual: 12.01 },
    '46-50': { annual: 29.15, semiannual: 14.87 },
    '51-55': { annual: 36.63, semiannual: 18.69 },
    '56-60': { annual: 46.09, semiannual: 23.52 },
    '61-70': { annual: 57.42, semiannual: 29.30 }
  },
  comfort: {
    '0-17': { annual: 16.83, semiannual: 8.59 },
    '18-30': { annual: 31.90, semiannual: 16.28 },
    '31-40': { annual: 33.22, semiannual: 16.95 },
    '41-45': { annual: 42.35, semiannual: 21.61 },
    '46-50': { annual: 52.47, semiannual: 26.77 },
    '51-55': { annual: 65.89, semiannual: 33.62 },
    '56-60': { annual: 82.94, semiannual: 42.32 },
    '61-70': { annual: 103.40, semiannual: 52.76 }
  },
  prestige: {
    '0-17': { annual: 37.40, semiannual: 19.08 },
    '18-30': { annual: 70.84, semiannual: 36.14 },
    '31-40': { annual: 73.92, semiannual: 37.71 },
    '41-45': { annual: 94.16, semiannual: 48.04 },
    '46-50': { annual: 116.60, semiannual: 59.49 },
    '51-55': { annual: 146.52, semiannual: 74.76 },
    '56-60': { annual: 184.36, semiannual: 94.06 },
    '61-70': { annual: 229.68, semiannual: 117.18 }
  },
  group: {
    standard: { annual: 17.20, semiannual: 8.78, quarterly: 4.43, monthly: 1.51 },
    comfort: { annual: 31.00, semiannual: 15.82, quarterly: 7.99, monthly: 2.72 },
    prestige: { annual: 68.80, semiannual: 35.10, quarterly: 17.73, monthly: 6.04 }
  }
};

// Групови тарифи за профилактика (EUR)
const PREVENTIVE_TARIFFS = {
  standard: { annual: 56.80, semiannual: 28.98, quarterly: 14.64, monthly: 4.98 },
  comfort: { annual: 111.40, semiannual: 56.84, quarterly: 28.71, monthly: 9.77 },
  prestige: { annual: 226.20, semiannual: 115.41, quarterly: 58.30, monthly: 19.84 }
};

// Дневни пари за болничен престой (EUR за 10 BGN/ден)
const DAILY_ALLOWANCE_TARIFFS = {
  individual: {
    '0-17': { annual: 19.25, semiannual: 9.81 },
    '18-30': { annual: 21.56, semiannual: 11.01 },
    '31-40': { annual: 27.28, semiannual: 13.90 },
    '41-45': { annual: 33.44, semiannual: 17.04 },
    '46-50': { annual: 40.37, semiannual: 20.59 },
    '51-55': { annual: 47.63, semiannual: 24.29 },
    '56-60': { annual: 55.66, semiannual: 28.39 },
    '61-70': { annual: 64.02, semiannual: 32.65 }
  },
  group: { annual: 15.60, semiannual: 7.96, quarterly: 4.02, monthly: 1.37 }
};

// Обезщетение за операции (EUR за 1000 BGN покритие)
const SURGERY_TARIFFS = {
  individual: {
    '0-17': { annual: 7.37, semiannual: 3.77 },
    '18-30': { annual: 8.25, semiannual: 4.22 },
    '31-40': { annual: 10.45, semiannual: 5.35 },
    '41-45': { annual: 12.87, semiannual: 6.55 },
    '46-50': { annual: 15.51, semiannual: 7.91 },
    '51-55': { annual: 18.26, semiannual: 9.33 },
    '56-60': { annual: 21.34, semiannual: 10.90 },
    '61-70': { annual: 24.53, semiannual: 12.54 }
  },
  group: { annual: 7.60, semiannual: 3.88, quarterly: 1.96, monthly: 0.67 }
};

// Второ медицинско мнение - само за групови
const SECOND_OPINION_TARIFF = {
  annual: 15.00, semiannual: 7.65, quarterly: 3.86, monthly: 1.33
};

export default function UniqaZaNashetoZdraveCalculator({ analysisId, clientId }) {
  const [inputs, setInputs] = useState({
    insuranceType: 'individual', // individual / group
    insuranceMode: 'supplementary', // supplementary / private
    age: 35,
    productLevel: 'comfort', // standard / comfort / prestige
    paymentFrequency: 'annual', // annual / semiannual / quarterly / monthly
    
    // Пакети
    includeOutpatient: true,
    includeInpatient: true, // Основен пакет - задължителен
    includeDental: false,
    includeMedicalDevices: false,
    includeLivingConditions: false,
    includePreventive: false, // Само групови
    includeDailyAllowance: false,
    includeSurgeryComp: false,
    includeSecondOpinion: false, // Само групови
    
    // За дневни пари и операции
    dailyAllowanceAmountBGN: 10, // BGN per day
    surgerySum: 1000, // BGN
    
    groupSize: 10
  });

  const [result, setResult] = useState(null);

  const getAgeGroup = (age) => {
    if (age <= 17) return '0-17';
    if (age <= 30) return '18-30';
    if (age <= 40) return '31-40';
    if (age <= 45) return '41-45';
    if (age <= 50) return '46-50';
    if (age <= 55) return '51-55';
    if (age <= 60) return '56-60';
    return '61-70';
  };

  const calculate = () => {
    const ageGroup = getAgeGroup(inputs.age);
    const isGroup = inputs.insuranceType === 'group';
    const freq = inputs.paymentFrequency;
    
    let totalPremium = 0;
    const breakdown = [];

    // Болнично лечение - задължителен основен пакет
    if (inputs.includeInpatient) {
      const tariff = isGroup 
        ? INPATIENT_TARIFFS.group[inputs.productLevel][freq]
        : INPATIENT_TARIFFS[inputs.productLevel][ageGroup][freq];
      totalPremium += tariff;
      breakdown.push({ name: 'Болнично лечение (основен)', premium: tariff });
    }

    // Извънболнично лечение
    if (inputs.includeOutpatient) {
      const tariff = isGroup 
        ? OUTPATIENT_TARIFFS.group[inputs.productLevel][freq]
        : OUTPATIENT_TARIFFS[inputs.productLevel][ageGroup][freq];
      totalPremium += tariff;
      breakdown.push({ name: 'Извънболнично лечение', premium: tariff });
    }

    // Дентално лечение
    if (inputs.includeDental) {
      const tariff = isGroup 
        ? DENTAL_TARIFFS.group[inputs.productLevel][freq]
        : DENTAL_TARIFFS[inputs.productLevel][ageGroup][freq];
      totalPremium += tariff;
      breakdown.push({ name: 'Дентално лечение', premium: tariff });
    }

    // Медицински средства
    if (inputs.includeMedicalDevices) {
      const tariff = isGroup 
        ? MEDICAL_DEVICES_TARIFFS.group[inputs.productLevel][freq]
        : MEDICAL_DEVICES_TARIFFS[inputs.productLevel][ageGroup][freq];
      totalPremium += tariff;
      breakdown.push({ name: 'Медицински средства', premium: tariff });
    }

    // Битови условия
    if (inputs.includeLivingConditions) {
      const tariff = isGroup 
        ? LIVING_CONDITIONS_TARIFFS.group[inputs.productLevel][freq]
        : LIVING_CONDITIONS_TARIFFS[inputs.productLevel][ageGroup][freq];
      totalPremium += tariff;
      breakdown.push({ name: 'Битови условия', premium: tariff });
    }

    // Профилактика - само групови
    if (inputs.includePreventive && isGroup) {
      const tariff = PREVENTIVE_TARIFFS[inputs.productLevel][freq];
      totalPremium += tariff;
      breakdown.push({ name: 'Профилактика', premium: tariff });
    }

    // Дневни пари
    if (inputs.includeDailyAllowance) {
      const baseTariff = isGroup 
        ? DAILY_ALLOWANCE_TARIFFS.group[freq]
        : DAILY_ALLOWANCE_TARIFFS.individual[ageGroup][freq];
      const multiplier = inputs.dailyAllowanceAmountBGN / 10;
      const tariff = baseTariff * multiplier;
      totalPremium += tariff;
      breakdown.push({ name: `Дневни пари (${inputs.dailyAllowanceAmountBGN} BGN/ден)`, premium: tariff });
    }

    // Обезщетение за операции
    if (inputs.includeSurgeryComp) {
      const baseTariff = isGroup 
        ? SURGERY_TARIFFS.group[freq]
        : SURGERY_TARIFFS.individual[ageGroup][freq];
      const multiplier = inputs.surgerySum / 1000;
      const tariff = baseTariff * multiplier;
      totalPremium += tariff;
      breakdown.push({ name: `Обезщетение за операции (${inputs.surgerySum} BGN)`, premium: tariff });
    }

    // Второ мнение - само групови
    if (inputs.includeSecondOpinion && isGroup) {
      const tariff = SECOND_OPINION_TARIFF[freq];
      totalPremium += tariff;
      breakdown.push({ name: 'Второ медицинско мнение', premium: tariff });
    }

    // Отстъпки за множество пакети
    const packagesCount = breakdown.length;
    let packageDiscount = 0;
    if (packagesCount >= 5) packageDiscount = 0.08;
    else if (packagesCount >= 4) packageDiscount = 0.05;
    else if (packagesCount >= 3) packageDiscount = 0.03;

    const discountAmount = totalPremium * packageDiscount;
    totalPremium -= discountAmount;

    // Завишения за "Частно здравно осигуряване"
    let privateIncrease = 0;
    if (inputs.insuranceMode === 'private') {
      const increases = {
        inpatient: 0.50,
        livingConditions: 0.50,
        outpatient: 0.25,
        medicalDevices: 0.25,
        dental: 0.15
      };
      
      breakdown.forEach(item => {
        if (item.name.includes('Болнично')) privateIncrease += item.premium * increases.inpatient;
        else if (item.name.includes('Битови')) privateIncrease += item.premium * increases.livingConditions;
        else if (item.name.includes('Извънболнично')) privateIncrease += item.premium * increases.outpatient;
        else if (item.name.includes('Медицински средства')) privateIncrease += item.premium * increases.medicalDevices;
        else if (item.name.includes('Дентално')) privateIncrease += item.premium * increases.dental;
      });
      totalPremium += privateIncrease;
    }

    // Отстъпки за групови застраховки
    let groupDiscount = 0;
    if (isGroup) {
      if (inputs.groupSize > 200) {
        groupDiscount = 0.15; // Ще се определи индивидуално
      } else if (inputs.groupSize > 100) {
        groupDiscount = 0.15;
      } else if (inputs.groupSize > 50) {
        groupDiscount = 0.10;
      } else if (inputs.groupSize > 20) {
        groupDiscount = 0.05;
      }
      
      const groupDiscountAmount = totalPremium * groupDiscount;
      totalPremium -= groupDiscountAmount;
    }

    // Добавяне на 2% застрахователен данък
    const insuranceTax = totalPremium * 0.02;
    const totalWithTax = totalPremium + insuranceTax;

    // Конвертиране в BGN
    const bgnRate = 1.95583;
    const totalBGN = totalWithTax * bgnRate;

    setResult({
      basePremium: totalPremium.toFixed(2),
      packageDiscount: packageDiscount > 0 ? (packageDiscount * 100).toFixed(0) : 0,
      discountAmount: discountAmount.toFixed(2),
      privateIncrease: privateIncrease.toFixed(2),
      groupDiscount: groupDiscount > 0 ? (groupDiscount * 100).toFixed(0) : 0,
      insuranceTax: insuranceTax.toFixed(2),
      totalPremiumEUR: totalWithTax.toFixed(2),
      totalPremiumBGN: totalBGN.toFixed(2),
      breakdown: breakdown,
      packagesCount: packagesCount
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

    const selectedPackages = result.breakdown.map(b => b.name).join(', ');

    const offerData = {
      analysis_id: analysisId,
      client_id: clientId || null,
      provider: 'УНИКА',
      product_name: 'За нашето здраве',
      product_type: 'health_insurance',
      beneficiary: 'client',
      beneficiary_name: 'Застрахован',
      beneficiary_age: inputs.age,
      monthly_premium: annualPremiumEUR / 12,
      annual_premium: annualPremiumEUR,
      offer_status: 'generated',
      ai_recommendation_reason: `Здравна застраховка УНИКА "${inputs.insuranceType === 'group' ? 'Групова' : 'Индивидуална'}", ${inputs.insuranceMode === 'private' ? 'Частно' : 'Допълнително'} здравно осигуряване, възраст ${inputs.age} год, ниво "${inputs.productLevel}". Избрани пакети: ${selectedPackages}. ${result.packageDiscount > 0 ? `Отстъпка ${result.packageDiscount}% за множество пакети.` : ''}`
    };

    try {
      await base44.entities.ProductOffer.create(offerData);
      toast.success('✓ Офертата е запазена успешно');
    } catch (error) {
      toast.error('Грешка при запазване: ' + error.message);
    }
  };

  const warnings = useMemo(() => {
    const w = [];
    
    if (inputs.age > 64 && inputs.insuranceType === 'individual') {
      w.push('Не се приемат лица над 64 години за индивидуални застраховки');
    }
    if (inputs.age > 74 && inputs.insuranceType === 'group') {
      w.push('Не се приемат лица над 74 години за групови застраховки');
    }
    if ((inputs.includeDental || inputs.includeMedicalDevices || inputs.includePreventive) && !inputs.includeOutpatient && !inputs.includeInpatient) {
      w.push('Пакетите Дентално, Медицински средства и Профилактика изискват Болнично И Извънболнично лечение');
    }
    if (inputs.includePreventive && inputs.insuranceType !== 'group') {
      w.push('Профилактика е само за групови договори');
    }
    if (inputs.includeSecondOpinion && inputs.insuranceType !== 'group') {
      w.push('Второ медицинско мнение е само за групови договори');
    }
    
    return w;
  }, [inputs]);

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="flex items-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/c923181b0_image.png" 
            alt="УНИКА" 
            className="h-10 bg-white p-1 rounded"
          />
          <div>
            <CardTitle className="text-xl">УНИКА - За нашето здраве</CardTitle>
            <p className="text-xs text-orange-100 mt-1">Здравна застраховка с модулни пакети</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800 space-y-1">
                {warnings.map((w, idx) => (
                  <p key={idx}>⚠ {w}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Тип застраховка</Label>
            <Select value={inputs.insuranceType} onValueChange={(v) => setInputs({...inputs, insuranceType: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Индивидуална / Семейна</SelectItem>
                <SelectItem value="group">Групова (10+ души)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Режим на осигуряване</Label>
            <Select value={inputs.insuranceMode} onValueChange={(v) => setInputs({...inputs, insuranceMode: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supplementary">Допълнително (надгражда НЗОК)</SelectItem>
                <SelectItem value="private">Частно (независимо от НЗОК)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              {inputs.insuranceMode === 'private' ? 'Завишения: Болнично +50%, Битови +50%, Извънболнично +25%, и др.' : 'Изисква валидни ЗО права'}
            </p>
          </div>

          <div>
            <Label>Възраст на застрахования</Label>
            <Input
              type="number"
              value={inputs.age}
              onChange={(e) => setInputs({...inputs, age: parseInt(e.target.value) || 0})}
              min="0"
              max={inputs.insuranceType === 'group' ? '74' : '64'}
            />
            <p className="text-xs text-slate-500 mt-1">
              Макс: {inputs.insuranceType === 'group' ? '74 години (групова)' : '64 години (индивидуална)'}
            </p>
          </div>

          {inputs.insuranceType === 'group' && (
            <div>
              <Label>Брой лица в групата</Label>
              <Input
                type="number"
                value={inputs.groupSize}
                onChange={(e) => setInputs({...inputs, groupSize: parseInt(e.target.value) || 10})}
                min="10"
              />
              <p className="text-xs text-slate-500 mt-1">
                {inputs.groupSize > 200 ? 'Над 200 - индивидуално тарифиране' : 
                 inputs.groupSize > 100 ? 'Отстъпка 15%' :
                 inputs.groupSize > 50 ? 'Отстъпка 10%' :
                 inputs.groupSize > 20 ? 'Отстъпка 5%' : 'Минимум 10 души'}
              </p>
            </div>
          )}

          <div>
            <Label>Продуктово ниво</Label>
            <Select value={inputs.productLevel} onValueChange={(v) => setInputs({...inputs, productLevel: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Стандарт</SelectItem>
                <SelectItem value="comfort">Комфорт</SelectItem>
                <SelectItem value="prestige">Престиж</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Честота на плащане</Label>
            <Select value={inputs.paymentFrequency} onValueChange={(v) => setInputs({...inputs, paymentFrequency: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Годишно {inputs.insuranceType === 'group' && '(отстъпка 5%)'}</SelectItem>
                <SelectItem value="semiannual">Шестмесечно {inputs.insuranceType === 'group' && '(отстъпка 3%)'}</SelectItem>
                {inputs.insuranceType === 'group' && (
                  <>
                    <SelectItem value="quarterly">Тримесечно (отстъпка 2%)</SelectItem>
                    <SelectItem value="monthly">Месечно</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <h4 className="font-semibold text-slate-900">Избор на здравни пакети</h4>
          
          <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 opacity-60">
              <Checkbox checked={inputs.includeInpatient} disabled id="inpatient" />
              <label htmlFor="inpatient" className="text-sm font-medium">
                ✓ Болнично лечение (Основен пакет - задължителен)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={inputs.includeOutpatient}
                onCheckedChange={(checked) => setInputs({...inputs, includeOutpatient: checked})}
                id="outpatient"
              />
              <label htmlFor="outpatient" className="text-sm font-medium cursor-pointer">
                Извънболнично лечение
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={inputs.includeDental}
                onCheckedChange={(checked) => setInputs({...inputs, includeDental: checked})}
                id="dental"
              />
              <label htmlFor="dental" className="text-sm font-medium cursor-pointer">
                Дентално лечение
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={inputs.includeMedicalDevices}
                onCheckedChange={(checked) => setInputs({...inputs, includeMedicalDevices: checked})}
                id="devices"
              />
              <label htmlFor="devices" className="text-sm font-medium cursor-pointer">
                Медицински средства
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={inputs.includeLivingConditions}
                onCheckedChange={(checked) => setInputs({...inputs, includeLivingConditions: checked})}
                id="living"
              />
              <label htmlFor="living" className="text-sm font-medium cursor-pointer">
                Услуги свързани с битови условия
              </label>
            </div>

            {inputs.insuranceType === 'group' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={inputs.includePreventive}
                  onCheckedChange={(checked) => setInputs({...inputs, includePreventive: checked})}
                  id="preventive"
                />
                <label htmlFor="preventive" className="text-sm font-medium cursor-pointer">
                  Профилактика (само групови)
                </label>
              </div>
            )}

            <div className="border-t pt-3 mt-3">
              <p className="text-xs font-semibold text-slate-600 mb-2">Допълнителни покрития (независими):</p>
              
              <div className="flex items-start space-x-2 mb-2">
                <Checkbox
                  checked={inputs.includeDailyAllowance}
                  onCheckedChange={(checked) => setInputs({...inputs, includeDailyAllowance: checked})}
                  id="daily"
                />
                <div className="flex-1">
                  <label htmlFor="daily" className="text-sm font-medium cursor-pointer">
                    Дневни пари за болничен престой
                  </label>
                  {inputs.includeDailyAllowance && (
                    <Input
                      type="number"
                      value={inputs.dailyAllowanceAmountBGN}
                      onChange={(e) => setInputs({...inputs, dailyAllowanceAmountBGN: parseInt(e.target.value) || 10})}
                      min="10"
                      max="100"
                      step="10"
                      className="mt-2"
                      placeholder="BGN/ден"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2 mb-2">
                <Checkbox
                  checked={inputs.includeSurgeryComp}
                  onCheckedChange={(checked) => setInputs({...inputs, includeSurgeryComp: checked})}
                  id="surgery"
                />
                <div className="flex-1">
                  <label htmlFor="surgery" className="text-sm font-medium cursor-pointer">
                    Обезщетение за операции
                  </label>
                  {inputs.includeSurgeryComp && (
                    <Input
                      type="number"
                      value={inputs.surgerySum}
                      onChange={(e) => setInputs({...inputs, surgerySum: parseInt(e.target.value) || 1000})}
                      min="1000"
                      max="10000"
                      step="1000"
                      className="mt-2"
                      placeholder="BGN застр. сума"
                    />
                  )}
                </div>
              </div>

              {inputs.insuranceType === 'group' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={inputs.includeSecondOpinion}
                    onCheckedChange={(checked) => setInputs({...inputs, includeSecondOpinion: checked})}
                    id="second-opinion"
                  />
                  <label htmlFor="second-opinion" className="text-sm font-medium cursor-pointer">
                    Второ медицинско мнение (само групови)
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={calculate} className="flex-1 bg-red-600 hover:bg-red-700">
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

        {result && warnings.length === 0 && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold text-slate-900">Изчислена премия</h4>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                {result.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span>{item.name}:</span>
                    <span className="font-medium">{item.premium.toFixed(2)} EUR</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
                {parseFloat(result.packageDiscount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Отстъпка за {result.packagesCount} пакета ({result.packageDiscount}%):</span>
                    <span className="font-semibold">-{result.discountAmount} EUR</span>
                  </div>
                )}
                {parseFloat(result.privateIncrease) > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Завишение за "Частно осигуряване":</span>
                    <span className="font-semibold">+{result.privateIncrease} EUR</span>
                  </div>
                )}
                {parseFloat(result.groupDiscount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Отстъпка за група {inputs.groupSize} души ({result.groupDiscount}%):</span>
                    <span className="font-semibold">-{(parseFloat(result.basePremium) * parseFloat(result.groupDiscount) / 100).toFixed(2)} EUR</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Застрахователен данък (2%):</span>
                  <span className="font-semibold">{result.insuranceTax} EUR</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold text-slate-900">Обща премия:</span>
                  <span className="font-bold text-red-600">{result.totalPremiumEUR} EUR</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>В лева (ориентировъчно):</span>
                  <span>{result.totalPremiumBGN} лв</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800 space-y-2">
                  <p className="font-semibold">Важна информация:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Отлагателен период: {inputs.insuranceType === 'group' ? '60 дни (3 мес. за нови лица)' : '60 дни (6 мес. за бременност)'}</li>
                    <li>• Абонаментно обслужване в мрежата на УНИКА (без самоучастие)</li>
                    <li>• Възстановяване на разходи: 80% (20% самоучастие при {inputs.insuranceMode === 'supplementary' ? 'услуги извън мрежата' : 'всички услуги'})</li>
                    <li>• Покритие до 70 години (индивидуални/семейни) или 75 години (групови)</li>
                    <li>• Телемедицина MedUNIQA - 24/7 онлайн консултации</li>
                    <li>• Не се покриват хронични заболявания от преди застраховката</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="font-semibold text-slate-900 mb-2">✓ Покрити рискове:</p>
                <ul className="text-slate-600 space-y-1 ml-3">
                  <li>• Заболявания и злополуки</li>
                  <li>• Бременност и раждане</li>
                  <li>• Физиотерапия и рехабилитация</li>
                  <li>• Профилактични прегледи</li>
                  <li>• Онкологични заболявания (само Престиж)</li>
                </ul>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="font-semibold text-slate-900 mb-2">✗ Изключения:</p>
                <ul className="text-slate-600 space-y-1 ml-3">
                  <li>• Козметични операции</li>
                  <li>• Психиатрично лечение</li>
                  <li>• ХИВ/СПИН свързани болести</li>
                  <li>• Вродени аномалии</li>
                  <li>• Алкохол/наркотици</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
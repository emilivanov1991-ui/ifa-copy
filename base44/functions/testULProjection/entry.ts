import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// ── Exact copy of mortality + UL logic from generateFinancialPlan ──

const MORTALITY_QX = {
  0:{m:10.4667,f:8.3265},1:{m:0.8631,f:0.8105},15:{m:0.4320,f:0.2681},
  16:{m:0.5632,f:0.3168},17:{m:0.6590,f:0.3991},18:{m:0.7820,f:0.4778},
  19:{m:0.9968,f:0.3351},20:{m:0.9754,f:0.3689},21:{m:0.9902,f:0.3905},
  22:{m:1.1783,f:0.3851},23:{m:1.1208,f:0.3416},24:{m:1.2253,f:0.3714},
  25:{m:1.1798,f:0.4777},26:{m:1.2803,f:0.5026},27:{m:1.2603,f:0.2587},
  28:{m:1.2194,f:0.5889},29:{m:1.2426,f:0.5133},30:{m:1.2442,f:0.6015},
  31:{m:1.3015,f:0.6550},32:{m:1.5494,f:0.5586},33:{m:1.6410,f:0.7463},
  34:{m:1.6169,f:0.9297},35:{m:1.8178,f:0.8255},36:{m:1.9444,f:1.0409},
  37:{m:2.3805,f:1.0218},38:{m:2.2935,f:1.2077},39:{m:2.5608,f:1.2746},
  40:{m:3.1639,f:1.2941},41:{m:3.2109,f:1.3436},42:{m:3.6103,f:1.5150},
  43:{m:4.1226,f:1.8807},44:{m:4.9154,f:2.1087},45:{m:5.4322,f:2.4594},
  46:{m:6.0691,f:2.6197},47:{m:7.0983,f:2.9067},48:{m:7.5943,f:2.9493},
  49:{m:7.5754,f:3.4800},50:{m:9.2432,f:3.4757},51:{m:9.8708,f:3.8075},
  52:{m:11.0132,f:4.1138},53:{m:12.1581,f:4.7100},54:{m:13.1207,f:5.4055},
  55:{m:13.7477,f:5.8224},56:{m:16.0129,f:5.8155},57:{m:16.4340,f:6.5164},
  58:{m:19.0146,f:7.2625},59:{m:20.7628,f:7.4624},60:{m:21.6724,f:7.7226},
  61:{m:22.9264,f:8.5540},62:{m:25.2898,f:9.3900},63:{m:26.2972,f:10.5458},
  64:{m:28.9558,f:11.5530},65:{m:29.2752,f:12.1736},
};

const getMonthlyMortality = (age) => {
  const a = Math.min(Math.max(Math.floor(age), 0), 65);
  let closest = 0;
  for (const k of Object.keys(MORTALITY_QX).map(Number).sort((a,b)=>a-b)) {
    if (k <= a) closest = k;
  }
  const q = MORTALITY_QX[closest] || MORTALITY_QX[0];
  return (q.m * 0.8 + q.f * 0.2) / 1000 / 12;
};

const getPremiumBonus = (annual) => {
  if (annual < 1200) return 0;
  if (annual < 1800) return 0.01;
  if (annual < 3000) return 0.02;
  if (annual < 4200) return 0.03;
  return 0.04;
};

const getAVCharge = (annual) => {
  if (annual < 720)  return 0.02;
  if (annual < 960)  return 0.0175;
  if (annual < 1200) return 0.015;
  if (annual < 1500) return 0.0125;
  if (annual < 2400) return 0.01;
  return 0.005; // >= 3600 (including 3000-3599 = 0.0075, but 3000 fits here)
};

// Точна AV charge таблица
const getAVChargeExact = (annual) => {
  if (annual < 720)  return 0.02;
  if (annual < 960)  return 0.0175;
  if (annual < 1200) return 0.015;
  if (annual < 1500) return 0.0125;
  if (annual < 2400) return 0.01;
  if (annual < 3600) return 0.0075;
  return 0.005; // >= 3600
};

const projectULFull = (annualSavings, startAge, years, assumedReturn = 0.08, faceAmount = 20000) => {
  if (years <= 0 || annualSavings <= 0) return 0;

  const premiumBonus = getPremiumBonus(annualSavings);
  const avChargeRate = getAVChargeExact(annualSavings);
  const monthlyReturn = assumedReturn / 12;
  const policyFeeMonthly = 15 / 12;

  let accountValue = 0;
  const yearlyData = [];

  for (let year = 1; year <= years; year++) {
    const currentAge = startAge + year - 1;
    const investibleRate = year === 1 ? 0.30 : year === 2 ? 0.60 : 1.00;
    const monthlyPremium = annualSavings / 12;

    for (let month = 1; month <= 12; month++) {
      let investible = monthlyPremium * investibleRate;
      if (year === 1 && month === 1) {
        investible += annualSavings * premiumBonus;
      }
      accountValue += investible;
      accountValue *= (1 + monthlyReturn);
      const avCharge = accountValue * (avChargeRate / 12);
      // Exact MetLife formula: COI = accountValue * (qx/1000/12) * (faceAmount/1000)
      const coi = accountValue * getMonthlyMortality(currentAge) * (faceAmount / 1000);
      accountValue -= (avCharge + coi + policyFeeMonthly);
      accountValue = Math.max(0, accountValue);
    }

    yearlyData.push({
      year,
      age: currentAge + 1,
      accountValue: Math.round(accountValue),
      totalPremiumsPaid: Math.round(annualSavings * year),
      deathBenefit: Math.round(Math.max(faceAmount, accountValue)),
    });
  }

  return { finalValue: Math.round(accountValue), yearlyData };
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { age = 35, annualSavings = 3000, faceAmount = 30000, years = 30, expectedReturn = 0.08 } = await req.json();

    const premiumBonus = getPremiumBonus(annualSavings);
    const avChargeRate = getAVChargeExact(annualSavings);

    const result = projectULFull(annualSavings, age, years, expectedReturn, faceAmount);

    return Response.json({
      params: { age, annualSavings, faceAmount, years, expectedReturn },
      premiumBonus_pct: premiumBonus * 100,
      avCharge_pct: avChargeRate * 100,
      policyFee_annual: 15,
      finalAccountValue: result.finalValue,
      totalPremiumsPaid: annualSavings * years,
      multiplier: (result.finalValue / (annualSavings * years)).toFixed(2),
      yearlyProjection: result.yearlyData,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import React, { useMemo } from 'react';
import { Check, X, Globe, TrendingUp, Building2, Award, Printer } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { EUR_BGN_RATE } from './FinancialPlanConstants';

/**
 * Данни за универсални пенсионни фондове в България
 * Източник: moitepari.bg (актуализирано: 29.04.2025)
 */
export const PENSION_FUNDS_DATA = {
  'ОББ': {
    fullName: 'УПФ "ОББ" ЕАД',
    shortName: 'ОББ',
    origin: 'Белгия (KBC Group)',
    return24m: 6.01,
    returnSince2004: 3.21,
    return5y: 3.38,
    return10y: 1.64,
    stdDeviation2y: 7.63,
    unitValue: 1.93,
    marketShare: 11.25,
    hasOnlineAccess: true,
    onlineUrl: 'https://ubb-pensions.bg',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/UBB_logo.svg/200px-UBB_logo.svg.png',
    advantages: [
      'Част от белгийската KBC Group - един от най-големите финансови конгломерати в Европа',
      'Стабилно управление с фокус върху дългосрочна доходност',
      'Пълен онлайн достъп до партидата',
      'Диверсифициран портфейл с инвестиции в глобални компании',
      'Инвестиции в акции на SAP, Apple, Google, Microsoft, Siemens и др.'
    ]
  },
  'Алианц България': {
    fullName: 'УПФ "Алианц България"',
    shortName: 'Алианц',
    origin: 'Германия',
    return24m: 5.60,
    returnSince2004: 2.58,
    return5y: 3.38,
    return10y: 1.44,
    stdDeviation2y: 7.09,
    unitValue: 1.70,
    marketShare: 19.29,
    hasOnlineAccess: true,
    onlineUrl: 'https://www.allianz.bg',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Allianz_logo.svg/200px-Allianz_logo.svg.png'
  },
  'Бъдеще': {
    fullName: 'УПФ "Бъдеще"',
    shortName: 'Бъдеще',
    origin: 'България',
    return24m: 6.15,
    returnSince2004: 2.72,
    return5y: 2.95,
    return10y: 1.85,
    stdDeviation2y: 9.35,
    unitValue: 1.75,
    marketShare: 2.53,
    hasOnlineAccess: true,
    onlineUrl: null,
    logo: null
  },
  'ДаллБогг': {
    fullName: 'УПФ "ДаллБогг: Живот и Здраве"',
    shortName: 'ДаллБогг',
    origin: 'България',
    return24m: 3.54,
    returnSince2004: null, // Нов фонд
    return5y: null,
    return10y: null,
    stdDeviation2y: 7.01,
    unitValue: 1.06,
    marketShare: 0.20,
    hasOnlineAccess: true,
    onlineUrl: 'https://dallbogg.bg',
    logo: null
  },
  'Доверие': {
    fullName: 'УПФ "Доверие"',
    shortName: 'Доверие',
    origin: 'България',
    return24m: 5.69,
    returnSince2004: 3.08,
    return5y: 2.32,
    return10y: 1.50,
    stdDeviation2y: 6.40,
    unitValue: 1.88,
    marketShare: 25.60,
    hasOnlineAccess: true,
    onlineUrl: 'https://www.poc-doverie.bg',
    logo: null
  },
  'ДСК-Родина': {
    fullName: 'УПФ "ДСК - Родина"',
    shortName: 'ДСК-Родина',
    origin: 'Унгария (OTP Group)',
    return24m: 5.49,
    returnSince2004: 2.92,
    return5y: 1.87,
    return10y: 1.47,
    stdDeviation2y: 7.13,
    unitValue: 1.82,
    marketShare: 20.64,
    hasOnlineAccess: true,
    onlineUrl: 'https://dskrodina.bg',
    logo: null
  },
  'Пенсионноосигурителен институт': {
    fullName: 'УПФ "Пенсионноосигурителен институт"',
    shortName: 'ПОИ',
    origin: 'България',
    return24m: 5.06,
    returnSince2004: 3.45,
    return5y: 2.97,
    return10y: 1.68,
    stdDeviation2y: 6.37,
    unitValue: 1.75,
    marketShare: 1.03,
    hasOnlineAccess: false,
    onlineUrl: null,
    logo: null
  },
  'Съгласие': {
    fullName: 'УПФ "Съгласие"',
    shortName: 'Съгласие',
    origin: 'България',
    return24m: 4.96,
    returnSince2004: 3.78,
    return5y: 2.36,
    return10y: 2.37,
    stdDeviation2y: 5.07,
    unitValue: 2.17,
    marketShare: 8.96,
    hasOnlineAccess: true,
    onlineUrl: 'https://saglasie.bg',
    logo: null
  },
  'Топлина': {
    fullName: 'УПФ "Топлина"',
    shortName: 'Топлина',
    origin: 'България',
    return24m: 8.82,
    returnSince2004: 2.94,
    return5y: 3.80,
    return10y: 2.74,
    stdDeviation2y: 11.78,
    unitValue: 1.69,
    marketShare: 1.38,
    hasOnlineAccess: false,
    onlineUrl: null,
    logo: null
  },
  'ЦКБ-Сила': {
    fullName: 'УПФ "ЦКБ - Сила"',
    shortName: 'ЦКБ-Сила',
    origin: 'България',
    return24m: 3.55,
    returnSince2004: 3.97,
    return5y: 2.29,
    return10y: 2.72,
    stdDeviation2y: 2.94,
    unitValue: 2.22,
    marketShare: 9.08,
    hasOnlineAccess: true,
    onlineUrl: 'https://ckbsila.bg',
    logo: null
  }
};

// Списък с имена на фондовете за dropdown и избор
export const PENSION_FUND_NAMES = Object.keys(PENSION_FUNDS_DATA);

// ОББ е нашият препоръчан фонд
export const RECOMMENDED_FUND = 'ОББ';

/**
 * Компонент за презентация на смяна на пенсионен фонд
 */
export default function PensionFundComparisonOffer({ 
  currentFund, 
  beneficiaryName = 'Клиент',
  beneficiaryType = 'client', // 'client' | 'partner'
  showPrint = true,
  onClose
}) {
  
  const comparison = useMemo(() => {
    if (!currentFund || currentFund === RECOMMENDED_FUND) return null;
    
    const current = PENSION_FUNDS_DATA[currentFund];
    const recommended = PENSION_FUNDS_DATA[RECOMMENDED_FUND];
    
    if (!current || !recommended) return null;
    
    // Изчисляване на разлики
    const return24mDiff = recommended.return24m - (current.return24m || 0);
    const returnSince2004Diff = current.returnSince2004 
      ? recommended.returnSince2004 - current.returnSince2004 
      : null;
    
    // Изчисляване на потенциална разлика при 100 лв депозит от 2002
    const hypothetical100LevGrowth = {
      current: current.unitValue ? Math.round(100 * current.unitValue * 100) / 100 : null,
      recommended: Math.round(100 * recommended.unitValue * 100) / 100
    };
    
    return {
      current,
      recommended,
      return24mDiff,
      returnSince2004Diff,
      hypothetical100LevGrowth,
      isBetterReturn24m: return24mDiff > 0,
      isBetterReturnLongTerm: returnSince2004Diff !== null && returnSince2004Diff > 0,
      hasOnlineAccessAdvantage: recommended.hasOnlineAccess && !current.hasOnlineAccess
    };
  }, [currentFund]);

  const handlePrint = () => {
    window.print();
  };

  if (!comparison) {
    return (
      <div className="p-8 text-center text-slate-500">
        {currentFund === RECOMMENDED_FUND 
          ? `${beneficiaryName} вече е в препоръчания фонд ОББ Пенсионно.`
          : 'Няма данни за сравнение.'}
      </div>
    );
  }

  const { current, recommended } = comparison;

  // Данни за bar chart
  const chartData = [
    { name: 'ЦКБ-Сила', value: 289.93 },
    { name: 'Съгласие', value: 247.82 },
    { name: 'ОББ', value: 218.80, highlight: true },
    { name: 'Доверие', value: 213.37 },
    { name: 'ДСК-Родина', value: 196.17 },
    { name: 'Алианц', value: 180.82 },
    { name: 'Инфлация', value: 225.35, isInflation: true }
  ];

  return (
    <div className="bg-white min-h-[800px] relative font-sans print:p-0">
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .pension-comparison-offer, .pension-comparison-offer * { visibility: visible; }
          .pension-comparison-offer { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            padding: 20px;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="pension-comparison-offer p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-red-800">УНИВЕРСАЛНИ ПЕНСИОННИ ФОНДОВЕ</h1>
          {showPrint && (
            <Button variant="outline" onClick={handlePrint} className="no-print gap-2">
              <Printer className="w-4 h-4" />
              Принтирай
            </Button>
          )}
        </div>

        {/* Main comparison */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Актуален фонд */}
          <div className="border-2 border-slate-300 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-slate-700">Актуален</h2>
              <div className="flex items-center gap-2">
                {current.logo ? (
                  <img src={current.logo} alt={current.shortName} className="h-8" />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
                <span className="font-semibold text-slate-600">{current.fullName}</span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Произход:</span>
                <span className="font-semibold">{current.origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Доходност през последните 24м:</span>
                <span className={`font-bold text-lg ${current.return24m < recommended.return24m ? 'text-red-600' : 'text-green-600'}`}>
                  {current.return24m?.toFixed(2) || 'N/A'}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Доходност от 01.07.2004:</span>
                <span className={`font-bold text-lg ${current.returnSince2004 && current.returnSince2004 < recommended.returnSince2004 ? 'text-red-600' : 'text-green-600'}`}>
                  {current.returnSince2004?.toFixed(2) || 'N/A'}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Онлайн достъп и проверка:</span>
                <span className={`font-bold text-lg ${current.hasOnlineAccess ? 'text-green-600' : 'text-red-600'}`}>
                  {current.hasOnlineAccess ? 'ДА' : 'НЕ'}
                </span>
              </div>
            </div>
          </div>

          {/* Бъдещ фонд - ОББ */}
          <div className="border-2 border-blue-500 rounded-lg p-6 bg-blue-50">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-blue-800">Бъдещ</h2>
              <div className="flex items-center gap-2">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/UBB_logo.svg/200px-UBB_logo.svg.png" 
                  alt="ОББ Пенсионно"
                  className="h-10"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div>
                  <span className="font-semibold text-blue-800">Пенсионно</span>
                  <span className="block text-xs text-blue-600">осигуряване</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Произход:</span>
                <span className="font-semibold text-blue-800">{recommended.origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Доходност през последните 24м:</span>
                <span className="font-bold text-lg text-green-600">
                  {recommended.return24m.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Доходност от 01.07.2004:</span>
                <span className="font-bold text-lg text-green-600">
                  {recommended.returnSince2004.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Онлайн достъп и проверка:</span>
                <span className="font-bold text-lg text-green-600 flex items-center gap-1">
                  <Check className="w-5 h-5" />
                  ДА
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart section */}
        <div className="grid grid-cols-2 gap-8">
          {/* Bar chart */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Всеки 100 лева, внесени в Универсален ПФ на 01.04.2002г. са нараснали към 31.12.2024г., както следва:
            </h3>
            <div className="space-y-2">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-24 text-xs text-right text-slate-600">{item.name}</div>
                  <div className="flex-1 h-6 bg-slate-100 rounded relative">
                    <div 
                      className={`h-full rounded ${
                        item.isInflation ? 'bg-slate-400' : 
                        item.highlight ? 'bg-blue-600' : 'bg-blue-400'
                      }`}
                      style={{ width: `${(item.value / 300) * 100}%` }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold">
                      {item.value.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 mt-2">
              Графиката е изготвена на базата на данни със следните източници: Разпределена доходност за 2002, 2003, 2004 г. и стойността на 1 дял в периода от 01.01.2005 г. - Комисия за финансов надзор
            </p>
          </div>

          {/* Portfolio structure */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Структура на портфейла на ОББ
            </h3>
            <p className="text-[10px] text-slate-500 mb-3">
              Структура на портфейла на Универсален пенсионен фонд ОББ към 30 Юни 2024 г.
            </p>
            
            {/* Simplified pie representation */}
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 via-blue-400 to-slate-300 relative">
                <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center text-xs text-center text-slate-600">
                  Диверсифициран<br/>портфейл
                </div>
              </div>
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span>Акции и дялове на фондове 34.09%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded"></div>
                  <span>Държавни облигации 55.57%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-300 rounded"></div>
                  <span>Корпоративни облигации 4.35%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-200 rounded"></div>
                  <span>Депозити и парични средства 5.99%</span>
                </div>
              </div>
            </div>

            {/* Company logos */}
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2">Инвестиции в компании като:</p>
              <div className="flex flex-wrap gap-2 items-center opacity-70">
                <span className="text-xs font-bold text-blue-700">SAP</span>
                <span className="text-xs font-bold text-red-600">MONBAT</span>
                <span className="text-xs font-bold text-slate-700">Apple Inc.</span>
                <span className="text-xs font-bold text-blue-500">Google</span>
                <span className="text-xs font-bold text-blue-900">SIEMENS</span>
                <span className="text-xs font-bold text-blue-600">intel</span>
                <span className="text-xs font-bold text-green-600">Microsoft</span>
                <span className="text-xs font-bold text-green-700">Bayer</span>
                <span className="text-xs font-bold text-red-700">DANONE</span>
              </div>
            </div>

            {/* Country flags representation */}
            <div className="mt-3">
              <p className="text-xs text-slate-500 mb-1">Географска диверсификация:</p>
              <div className="flex gap-1 text-lg">
                🇧🇬 🇩🇪 🇫🇷 🇬🇧 🇺🇸 🇯🇵 🇨🇭 🇳🇱 🇪🇸 🇮🇹 🇸🇪 🇧🇪 🇦🇹 🇮🇪
              </div>
            </div>
          </div>
        </div>

        {/* Advantages section */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Защо да изберете ОББ Пенсионно?
          </h3>
          <ul className="grid grid-cols-2 gap-2 text-sm text-green-700">
            {recommended.advantages?.map((adv, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Difference highlight */}
        {(comparison.isBetterReturn24m || comparison.isBetterReturnLongTerm) && (
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Потенциална полза от смяната
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {comparison.isBetterReturn24m && (
                <div>
                  <span className="text-amber-700">По-висока доходност за последните 24м:</span>
                  <span className="font-bold text-amber-900 ml-2">+{comparison.return24mDiff.toFixed(2)}%</span>
                </div>
              )}
              {comparison.isBetterReturnLongTerm && (
                <div>
                  <span className="text-amber-700">По-висока дългосрочна доходност:</span>
                  <span className="font-bold text-amber-900 ml-2">+{comparison.returnSince2004Diff.toFixed(2)}%</span>
                </div>
              )}
              {comparison.hasOnlineAccessAdvantage && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-700" />
                  <span className="text-amber-700">Получавате онлайн достъп до партидата си</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500">
          <p>
            * Доходността в миналото не е гаранция за бъдещи резултати. Стойността на дяловете може да се повиши или понижи.
          </p>
          <p className="mt-1">
            Данни към: 29.04.2025 | Източник: moitepari.bg, КФН
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Помощна функция за проверка дали да се покаже офертата за смяна на фонд
 */
export const shouldShowPensionFundOffer = (currentFund) => {
  if (!currentFund) return false;
  if (currentFund === RECOMMENDED_FUND || currentFund === 'ОББ Пенсионно') return false;
  return PENSION_FUNDS_DATA[currentFund] !== undefined;
};

/**
 * Нормализира името на фонда за сравнение
 */
export const normalizeFundName = (fundName) => {
  if (!fundName) return null;
  
  const normalizations = {
    'упф обб': 'ОББ',
    'обб': 'ОББ',
    'обб пенсионно': 'ОББ',
    'алианц': 'Алианц България',
    'алианц българия': 'Алианц България',
    'дск родина': 'ДСК-Родина',
    'дск-родина': 'ДСК-Родина',
    'дск': 'ДСК-Родина',
    'цкб сила': 'ЦКБ-Сила',
    'цкб-сила': 'ЦКБ-Сила',
    'цкб': 'ЦКБ-Сила',
    'доверие': 'Доверие',
    'съгласие': 'Съгласие',
    'бъдеще': 'Бъдеще',
    'топлина': 'Топлина',
    'далбог': 'ДаллБогг',
    'даллбогг': 'ДаллБогг',
    'пои': 'Пенсионноосигурителен институт',
    'пенсионноосигурителен институт': 'Пенсионноосигурителен институт'
  };
  
  const lowerName = fundName.toLowerCase().trim();
  return normalizations[lowerName] || fundName;
};
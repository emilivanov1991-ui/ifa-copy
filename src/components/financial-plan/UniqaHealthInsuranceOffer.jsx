import React from 'react';
import { Printer, Check, Smartphone, Building2, Heart, Stethoscope, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";

/**
 * UNIQA "За нашето здраве" - Допълнително здравно осигуряване
 * Презентация на продукта
 */
export default function UniqaHealthInsuranceOffer({ 
  beneficiaryName = 'Клиент',
  planLevel = 'comfort', // 'standard' | 'comfort' | 'prestige'
  monthlyPremium = 0,
  annualPremium = 0,
  showPrint = true 
}) {
  
  const handlePrint = () => {
    window.print();
  };

  const planLevels = {
    standard: { name: 'СТАНДАРТ', color: 'blue' },
    comfort: { name: 'КОМФОРТ', color: 'blue' },
    prestige: { name: 'ПРЕСТИЖ', color: 'blue' }
  };

  const selectedPlan = planLevels[planLevel] || planLevels.comfort;

  return (
    <div className="bg-white min-h-[700px] relative font-sans print:p-0">
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .uniqa-health-ins-offer, .uniqa-health-ins-offer * { visibility: visible; }
          .uniqa-health-ins-offer { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            padding: 20px;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="uniqa-health-ins-offer p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="bg-gradient-to-r from-red-700 to-red-600 text-white px-6 py-3 rounded-lg">
            <h1 className="text-lg font-bold">Здравна застраховка</h1>
            <h2 className="text-xl font-bold">„УНИКА за нашето здраве"</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* UNIQA Logo */}
            <div className="text-center">
              <div className="text-blue-600 text-3xl font-light mb-1">
                <span className="inline-block border-2 border-blue-600 rounded-full w-10 h-10 leading-[36px]">Q</span>
              </div>
              <div className="text-blue-800 font-bold text-lg tracking-wide">UNIQA</div>
            </div>
            
            {showPrint && (
              <Button variant="outline" onClick={handlePrint} className="no-print gap-2" size="sm">
                <Printer className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Main content - 2 columns */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            {/* Национално Покритие */}
            <div className="border-l-4 border-red-600 bg-slate-50 p-4 rounded-r-lg">
              <h3 className="font-bold text-red-800 mb-2">Национално Покритие</h3>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>2 Възможности за Допълнително Здравно Осигуряване или Частно Здравно Осигуряване</li>
                <li>Индивидуални, семейни или групови планове с</li>
                <li className="font-semibold">3 нива на покритие, СТАНДАРТ, КОМФОРТ и ПРЕСТИЖ</li>
              </ul>
            </div>

            {/* Разнообразен Избор */}
            <div className="border-l-4 border-red-600 bg-slate-50 p-4 rounded-r-lg">
              <h3 className="font-bold text-red-800 mb-2">Разнообразен Избор от Здравни Пакети:</h3>
              <ul className="text-sm text-slate-700 space-y-0.5">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Болнично Лечение
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Извънболнично Лечение
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Физиотерапия и Рехабилитация
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Дентално Лечение
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Медицински Средства
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Телемедицина (UNIQA)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Услуги свързани с битови и други допълнителни условия
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Обезщетение за операции
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Дневни Пари за Болничен Престой
                </li>
              </ul>
            </div>

            {/* Групови договори */}
            <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded-r-lg">
              <p className="text-sm text-amber-800">
                При сключване на групови договори няма отлагателен период при злополука или заболяване, само при бременност (9 месеца)
              </p>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Групови договори - защита */}
            <div className="border-l-4 border-red-600 bg-slate-50 p-4 rounded-r-lg">
              <h3 className="font-bold text-red-800 mb-2">При сключване на групови договори може да се включат и да бъдат защитени, колеги с:</h3>
              <ul className="text-sm text-slate-700 space-y-1">
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Общи заболявания
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Хронични или професионални заболявания
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Последици от Злополуки
                </li>
              </ul>
            </div>

            {/* MedUNIQA */}
            <div className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-r-lg">
              <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Мобилно Предложение MedUNIQA
              </h3>
              <p className="text-sm text-slate-700 mb-2">
                Всеки Клиент със активна застраховка, може да се възползва от следните услуги:
              </p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>3 Онлайн Консултации с Доказани специалисти в областта на: Педиатрия, Урология, Ортопедия, Дерматология, Гастроентерология, Гинеколог, Вътрешни Болести, Очни Болести, Ендокринология, отговор до 6ч в работно време.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Електронна Здравна Карта с вашата здравна история.
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Онлайн достъп до всички разходи и лимити и информация.
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Онлайн процес за възстановяване на разходи
                </li>
              </ul>
            </div>

            {/* Директно разплащане */}
            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
              <h3 className="font-bold text-green-800 mb-2">Директно Разплащане между Уника и Лечебното заведение</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Вие Избирате при кой Доктор и къде да се Лекувате
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Онлайн или по телефон запазване на часове за преглед
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pricing section */}
        {(monthlyPremium > 0 || annualPremium > 0) && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">Вашата оферта за {beneficiaryName}</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-800">{selectedPlan.name}</div>
                <div className="text-sm text-slate-600">ниво на покритие</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-800">
                  {monthlyPremium.toFixed(2)} лв.
                </div>
                <div className="text-sm text-slate-600">месечна премия</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-800">
                  {(annualPremium || monthlyPremium * 12).toFixed(2)} лв.
                </div>
                <div className="text-sm text-slate-600">годишна премия</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500">
          <p>UNIQA Застраховане АД | Здравна застраховка „УНИКА за нашето здраве"</p>
          <p className="mt-1">* Подробна информация за покритията можете да намерите в Общите условия.</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Помощна функция за проверка дали да се покаже UNIQA Health Insurance офертата
 */
export const shouldShowUniqaHealthInsuranceOffer = (productOffers) => {
  if (!productOffers || productOffers.length === 0) return false;
  
  return productOffers.some(offer => 
    (offer.provider === 'UNIQA' && offer.product_type === 'health_insurance') ||
    (offer.product_name && offer.product_name.toLowerCase().includes('за нашето здраве'))
  );
};

/**
 * Извлича данни за UNIQA Health Insurance оферта
 */
export const extractUniqaHealthInsuranceData = (productOffers, beneficiary = 'partner1') => {
  if (!productOffers) return null;
  
  const offer = productOffers.find(o => 
    o.product_type === 'health_insurance' &&
    o.provider === 'UNIQA' &&
    o.beneficiary === beneficiary
  );
  
  if (!offer) return null;
  
  let planLevel = 'comfort';
  if (offer.product_name?.toLowerCase().includes('стандарт')) planLevel = 'standard';
  if (offer.product_name?.toLowerCase().includes('престиж')) planLevel = 'prestige';
  
  return {
    beneficiaryName: offer.beneficiary_name || (beneficiary === 'partner1' ? 'Клиент' : 'Партньор'),
    planLevel,
    monthlyPremium: offer.monthly_premium || 0,
    annualPremium: offer.annual_premium || (offer.monthly_premium || 0) * 12
  };
};
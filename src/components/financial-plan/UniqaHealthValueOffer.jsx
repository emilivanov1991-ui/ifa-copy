import React from 'react';
import { Printer, Check, Shield, Heart, Stethoscope, Plane, Building2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

/**
 * UNIQA "Здраве и Ценност" - Презентация на продукта
 * Международна здравна застраховка за лечение на критични заболявания
 */
export default function UniqaHealthValueOffer({ 
  beneficiaryName = 'Клиент',
  plan = 'europa', // 'europa' | 'world'
  monthlyPremium = 0,
  annualPremium = 0,
  showPrint = true 
}) {
  
  const handlePrint = () => {
    window.print();
  };

  const planDetails = {
    europa: {
      name: 'План Европа',
      coverage: 'Всички страни в Европа (вкл. Турция и Русия)',
      annualLimit: '2 240 000',
      color: 'blue'
    },
    world: {
      name: 'План Свят',
      coverage: 'Целия свят',
      annualLimit: '4 480 000',
      color: 'indigo'
    }
  };

  const selectedPlan = planDetails[plan] || planDetails.europa;

  return (
    <div className="bg-white min-h-[800px] relative font-sans print:p-0">
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .uniqa-health-offer, .uniqa-health-offer * { visibility: visible; }
          .uniqa-health-offer { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            padding: 20px;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="uniqa-health-offer p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            {/* UNIQA Logo */}
            <div className="text-center">
              <div className="text-blue-600 text-4xl font-light mb-1">
                <span className="inline-block border-2 border-blue-600 rounded-full w-12 h-12 leading-[44px]">Q</span>
              </div>
              <div className="text-blue-800 font-bold text-xl tracking-wide">UNIQA</div>
            </div>
            <div className="text-center">
              <h1 className="text-blue-800 font-semibold text-lg">Международна здравна</h1>
              <h2 className="text-blue-800 font-semibold text-lg">застраховка „Здраве и</h2>
              <h2 className="text-blue-800 font-semibold text-lg">Ценност"</h2>
            </div>
          </div>
          
          {showPrint && (
            <Button variant="outline" onClick={handlePrint} className="no-print gap-2">
              <Printer className="w-4 h-4" />
              Принтирай
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left column - Statistics */}
          <div className="space-y-4">
            {/* 85% statistic */}
            <div className="flex items-center gap-4">
              <div className="w-28 h-28 rounded-full bg-blue-600 flex flex-col items-center justify-center text-white">
                <span className="text-3xl font-bold">85%</span>
                <span className="text-xs">255 души на ден</span>
              </div>
              <div className="text-sm text-slate-600 max-w-[200px]">
                са починали от ракови образувания, сърдечно-съдови заболявания и злополуки
              </div>
            </div>

            {/* 87% statistic */}
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-blue-500 flex flex-col items-center justify-center text-white">
                <span className="text-2xl font-bold">87%</span>
                <span className="text-[10px]">от инвалидите 168</span>
                <span className="text-[10px]">души на ден</span>
              </div>
              <div className="text-sm text-slate-600 max-w-[200px]">
                са освидетелствани със степен на нетрудоспособност над 50%
              </div>
            </div>

            {/* Bottom circles */}
            <div className="flex items-end gap-2 mt-6">
              {/* 37 circle */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-blue-400 flex flex-col items-center justify-center text-white">
                  <span className="text-3xl font-bold">37</span>
                </div>
                <div className="text-xs text-blue-600 text-center mt-1 max-w-[100px]">
                  от диагнозите са неточни
                </div>
              </div>
              
              {/* 75% circle */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-green-500 flex flex-col items-center justify-center text-white">
                  <span className="text-4xl font-bold">75%</span>
                </div>
                <div className="text-xs text-green-700 text-center mt-1 max-w-[130px]">
                  от случаите предприетото лечение не е най-доброто
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Benefits */}
          <div className="space-y-3">
            {/* Main benefit box */}
            <div className="bg-blue-600 text-white p-4 rounded-lg">
              <p className="text-sm font-medium">
                Гарантирано най-доброто лечение за Вас лечение на 10 критични заболявания и хирургически операции
              </p>
            </div>

            {/* Coverage items */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                <Heart className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">
                  Разходи за болнично лечение при злокачествени ракови заболявания, доброкачествени туморни образувания на главата, сложни и скъпоструващи операции за лечение на сърдечно-съдови проблеми, трансплантации на органи
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">
                  Разходи за престой на придружаващо лице – при деца до 18 год
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">
                  Дневен стационар - до 24 часа
                </p>
              </div>
            </div>

            {/* Покрития section */}
            <div className="mt-4">
              <h3 className="font-semibold text-blue-800 mb-2">Покрития</h3>
              <ul className="text-sm text-slate-700 space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Стационарно лечение / Дневен болничен престой
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Стоматологично лечение
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Транспорт при необходимост, вкл. хеликоптер
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Амбулаторно лечение
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Рехабилитация и санаториално лечение
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Разходи за спасяване
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Разходи за транспортиране и репатриране
                </li>
              </ul>
            </div>

            {/* Предимства section */}
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Предимства</h3>
              <ul className="text-sm text-green-700 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    При сключване на Международна здравна застраховка „Здраве и Ценност" не е необходим лекарски преглед, а само попълнена декларация от 7 въпроса за здравословното ти състояние
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Plane className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>{selectedPlan.name}</strong> - {selectedPlan.coverage} с годишен лимит над <strong>{selectedPlan.annualLimit} евро</strong> за една застрахователна година
                  </span>
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
                <div className="text-2xl font-bold text-blue-800">
                  {monthlyPremium.toFixed(2)} €
                </div>
                <div className="text-sm text-slate-600">месечна премия</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-800">
                  {(annualPremium || monthlyPremium * 12).toFixed(2)} €
                </div>
                <div className="text-sm text-slate-600">годишна премия</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {selectedPlan.annualLimit} €
                </div>
                <div className="text-sm text-slate-600">годишен лимит</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500">
          <p>
            UNIQA Застраховане АД | Международна здравна застраховка „Здраве и Ценност"
          </p>
          <p className="mt-1">
            * Подробна информация за покритията и изключенията можете да намерите в Общите условия на продукта.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Помощна функция за проверка дали да се покаже UNIQA Health офертата
 */
export const shouldShowUniqaHealthOffer = (productOffers) => {
  if (!productOffers || productOffers.length === 0) return false;
  
  return productOffers.some(offer => 
    offer.product_type === 'critical_illness' || 
    offer.product_type === 'health_insurance' ||
    offer.provider === 'UNIQA' ||
    (offer.product_name && offer.product_name.toLowerCase().includes('здраве и ценност'))
  );
};

/**
 * Извлича данни за UNIQA Health оферта от списък с оферти
 */
export const extractUniqaHealthOfferData = (productOffers, beneficiary = 'partner1') => {
  if (!productOffers) return null;
  
  const offer = productOffers.find(o => 
    (o.product_type === 'critical_illness' || o.product_type === 'health_insurance') &&
    (o.provider === 'UNIQA' || (o.product_name && o.product_name.toLowerCase().includes('здраве'))) &&
    o.beneficiary === beneficiary
  );
  
  if (!offer) return null;
  
  return {
    beneficiaryName: offer.beneficiary_name || (beneficiary === 'partner1' ? 'Клиент' : 'Партньор'),
    plan: offer.product_name?.toLowerCase().includes('свят') ? 'world' : 'europa',
    monthlyPremium: offer.monthly_premium || 0,
    annualPremium: offer.annual_premium || (offer.monthly_premium || 0) * 12
  };
};
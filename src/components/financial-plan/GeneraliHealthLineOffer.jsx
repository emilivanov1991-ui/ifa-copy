import React from 'react';
import { Printer, Check, Building2, Stethoscope, Pill, Heart, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";

/**
 * Generali HEALTH Line - Допълнително здравно осигуряване
 * Презентация на продукта
 */
export default function GeneraliHealthLineOffer({ 
  beneficiaryName = 'Клиент',
  plan = 'basic', // 'basic' | 'plus'
  monthlyPremium = 0,
  annualPremium = 0,
  isInsured = true, // Дали е здравноосигурен в НЗОК
  showPrint = true 
}) {
  
  const handlePrint = () => {
    window.print();
  };

  const planDetails = {
    basic: {
      name: 'HEALTH Line Basic',
      packagePrice: '4 200 лв.',
      hospitalCare: '2 000 лв.',
      outpatientCare: '2 000 лв.',
      reimbursement: '200 лв.',
      color: 'red'
    },
    plus: {
      name: 'HEALTH Line Plus',
      packagePrice: '10 200 лв.',
      hospitalCare: '8 000 лв.',
      outpatientCare: '2 000 лв.',
      reimbursement: '200 лв.',
      color: 'red'
    }
  };

  const selectedPlan = planDetails[plan] || planDetails.basic;

  // Покрития за болнична помощ
  const hospitalCoverages = [
    'Прием и настаняване на болен',
    'В стая с VIP условия',
    'Престой в болница - Вътрешни болести, Гастроентерология, Кардиология, Пулмология, Ендокринология, Нефрология, Неврология, УНГ, Офталмология, Хирургия, Урология, Ортопедия, МГ, Родилно, Физиотерапевтично, Педиатрично, Хематологично, Ревматологично, Алергологично, Дерматология, отделения за домашен и продължителен лечение',
    'Преглед, изследвания и назначение на лечение от Дежурен и лекуващ лекар, визитации от завеждащи отделение',
    'Избор на екип, при лечение по НЗОК',
    'Консултации със специалисти от отделенията и клиники на самото лечебно заведение',
    'Медицински изследвания в стационара - Хематологични, биохимични, микробиологични, цитологични, имунологични, вирусологични',
    'Хормонални изследвания и туморни маркери',
    'Функционални изследвания',
    'Образна диагностика - рентгенови изследвания, компютърна томография, ядрено-магнитен резонанс, ангиографски изследвания, радио-изотопни изследвания, коронарография',
    'Консервативно лечение - медикаментозно, физиотерапия',
    'Оперативно лечение - предоперативна подготовка, сложност на извършена операция, имплантни и консумативи'
  ];

  // Покрития за извънболнична помощ
  const outpatientCoverages = [
    'Консултация на болен с други специалисти',
    'От хабилитирано лице - по избор',
    'Хематологични, Микробиологични изследвания с антибиограма, Химия, глюкоза, Цитологични, Хистологични, Ензими, Серология, Хормонални изследвания и Туморни маркери, Изследване на урина',
    'Клинико-инструментални изследвания',
    'Образна диагностика - КТ, ЯМР, ехографски изследвания на сърце, коремни органи, флуорескентна ангиография',
    'Функционални изследвания - Електрокардиограма, Холтер мониториране на ЕКГ и АН, биопсия/цитологична, ЕМГ, ЕЕГ, ЕМГ, ФИД, Аудиометрия, Периметрия',
    'Ендоскопски изследвания - Гастроскопия, Колоноскопия, вкл. обработка, бронхоскопия',
    'Остеоденситометрия',
    'Манипулации и извънболнични условия - Поставяне на подкожни, мускулни и венозни инжекции, Венозна вливания, Обработка и превръзка на рана, Сваляне на конец след оперативна интервенция',
    'Лечение в извънболнични условия'
  ];

  return (
    <div className="bg-white min-h-[900px] relative font-sans print:p-0 text-xs">
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .generali-health-offer, .generali-health-offer * { visibility: visible; }
          .generali-health-offer { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            padding: 15px;
            font-size: 9px;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="generali-health-offer p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="bg-gradient-to-r from-red-700 to-red-600 text-white px-6 py-3 rounded-lg">
            <h1 className="text-lg font-bold">Допълнително здравно осигуряване</h1>
            <h2 className="text-xl font-bold">„ДЖЕНЕРАЛИ HEALTH LINE"</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Generali Logo */}
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/1a98c2c51_image.png" 
              alt="Generali" 
              className="h-16"
            />
            
            {showPrint && (
              <Button variant="outline" onClick={handlePrint} className="no-print gap-2" size="sm">
                <Printer className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Left column - Застрахователен пакет */}
          <div className="space-y-3">
            {/* Package header */}
            <div className="border border-red-300 rounded overflow-hidden">
              <div className="bg-red-100 p-2">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr>
                      <th className="text-left text-red-800 font-bold">ЗАСТРАХОВАТЕЛЕН ПАКЕТ<br/>HEALTH Line</th>
                      <th className="text-center text-red-700">Basic<br/>4 200 лв.</th>
                      <th className="text-center text-red-700">Plus<br/>10 200 лв.</th>
                    </tr>
                  </thead>
                </table>
              </div>
              
              {/* Болнична помощ */}
              <div className="p-2 bg-red-50">
                <div className="font-bold text-red-800 mb-1">Болнична помощ</div>
                <table className="w-full text-[9px]">
                  <tbody>
                    <tr className="border-b border-red-100">
                      <td className="py-0.5">Basic</td>
                      <td className="text-center">2 000 лв.</td>
                      <td className="text-center">8 000 лв.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Detailed coverages */}
              <div className="p-2 text-[9px] space-y-1 max-h-[400px] overflow-y-auto">
                <div className="font-semibold text-red-700">Прием и настаняване на болен</div>
                <div className="pl-2 text-slate-600">В стая с VIP условия: 200 лв. / 500 лв.</div>
                
                <div className="font-semibold text-red-700 mt-2">Престой в болница</div>
                <div className="pl-2 text-slate-600 text-[8px]">
                  Вътрешни болести, Гастроентерология, Кардиология, Пулмология, Ендокринология, Нефрология, Неврология, УНГ, Офталмология, Хирургия, Урология, Ортопедия...
                </div>

                <div className="font-semibold text-red-700 mt-2">Преглед и назначение на лечение</div>
                <div className="pl-2 text-slate-600">от Дежурен и лекуващ лекар</div>

                <div className="font-semibold text-red-700 mt-2">Избор на екип</div>
                <div className="pl-2 text-slate-600">НЕ / 900 лв.</div>

                <div className="font-semibold text-red-700 mt-2">Медицински изследвания</div>
                <div className="pl-2 text-slate-600">Хематологични, биохимични, микробиологични...</div>

                <div className="font-semibold text-red-700 mt-2">Образна диагностика</div>
                <div className="pl-2 text-slate-600">Рентген, КТ, ЯМР, ангиография, коронарография</div>

                <div className="font-semibold text-red-700 mt-2">Оперативно лечение</div>
                <div className="pl-2 text-slate-600">Сложност на операция, имплантни: НЕ / 250-500 лв.</div>
              </div>
            </div>
          </div>

          {/* Middle column - Извънболнична помощ */}
          <div className="space-y-3">
            <div className="border border-red-300 rounded overflow-hidden">
              <div className="bg-red-100 p-2">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr>
                      <th className="text-left text-red-800 font-bold">Извънболнична помощ</th>
                      <th className="text-center text-red-700">Basic<br/>2 000 лв.</th>
                      <th className="text-center text-red-700">Plus<br/>2 000 лв.</th>
                    </tr>
                  </thead>
                </table>
              </div>

              <div className="p-2 text-[9px] space-y-1 max-h-[400px] overflow-y-auto">
                <div className="font-semibold text-red-700">Прегледи при специалисти</div>
                <div className="pl-2 text-slate-600">Първични и вторични</div>
                
                <div className="font-semibold text-red-700 mt-2">От специалист</div>
                <div className="pl-2 text-slate-600">с други специалисти</div>

                <div className="font-semibold text-red-700 mt-2">От хабилитирано лице</div>
                <div className="pl-2 text-slate-600">по избор</div>

                <div className="font-semibold text-red-700 mt-2">Лабораторни изследвания</div>
                <div className="pl-2 text-slate-600">Хематологични, Микробиологични с антибиограма, Химия, глюкоза, Цитологични...</div>

                <div className="font-semibold text-red-700 mt-2">Клинико-инструментални</div>
                <div className="pl-2 text-slate-600">Plus: 1000 лв.</div>

                <div className="font-semibold text-red-700 mt-2">Образна диагностика</div>
                <div className="pl-2 text-slate-600">КТ, ЯМР, ехографски изследвания</div>

                <div className="font-semibold text-red-700 mt-2">Функционални изследвания</div>
                <div className="pl-2 text-slate-600">ЕКГ, Холтер, ЕМГ, ЕЕГ, ФИД, Аудиометрия</div>

                <div className="font-semibold text-red-700 mt-2">Ендоскопски изследвания</div>
                <div className="pl-2 text-slate-600">Гастроскопия, Колоноскопия, бронхоскопия</div>

                <div className="font-semibold text-red-700 mt-2">Манипулации</div>
                <div className="pl-2 text-slate-600">Инжекции, вливания, превръзки</div>

                <div className="font-semibold text-red-700 mt-2">Лечение в извънболнични условия</div>
                <div className="pl-2 text-slate-600">300 лв. / 500 лв.</div>
              </div>

              {/* Възстановяване на разходи */}
              <div className="bg-amber-50 p-2 border-t border-amber-200">
                <div className="font-bold text-amber-800 text-[10px]">Възстановяване на разходи с 20% самоучастие</div>
                <table className="w-full text-[9px] mt-1">
                  <tbody>
                    <tr>
                      <td>Лекарствени средства, вкл. витамини и минерали</td>
                      <td className="text-center">Basic<br/>200 лв.</td>
                      <td className="text-center">Plus<br/>200 лв.</td>
                    </tr>
                    <tr>
                      <td>Слухови апарати, очила за корекция на зрението</td>
                      <td className="text-center">подлимит-<br/>50 лв.</td>
                      <td className="text-center">подлимит-<br/>50 лв.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right column - Нива на покритие & Застрахователно покритие */}
          <div className="space-y-3">
            {/* Нива на покритие */}
            <div className="border border-slate-300 rounded overflow-hidden">
              <div className="bg-slate-100 p-2">
                <h3 className="font-bold text-slate-800 text-sm">НИВА НА ПОКРИТИЕ</h3>
              </div>
              <div className="p-2">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-1"></th>
                      <th className="text-center text-red-700 py-1">HEALTH Line<br/>Basic</th>
                      <th className="text-center text-red-700 py-1">HEALTH Line<br/>Plus</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5">Болнично лечение</td>
                      <td className="text-center font-semibold">2 000 лв.</td>
                      <td className="text-center font-semibold">8 000 лв.</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5">Извънболнично лечение</td>
                      <td className="text-center font-semibold">2 000 лв.</td>
                      <td className="text-center font-semibold">2 000 лв.</td>
                    </tr>
                    <tr>
                      <td className="py-1.5">Възстановяване на разходи с 20% самоучастие</td>
                      <td className="text-center font-semibold">200 лв.</td>
                      <td className="text-center font-semibold">200 лв.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Застрахователно покритие */}
            <div className="border border-slate-300 rounded overflow-hidden">
              <div className="bg-slate-100 p-2">
                <h3 className="font-bold text-slate-800 text-sm">ЗАСТРАХОВАТЕЛНО ПОКРИТИЕ</h3>
              </div>
              <div className="p-2 text-[9px] space-y-2">
                <div>
                  <span className="font-bold text-red-700">HEALTH Line Basic</span>
                </div>
                <p className="text-slate-700">
                  <strong>Болнична помощ:</strong> прием и настаняване на болен, преглед, изследвания – лабораторни и инструментални, образна диагностика, назначаване на лечение, консултации със специалисти, манипулации, изследвания, операции, консумативи и имплантни.
                </p>
                <p className="text-slate-700">
                  <strong>Извънболнична помощ:</strong> прегледи при специалисти - първични и вторични, консултации, лабораторни и инструментални изследвания, образна диагностика, функционални изследвания, ендоскопски изследвания, остеоденситометрия, манипулации и физиотерапия;
                </p>
                <p className="text-slate-700">
                  <strong>Възстановяване на разходи:</strong> медикаменти, слухови апарати, очила за корекция на зрението /2 стъкла без рамки/ или контактни лещи за корекция на зрението;
                </p>
                
                <div className="mt-3 pt-2 border-t border-slate-200">
                  <span className="font-bold text-red-700">HEALTH Line Plus</span>
                </div>
                <p className="text-slate-700">
                  <strong>HEALTH Line Basic</strong> + Избор на екип, операции с голяма сложност и високоспециализирана хирургия, консултации с хабилитирани лица при болнично лечение, физиотерапия при болнично лечение и имплантни от заболяване.
                </p>
              </div>
            </div>

            {/* Pricing for selected plan */}
            {(monthlyPremium > 0 || annualPremium > 0) && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2 text-sm">Вашата оферта за {beneficiaryName}</h3>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-800">
                    {annualPremium.toFixed(2)} лв.
                  </div>
                  <div className="text-[10px] text-slate-600">годишна премия ({selectedPlan.name})</div>
                  {!isInsured && (
                    <div className="text-[9px] text-amber-600 mt-1">
                      * Цена за лица без здравна осигуровка в НЗОК
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 border-t border-slate-200 text-[9px] text-slate-500">
          <p>
            Дженерали Застраховане АД | Допълнително здравно осигуряване „HEALTH Line"
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
 * Помощна функция за проверка дали да се покаже Generali Health офертата
 */
export const shouldShowGeneraliHealthOffer = (productOffers) => {
  if (!productOffers || productOffers.length === 0) return false;
  
  return productOffers.some(offer => 
    offer.provider === 'Generali' ||
    (offer.product_name && offer.product_name.toLowerCase().includes('health line')) ||
    (offer.product_type === 'health_insurance' && offer.provider?.toLowerCase().includes('generali'))
  );
};

/**
 * Извлича данни за Generali Health оферта от списък с оферти
 */
export const extractGeneraliHealthOfferData = (productOffers, beneficiary = 'partner1') => {
  if (!productOffers) return null;
  
  const offer = productOffers.find(o => 
    (o.product_type === 'health_insurance') &&
    (o.provider === 'Generali' || (o.product_name && o.product_name.toLowerCase().includes('health line'))) &&
    o.beneficiary === beneficiary
  );
  
  if (!offer) return null;
  
  return {
    beneficiaryName: offer.beneficiary_name || (beneficiary === 'partner1' ? 'Клиент' : 'Партньор'),
    plan: offer.product_name?.toLowerCase().includes('plus') ? 'plus' : 'basic',
    monthlyPremium: offer.monthly_premium || 0,
    annualPremium: offer.annual_premium || (offer.monthly_premium || 0) * 12,
    isInsured: true // По подразбиране приемаме, че е здравноосигурен
  };
};
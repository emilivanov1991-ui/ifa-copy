import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// MetLife Style Offer
export function MetLifeOfferPage({ offer, analysis, consultant }) {
  const projectionData = generateProjection(offer);
  
  return (
    <div className="bg-white min-h-[1100px] p-6 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-green-500">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Индивидуална</h1>
          <h2 className="text-lg text-slate-600">застрахователна оферта</h2>
        </div>
        <div className="text-2xl font-bold text-green-600">MetLife</div>
      </div>

      {/* Client Info */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
        <div>
          <span className="text-slate-500">Застраховано лице:</span>
          <span className="ml-2 font-semibold">{offer.beneficiary_name}</span>
        </div>
        <div>
          <span className="text-slate-500">Възраст:</span>
          <span className="ml-2 font-semibold">{offer.beneficiary_age} г.</span>
        </div>
        <div>
          <span className="text-slate-500">Рисков Клас:</span>
          <span className="ml-2 font-semibold">{offer.risk_class || 1}</span>
        </div>
      </div>

      {/* Savings Program Header */}
      <div className="bg-blue-600 text-white p-3 rounded-t-lg text-center font-bold">
        СПЕСТОВНА ПРОГРАМА
      </div>

      {/* Main Features */}
      <div className="border border-slate-200 mb-4">
        <div className="grid grid-cols-2">
          <div className="p-3 bg-blue-50 font-semibold border-r">Основни характеристики</div>
          <div className="p-3 bg-blue-50 font-semibold">Инвестиционни фондове</div>
        </div>
        <div className="grid grid-cols-2 border-t">
          <div className="p-2 border-r">
            <div className="flex justify-between py-1 border-b">
              <span>Годишна спестовна вноска</span>
              <span className="font-semibold text-blue-600">{(offer.annual_premium || 0).toLocaleString()} €</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>Полугодишна спестовна вноска</span>
              <span className="font-semibold">{((offer.annual_premium || 0) / 2).toLocaleString()} €</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>Интегрирано покритие Живот</span>
              <span className="font-semibold">{(offer.coverage_amount || 0).toLocaleString()} €</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Премиен бонус</span>
              <span className="font-semibold">1%</span>
            </div>
          </div>
          <div className="p-2">
            <div className="flex justify-between py-1 border-b">
              <span>Световни акции</span>
              <span className="font-semibold">50%</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>Акции развиващи се пазари</span>
              <span className="font-semibold">50%</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>Световни ценни книжа</span>
              <span className="font-semibold">0%</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Средна годишна доходност</span>
              <span className="font-semibold text-green-600">8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Coverages */}
      <div className="bg-orange-500 text-white p-3 text-center font-bold">
        ДОПЪЛНИТЕЛНИ ЗАСТРАХОВАТЕЛНИ ПОКРИТИЯ И ОБЕЗЩЕТЕНИЯ
      </div>
      <table className="w-full border border-slate-200 mb-4 text-xs">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-2 text-left border-r">Застрахователно покритие</th>
            <th className="p-2 text-center border-r">Обезщетение</th>
            <th className="p-2 text-center">Цена</th>
          </tr>
        </thead>
        <tbody>
          {[
            { name: 'Загуба на живот', coverage: offer.coverage_amount, price: 0 },
            { name: 'Загуба на живот при злополука', coverage: 0, price: 0 },
            { name: 'Трайна загуба на работоспособност над 50%', coverage: 0, price: 0 },
            { name: 'Диагностициране на 32 Тежки Заболявания', coverage: 0, price: 0 },
            { name: 'Телемедицина', coverage: 'Включено', price: 0 },
          ].map((item, i) => (
            <tr key={i} className="border-t">
              <td className="p-2 border-r">{item.name}</td>
              <td className="p-2 text-center border-r">
                {typeof item.coverage === 'number' ? `${item.coverage.toLocaleString()} €` : item.coverage}
              </td>
              <td className="p-2 text-center">{item.price.toLocaleString()} €</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Projection Chart */}
      {projectionData.length > 0 && (
        <>
          <div className="bg-green-600 text-white p-3 text-center font-bold">
            ПРОЕКЦИЯ ЗА РАЗВИТИЕТО НА КЛИЕНТСКА СМЕТКА
          </div>
          <div className="h-48 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => `${v.toLocaleString()} €`} />
                <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="invested" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Price Summary */}
      <div className="bg-green-600 text-white p-3 text-center font-bold">
        ЦЕНА И НАЧИН НА ПЛАЩАНЕ
      </div>
      <div className="border border-slate-200 mb-4">
        <div className="flex justify-between p-2 border-b">
          <span>Обща нетна сума за спестяване</span>
          <span className="font-semibold">{(offer.annual_premium || 0).toLocaleString()} € годишно</span>
        </div>
        <div className="flex justify-between p-2 border-b">
          <span>Административна такса</span>
          <span className="font-semibold">15,00 € годишно</span>
        </div>
        <div className="flex justify-between p-2 border-b bg-blue-50">
          <span className="font-semibold">Годишно плащане</span>
          <span className="font-semibold text-blue-600">{((offer.annual_premium || 0) + 15).toLocaleString()} € годишно</span>
        </div>
        <div className="flex justify-between p-2">
          <span>Полугодишно плащане</span>
          <span className="font-semibold">{(((offer.annual_premium || 0) + 15) / 2).toLocaleString()} € на полугодие</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t text-xs text-slate-500">
        <p>• Всички застрахователни покрития са валидни 24 часа в денонощието, 7 дни в седмицата.</p>
        <p>• Всички застрахователни покрития са валидни в цял свят.</p>
      </div>

      {/* Consultant */}
      <div className="mt-6 text-right text-sm">
        <p className="font-semibold text-blue-600">{consultant?.name}</p>
        <p className="text-slate-600">Личен Финансов Консултант</p>
        <p className="text-slate-500">{consultant?.phone}</p>
        <p className="text-blue-600">{consultant?.email}</p>
      </div>
    </div>
  );
}

// UNIQA Style Offer
export function UNIQAOfferPage({ offer, analysis }) {
  return (
    <div className="bg-white min-h-[1100px] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="border-2 border-slate-300 p-4">
          <h1 className="text-lg font-bold text-slate-800">Здравна застраховка</h1>
          <h2 className="text-blue-600">„УНИКА за нашето здраве"</h2>
        </div>
        <div className="text-2xl font-bold text-blue-700">UNIQA</div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-600 text-white p-4 rounded-lg">
          <h3 className="font-bold mb-2">Национално Покритие</h3>
          <ul className="text-sm space-y-1">
            <li>• 2 Възможности за Допълнително Здравно Осигуряване</li>
            <li>• Индивидуални, семейни или групови планове</li>
            <li>• 3 нива на покритие: СТАНДАРТ, КОМФОРТ и ПРЕСТИЖ</li>
          </ul>
        </div>
        <div className="bg-blue-600 text-white p-4 rounded-lg">
          <h3 className="font-bold mb-2">При сключване на групови договори:</h3>
          <ul className="text-sm space-y-1">
            <li>• Общи заболявания</li>
            <li>• Хронични или професионални заболявания</li>
            <li>• Последици от Злополуки</li>
          </ul>
        </div>
      </div>

      {/* Health Packages */}
      <div className="border-l-4 border-blue-600 bg-slate-50 p-4 mb-6">
        <h3 className="font-bold text-blue-600 mb-2">Разнообразен Избор от Здравни Пакети:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <ul className="space-y-1">
            <li>• Болнично Лечение</li>
            <li>• Извънболнично Лечение</li>
            <li>• Физиотерапия и Рехабилитация</li>
            <li>• Дентално Лечение</li>
          </ul>
          <ul className="space-y-1">
            <li>• Медицински Средства</li>
            <li>• Телемедицина (UNIQA)</li>
            <li>• Обезщетение за операции</li>
            <li>• Дневни Пари за Болничен Престой</li>
          </ul>
        </div>
      </div>

      {/* Mobile App */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-blue-600 mb-2">Мобилно Предложение MedUNIQA</h3>
        <p className="text-sm text-slate-600">
          Всеки Клиент със активна застраховка може да се възползва от следните услуги:
        </p>
        <ul className="text-sm mt-2 space-y-1">
          <li>• 3 Онлайн Консултации с Доказани специалисти</li>
          <li>• Електронна Здравна Карта с вашата здравна история</li>
          <li>• Онлайн достъп до всички разходи и лимити</li>
        </ul>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { value: '85%', label: 'са починали от ракови образувания' },
          { value: '87%', label: 'от инвалидите' },
          { value: '37%', label: 'от диагнозите са неточни' },
          { value: '75%', label: 'от случаите лечението не е най-доброто' },
        ].map((stat, i) => (
          <div key={i} className="bg-gradient-to-br from-blue-500 to-green-500 text-white p-4 rounded-lg text-center">
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Premium */}
      <div className="bg-blue-600 text-white p-4 rounded-lg text-center">
        <p className="text-sm">Месечна премия</p>
        <p className="text-3xl font-bold">{(offer.monthly_premium || 0).toLocaleString()} €</p>
        <p className="text-sm opacity-80">({(offer.annual_premium || 0).toLocaleString()} € годишно)</p>
      </div>
    </div>
  );
}

// Generali Style Offer  
export function GeneraliOfferPage({ offer }) {
  return (
    <div className="bg-white min-h-[1100px] p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-red-600">
        <div className="border-2 border-slate-300 p-3 bg-slate-50">
          <p className="text-sm text-slate-600">Допълнително здравно осигуряване</p>
          <h1 className="text-lg font-bold text-red-700">„ДЖЕНЕРАЛИ HEALTH LINE"</h1>
        </div>
        <div className="text-2xl font-bold text-red-700">GENERALI</div>
      </div>

      {/* Coverage Table */}
      <div className="mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-red-600 text-white">
              <th className="p-2 text-left">ЗАСТРАХОВАТЕЛЕН ПАКЕТ</th>
              <th className="p-2 text-center">Basic</th>
              <th className="p-2 text-center">Plus</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2 font-semibold text-red-700">Болнична помощ</td>
              <td className="p-2 text-center">2 000 лв.</td>
              <td className="p-2 text-center">8 000 лв.</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Извънболнично лечение</td>
              <td className="p-2 text-center">2 000 лв.</td>
              <td className="p-2 text-center">2 000 лв.</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Възстановяване на разходи с 20% самоучастие</td>
              <td className="p-2 text-center">200 лв.</td>
              <td className="p-2 text-center">200 лв.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Coverage Details */}
      <div className="bg-slate-50 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-red-700 mb-3">ЗАСТРАХОВАТЕЛНО ПОКРИТИЕ</h3>
        <div className="space-y-2 text-sm">
          <p><strong>HEALTH Line Basic</strong></p>
          <p className="text-slate-600">
            Болнична помощ: прием и настаняване на болен, преглед, изследвания – лабораторни и 
            инструментални, образна диагностика, назначаване на лечение, консултации със 
            специалисти, манипулации, изследвания, операции, консумативи и импланти.
          </p>
          <p className="mt-4"><strong>HEALTH Line Plus</strong></p>
          <p className="text-slate-600">
            Избор на метод на лечение, операция с голяма сложност, високоспециализирана хирургия, 
            консултации с хабилитирани лица при болнично лечение, физиотерапия при болнично лечение.
          </p>
        </div>
      </div>

      {/* Price */}
      <div className="bg-red-600 text-white p-4 rounded-lg text-center">
        <p className="text-sm">Месечна премия</p>
        <p className="text-3xl font-bold">{(offer.monthly_premium || 0).toLocaleString()} €</p>
      </div>
    </div>
  );
}

// Helper function to generate projection data
function generateProjection(offer) {
  if (!offer.term_years || !offer.annual_premium) return [];
  
  const data = [];
  const rate = 0.08; // 8% annual return
  let invested = 0;
  let value = 0;
  
  for (let year = 1; year <= offer.term_years; year++) {
    invested += offer.annual_premium;
    value = (value + offer.annual_premium) * (1 + rate);
    data.push({
      year,
      invested: Math.round(invested),
      value: Math.round(value)
    });
  }
  
  return data;
}

export default function ProductOfferPDF({ offer, analysis, consultant }) {
  // Select appropriate template based on provider
  switch (offer.provider) {
    case 'MetLife':
      return <MetLifeOfferPage offer={offer} analysis={analysis} consultant={consultant} />;
    case 'UNIQA':
      return <UNIQAOfferPage offer={offer} analysis={analysis} />;
    case 'Generali':
      return <GeneraliOfferPage offer={offer} />;
    default:
      return <MetLifeOfferPage offer={offer} analysis={analysis} consultant={consultant} />;
  }
}
import React from 'react';
import UniversalProductCalculator from '../components/products/UniversalProductCalculator';

export default function ProductConfigDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Универсална Продуктова Система
          </h1>
          <p className="text-slate-600">
            Пример: ДЗИ Закрила (конфигуриран през JSON)
          </p>
        </div>

        <UniversalProductCalculator 
          productId="dzi-zakrila"
          initialInputs={{
            age: 35,
            gender: 'male',
            sum: 50000,
            term: 20,
            isSmoker: false
          }}
        />

        <div className="mt-12 bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Как работи системата:</h3>
          <ol className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">1.</span>
              <span>
                <strong>JSON конфигурация</strong> - Всеки продукт е описан като JSON файл с тарифи, правила и параметри
                (<code className="bg-slate-100 px-1 rounded">components/products/configs/dzi-zakrila.json</code>)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">2.</span>
              <span>
                <strong>Calculation Engine</strong> - Универсален engine чете JSON-а и изчислява премията
                (<code className="bg-slate-100 px-1 rounded">ProductConfigEngine.jsx</code>)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">3.</span>
              <span>
                <strong>Universal Calculator</strong> - Един компонент работи за всички продукти
                (<code className="bg-slate-100 px-1 rounded">UniversalProductCalculator.jsx</code>)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">4.</span>
              <span>
                <strong>Добавяне на продукт</strong> - Копирай template, попълни тарифи → готово за 5 минути!
              </span>
            </li>
          </ol>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Следваща стъпка:</strong> Прегледай <code className="bg-white px-2 py-0.5 rounded">PRODUCT_CONFIG_TEMPLATE.md</code> 
              {' '}и изпрати тарифи за 2-3 продукта - аз ги конфигурирам веднага!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
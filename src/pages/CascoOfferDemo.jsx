import React from 'react';
import DZICascoCalculator from '@/components/financial-plan/DZICascoCalculator';

export default function CascoOfferDemo() {
  // Примерни данни: Toyota Corolla 2020 / 45000 лв.
  const carData = {
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    valueBGN: 45000,
    hasCasco: false,
    cascoExpiry: null
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Примерна оферта за ДЗИ Каско+
          </h1>
          <p className="text-slate-600">
            Toyota Corolla 2020 / 45 000 лв.
          </p>
        </div>

        <DZICascoCalculator carData={carData} showDetailed={true} />

        <div className="mt-8 bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Детайли на изчислението:</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• <strong>Възрастова група:</strong> 3-5 години (2025 - 2020 = 5г.)</li>
            <li>• <strong>Стойностен праг:</strong> до 50 000 лв.</li>
            <li>• <strong>Тарифен процент:</strong> 6.00% (Пълно каско за 3-5г., до 50000лв.)</li>
            <li>• <strong>Основна премия:</strong> 45 000 × 6.00% = 2 700 лв.</li>
            <li>• <strong>Помощ на пътя Премиум:</strong> +20 лв.</li>
            <li>• <strong>Доверен сервиз:</strong> включено (мин. 490 лв. се покрива)</li>
            <li>• <strong>Общо годишна премия:</strong> 2 720 лв.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
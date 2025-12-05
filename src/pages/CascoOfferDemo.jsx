import React from 'react';
import DZICascoCalculator, { calculateDZICascoOffer } from '@/components/financial-plan/DZICascoCalculator';
import DZICascoOfferPDF from '@/components/financial-plan/DZICascoOfferPDF';

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

  // Изчисляване на офертата
  const offer = calculateDZICascoOffer(carData);

  // Данни за PDF офертата
  const pdfData = {
    // Клиент
    clientName: 'ИВАН ПЕТРОВ ИВАНОВ',
    clientBirthDate: '1985-06-15',
    
    // МПС
    regNumber: 'СА1234КМ',
    vin: 'JTDKN3DU5A0123456',
    vehicleType: 'Лек автомобил',
    brand: carData.brand,
    model: carData.model,
    year: carData.year,
    firstRegDate: '2020-03-15',
    purpose: 'Лично ползване',
    rightHandDrive: 'Не',
    
    // Застраховка
    insuranceClause: 'КЛАУЗА ПЪЛНО КАСКО',
    additionalAgreements: 'ДОВЕРЕН СЕРВИЗ',
    insuranceSum: carData.valueBGN,
    roadsideAssistance: 'Клаузи "Премиум и Чужбина"',
    term: '12 месеца',
    paymentMethod: 'Еднократно',
    
    // Премии
    cascoPremium: offer.eligible ? offer.pricing.basePremium : 0,
    roadsidePremium: 20.00,
    
    // Отстъпки
    discounts: [
      'Бонус-Малус стъпало',
      'Валидна застраховка "ГО"',
      'Еднократно плащане'
    ],
    
    // Агенция
    agencyName: 'APEX FINANCIAL ADVISORS',
    agencyCode: '12345678'
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

        {/* PDF Генератор */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Генериране на официална оферта (PDF)</h3>
          <DZICascoOfferPDF offerData={pdfData} />
        </div>

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
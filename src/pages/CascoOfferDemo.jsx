import React, { useMemo } from 'react';
import DZICascoCalculator, { calculateDZICascoOffer } from '@/components/financial-plan/DZICascoCalculator';
import DZICascoOfferPDF from '@/components/financial-plan/DZICascoOfferPDF';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  const offer = useMemo(() => calculateDZICascoOffer(carData), []);

  // Данни за PDF офертата
  const pdfOfferData = useMemo(() => {
    if (!offer.eligible) return null;
    
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 1);
    
    return {
      // Клиент
      clientName: 'ИВАН ПЕТРОВ ИВАНОВ',
      clientBirthdate: '1985-06-15',
      
      // МПС
      regNumber: 'СА1234КМ',
      vinNumber: 'JTDKN3DU5A0123456',
      vehicleType: 'Лек автомобил',
      brand: carData.brand.toUpperCase(),
      model: carData.model.toUpperCase(),
      productionYear: carData.year,
      firstRegDate: `${carData.year}-03-15`,
      purpose: 'Лично ползване',
      rightHandDrive: 'Не',
      
      // Застраховка
      clauseType: 'КЛАУЗА ПЪЛНО КАСКО',
      additionalAgreements: 'ДОВЕРЕН СЕРВИЗ',
      insuranceSum: offer.carInfo.valueBGN,
      
      // Помощ на пътя
      roadsideAssistance: 'Клаузи "Премиум и Чужбина"',
      
      // Срокове
      insuranceTerm: '12 месеца',
      startDate: new Date(),
      paymentMethod: 'Еднократно',
      
      // Премии
      cascoPremium: offer.pricing.basePremium,
      roadsidePremium: offer.pricing.roadsidePremium,
      
      // Отстъпки
      discounts: ['Бонус-Малус стъпало', 'Валидна застраховка "ГО"', 'Еднократно плащане'],
      
      // Валидност
      validUntil: validUntil
    };
  }, [offer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Примерна оферта за ДЗИ Каско+
          </h1>
          <p className="text-slate-600">
            Toyota Corolla 2020 / 45 000 лв.
          </p>
        </div>

        {/* Калкулирана оферта */}
        <DZICascoCalculator carData={carData} showDetailed={true} />

        {/* PDF Генератор */}
        {pdfOfferData && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Генериране на официална оферта</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Генерирайте PDF документ с офертата във формата на ДЗИ за изпращане на клиента.
              </p>
              <DZICascoOfferPDF offerData={pdfOfferData} />
            </CardContent>
          </Card>
        )}

        {/* Детайли */}
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
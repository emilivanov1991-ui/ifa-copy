import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Check, Star } from 'lucide-react';

export default function GeneraliHealthLinePlus() {
  const monthlyPremium = 85;
  const annualPremium = 1020;

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="flex items-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/1a98c2c51_image.png" 
            alt="Generali" 
            className="h-10 bg-white p-1 rounded"
          />
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              HEALTH Line - Plus
              <Star className="w-5 h-5 text-yellow-300" />
            </CardTitle>
            <p className="text-xs text-red-100 mt-1">Разширено допълнително здравно осигуряване</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-slate-900">Премия</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Месечна премия:</span>
              <span className="font-semibold">{monthlyPremium} BGN</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-lg">
              <span className="font-bold text-slate-900">Годишна премия:</span>
              <span className="font-bold text-red-600">{annualPremium} BGN</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Болнично лечение
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Разширено</span>
            </h4>
            <div className="space-y-2 text-sm text-slate-600 ml-6">
              <div className="flex justify-between">
                <span>• Хоспитализация (дневно):</span>
                <span className="font-medium text-green-700">60 BGN/ден</span>
              </div>
              <div className="flex justify-between">
                <span>• Интензивно отделение:</span>
                <span className="font-medium text-green-700">120 BGN/ден</span>
              </div>
              <div className="flex justify-between">
                <span>• Оперативна намеса:</span>
                <span className="font-medium text-green-700">До 5,000 BGN</span>
              </div>
              <div className="flex justify-between">
                <span>• Медикаменти в болница:</span>
                <span className="font-medium text-green-700">До 800 BGN</span>
              </div>
              <div className="flex justify-between">
                <span>• Транспорт/линейка:</span>
                <span className="font-medium text-green-700">До 400 BGN</span>
              </div>
              <div className="flex justify-between">
                <span>• Рехабилитация след операция:</span>
                <span className="font-medium text-green-700">До 600 BGN</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Извънболнично лечение
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Разширено</span>
            </h4>
            <div className="space-y-2 text-sm text-slate-600 ml-6">
              <div className="flex justify-between">
                <span>• Прегледи специалисти:</span>
                <span className="font-medium text-green-700">До 800 BGN/год</span>
              </div>
              <div className="flex justify-between">
                <span>• Изследвания:</span>
                <span className="font-medium text-green-700">До 600 BGN/год</span>
              </div>
              <div className="flex justify-between">
                <span>• Медикаменти:</span>
                <span className="font-medium text-green-700">До 400 BGN/год</span>
              </div>
              <div className="flex justify-between">
                <span>• Физиотерапия:</span>
                <span className="font-medium text-green-700">До 500 BGN/год</span>
              </div>
              <div className="flex justify-between">
                <span>• Дентално лечение:</span>
                <span className="font-medium text-green-700">До 300 BGN/год</span>
              </div>
              <div className="flex justify-between">
                <span>• Профилактични прегледи:</span>
                <span className="font-medium text-green-700">До 200 BGN/год</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-xs text-blue-800 space-y-2">
            <p className="font-semibold">Важна информация:</p>
            <ul className="space-y-1 ml-4">
              <li>• Възраст: 18-70 години</li>
              <li>• Отлагателен период: 30 дни (90 дни за хронични заболявания)</li>
              <li>• Самоучастие: 15% при извънболнично лечение</li>
              <li>• Територия: България + чужбина (спешни случаи)</li>
              <li>• Покритие: Допълнително към НЗОК</li>
              <li>• Бонус: Безплатна годишна профилактика</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
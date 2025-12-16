import React, { useState } from 'react';
import UniversalProductCalculator from '../components/products/UniversalProductCalculator';
import MetLifeMedicaCalculator from '../components/products/MetLifeMedicaCalculator';
import MetLifeCreditGuardCalculator from '../components/products/MetLifeCreditGuardCalculator';
import MetLifeULCalculator from '../components/financial-plan/MetLifeULCalculator';
import MetLifeChildULCalculator from '../components/financial-plan/MetLifeChildULCalculator';
import MetLifeCareCalculator from '../components/financial-plan/MetLifeCareCalculator';
import MetLifeTermLifeCalculator from '../components/financial-plan/MetLifeTermLifeCalculator';
import InstinctHomeCalculator from '../components/financial-plan/InstinctHomeCalculator';
import SavedOffersManager from '../components/offers/SavedOffersManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProductConfigDemo() {
  const [demoAnalysisId, setDemoAnalysisId] = useState('');
  const [demoClientId, setDemoClientId] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Универсална Продуктова Система
          </h1>
          <p className="text-slate-600">
            Конфигурирани продукти чрез JSON
          </p>
        </div>

        {/* Demo Analysis/Client IDs for CRM Integration */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">CRM Интеграция - Идентификатори</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Въведете ID-та за автоматично запазване на офертите в клиентското досие
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Analysis ID (Финансов анализ)</Label>
                  <Input 
                    value={demoAnalysisId}
                    onChange={(e) => setDemoAnalysisId(e.target.value)}
                    placeholder="Въведи ID на финансов анализ"
                    className="text-sm mt-1 border-blue-300 focus:border-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Свързва офертата с конкретен финансов анализ</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Client ID (Клиент)</Label>
                  <Input 
                    value={demoClientId}
                    onChange={(e) => setDemoClientId(e.target.value)}
                    placeholder="Въведи ID на клиент"
                    className="text-sm mt-1 border-purple-300 focus:border-purple-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Свързва офертата с клиентския профил</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-xs text-blue-800">
                  ✓ Офертите се запазват автоматично в системата и са достъпни в "Досие" секцията на клиентския и консултантския портал
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="metlife-credit-guard" className="w-full">
          <TabsList className="grid w-full grid-cols-9 mb-6 text-xs">
            <TabsTrigger value="metlife-credit-guard">Credit Guard</TabsTrigger>
            <TabsTrigger value="metlife-predimstvo">Предимство</TabsTrigger>
            <TabsTrigger value="metlife-detstvo">Детство</TabsTrigger>
            <TabsTrigger value="metlife-grija">Грижа</TabsTrigger>
            <TabsTrigger value="metlife-srochen">Срочен живот</TabsTrigger>
            <TabsTrigger value="metlife-medica">Медика</TabsTrigger>
            <TabsTrigger value="dzi-zakrila">ДЗИ Закрила</TabsTrigger>
            <TabsTrigger value="instinct-home">Инстинкт</TabsTrigger>
            <TabsTrigger value="saved-offers">Запазени</TabsTrigger>
          </TabsList>

          <TabsContent value="metlife-credit-guard">
            <MetLifeCreditGuardCalculator 
              initialInputs={{
                age: 18,
                sum: 100000,
                term: 30,
                packageType: 'Основен'
              }}
              analysisId={demoAnalysisId}
              clientId={demoClientId}
            />
          </TabsContent>

          <TabsContent value="metlife-predimstvo">
            <MetLifeULCalculator 
              initialData={{
                clientName: 'Демо клиент',
                age: 35,
                riskClass: 1,
                annualSavings: 1500,
                integratedLifeCoverage: 5000,
                globalStock: 0.5,
                emergingMarkets: 0.5,
                globalBond: 0,
                expectedReturn: 0.08
              }}
              analysisId={demoAnalysisId}
              clientId={demoClientId}
            />
          </TabsContent>

          <TabsContent value="metlife-detstvo">
            <MetLifeChildULCalculator 
              initialData={{
                policyholderName: 'Родител',
                policyholderAge: 35,
                childName: 'Дете',
                childAge: 5,
                annualSavings: 1200,
                fundGlobalStocks: 50,
                fundEmergingMarkets: 50,
                fundBonds: 0,
                childProtection: true
              }}
              analysisId={demoAnalysisId}
              clientId={demoClientId}
            />
          </TabsContent>

          <TabsContent value="metlife-grija">
            <MetLifeCareCalculator 
              initialData={{
                clientName: 'Демо клиент',
                age: 35,
                riskClass: 1,
                package: 'Сребърен'
              }}
              analysisId={demoAnalysisId}
              clientId={demoClientId}
            />
          </TabsContent>

          <TabsContent value="metlife-srochen">
            <MetLifeTermLifeCalculator 
              initialData={{
                clientName: 'Демо клиент',
                age: 35,
                riskClass: 1,
                termLifeCoverage: 50000,
                termLifeYears: 10,
                fracturesCoverage: 1500
              }}
              analysisId={demoAnalysisId}
              clientId={demoClientId}
            />
          </TabsContent>

          <TabsContent value="metlife-medica">
            <MetLifeMedicaCalculator 
              initialInputs={{
                age: 34,
                coverageType: '32_critical_illnesses',
                plan: '100000',
                riskClass: '1',
                paymentFrequency: 'annual'
              }}
              analysisId={demoAnalysisId}
              clientId={demoClientId}
            />
          </TabsContent>

          <TabsContent value="dzi-zakrila">
            <UniversalProductCalculator 
              productId="dzi-zakrila"
              initialInputs={{
                age: 35,
                gender: 'male',
                sum: 50000,
                term: 20,
                isSmoker: false
              }}
              analysisId={demoAnalysisId}
              clientId={demoClientId}
            />
          </TabsContent>

          <TabsContent value="instinct-home">
            <InstinctHomeCalculator 
              initialData={{
                clientName: 'Демо клиент',
                address: 'гр. София',
                packageType: 'Пакет 2',
                currency: 'EUR'
              }}
              analysisId={demoAnalysisId}
              clientId={demoClientId}
            />
          </TabsContent>

          <TabsContent value="saved-offers">
            {demoAnalysisId ? (
              <SavedOffersManager 
                analysisId={demoAnalysisId}
                clientId={demoClientId}
              />
            ) : (
              <div className="text-center py-12 text-slate-500">
                Въведи Analysis ID за да видиш запазените оферти
              </div>
            )}
          </TabsContent>
          </Tabs>

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
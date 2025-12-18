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
import DZIZakrilaCalculator from '../components/products/DZIZakrilaCalculator';
import DZICascoCalculator from '../components/financial-plan/DZICascoCalculator';
import DZIGOCalculator from '../components/products/DZIGOCalculator';
import GeneraliHealthLineOffer from '../components/financial-plan/GeneraliHealthLineOffer';
import UniqaHealthValueCalculator from '../components/financial-plan/UniqaHealthValueCalculator';
import PlaceholderCalculator from '../components/products/PlaceholderCalculator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from 'lucide-react';

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

        <Tabs defaultValue="metlife" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-6 h-auto gap-2 bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-xl">
        <TabsTrigger value="metlife" className="flex-col h-auto py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg">
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/d26d48d16_image.png" alt="MetLife" className="h-8 mb-1" />
        <span className="text-xs">MetLife</span>
        </TabsTrigger>
        <TabsTrigger value="dzi" className="flex-col h-auto py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg">
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/2485fdb3e_image.png" alt="ДЗИ" className="h-8 mb-1" />
        <span className="text-xs">ДЗИ</span>
        </TabsTrigger>
        <TabsTrigger value="uniqa" className="flex-col h-auto py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg">
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/c923181b0_image.png" alt="УНИКА" className="h-8 mb-1" />
        <span className="text-xs">УНИКА</span>
        </TabsTrigger>
        <TabsTrigger value="generali" className="flex-col h-auto py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg">
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/1a98c2c51_image.png" alt="Generali" className="h-8 mb-1" />
        <span className="text-xs">Generali</span>
        </TabsTrigger>
        <TabsTrigger value="instinct" className="flex-col h-auto py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg">
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/09a600ebb_image.png" alt="Инстинкт" className="h-8 mb-1" />
        <span className="text-xs">Инстинкт</span>
        </TabsTrigger>
        <TabsTrigger value="credits" className="flex-col h-auto py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg">
        <span className="text-sm font-semibold">🏦</span>
        <span className="text-xs">Кредити</span>
        </TabsTrigger>
        <TabsTrigger value="pension" className="flex-col h-auto py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg">
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/838db6bfd_image.png" alt="ОББ Пенсионно" className="h-8 mb-1" />
        <span className="text-xs">Пенсии</span>
        </TabsTrigger>
        <TabsTrigger value="saved-offers" className="flex-col h-auto py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg">
        <Package className="h-6 w-6 mb-1 text-violet-600" />
        <span className="text-xs">Запазени</span>
        </TabsTrigger>
        </TabsList>

          {/* MetLife Products */}
          <TabsContent value="metlife" className="space-y-4">
            <Tabs defaultValue="credit-guard" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-4 bg-blue-50 p-1 rounded-lg">
                <TabsTrigger value="credit-guard">Credit Guard</TabsTrigger>
                <TabsTrigger value="ul">Unit Linked</TabsTrigger>
                <TabsTrigger value="junior-ul">Junior Unit Linked</TabsTrigger>
                <TabsTrigger value="care">Грижа</TabsTrigger>
                <TabsTrigger value="term-life">Term Life</TabsTrigger>
                <TabsTrigger value="medica">MetLife Medica</TabsTrigger>
              </TabsList>

              <TabsContent value="credit-guard">
                <MetLifeCreditGuardCalculator 
                  initialInputs={{
                    age: 30,
                    sum: 100000,
                    term: 30,
                    packageType: 'Основен'
                  }}
                  analysisId={demoAnalysisId}
                  clientId={demoClientId}
                />
              </TabsContent>

              <TabsContent value="ul">
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

              <TabsContent value="junior-ul">
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

              <TabsContent value="care">
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

              <TabsContent value="term-life">
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

              <TabsContent value="medica">
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
            </Tabs>
          </TabsContent>

          {/* ДЗИ Products */}
          <TabsContent value="dzi" className="space-y-4">
            <Tabs defaultValue="zakrila" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-4 bg-blue-50 p-1 rounded-lg">
                <TabsTrigger value="zakrila">Закрила</TabsTrigger>
                <TabsTrigger value="casco">Каско+</TabsTrigger>
                <TabsTrigger value="go">ГО</TabsTrigger>
                <TabsTrigger value="best-doctors">Бест Докторс</TabsTrigger>
              </TabsList>

              <TabsContent value="zakrila">
                <DZIZakrilaCalculator 
                  analysisId={demoAnalysisId}
                  clientId={demoClientId}
                />
              </TabsContent>

              <TabsContent value="casco">
                <DZICascoCalculator 
                  carData={{
                    brand: 'BMW',
                    model: 'X5',
                    year: 2020,
                    valueEUR: 45000,
                    hasCasco: false
                  }}
                />
              </TabsContent>

              <TabsContent value="go">
                <DZIGOCalculator 
                  analysisId={demoAnalysisId}
                  clientId={demoClientId}
                />
              </TabsContent>

              <TabsContent value="best-doctors">
                <PlaceholderCalculator 
                  productName="Бест Докторс"
                  provider="ДЗИ"
                  description="Застраховка за допълнително здравно мнение. Моля предоставете тарифи и условия за конфигуриране."
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* УНИКА Products */}
          <TabsContent value="uniqa" className="space-y-4">
            <Tabs defaultValue="health-value" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-4 bg-blue-50 p-1 rounded-lg">
                <TabsTrigger value="health-value">Здраве и ценност</TabsTrigger>
                <TabsTrigger value="our-health">За Нашето здраве</TabsTrigger>
                <TabsTrigger value="home-happy">У дома и щастлив</TabsTrigger>
                <TabsTrigger value="casco">Каско</TabsTrigger>
                <TabsTrigger value="go">ГО</TabsTrigger>
              </TabsList>

              <TabsContent value="health-value">
                <UniqaHealthValueCalculator 
                  initialData={{
                    clientName: 'Демо клиент',
                    age: 35,
                    plan: 'europa',
                    frequency: 'annual'
                  }}
                  analysisId={demoAnalysisId}
                  clientId={demoClientId}
                />
              </TabsContent>

              <TabsContent value="our-health">
                <PlaceholderCalculator 
                  productName="За Нашето здраве"
                  provider="УНИКА"
                  description="Допълнително здравно осигуряване. Моля предоставете тарифи и условия."
                />
              </TabsContent>

              <TabsContent value="home-happy">
                <PlaceholderCalculator 
                  productName="У дома и щастлив"
                  provider="УНИКА"
                  description="Имуществена застраховка. Моля предоставете тарифи и условия."
                />
              </TabsContent>

              <TabsContent value="casco">
                <PlaceholderCalculator 
                  productName="Каско"
                  provider="УНИКА"
                  description="Застраховка Каско на автомобили. Моля предоставете тарифи и условия."
                />
              </TabsContent>

              <TabsContent value="go">
                <PlaceholderCalculator 
                  productName="ГО"
                  provider="УНИКА"
                  description="Гражданска отговорност. Моля предоставете тарифи и условия."
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Generali Products */}
          <TabsContent value="generali" className="space-y-4">
            <Tabs defaultValue="health" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-4 bg-red-50 p-1 rounded-lg">
                <TabsTrigger value="health">Health Line</TabsTrigger>
                <TabsTrigger value="home">Домашно Имущество</TabsTrigger>
                <TabsTrigger value="casco">Каско</TabsTrigger>
                <TabsTrigger value="go">ГО</TabsTrigger>
              </TabsList>

              <TabsContent value="health">
                <GeneraliHealthLineOffer 
                  beneficiaryName="Демо клиент"
                  plan="plus"
                  monthlyPremium={85}
                  annualPremium={1020}
                  isInsured={true}
                  showPrint={false}
                />
              </TabsContent>

              <TabsContent value="home">
                <PlaceholderCalculator 
                  productName="Домашно Имущество"
                  provider="Generali"
                  description="Имуществена застраховка. Моля предоставете тарифи и условия."
                />
              </TabsContent>

              <TabsContent value="casco">
                <PlaceholderCalculator 
                  productName="Каско"
                  provider="Generali"
                  description="Застраховка Каско. Моля предоставете тарифи и условия."
                />
              </TabsContent>

              <TabsContent value="go">
                <PlaceholderCalculator 
                  productName="ГО"
                  provider="Generali"
                  description="Гражданска отговорност. Моля предоставете тарифи и условия."
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Instinct Products */}
          <TabsContent value="instinct" className="space-y-4">
            <InstinctHomeCalculator 
              analysisId={demoAnalysisId}
              clientId={demoClientId}
            />
          </TabsContent>

          {/* Credits */}
          <TabsContent value="credits" className="space-y-4">
            <Tabs defaultValue="unicredit-mortgage" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-4 bg-green-50 p-1 rounded-lg text-xs">
                <TabsTrigger value="unicredit-mortgage">UniCredit Ипотека</TabsTrigger>
                <TabsTrigger value="dsk-mortgage">ДСК Ипотека</TabsTrigger>
                <TabsTrigger value="ubb-mortgage">ОББ Ипотека</TabsTrigger>
                <TabsTrigger value="postbank-mortgage">Пощенска Ипотека</TabsTrigger>
                <TabsTrigger value="unicredit-consumer">UniCredit Потребителски</TabsTrigger>
                <TabsTrigger value="ubb-consumer">ОББ Потребителски</TabsTrigger>
              </TabsList>

              <TabsContent value="unicredit-mortgage">
                <PlaceholderCalculator 
                  productName="Ипотечен кредит"
                  provider="UniCredit"
                  description="Ипотечно кредитиране. Моля предоставете лихвени проценти, такси и условия."
                  logoUrl="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/d2215799e_image.png"
                />
              </TabsContent>

              <TabsContent value="dsk-mortgage">
                <PlaceholderCalculator 
                  productName="Ипотечен кредит"
                  provider="ДСК Банка"
                  description="Ипотечно кредитиране. Моля предоставете лихвени проценти, такси и условия."
                  logoUrl="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/4edc7ab0b_image.png"
                />
              </TabsContent>

              <TabsContent value="ubb-mortgage">
                <PlaceholderCalculator 
                  productName="Ипотечен кредит"
                  provider="ОББ"
                  description="Ипотечно кредитиране. Моля предоставете лихвени проценти, такси и условия."
                  logoUrl="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/8a6c6726e_image.png"
                />
              </TabsContent>

              <TabsContent value="postbank-mortgage">
                <PlaceholderCalculator 
                  productName="Ипотечен кредит"
                  provider="Пощенска Банка"
                  description="Ипотечно кредитиране. Моля предоставете лихвени проценти, такси и условия."
                  logoUrl="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/97f069381_image.png"
                />
              </TabsContent>

              <TabsContent value="unicredit-consumer">
                <PlaceholderCalculator 
                  productName="Потребителски кредит"
                  provider="UniCredit"
                  description="Потребителско кредитиране. Моля предоставете лихвени проценти, такси и условия."
                  logoUrl="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/d2215799e_image.png"
                />
              </TabsContent>

              <TabsContent value="ubb-consumer">
                <PlaceholderCalculator 
                  productName="Потребителски кредит"
                  provider="ОББ"
                  description="Потребителско кредитиране. Моля предоставете лихвени проценти, такси и условия."
                  logoUrl="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/8a6c6726e_image.png"
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Pension Products */}
          <TabsContent value="pension" className="space-y-4">
            <Tabs defaultValue="pillar2" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-blue-50 p-1 rounded-lg">
                <TabsTrigger value="pillar2">Втори стълб - ДЗПО</TabsTrigger>
                <TabsTrigger value="pillar3">Трети стълб - ДДПО</TabsTrigger>
              </TabsList>

              <TabsContent value="pillar2">
                <PlaceholderCalculator 
                  productName="Втори стълб - ДЗПО"
                  provider="ОББ Пенсионно осигуряване"
                  description="Допълнително задължително пенсионно осигуряване. Моля предоставете такси, доходност и условия."
                />
              </TabsContent>

              <TabsContent value="pillar3">
                <PlaceholderCalculator 
                  productName="Трети стълб - ДДПО"
                  provider="ОББ Пенсионно осигуряване"
                  description="Допълнително доброволно пенсионно осигуряване. Моля предоставете такси, доходност и условия."
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Instinct - Keep for backwards compatibility */}
          {/* Saved Offers */}
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
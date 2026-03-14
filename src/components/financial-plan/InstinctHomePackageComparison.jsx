import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from 'lucide-react';
import { calculateInstinctHomePremium } from './InstinctHomeConstants';

const toEUR = (bgn) => Math.round(bgn / 1.96);

export default function InstinctHomePackageComparison({ customSumEUR = 76531, onCustomSumEURChange }) {
  const [selectedPackage, setSelectedPackage] = React.useState('custom');
  
  const handlePackageChange = (pkg) => {
    setSelectedPackage(pkg);
    if (pkg === 'package1') onCustomSumEURChange?.(25510);
    else if (pkg === 'package2') onCustomSumEURChange?.(51020);
    else if (pkg === 'package3') onCustomSumEURChange?.(76531);
  };

  const packages = useMemo(() => {
    const customBGN = Math.round(customSumEUR * 1.96);
    return [{
      package1: { name: 'Пакет 1', sumEUR: 25510, ...calculateInstinctHomePremium(0, 'Пакет 1', {}) },
      package2: { name: 'Пакет 2', sumEUR: 51020, ...calculateInstinctHomePremium(0, 'Пакет 2', {}) },
      package3: { name: 'Пакет 3', sumEUR: 76531, ...calculateInstinctHomePremium(0, 'Пакет 3', {}) },
      custom: { name: 'Персонализиран', sumEUR: customSumEUR, ...calculateInstinctHomePremium(customBGN, 'custom', {}) }
    }[selectedPackage]];
  }, [customSumEUR, selectedPackage]);

  const coverageRows = [
    { label: 'Пожар, Гръмотевична буря, Градушка, Наводнение вследствие на природни бедствия, Експлозия, Имплозия, Падане на летателен апарат', keys: ['fire_immovable', 'fire_movable'] },
    { label: 'Свличане и срутване на земни пластове и действие на подпочвени води', keys: ['landslide_immovable', 'landslide_movable'] },
    { label: 'Изтичане на вода и пара', keys: ['water_immovable', 'water_movable'] },
    { label: 'Гражданска отговорност към трети лица', keys: ['liability'], single: true },
    { label: 'Земетресение', keys: ['earthquake_immovable', 'earthquake_movable'] },
    { label: 'Злоумишлени действия, вкл. Палеж', keys: ['vandalism_immovable', 'vandalism_movable'] },
    { label: 'Удар от пътно превозно средство', keys: ['vehicle_immovable', 'vehicle_movable'] },
    { label: 'Допълнителни разходи за разчистване', keys: ['cleanup_immovable', 'cleanup_movable'] },
    { label: 'Замръзване', keys: ['freezing_immovable', 'freezing_movable'] },
    { label: 'Тежест от естествено натрупване на сняг и лед', keys: ['snow_immovable', 'snow_movable'] },
    { label: 'Счупване на стъкла', keys: ['glass_immovable', 'glass_movable'] },
    { label: 'Късо съединение и токов удар', keys: ['short_circuit_immovable', 'short_circuit_movable'] },
    { label: 'Кражба чрез взлом, техническо средство или грабеж', keys: ['theft'], single: true },
    { label: 'Разходи за временно настаняване', keys: ['temporary_accommodation'], single: true },
    { label: 'Медицински преглед или обезщетение при смърт на домашен любимец', keys: ['pet'], single: true },
    { label: 'Съоръжения и екипировка за хобита и спортове', keys: ['hobby_sport'], single: true },
    { label: 'Щети на движимо имущество при транспорт при смяна на адрес', keys: ['relocation_transport'], single: true },
  ];

  return (
    <div className="space-y-6">
      {/* Package Selection */}
      <Card className="bg-gradient-to-br from-purple-50 via-purple-100 to-blue-50 border-purple-200 shadow-lg">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <Label className="text-sm font-semibold text-purple-900">Изберете пакет:</Label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Select value={selectedPackage} onValueChange={handlePackageChange}>
                  <SelectTrigger className="border-purple-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="package1">Пакет 1 (25,510 €)</SelectItem>
                    <SelectItem value="package2">Пакет 2 (51,020 €)</SelectItem>
                    <SelectItem value="package3">Пакет 3 (76,531 €)</SelectItem>
                    <SelectItem value="custom">Персонализиран</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-purple-800 mb-2 block">Застрахователна сума (€)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={customSumEUR}
                    onChange={(e) => { setSelectedPackage('custom'); onCustomSumEURChange?.(parseInt(e.target.value) || 0); }}
                    min={25510}
                    max={255102}
                    step={500}
                    disabled={selectedPackage !== 'custom'}
                    className="font-semibold text-purple-700 border-purple-300 disabled:opacity-60"
                  />
                  <span className="text-sm font-medium text-purple-700">€</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card className="shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 py-5">
          <CardTitle className="text-white text-center text-xl font-bold tracking-wide">Сравнение на покрития</CardTitle>
          <p className="text-purple-100 text-center text-xs mt-1">Всички стойности са в евро (€)</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gradient-to-r from-purple-100 to-blue-100 border-b-2 border-purple-300">
                  <th className="text-left p-4 font-bold text-purple-900 min-w-[280px] sticky left-0 bg-gradient-to-r from-purple-100 to-purple-50 z-10 shadow-sm"></th>
                  {packages.map((pkg, idx) => (
                    <th key={idx} className="text-center p-4 font-semibold text-purple-900 border-l border-purple-200 min-w-[160px]">
                      <div className="mb-2 text-sm font-bold">{pkg.name}</div>
                      <div className="text-base font-extrabold text-purple-600 bg-white rounded-lg py-2 px-3 shadow-sm">
                        {pkg.sumEUR?.toLocaleString()} €
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-semibold">
                        <div className="text-blue-700 bg-blue-50 rounded-md py-1">Недвижимо</div>
                        <div className="text-purple-700 bg-purple-50 rounded-md py-1">Движимо</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coverageRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-slate-100 hover:bg-purple-50 transition-colors group">
                    <td className="p-3 text-slate-700 font-medium sticky left-0 bg-white z-10 group-hover:bg-purple-50 shadow-sm">{row.label}</td>
                    {packages.map((pkg, pkgIdx) => (
                      <td key={pkgIdx} className="p-3 border-l border-slate-100">
                        {row.single ? (
                          <div className="text-center font-semibold text-slate-800 bg-white rounded-md py-2 px-3">
                            {toEUR(Math.round(pkg.coverages?.[row.keys[0]] || 0)).toLocaleString()} €
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="font-semibold text-blue-600 bg-blue-50 rounded-md py-2 px-2">
                              {toEUR(Math.round(pkg.coverages?.[row.keys[0]] || 0)).toLocaleString()} €
                            </div>
                            <div className="font-semibold text-purple-600 bg-purple-50 rounded-md py-2 px-2">
                              {toEUR(Math.round(pkg.coverages?.[row.keys[1]] || 0)).toLocaleString()} €
                            </div>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Premium Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 border-t-4 border-purple-300">
            <div className="flex justify-center">
              {packages.map((pkg, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border border-purple-200 max-w-sm">
                  <div className="text-center space-y-3">
                    <div className="text-sm font-semibold text-purple-600 uppercase tracking-wide">{pkg.name}</div>
                    <div className="text-3xl font-extrabold text-purple-700">
                      {pkg.annualPremiumEUR?.toFixed(2)} €
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      {pkg.monthlyPremiumEUR} €/мес
                    </div>
                    <div className="text-xs text-purple-500 bg-purple-50 rounded-full py-1.5 px-4 inline-block">Годишна премия</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Info */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-md">
        <CardContent className="pt-5 pb-5 text-xs text-slate-600">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-sm">ЗД "Инстинкт" АД</p>
              <p>Разрешение за застрахователна дейност № 180-ОЗ от 09.02.2023</p>
              <p>гр. София, бул. "Джавахарлал Неру" №28, "Силвър център", етаж 3</p>
              <p className="font-medium text-purple-700">Тел: 0700 20032 | Email: office@instinct-insurance.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
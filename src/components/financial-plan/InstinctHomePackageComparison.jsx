import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateInstinctHomePremium, EUR_BGN_RATE } from './InstinctHomeConstants';

export default function InstinctHomePackageComparison({ customSum = 500000, onCustomSumChange }) {
  // Calculate all 4 packages
  const packages = useMemo(() => {
    const pkg1 = calculateInstinctHomePremium(0, 'Пакет 1', {});
    const pkg2 = calculateInstinctHomePremium(0, 'Пакет 2', {});
    const pkg3 = calculateInstinctHomePremium(0, 'Пакет 3', {});
    const custom = calculateInstinctHomePremium(customSum, 'custom', {});
    
    return [
      { name: 'Пакет 1', sum: 50000, ...pkg1 },
      { name: 'Пакет 2', sum: 100000, ...pkg2 },
      { name: 'Пакет 3', sum: 150000, ...pkg3 },
      { name: 'Пакет "Избор"', sum: customSum, ...custom }
    ];
  }, [customSum]);

  const coverageRows = [
    { label: 'Пожар, Гръмотевична буря, Градушка, Наводнение вследствие на природни бедствия, Експлозия, Имплозия, Падане на летателен апарат, негови части или товар', keys: ['fire_immovable', 'fire_movable'] },
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
    { label: 'Медицински преглед или обезщетение при смърт на домашен любимец вследствие на покрит по полицата риск', keys: ['pet'], single: true },
    { label: 'Съоръжения и екипировка за упражняване на хобита и спортове', keys: ['hobby_sport'], single: true, note: '/ капацитет за покритие – 100 лв. /' },
    { label: 'Щети на движимо имущество по време на транспорт при смяна на адрес', keys: ['relocation_transport'], single: true },
    { label: 'Щети на движимо имущество на два адреса за 14 дни по време на смяна на адрес', keys: ['relocation_dual_address'], single: true }
  ];

  return (
    <div className="space-y-4">
      {/* Custom Sum Input */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Пакет "Избор" - Застрахователна сума:</Label>
            <Input 
              type="number"
              value={customSum}
              onChange={(e) => onCustomSumChange?.(parseInt(e.target.value) || 0)}
              min={50000}
              max={500000}
              step={1000}
              className="w-48"
            />
            <span className="text-sm text-slate-600">лв (BGN)</span>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader className="bg-purple-600 py-4">
          <CardTitle className="text-white text-center">Покрития</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-purple-100 border-b-2 border-purple-300">
                  <th className="text-left p-3 font-semibold text-purple-900 min-w-[250px] sticky left-0 bg-purple-100 z-10"></th>
                  {packages.map((pkg, idx) => (
                    <th key={idx} className="text-center p-3 font-semibold text-purple-900 border-l border-purple-200">
                      <div className="mb-1">{pkg.name}</div>
                      <div className="text-sm font-bold">{(pkg.sum / EUR_BGN_RATE).toLocaleString()} лв</div>
                      <div className="grid grid-cols-2 gap-1 mt-2 text-xs font-medium text-purple-700">
                        <div>Недвижимо</div>
                        <div>Движимо</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coverageRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 text-slate-700 font-medium sticky left-0 bg-white z-10">
                      {row.label}
                      {row.note && <div className="text-xs text-slate-500 italic mt-0.5">{row.note}</div>}
                    </td>
                    {packages.map((pkg, pkgIdx) => (
                      <td key={pkgIdx} className="p-3 border-l border-slate-100">
                        {row.single ? (
                          <div className="text-center font-semibold text-slate-800">
                            {Math.round(pkg.coverages?.[row.keys[0]] || 0).toLocaleString()} лв
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="font-semibold text-blue-600">
                              {Math.round(pkg.coverages?.[row.keys[0]] || 0).toLocaleString()} лв
                            </div>
                            <div className="font-semibold text-purple-600">
                              {Math.round(pkg.coverages?.[row.keys[1]] || 0).toLocaleString()} лв
                            </div>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-purple-600 text-white">
                <tr>
                  <td className="p-3 font-bold sticky left-0 bg-purple-600 z-10">Информация за таксата</td>
                  {packages.map((pkg, idx) => (
                    <td key={idx} className="p-3 text-center border-l border-purple-500"></td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Premium Summary Row */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 border-t-2 border-purple-300">
            <div className="grid grid-cols-4 gap-4 text-center">
              {packages.map((pkg, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-xs text-slate-600">Годишна премия</div>
                  <div className="text-lg font-bold text-purple-600">
                    {pkg.annualPremiumBGN?.toFixed(2)} лв
                  </div>
                  <div className="text-xs text-slate-500">
                    ({(pkg.annualPremiumBGN / 12).toFixed(2)} лв/мес)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Info */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-4 text-xs text-slate-600">
          <p className="font-medium text-slate-800 mb-2">ЗД "Инстинкт" АД</p>
          <p>Разрешение за застрахователна дейност № 180-ОЗ от 09.02.2023</p>
          <p>гр. София, бул. "Джавахарлал Неру" №28, "Силвър център", етаж 3</p>
          <p>Тел: 0700 20032 | Email: office@instinct-insurance.com</p>
        </CardContent>
      </Card>
    </div>
  );
}
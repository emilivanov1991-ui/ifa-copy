import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from 'lucide-react';
import { calculateInstinctHomePremium, EUR_BGN_RATE } from './InstinctHomeConstants';

export default function InstinctHomePackageComparison({ customSum = 500000, onCustomSumChange }) {
  const [selectedPackage, setSelectedPackage] = React.useState('custom');
  
  const handlePackageChange = (pkg) => {
    setSelectedPackage(pkg);
    if (pkg === 'package1') {
      onCustomSumChange?.(50000);
    } else if (pkg === 'package2') {
      onCustomSumChange?.(100000);
    } else if (pkg === 'package3') {
      onCustomSumChange?.(150000);
    }
  };
  // Calculate packages based on selection
  const packages = useMemo(() => {
    const allPackages = {
      package1: { name: 'Пакет 1', sum: 50000, ...calculateInstinctHomePremium(0, 'Пакет 1', {}) },
      package2: { name: 'Пакет 2', sum: 100000, ...calculateInstinctHomePremium(0, 'Пакет 2', {}) },
      package3: { name: 'Пакет 3', sum: 150000, ...calculateInstinctHomePremium(0, 'Пакет 3', {}) },
      custom: { name: 'Пакет "Избор"', sum: customSum, ...calculateInstinctHomePremium(customSum, 'custom', {}) }
    };
    
    // Show only selected package
    return [allPackages[selectedPackage]];
  }, [customSum, selectedPackage]);

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
    <div className="space-y-6">
      {/* Package Selection */}
      <div>
        <Card className="bg-gradient-to-br from-purple-50 via-purple-100 to-blue-50 border-purple-200 shadow-lg">
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <Label className="text-sm font-semibold text-purple-900">Пакет "Избор" - Конфигурация:</Label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-purple-800 mb-2 block">Изберете пакет</Label>
                  <Select value={selectedPackage} onValueChange={handlePackageChange}>
                    <SelectTrigger className="border-purple-300 focus:ring-purple-500 focus:border-purple-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="package1">Пакет 1 (50,000 лв)</SelectItem>
                      <SelectItem value="package2">Пакет 2 (100,000 лв)</SelectItem>
                      <SelectItem value="package3">Пакет 3 (150,000 лв)</SelectItem>
                      <SelectItem value="custom">Персонализиран</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-purple-800 mb-2 block">Застрахователна сума</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number"
                      value={customSum}
                      onChange={(e) => {
                        setSelectedPackage('custom');
                        onCustomSumChange?.(parseInt(e.target.value) || 0);
                      }}
                      min={50000}
                      max={500000}
                      step={1000}
                      disabled={selectedPackage !== 'custom'}
                      className="font-semibold text-purple-700 border-purple-300 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:opacity-60"
                    />
                    <span className="text-sm font-medium text-purple-700 whitespace-nowrap">лв (BGN)</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-purple-600">
                {selectedPackage === 'custom' 
                  ? 'Изберете сума между 50,000 и 500,000 лв за персонализирано покритие'
                  : 'Избрахте готов пакет. За персонализирана сума, изберете "Персонализиран"'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <div>
        <Card className="shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 py-5">
            <CardTitle className="text-white text-center text-xl font-bold tracking-wide">Сравнение на покрития</CardTitle>
            <p className="text-purple-100 text-center text-xs mt-1">Всички стойности са в български лева (BGN)</p>
          </CardHeader>
          <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gradient-to-r from-purple-100 to-blue-100 border-b-2 border-purple-300">
                  <th className="text-left p-4 font-bold text-purple-900 min-w-[280px] sticky left-0 bg-gradient-to-r from-purple-100 to-purple-50 z-10 shadow-sm"></th>
                  {packages.map((pkg, idx) => (
                    <th key={idx} className="text-center p-4 font-semibold text-purple-900 border-l border-purple-200 min-w-[160px] transition-all hover:bg-purple-50">
                      <div>
                        <div className="mb-2 text-sm font-bold">{pkg.name}</div>
                        <div className="text-base font-extrabold text-purple-600 bg-white rounded-lg py-2 px-3 shadow-sm">
                          {pkg.sum.toLocaleString()} лв
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-semibold">
                          <div className="text-blue-700 bg-blue-50 rounded-md py-1">Недвижимо</div>
                          <div className="text-purple-700 bg-purple-50 rounded-md py-1">Движимо</div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coverageRows.map((row, rowIdx) => (
                  <tr 
                    key={rowIdx} 
                    className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200 group"
                  >
                    <td className="p-3 text-slate-700 font-medium sticky left-0 bg-white z-10 group-hover:bg-gradient-to-r group-hover:from-purple-50 group-hover:to-transparent transition-all shadow-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-full bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div>
                          {row.label}
                          {row.note && <div className="text-xs text-slate-500 italic mt-1">{row.note}</div>}
                        </div>
                      </div>
                    </td>
                    {packages.map((pkg, pkgIdx) => (
                      <td key={pkgIdx} className="p-3 border-l border-slate-100">
                        {row.single ? (
                          <div className="text-center font-semibold text-slate-800 bg-white rounded-md py-2 px-3 group-hover:shadow-sm transition-shadow">
                            {Math.round(pkg.coverages?.[row.keys[0]] || 0).toLocaleString()} лв
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="font-semibold text-blue-600 bg-blue-50 rounded-md py-2 px-2 group-hover:shadow-sm transition-shadow">
                              {Math.round(pkg.coverages?.[row.keys[0]] || 0).toLocaleString()} лв
                            </div>
                            <div className="font-semibold text-purple-600 bg-purple-50 rounded-md py-2 px-2 group-hover:shadow-sm transition-shadow">
                              {Math.round(pkg.coverages?.[row.keys[1]] || 0).toLocaleString()} лв
                            </div>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <tr>
                  <td className="p-4 font-bold sticky left-0 bg-gradient-to-r from-purple-600 to-purple-700 z-10 text-sm">Годишна премия</td>
                  {packages.map((pkg, idx) => (
                    <td key={idx} className="p-4 text-center border-l border-purple-500"></td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Premium Summary Row */}
          <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-blue-50 p-6 border-t-4 border-purple-300">
            <div className="flex justify-center">
              {packages.map((pkg, idx) => (
                <div 
                  key={idx}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-200 max-w-sm"
                >
                  <div className="text-center space-y-3">
                    <div className="text-sm font-semibold text-purple-600 uppercase tracking-wide">{pkg.name}</div>
                    <div className="text-3xl font-extrabold text-purple-700">
                      {pkg.annualPremiumBGN?.toFixed(2)} лв
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      {(pkg.annualPremiumBGN / 12).toFixed(2)} лв/мес
                    </div>
                    <div className="text-xs text-purple-500 bg-purple-50 rounded-full py-1.5 px-4 inline-block">
                      Годишна премия
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        </Card>
      </div>

      {/* Provider Info */}
      <div>
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-md">
          <CardContent className="pt-5 pb-5 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-sm">ЗД "Инстинкт" АД</p>
                <p className="leading-relaxed">Разрешение за застрахователна дейност № 180-ОЗ от 09.02.2023</p>
                <p className="leading-relaxed">гр. София, бул. "Джавахарлал Неру" №28, "Силвър център", етаж 3</p>
                <p className="leading-relaxed font-medium text-purple-700">Тел: 0700 20032 | Email: office@instinct-insurance.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, TrendingUp, Calculator, Users, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";

// Page 10 - Pension Demographics
const PensionDemographics = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Пенсионно осигуряване</h2>
      <p className="text-slate-600">Възрастов състав на населението в България</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2 text-blue-600">2016 година</h3>
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <Users className="w-12 h-12 text-blue-600" />
              <div>
                <p className="text-3xl font-bold text-blue-600">1.56</p>
                <p className="text-sm text-slate-600">работещи на 1 пенсионер</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              На един пенсионер се падат 1,56 човека в трудоспособна възраст (от 20 до 64 год.)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2 text-red-600">2060 година (прогноза)</h3>
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
              <Users className="w-12 h-12 text-red-600" />
              <div>
                <p className="text-3xl font-bold text-red-600">1.00</p>
                <p className="text-sm text-slate-600">работещ на 1 пенсионер</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              На един пенсионер ще се падне по 1 човек в трудоспособна възраст (от 20 до 64 год.)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 mb-2">Демографска криза</p>
              <p className="text-sm text-amber-800">
                Застаряващото население и намаляващата работна сила означават, че държавните пенсии 
                ще станат все по-трудни за поддържане. Личното пенсионно планиране става критично важно.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Page 11 - How Rich People Invest
const RichInvestmentStrategy = () => {
  const portfolioData = [
    { category: 'Паричен пазар', percent: 25.6, color: 'bg-red-500' },
    { category: 'Облигации', percent: 16.9, color: 'bg-slate-400' },
    { category: 'Акции', percent: 26.8, color: 'bg-blue-400' },
    { category: 'Недвижими имоти', percent: 17.6, color: 'bg-slate-600' },
    { category: 'Алтернативи (други)', percent: 13.1, color: 'bg-slate-800' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Как инвестират най-богатите хора в света?</h2>
      <p className="text-slate-600">Разнообразие на портфейла</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Bar chart */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {portfolioData.map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-700">{item.category}</span>
                    <span className="text-sm font-semibold">{item.percent}%</span>
                  </div>
                  <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-500", item.color)}
                      style={{ width: `${item.percent * 3.3}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key insights */}
        <div className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-900 mb-2">Разнообразие</h3>
              <p className="text-sm text-blue-800">
                Богатите хора разпределят инвестициите си в множество активи за намаляване на риска
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-green-900 mb-2">Минимални промени</h3>
              <p className="text-sm text-green-800">
                Те правят малко корекции във времето и се придържат към дългосрочна стратегия
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-purple-900 mb-2">Балансиран подход</h3>
              <p className="text-sm text-purple-800">
                Комбинация от сигурни и по-рискови инвестиции за оптимална възвръщаемост
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center">Източник: Amundi</p>
    </div>
  );
};

// Page 12 - Regular Investment (Pioneer Fund)
const RegularInvestmentPower = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Редовна инвестиция</h2>
      <p className="text-slate-600">Pioneer Fund - третият най-стар фонд в света</p>
      
      <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Резултат от създаването на фонда</h3>
          <p className="text-4xl md:text-5xl font-bold mb-2">1 503 884%</p>
          <p className="text-blue-200 mb-4">11,6% средна годишна доходност</p>
          <p className="text-sm text-blue-100">
            Резултати от 01.03.1928 г. до 31.12.2015 г.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-slate-600 mb-1">Инвестиция</p>
            <p className="text-2xl font-bold text-slate-900">$1,000</p>
            <p className="text-sm text-slate-500 mt-2">март 1928</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-slate-600 mb-1">Стойност</p>
            <p className="text-2xl font-bold text-green-600">$15.6M</p>
            <p className="text-sm text-slate-500 mt-2">декември 2015</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-slate-600 mb-1">Растеж</p>
            <p className="text-2xl font-bold text-blue-600">15,584x</p>
            <p className="text-sm text-slate-500 mt-2">за 87 години</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">Ключови моменти в историята</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <p className="text-slate-700">1929-1931: Световна икономическа криза (-43%)</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-slate-700">2008-2009: Финансова криза - възстановяване</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <p className="text-slate-700">Дългосрочно: Стабилен растеж въпреки кризите</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-slate-500">
        Източник: Amundi. Минали резултати не гарантират бъдещи. Инвестициите носят риск.
      </p>
    </div>
  );
};

// Page 13 - Monthly Savings Table
const MonthlySavingsTable = () => {
  const rates = [1, 3, 5, 6, 8, 10];
  const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40];
  
  const calculateSavings = (monthlyAmount, ratePercent, years) => {
    const monthlyRate = ratePercent / 100 / 12;
    const months = years * 12;
    if (monthlyRate === 0) return monthlyAmount * months;
    return monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Редовен месечен депозит от 50 лв.</h2>
      <p className="text-slate-600">Резултат при различни годишни доходности</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-slate-200">
          <thead>
            <tr className="bg-red-700 text-white">
              <th className="p-3 text-left font-semibold">Години</th>
              {rates.map(rate => (
                <th key={rate} className="p-3 text-right font-semibold">{rate}% p.a.</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map((year, idx) => (
              <tr key={year} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                <td className="p-3 font-semibold text-slate-700">{year}</td>
                {rates.map(rate => {
                  const value = calculateSavings(50, rate, year);
                  return (
                    <td key={rate} className="p-3 text-right font-medium">
                      {Math.round(value).toLocaleString('bg-BG')} лв
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Забележка:</strong> Таблицата показва колко можете да натрупате при редовно 
            месечно спестяване на 50 лв. при различни годишни доходности и периоди.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Page 14 - Why Invest Regularly
const WhyInvestRegularly = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Защо да инвестираме редовно?</h2>
      
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-slate-600 mb-1">Доходност</p>
            <p className="text-lg font-bold text-red-600">3.53-9.99%</p>
            <p className="text-xs text-slate-500 mt-1">17% от случаите</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-100 border-slate-300">
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-slate-600 mb-1">Доходност</p>
            <p className="text-lg font-bold text-slate-700">10-12.99%</p>
            <p className="text-xs text-slate-500 mt-1">30% от случаите</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-100 border-blue-300">
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-slate-600 mb-1">Доходност</p>
            <p className="text-lg font-bold text-blue-700">13-15.99%</p>
            <p className="text-xs text-slate-500 mt-1">32% от случаите</p>
          </CardContent>
        </Card>

        <Card className="bg-green-100 border-green-300">
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-slate-600 mb-1">Доходност</p>
            <p className="text-lg font-bold text-green-700">16-20%</p>
            <p className="text-xs text-slate-500 mt-1">21% от случаите</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">Статистика за US Pioneer Fund (1928-2016)</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-blue-200 text-sm">Минимален резултат</p>
              <p className="text-2xl font-bold">3.53% годишно</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm">Максимален резултат</p>
              <p className="text-2xl font-bold">19.65% годишно</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm">Среден резултат</p>
              <p className="text-2xl font-bold">12.94% годишно</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-slate-500">
        Данните са за 20-годишни инвестиционни периоди. Миналите резултати не гарантират бъдещи.
      </p>
    </div>
  );
};

// Page 15 - Compound Interest
const CompoundInterestVisual = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Сложна лихва - Натрупване</h2>
      <p className="text-slate-600">Силата на ранното инвестиране</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Early Start */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">✅</span>
              Започнали на 20 години
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">Месечна вноска</p>
                <p className="text-xl font-bold text-slate-900">50 лв (20-59 год.)</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Общо внесено</p>
                <p className="text-lg font-semibold text-slate-700">6,000 лв</p>
              </div>
              <div className="pt-3 border-t border-green-200">
                <p className="text-sm text-slate-600 mb-2">Краен капитал при 59 години:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>При 6%:</span>
                    <span className="font-bold">48,148 лв</span>
                  </div>
                  <div className="flex justify-between">
                    <span>При 8%:</span>
                    <span className="font-bold">94,458 лв</span>
                  </div>
                  <div className="flex justify-between">
                    <span>При 10%:</span>
                    <span className="font-bold text-green-600">183,550 лв</span>
                  </div>
                  <div className="flex justify-between">
                    <span>При 12%:</span>
                    <span className="font-bold text-green-700">353,317 лв</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Late Start */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-red-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Започнали на 30 години
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">Месечна вноска</p>
                <p className="text-xl font-bold text-slate-900">50 лв (30-59 год.)</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Общо внесено</p>
                <p className="text-lg font-semibold text-slate-700">18,000 лв</p>
              </div>
              <div className="pt-3 border-t border-red-200">
                <p className="text-sm text-slate-600 mb-2">Краен капитал при 59 години:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>При 6%:</span>
                    <span className="font-bold">50,282 лв</span>
                  </div>
                  <div className="flex justify-between">
                    <span>При 8%:</span>
                    <span className="font-bold">73,408 лв</span>
                  </div>
                  <div className="flex justify-between">
                    <span>При 10%:</span>
                    <span className="font-bold">108,566 лв</span>
                  </div>
                  <div className="flex justify-between">
                    <span>При 12%:</span>
                    <span className="font-bold">162,176 лв</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 mb-2">Важен извод</p>
              <p className="text-sm text-amber-800">
                Този, който започне да спестява по-рано, по-често и по-малки суми, получава МНОГО 
                ПОВЕЧЕ при един и същ лихвен процент и еднакъв срок на спестяване. Всеки, който започне 
                по-късно, се нуждае от повече пари или по-високи вноски.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Page 16 - DAX Triangle
const DAXTriangle = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">50 годишна доходност от акции</h2>
      <p className="text-slate-600">DAX - Триъгълник на доходност (1972-2021)</p>
      
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-900">Триъгълник на доходност</p>
              <p className="text-sm text-slate-600 mt-2">Визуализация на 50-годишна история</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500 mx-auto mb-3" />
            <p className="font-semibold text-red-900">Отрицателна доходност</p>
            <p className="text-xs text-slate-600 mt-2">Краткосрочни загуби</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-100 border-slate-300">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-900">Нулева доходност</p>
            <p className="text-xs text-slate-600 mt-2">Без печалба/загуба</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500 mx-auto mb-3" />
            <p className="font-semibold text-blue-900">Положителна доходност</p>
            <p className="text-xs text-slate-600 mt-2">Дългосрочни печалби</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-green-900 mb-3">Важни изводи</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Колкото по-дълъг е инвестиционният период, толкова по-ниска е вероятността от загуба</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>15+ години: Практически няма случаи на отрицателна доходност</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Дългосрочното инвестиране намалява риска драстично</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <p className="text-xs text-slate-500">Източник: Deutsches Aktieninstitut 2022</p>
    </div>
  );
};

// Page 17 - Rule 72
const Rule72 = () => {
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(8);
  
  const doublingTime = 72 / rate;
  const doublings = Math.floor(36 / doublingTime);
  const finalAmount = amount * Math.pow(2, doublings);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Ефект от натрупване при сложна лихва</h2>
      <h3 className="text-xl font-semibold text-blue-600">Правило 72</h3>
      
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Calculator className="w-12 h-12 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Формула: 72 ÷ доходност = години за удвояване</h3>
              <p className="text-sm text-blue-800">
                Правило 72 гласи, че приходите от инвестиции с постоянна доходност (лихва) 
                трябва да се удвояват на определен брой години.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Начална сума (лв)</Label>
            <Input
              type="number"
              min="100"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Годишна доходност (%)</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value) || 1)}
            />
          </div>
        </div>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Формула</p>
              <p className="text-2xl font-bold text-blue-600">
                72 ÷ {rate} = {doublingTime.toFixed(1)} години
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Удвоявания за 36 години (до 65 год.)</p>
              <p className="text-3xl font-bold text-green-600">{doublings}x</p>
            </div>
            <div className="pt-3 border-t border-green-200">
              <p className="text-sm text-slate-600 mb-1">Краен капитал от {amount.toLocaleString('bg-BG')} лв</p>
              <p className="text-3xl font-bold text-emerald-600">
                {finalAmount.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} лв
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual representation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[4, 6, 8, 10].map((r) => {
          const time = 72 / r;
          const doubles = Math.floor(36 / time);
          const final = 5000 * Math.pow(2, doubles);
          
          return (
            <Card key={r} className="bg-white border-slate-200">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold">{r}%</span>
                </div>
                <p className="text-sm text-slate-600 mb-1">От 5000 лв на 29 год.</p>
                <p className="text-xl font-bold text-blue-600">
                  {final.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} лв
                </p>
                <p className="text-xs text-slate-500 mt-1">на 65 год.</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Page 18 - Income Protection
const IncomeProtectionTable = () => {
  const incomes = [933, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3200, 3400, 3750, 4400, 5000, 6000];
  
  const calculateBenefits = (gross, net) => {
    return {
      unemployment: Math.min(net * 0.6, 780),
      maternity: Math.min(gross * 0.9, 2638),
      sickness: net * 0.7,
      pension: Math.min(gross * 0.42 * 1.1 / 100, 2000),
    };
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Доход и видове обезщетения</h2>
      <p className="text-slate-600">Подсигуряване на доходи при различни ситуации</p>
      
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 mb-2">Важно да знаете</p>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Обезщетение за безработица: до 12 месеца, 60% от средния доход</li>
                <li>• Обезщетение за майчинство: 410 дни, 90% от средния доход</li>
                <li>• Обезщетение по болест: 70-90% в зависимост от случая</li>
                <li>• Пенсия: зависи от осигурителен стаж и доходи</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-slate-600 mb-1">При безработица</p>
            <p className="text-xl font-bold text-blue-600">60%</p>
            <p className="text-xs text-slate-500 mt-1">от средния доход</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-slate-600 mb-1">При майчинство</p>
            <p className="text-xl font-bold text-green-600">90%</p>
            <p className="text-xs text-slate-500 mt-1">до 410 дни</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-slate-600 mb-1">При болест</p>
            <p className="text-xl font-bold text-purple-600">70-90%</p>
            <p className="text-xs text-slate-500 mt-1">в зависимост от случая</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-slate-600 mb-1">При пенсиониране</p>
            <p className="text-xl font-bold text-red-600">~40%</p>
            <p className="text-xs text-slate-500 mt-1">от последния доход</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-red-600 to-pink-700 text-white">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">Защо е важна допълнителната застраховка?</h3>
          <p className="text-sm text-white/90">
            Държавните обезщетения често са недостатъчни за поддържане на стандарта на живот. 
            Личната застраховка за доходи е критично важна за финансовата сигурност на семейството.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default function AuxiliaryTools() {
  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="text-blue-600 font-medium text-sm tracking-widest uppercase mb-4 block">
            Образователни материали
          </span>
          <h1 className="text-3xl md:text-4xl font-light text-slate-900 mb-4">
            Помощни <span className="font-semibold text-blue-600">Средства</span>
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Научете повече за финансовото планиране с нашите интерактивни помощни средства
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-10"
        >
          <Tabs defaultValue="pension" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <TabsTrigger value="pension" className="text-xs">Пенсия</TabsTrigger>
              <TabsTrigger value="rich" className="text-xs">Богати инвеститори</TabsTrigger>
              <TabsTrigger value="pioneer" className="text-xs">Pioneer Fund</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs">Месечно спестяване</TabsTrigger>
              <TabsTrigger value="compound" className="text-xs">Сложна лихва</TabsTrigger>
              <TabsTrigger value="rule72" className="text-xs">Правило 72</TabsTrigger>
            </TabsList>

            <TabsContent value="pension"><PensionDemographics /></TabsContent>
            <TabsContent value="rich"><RichInvestmentStrategy /></TabsContent>
            <TabsContent value="pioneer"><RegularInvestmentPower /></TabsContent>
            <TabsContent value="monthly"><MonthlySavingsTable /></TabsContent>
            <TabsContent value="why"><WhyInvestRegularly /></TabsContent>
            <TabsContent value="compound"><CompoundInterestVisual /></TabsContent>
            <TabsContent value="dax"><DAXTriangle /></TabsContent>
            <TabsContent value="rule72"><Rule72 /></TabsContent>
            <TabsContent value="income"><IncomeProtectionTable /></TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
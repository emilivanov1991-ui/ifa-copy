import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Baby, Car, Palmtree, SkipForward } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ChildrenGoalsStep({ data, onChange }) {
  // Calculate average children age
  const calculateAverageChildAge = () => {
    const childrenCount = data.children_count || 0;
    if (childrenCount === 0) return 0;
    
    let totalAge = 0;
    let validChildren = 0;
    
    for (let i = 1; i <= childrenCount; i++) {
      const birthdate = data[`child_${i}_birthdate`];
      if (birthdate) {
        const birth = new Date(birthdate);
        const today = new Date();
        const age = today.getFullYear() - birth.getFullYear();
        totalAge += age;
        validChildren++;
      }
    }
    
    return validChildren > 0 ? totalAge / validChildren : 0;
  };

  // Calculate required monthly investment using compound interest formula
  const calculateMonthlyInvestment = (targetAmount, years, annualRate) => {
    if (years <= 0 || targetAmount <= 0) return 0;
    const monthlyRate = annualRate / 12;
    const months = years * 12;
    // Future Value of Annuity formula solved for PMT
    const payment = targetAmount * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment);
  };

  const totalChildrenCosts = 
    (data.children_birth_costs || 0) +
    (data.children_education_costs || 0) +
    (data.children_start_life_costs || 0);

  const currentSavings = data.children_current_savings || 0;
  const missingAmount = Math.max(0, totalChildrenCosts - currentSavings);
  const averageChildAge = calculateAverageChildAge();
  const investmentHorizon = Math.max(1, 20 - Math.round(averageChildAge));
  const monthlyInvestment = calculateMonthlyInvestment(missingAmount, investmentHorizon, 0.08);

  // Check for duplicate names
  const getExistingNames = () => {
    return [
      ...(data.referrals_no_own_home || []),
      ...(data.referrals_own_home_long || []),
      ...(data.birthday_family_names || []),
      ...(data.birthday_friends_names || []),
      ...(data.birthday_colleagues_names || []),
      ...(data.referrals_have_savings || []),
      ...(data.referrals_invest_regularly || []),
      ...(data.pension_referrals_abroad || []),
      ...(data.pension_referrals_high_income || []),
      ...(data.pension_referrals_entrepreneur || []),
      ...(data.pension_referrals_young || [])
    ].filter(n => n && n.trim());
  };

  const isDuplicateName = (name) => {
    if (!name || !name.trim()) return false;
    const existingNames = getExistingNames();
    return existingNames.some(h => h.toLowerCase().trim() === name.toLowerCase().trim());
  };

  // Skip children section
  if (data.skip_children_section) {
    return (
      <div className="space-y-8">
        <div className="bg-slate-50 rounded-xl p-6 text-center">
          <Baby className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-900 mb-2">Тази секция е пропусната</h3>
          <p className="text-slate-600 mb-4">Избрали сте да не попълвате секцията за финансово осигуряване на децата.</p>
          <Button 
            variant="outline" 
            onClick={() => onChange('skip_children_section', false)}
            className="rounded-full"
          >
            Върни се към секцията
          </Button>
        </div>

        {/* Other Goals section still visible */}
        <div className="bg-slate-50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Palmtree className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Други цели (кола, почивка...)</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-slate-500" />
                <Label className="font-medium">Кола</Label>
              </div>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={data.other_goals_car || ''}
                onChange={(e) => onChange('other_goals_car', parseInt(e.target.value) || '')}
                className="rounded-lg w-32"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Palmtree className="h-4 w-4 text-slate-500" />
                <Label className="font-medium">Почивка</Label>
              </div>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={data.other_goals_vacation || ''}
                onChange={(e) => onChange('other_goals_vacation', parseInt(e.target.value) || '')}
                className="rounded-lg w-32"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label className="font-medium">Други</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={data.other_goals_other || ''}
                onChange={(e) => onChange('other_goals_other', parseInt(e.target.value) || '')}
                className="rounded-lg w-32"
              />
            </div>
          </div>
        </div>

        <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
          <Checkbox
            checked={data.include_other_goals_in_plan || false}
            onCheckedChange={(checked) => onChange('include_other_goals_in_plan', checked)}
          />
          <span className="font-medium text-blue-800">Да бъде включено във финансовия план</span>
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Children Expenses */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Финансово осигуряване на децата</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onChange('skip_children_section', true)}
            className="rounded-full text-slate-600"
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Пропусни темата
          </Button>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Нуждите на децата растат заедно с тяхната възраст. Разходи, за които трябва да се подготвите:
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-medium">Разходи за раждане</Label>
              <p className="text-xs text-slate-500">детска количка, пелени, медицински грижи...</p>
            </div>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.children_birth_costs || ''}
              onChange={(e) => onChange('children_birth_costs', parseInt(e.target.value) || '')}
              className="rounded-lg w-32"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-medium">Висше образование</Label>
              <p className="text-xs text-slate-500">студентски такси, общежитие...</p>
            </div>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.children_education_costs || ''}
              onChange={(e) => onChange('children_education_costs', parseInt(e.target.value) || '')}
              className="rounded-lg w-32"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-medium">Старт в живота</Label>
              <p className="text-xs text-slate-500">помощ за жилище, започване на бизнес</p>
            </div>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.children_start_life_costs || ''}
              onChange={(e) => onChange('children_start_life_costs', parseInt(e.target.value) || '')}
              className="rounded-lg w-32"
            />
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Общо:</span>
              <span className="font-bold text-lg text-blue-600">{totalChildrenCosts.toLocaleString()} €</span>
            </div>
          </div>

          {/* Current savings for children goals */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <Label className="font-medium">Колко спестявания имате заделени за горните цели?</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.children_current_savings || ''}
              onChange={(e) => onChange('children_current_savings', parseInt(e.target.value) || '')}
              className="rounded-lg w-32"
            />
          </div>

          {/* Investment calculation message */}
          {currentSavings > 0 && missingAmount > 0 && averageChildAge > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
              <p className="text-blue-800">
                За осигуряване на подобни суми са ви необходими инвестиции в размер на около <span className="font-bold">{monthlyInvestment.toLocaleString()} €</span> месечно. Във финансовия план ще откриете по-подробни предложения и проекции.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                (Изчислено при {investmentHorizon} години хоризонт и 8% средна годишна доходност)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Children Referrals */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Кой от Вашите приятели и познати:</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Has children */}
          <div className="space-y-3">
            <Label className="text-slate-700">Има деца?</Label>
            {(data.children_referrals_has_kids || ['']).map((name, index) => {
              const isDuplicate = isDuplicateName(name);
              
              return (
                <div key={`has_kids_${index}`}>
                  <Input
                    placeholder="Име на познат"
                    value={name}
                    onChange={(e) => {
                      const newList = [...(data.children_referrals_has_kids || [''])];
                      newList[index] = e.target.value;
                      if (index === newList.length - 1 && e.target.value) {
                        newList.push('');
                      }
                      onChange('children_referrals_has_kids', newList);
                    }}
                    className={cn("rounded-lg", isDuplicate && "border-amber-500")}
                  />
                  {isDuplicate && (
                    <p className="text-amber-600 text-sm mt-1">
                      Това име бе предоставено на предходните теми. С кого бихме могли да го заменим?
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recent wedding */}
          <div className="space-y-3">
            <Label className="text-slate-700">Е имал сватба през последните три години?</Label>
            {(data.children_referrals_recent_wedding || ['']).map((name, index) => {
              const isDuplicate = isDuplicateName(name);
              
              return (
                <div key={`wedding_${index}`}>
                  <Input
                    placeholder="Име на познат"
                    value={name}
                    onChange={(e) => {
                      const newList = [...(data.children_referrals_recent_wedding || [''])];
                      newList[index] = e.target.value;
                      if (index === newList.length - 1 && e.target.value) {
                        newList.push('');
                      }
                      onChange('children_referrals_recent_wedding', newList);
                    }}
                    className={cn("rounded-lg", isDuplicate && "border-amber-500")}
                  />
                  {isDuplicate && (
                    <p className="text-amber-600 text-sm mt-1">
                      Това име бе предоставено на предходните теми. С кого бихме могли да го заменим?
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Include children in plan */}
      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
        <Checkbox
          checked={data.include_children_in_plan || false}
          onCheckedChange={(checked) => onChange('include_children_in_plan', checked)}
        />
        <span className="font-medium text-blue-800">Да бъде включено във финансовия план</span>
      </label>

      {/* Other Goals */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Palmtree className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Други цели (кола, почивка...)</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onChange('skip_other_goals_section', !data.skip_other_goals_section)}
            className="rounded-full text-slate-600"
          >
            <SkipForward className="h-4 w-4 mr-2" />
            {data.skip_other_goals_section ? 'Върни темата' : 'Пропусни темата'}
          </Button>
        </div>

        {data.skip_other_goals_section ? (
          <p className="text-slate-500 text-center py-4">Тази секция е пропусната.</p>
        ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 items-end">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-slate-500" />
              <Label className="font-medium">Кола</Label>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Сума (€)</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={data.other_goals_car || ''}
                onChange={(e) => onChange('other_goals_car', parseInt(e.target.value) || '')}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Хоризонт (години)</Label>
              <Input
                type="number"
                min="1"
                placeholder="1"
                value={data.other_goals_car_years || ''}
                onChange={(e) => onChange('other_goals_car_years', parseInt(e.target.value) || '')}
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-end">
            <div className="flex items-center gap-2">
              <Palmtree className="h-4 w-4 text-slate-500" />
              <Label className="font-medium">Почивка</Label>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Сума (€)</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={data.other_goals_vacation || ''}
                onChange={(e) => onChange('other_goals_vacation', parseInt(e.target.value) || '')}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Хоризонт (години)</Label>
              <Input
                type="number"
                min="1"
                placeholder="1"
                value={data.other_goals_vacation_years || ''}
                onChange={(e) => onChange('other_goals_vacation_years', parseInt(e.target.value) || '')}
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 items-end">
            <Label className="font-medium">Други</Label>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Описание</Label>
              <Input
                type="text"
                placeholder="Опишете целта..."
                value={data.other_goals_other_description || ''}
                onChange={(e) => onChange('other_goals_other_description', e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Сума (€)</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={data.other_goals_other || ''}
                onChange={(e) => onChange('other_goals_other', parseInt(e.target.value) || '')}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Хоризонт (години)</Label>
              <Input
                type="number"
                min="1"
                placeholder="1"
                value={data.other_goals_other_years || ''}
                onChange={(e) => onChange('other_goals_other_years', parseInt(e.target.value) || '')}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Include other goals in plan */}
      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
        <Checkbox
          checked={data.include_other_goals_in_plan || false}
          onCheckedChange={(checked) => onChange('include_other_goals_in_plan', checked)}
        />
        <span className="font-medium text-blue-800">Да бъде включено във финансовия план</span>
      </label>
    </div>
  );
}
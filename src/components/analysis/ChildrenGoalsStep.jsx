import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Baby, Car, Palmtree } from 'lucide-react';

export default function ChildrenGoalsStep({ data, onChange }) {
  const totalChildrenCosts = 
    (data.children_birth_costs || 0) +
    (data.children_sport_costs || 0) +
    (data.children_education_costs || 0) +
    (data.children_wedding_costs || 0) +
    (data.children_start_life_costs || 0) +
    (data.children_other_costs || 0);

  return (
    <div className="space-y-8">
      {/* Children Expenses */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Baby className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Финансово осигуряване на децата</h3>
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
              <Label className="font-medium">Спорт</Label>
              <p className="text-xs text-slate-500">такси, екипировка...</p>
            </div>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.children_sport_costs || ''}
              onChange={(e) => onChange('children_sport_costs', parseInt(e.target.value) || '')}
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
              <Label className="font-medium">Сватба</Label>
              <p className="text-xs text-slate-500">зестра, празненство, меден месец</p>
            </div>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.children_wedding_costs || ''}
              onChange={(e) => onChange('children_wedding_costs', parseInt(e.target.value) || '')}
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

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-medium">Други</Label>
              <p className="text-xs text-slate-500">шофьорски курс, абитуриентски бал, обучение в чужбина...</p>
            </div>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.children_other_costs || ''}
              onChange={(e) => onChange('children_other_costs', parseInt(e.target.value) || '')}
              className="rounded-lg w-32"
            />
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Общо:</span>
              <span className="font-bold text-lg text-blue-600">{totalChildrenCosts.toLocaleString()} лв</span>
            </div>
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
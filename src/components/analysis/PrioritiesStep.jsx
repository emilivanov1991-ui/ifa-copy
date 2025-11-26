import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ListOrdered, TrendingUp } from 'lucide-react';

const priorities = [
  { key: 'priority_income_protection', label: 'Подсигуряване на доходите', desc: 'минимално 3% от доходите' },
  { key: 'priority_property_protection', label: 'Защита на собствеността', desc: '' },
  { key: 'priority_reserve', label: 'Създаване и увеличаване стойността на резерва', desc: '50% от баланса' },
  { key: 'priority_housing', label: 'Ново жилище', desc: 'спестявания - 1% от ипотечния заем' },
  { key: 'priority_pension', label: 'По-добра пенсия', desc: 'минимално 7% от доходите' },
  { key: 'priority_children', label: 'Финансово подсигуряване на децата', desc: '' },
  { key: 'priority_other', label: 'Други (кола, почивка...)', desc: '' },
];

export default function PrioritiesStep({ data, onChange }) {
  // Get all used priority values
  const usedValues = priorities
    .map(p => data[p.key])
    .filter(v => v !== undefined && v !== null && v !== '');

  // Get available options for a specific priority field
  const getAvailableOptions = (currentKey) => {
    const currentValue = data[currentKey];
    return [1, 2, 3, 4, 5, 6, 7].filter(num => 
      num === currentValue || !usedValues.includes(num)
    );
  };

  return (
    <div className="space-y-8">
      {/* Priorities */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <ListOrdered className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Какви са Вашите приоритети сега?</h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">1 - най-важно, 7 - най-малко важно</p>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left text-sm font-medium text-slate-700 px-4 py-2">Приоритет</th>
                <th className="text-left text-xs text-slate-500 px-4 py-2 hidden sm:table-cell">Описание</th>
                <th className="text-center text-sm font-medium text-slate-700 px-4 py-2 w-20">№</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {priorities.map((priority) => (
                <tr key={priority.key} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <span className="text-sm font-medium text-slate-900">{priority.label}</span>
                    {priority.desc && <p className="text-xs text-slate-500 sm:hidden">{priority.desc}</p>}
                  </td>
                  <td className="px-4 py-2 hidden sm:table-cell">
                    <span className="text-xs text-slate-500">{priority.desc}</span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Select 
                      value={data[priority.key]?.toString() || ''} 
                      onValueChange={(value) => onChange(priority.key, parseInt(value))}
                    >
                      <SelectTrigger className="rounded-lg w-16 mx-auto">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableOptions(priority.key).map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investment Summary */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Инвестиции на финансовия пазар</h3>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Месечно фиксирани (€)</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.monthly_fixed_investment || ''}
              onChange={(e) => onChange('monthly_fixed_investment', parseInt(e.target.value) || '')}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label>Месечно променливи (€)</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.monthly_variable_investment || ''}
              onChange={(e) => onChange('monthly_variable_investment', parseInt(e.target.value) || '')}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label>Общо на месец (€)</Label>
            <div className="h-10 px-3 py-2 bg-blue-100 border border-blue-200 rounded-lg flex items-center">
              <span className="font-semibold text-blue-700">
                {((data.monthly_fixed_investment || 0) + (data.monthly_variable_investment || 0)).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Еднократно (€)</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.one_time_investment || ''}
              onChange={(e) => onChange('one_time_investment', parseInt(e.target.value) || '')}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
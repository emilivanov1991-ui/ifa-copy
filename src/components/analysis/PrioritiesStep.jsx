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
import FinancialHealthCard from './FinancialHealthCard';

const allPriorities = [
  { key: 'priority_income_protection', label: 'Подсигуряване на доходите' },
  { key: 'priority_property_protection', label: 'Защита на собствеността' },
  { key: 'priority_reserve', label: 'Създаване и увеличаване стойността на резерва' },
  { key: 'priority_housing', label: 'Ново жилище' },
  { key: 'priority_pension', label: 'По-добра пенсия' },
  { key: 'priority_children', label: 'Финансово подсигуряване на децата' },
  { key: 'priority_other', label: 'Други (кола, почивка...)' },
];

export default function PrioritiesStep({ data, onChange, showErrors }) {
  // Filter priorities based on conditions
  const getActivePriorities = () => {
    return allPriorities.filter(p => {
      // Skip "Други" if other goals section is skipped
      if (p.key === 'priority_other' && data.skip_other_goals_section) return false;
      
      // Skip "Финансово подсигуряване на децата" if children section is skipped
      if (p.key === 'priority_children' && data.skip_children_section) return false;
      
      // Skip "Ново жилище" if not planning change AND no mortgage on owned property
      if (p.key === 'priority_housing') {
        const notPlanningChange = data.planning_housing_change === false;
        const noMortgage = !data.current_housing_has_mortgage;
        if (notPlanningChange && noMortgage) return false;
      }
      
      // Skip "Защита на собствеността" if no property and no car
      if (p.key === 'priority_property_protection') {
        const hasProperty = data.has_property_1 || data.has_property_2 || data.has_property_3;
        const hasCar = data.has_car_1 || data.has_car_2 || data.has_car_3;
        if (!hasProperty && !hasCar) return false;
      }
      
      return true;
    });
  };

  const priorities = getActivePriorities();
  const maxPriority = priorities.length;

  // Get all used priority values
  const usedValues = priorities
    .map(p => data[p.key])
    .filter(v => v !== undefined && v !== null && v !== '');

  // Get available options for a specific priority field
  const getAvailableOptions = (currentKey) => {
    const currentValue = data[currentKey];
    return Array.from({ length: maxPriority }, (_, i) => i + 1).filter(num => 
      num === currentValue || !usedValues.includes(num)
    );
  };

  // Sort priorities by their assigned value (unassigned at bottom)
  const sortedPriorities = [...priorities].sort((a, b) => {
    const valA = data[a.key];
    const valB = data[b.key];
    if (valA === undefined || valA === null || valA === '') return 1;
    if (valB === undefined || valB === null || valB === '') return -1;
    return valA - valB;
  });

  // Check if all priorities are filled
  const allFilled = priorities.every(p => data[p.key] !== undefined && data[p.key] !== null && data[p.key] !== '');
  const isInvalid = showErrors && !allFilled;

  return (
    <div className="space-y-8">
      {/* Priorities */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <ListOrdered className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Какви са Вашите приоритети сега? <span className="text-red-500">*</span></h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">1 - най-важно, {maxPriority} - най-малко важно</p>

        <div className={`bg-white rounded-lg border overflow-hidden ${isInvalid ? 'border-red-500' : 'border-slate-200'}`}>
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-center text-sm font-medium text-slate-700 px-4 py-2 w-16">№</th>
                <th className="text-left text-sm font-medium text-slate-700 px-4 py-2">Приоритет</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedPriorities.map((priority) => {
                const value = data[priority.key];
                const hasValue = value !== undefined && value !== null && value !== '';
                
                return (
                  <tr key={priority.key} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-center">
                      <Select 
                        value={value?.toString() || ''} 
                        onValueChange={(val) => onChange(priority.key, parseInt(val))}
                      >
                        <SelectTrigger className={`rounded-lg w-14 mx-auto ${!hasValue && isInvalid ? 'border-red-500 bg-red-50' : ''}`}>
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableOptions(priority.key).map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-sm font-medium text-slate-900">{priority.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {isInvalid && (
          <p className="text-red-500 text-sm mt-2">Моля, задайте приоритет на всички елементи.</p>
        )}
      </div>

      {/* Financial Health Card */}
      <FinancialHealthCard data={data} />

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
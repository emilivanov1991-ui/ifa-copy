import React, { useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ListOrdered, TrendingUp, AlertTriangle } from 'lucide-react';
import FinancialHealthCard from './FinancialHealthCard';

const getPriorities = (t) => [
  { key: 'priority_income_protection', label: t('Подсигуряване на доходите', 'Income Protection') },
  { key: 'priority_property_protection', label: t('Защита на собствеността', 'Property Protection') },
  { key: 'priority_reserve', label: t('Създаване и увеличаване стойността на резерва', 'Building and growing the reserve') },
  { key: 'priority_housing', label: t('Ново жилище', 'New home') },
  { key: 'priority_pension', label: t('По-добра пенсия', 'Better pension') },
  { key: 'priority_children', label: t('Финансово подсигуряване на децата', "Children's financial security") },
  { key: 'priority_other', label: t('Други (кола, почивка...)', 'Other (car, vacation...)') },
];

export default function PrioritiesStep({ data, onChange, showErrors, lang = 'bg' }) {
  const t = (bg, en) => lang === 'en' ? en : bg;
  const allPriorities = getPriorities(t);

  // Calculate monthly balance from FinancialFlowStep data
  const monthlyBalance = useMemo(() => {
    const includePartner = data.include_partner || false;
    
    const clientAnnualBonusMonthly = Math.round((data.client_annual_bonus || 0) / 12);
    const partnerAnnualBonusMonthly = Math.round((data.partner_annual_bonus || 0) / 12);
    
    const totalClientIncome = (data.client_net_income || 0) + (data.client_other_monthly_income || 0) + clientAnnualBonusMonthly;
    const totalPartnerIncome = includePartner ? ((data.partner_net_income || 0) + (data.partner_other_monthly_income || 0) + partnerAnnualBonusMonthly) : 0;
    const totalMonthlyIncome = totalClientIncome + totalPartnerIncome;
    
    const totalHousingExpenses = (data.expense_rent || 0) + (data.expense_utilities || 0) + 
      (data.expense_phone || 0) + (data.expense_internet || 0) + (data.expense_tv || 0) + (data.expense_other_housing || 0);
    
    const totalCarExpenses = (data.expense_fuel || 0) + (data.expense_car_maintenance || 0) + (data.expense_car_other || 0);
    
    const totalVariableExpenses = (data.expense_food || 0) + (data.expense_clothing || 0) + (data.expense_culture || 0) +
      (data.expense_travel || 0) + (data.expense_children || 0) + (data.expense_cigarettes || 0) +
      (data.expense_pets || 0) + (data.expense_vacation || 0) + (data.expense_business || 0) + (data.expense_other || 0) +
      (data.expense_education || 0) + (data.expense_health || 0) + (data.expense_cosmetics || 0) +
      (data.expense_hobbies || 0) + (data.expense_electronics || 0) + (data.expense_taxes || 0);

    const totalExpenses = totalHousingExpenses + totalCarExpenses + totalVariableExpenses;
    
    const totalLiabilitiesMonthly = (data.liability_mortgage_monthly || 0) + (data.liability_consumer_loans_monthly || 0) +
      (data.liability_credit_cards_monthly || 0) + (data.liability_leasing_monthly || 0) + (data.liability_overdraft_monthly || 0);

    const totalInsurance = (data.insurance_life || 0) + (data.insurance_property || 0) +
      (data.insurance_movable || 0) + (data.insurance_civil || 0) + (data.insurance_casco || 0) + (data.insurance_other || 0);
    
    return totalMonthlyIncome - totalExpenses - totalInsurance - totalLiabilitiesMonthly;
  }, [data]);

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  // Filter priorities based on conditions
  const getActivePriorities = () => {
    return allPriorities.filter(p => {
      // Always show all priorities - no filtering based on old PersonalDataStep fields
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
  const isInvalid = !allFilled; // Always show validation state, not dependent on showErrors

  // Check if income protection is NOT priority 1
  const incomeProtectionPriority = data.priority_income_protection;
  const showIncomeProtectionWarning = incomeProtectionPriority !== undefined && 
    incomeProtectionPriority !== null && 
    incomeProtectionPriority !== '' && 
    incomeProtectionPriority !== 1;

  const prioritiesSection = (
    <div className="space-y-6">
      {/* Priorities Table */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <ListOrdered className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">{t('След анализа и на база на видяното - Какви са Вашите приоритети сега?', 'After the analysis — what are your priorities now?')} <span className="text-red-500">*</span></h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">{t(`1 - най-важно, ${maxPriority} - най-малко важно`, `1 - most important, ${maxPriority} - least important`)}</p>

        <div className={`bg-white rounded-lg border overflow-hidden ${isInvalid ? 'border-red-500' : 'border-slate-200'}`}>
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-center text-sm font-medium text-slate-700 px-4 py-2 w-16">№</th>
                <th className="text-left text-sm font-medium text-slate-700 px-4 py-2">{t('Приоритет', 'Priority')}</th>
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
          <p className="text-red-500 text-sm mt-2">{t('Моля, задайте приоритет на всички елементи.', 'Please assign a priority to all items.')}</p>
        )}

        {/* Income protection warning - right after priorities table */}
        {showIncomeProtectionWarning && (
          <div className="mt-3 flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-lg p-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 font-medium">
              {t('Всички останали Ваши цели зависят от възможността Ви да генерирате средства. Подсигуряването на доходите Ви следва да е приоритет.', 'All your other goals depend on your ability to generate income. Income protection should be your top priority.')}
            </p>
          </div>
        )}
      </div>

      {/* Monthly Allocation */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">{t('Месечно заделяне', 'Monthly allocation')}</h3>
        </div>
        <div className="space-y-2" data-invalid={showErrors && (data.monthly_priority_allocation === undefined || data.monthly_priority_allocation === '') ? "true" : undefined}>
          <Label>
            {t('Каква част от', 'What portion of')} <span className="font-semibold text-blue-600">{monthlyBalance.toLocaleString()} €</span> {t('(месечен баланс от "Финансов поток"), която Ви остава на месечна база бихте заделили за осигуряване на Вашите приоритети?', '(monthly balance from "Financial Flow") would you allocate monthly to secure your priorities?')} <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            min="0"
            placeholder={t('Въведете сума в евро', 'Enter amount in euro')}
            value={data.monthly_priority_allocation ?? ''}
            onChange={(e) => onChange('monthly_priority_allocation', e.target.value === '' ? '' : parseInt(e.target.value))}
            className={`rounded-lg max-w-xs ${showErrors && (data.monthly_priority_allocation === undefined || data.monthly_priority_allocation === '') ? 'border-red-500 bg-red-50' : ''}`}
            required
          />
          {data.monthly_priority_allocation !== undefined && data.monthly_priority_allocation !== '' && monthlyBalance > 0 && data.monthly_priority_allocation > monthlyBalance && (
            <div className="flex items-start gap-2 mt-2 text-amber-700 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{t('Сумата надхвърля текущите ви възможности за спестяване.', 'The amount exceeds your current savings capacity.')}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );

  return (
    <div className="space-y-8">
      <FinancialHealthCard
        data={data}
        prioritiesWarning={showIncomeProtectionWarning}
        prioritiesSection={prioritiesSection}
      />
    </div>
  );
}
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, Home, Car, ShoppingBag, PiggyBank, CreditCard, Shield } from 'lucide-react';

export default function FinancialFlowStep({ data, onChange }) {
  // Calculate totals
  const totalClientIncome = (data.client_net_income || 0) + (data.client_other_monthly_income || 0);
  const totalPartnerIncome = (data.partner_net_income || 0) + (data.partner_other_monthly_income || 0);
  const totalMonthlyIncome = totalClientIncome + totalPartnerIncome;

  const totalHousingExpenses = (data.expense_rent || 0) + (data.expense_utilities || 0) + 
    (data.expense_phone || 0) + (data.expense_internet || 0) + (data.expense_tv || 0) + (data.expense_other_housing || 0);
  
  const totalCarExpenses = (data.expense_fuel || 0) + (data.expense_car_maintenance || 0) + (data.expense_car_other || 0);
  
  const totalVariableExpenses = (data.expense_food || 0) + (data.expense_clothing || 0) + (data.expense_culture || 0) +
    (data.expense_travel || 0) + (data.expense_children || 0) + (data.expense_cigarettes || 0) +
    (data.expense_pets || 0) + (data.expense_vacation || 0) + (data.expense_business || 0) + (data.expense_other || 0);

  const totalExpenses = totalHousingExpenses + totalCarExpenses + totalVariableExpenses;

  const totalAssets = (data.asset_checking_account || 0) + (data.asset_long_term_savings || 0) +
    (data.asset_medium_term_savings || 0) + (data.asset_short_term_savings || 0);

  const totalLiabilities = (data.liability_mortgage || 0) + (data.liability_consumer_loans || 0) +
    (data.liability_credit_cards || 0) + (data.liability_leasing || 0) + (data.liability_overdraft || 0);

  const totalInsurance = (data.insurance_life || 0) + (data.insurance_property || 0) +
    (data.insurance_household || 0) + (data.insurance_civil || 0) + (data.insurance_casco || 0) + (data.insurance_other || 0);

  return (
    <div className="space-y-8">
      {/* Income */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Banknote className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-slate-900">Доходи (месечни, в €)</h3>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Client */}
          <div>
            <h4 className="font-medium text-slate-700 mb-3">Клиент</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Брутен доход</Label>
                <Input type="number" min="0" placeholder="0" value={data.client_gross_income || ''}
                  onChange={(e) => onChange('client_gross_income', parseInt(e.target.value) || '')} className="rounded-lg w-28" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Нетен доход</Label>
                <Input type="number" min="0" placeholder="0" value={data.client_net_income || ''}
                  onChange={(e) => onChange('client_net_income', parseInt(e.target.value) || '')} className="rounded-lg w-28" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Други месечни доходи</Label>
                <Input type="number" min="0" placeholder="0" value={data.client_other_monthly_income || ''}
                  onChange={(e) => onChange('client_other_monthly_income', parseInt(e.target.value) || '')} className="rounded-lg w-28" />
              </div>
            </div>
          </div>

          {/* Partner */}
          <div>
            <h4 className="font-medium text-slate-700 mb-3">Партньор</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Брутен доход</Label>
                <Input type="number" min="0" placeholder="0" value={data.partner_gross_income || ''}
                  onChange={(e) => onChange('partner_gross_income', parseInt(e.target.value) || '')} className="rounded-lg w-28" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Нетен доход</Label>
                <Input type="number" min="0" placeholder="0" value={data.partner_net_income || ''}
                  onChange={(e) => onChange('partner_net_income', parseInt(e.target.value) || '')} className="rounded-lg w-28" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Други месечни доходи</Label>
                <Input type="number" min="0" placeholder="0" value={data.partner_other_monthly_income || ''}
                  onChange={(e) => onChange('partner_other_monthly_income', parseInt(e.target.value) || '')} className="rounded-lg w-28" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Общо месечни доходи:</span>
            <span className="font-bold text-lg text-green-600">{totalMonthlyIncome.toLocaleString()} €</span>
          </div>
        </div>
      </div>

      {/* Expenses - Housing */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Home className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold text-slate-900">Разходи за жилище (месечни, в €)</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm">Наем</Label>
            <Input type="number" min="0" placeholder="0" value={data.expense_rent || ''}
              onChange={(e) => onChange('expense_rent', parseInt(e.target.value) || '')} className="rounded-lg w-24" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm">Режийни</Label>
            <Input type="number" min="0" placeholder="0" value={data.expense_utilities || ''}
              onChange={(e) => onChange('expense_utilities', parseInt(e.target.value) || '')} className="rounded-lg w-24" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm">Телефон</Label>
            <Input type="number" min="0" placeholder="0" value={data.expense_phone || ''}
              onChange={(e) => onChange('expense_phone', parseInt(e.target.value) || '')} className="rounded-lg w-24" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm">Интернет</Label>
            <Input type="number" min="0" placeholder="0" value={data.expense_internet || ''}
              onChange={(e) => onChange('expense_internet', parseInt(e.target.value) || '')} className="rounded-lg w-24" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm">Телевизия</Label>
            <Input type="number" min="0" placeholder="0" value={data.expense_tv || ''}
              onChange={(e) => onChange('expense_tv', parseInt(e.target.value) || '')} className="rounded-lg w-24" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm">Други</Label>
            <Input type="number" min="0" placeholder="0" value={data.expense_other_housing || ''}
              onChange={(e) => onChange('expense_other_housing', parseInt(e.target.value) || '')} className="rounded-lg w-24" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between">
          <span className="text-sm font-medium">Общо жилище:</span>
          <span className="font-semibold text-red-600">{totalHousingExpenses.toLocaleString()} €</span>
        </div>
      </div>

      {/* Expenses - Car */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Car className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold text-slate-900">Разходи за автомобил (месечни, в €)</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm">Гориво</Label>
            <Input type="number" min="0" placeholder="0" value={data.expense_fuel || ''}
              onChange={(e) => onChange('expense_fuel', parseInt(e.target.value) || '')} className="rounded-lg w-24" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm">Поддръжка</Label>
            <Input type="number" min="0" placeholder="0" value={data.expense_car_maintenance || ''}
              onChange={(e) => onChange('expense_car_maintenance', parseInt(e.target.value) || '')} className="rounded-lg w-24" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm">Други</Label>
            <Input type="number" min="0" placeholder="0" value={data.expense_car_other || ''}
              onChange={(e) => onChange('expense_car_other', parseInt(e.target.value) || '')} className="rounded-lg w-24" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between">
          <span className="text-sm font-medium">Общо автомобил:</span>
          <span className="font-semibold text-red-600">{totalCarExpenses.toLocaleString()} €</span>
        </div>
      </div>

      {/* Variable Expenses */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold text-slate-900">Променливи разходи (месечни, в €)</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            ['Храна', 'expense_food'],
            ['Облекло', 'expense_clothing'],
            ['Култура', 'expense_culture'],
            ['Пътуване', 'expense_travel'],
            ['Деца', 'expense_children'],
            ['Цигари', 'expense_cigarettes'],
            ['Домашни любимци', 'expense_pets'],
            ['Почивка', 'expense_vacation'],
            ['Бизнес разходи', 'expense_business'],
            ['Други', 'expense_other'],
          ].map(([label, key]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <Label className="text-sm">{label}</Label>
              <Input type="number" min="0" placeholder="0" value={data[key] || ''}
                onChange={(e) => onChange(key, parseInt(e.target.value) || '')} className="rounded-lg w-24" />
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between">
          <span className="text-sm font-medium">Общо променливи:</span>
          <span className="font-semibold text-red-600">{totalVariableExpenses.toLocaleString()} €</span>
        </div>
      </div>

      {/* Assets */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <PiggyBank className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Активи (в €)</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ['Разплащателна сметка', 'asset_checking_account'],
            ['Дългосрочни спестявания', 'asset_long_term_savings'],
            ['Средносрочни спестявания', 'asset_medium_term_savings'],
            ['Краткосрочни спестявания', 'asset_short_term_savings'],
          ].map(([label, key]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <Label className="text-sm">{label}</Label>
              <Input type="number" min="0" placeholder="0" value={data[key] || ''}
                onChange={(e) => onChange(key, parseInt(e.target.value) || '')} className="rounded-lg w-28" />
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between">
          <span className="text-sm font-medium">Общо активи:</span>
          <span className="font-semibold text-blue-600">{totalAssets.toLocaleString()} €</span>
        </div>
      </div>

      {/* Liabilities */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-slate-900">Пасиви / Задължения (кредитно салдо, в €)</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ['Ипотека', 'liability_mortgage'],
            ['Потребителски кредити', 'liability_consumer_loans'],
            ['Кредитни карти', 'liability_credit_cards'],
            ['Лизинг', 'liability_leasing'],
            ['Овърдрафт', 'liability_overdraft'],
          ].map(([label, key]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <Label className="text-sm">{label}</Label>
              <Input type="number" min="0" placeholder="0" value={data[key] || ''}
                onChange={(e) => onChange(key, parseInt(e.target.value) || '')} className="rounded-lg w-28" />
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between">
          <span className="text-sm font-medium">Общо задължения:</span>
          <span className="font-semibold text-orange-600">{totalLiabilities.toLocaleString()} €</span>
        </div>
      </div>

      {/* Insurance */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-slate-900">Застраховки (месечни вноски, в €)</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            ['Живот и злополука', 'insurance_life'],
            ['Недвижимо имущество', 'insurance_property'],
            ['Домакинство', 'insurance_household'],
            ['Гражданска застраховка', 'insurance_civil'],
            ['Автокаско', 'insurance_casco'],
            ['Други', 'insurance_other'],
          ].map(([label, key]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <Label className="text-sm">{label}</Label>
              <Input type="number" min="0" placeholder="0" value={data[key] || ''}
                onChange={(e) => onChange(key, parseInt(e.target.value) || '')} className="rounded-lg w-24" />
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between">
          <span className="text-sm font-medium">Общо застраховки:</span>
          <span className="font-semibold text-purple-600">{totalInsurance.toLocaleString()} €</span>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Баланс</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex justify-between">
            <span>Общо доходи:</span>
            <span className="font-semibold text-green-600">{totalMonthlyIncome.toLocaleString()} €</span>
          </div>
          <div className="flex justify-between">
            <span>Общо разходи:</span>
            <span className="font-semibold text-red-600">{totalExpenses.toLocaleString()} €</span>
          </div>
          <div className="flex justify-between">
            <span>Имущество (активи):</span>
            <span className="font-semibold text-blue-600">{totalAssets.toLocaleString()} €</span>
          </div>
          <div className="flex justify-between">
            <span>Задължения:</span>
            <span className="font-semibold text-orange-600">{totalLiabilities.toLocaleString()} €</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200 flex justify-between">
          <span className="font-semibold">Месечен баланс:</span>
          <span className={`font-bold text-lg ${(totalMonthlyIncome - totalExpenses - totalInsurance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(totalMonthlyIncome - totalExpenses - totalInsurance).toLocaleString()} €
          </span>
        </div>
      </div>
    </div>
  );
}
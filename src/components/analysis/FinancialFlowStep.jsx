import React, { useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, Home, Car, ShoppingBag, PiggyBank, CreditCard, Shield } from 'lucide-react';

export default function FinancialFlowStep({ data, onChange, showErrors }) {
  const includePartner = data.include_partner || false;
  
  // Helper to check if a field is invalid
  const isFieldInvalid = (value) => showErrors && (value === undefined || value === null || value === '');

  // Auto-populate gross income from Pension step
  useEffect(() => {
    if (data.client_gross_income_pension !== undefined && data.client_gross_income === undefined) {
      onChange('client_gross_income', data.client_gross_income_pension);
    }
    if (includePartner && data.partner_gross_income_pension !== undefined && data.partner_gross_income === undefined) {
      onChange('partner_gross_income', data.partner_gross_income_pension);
    }
  }, [data.client_gross_income_pension, data.partner_gross_income_pension, includePartner]);

  // Auto-populate checking account from Reserve step
  useEffect(() => {
    if (data.asset_checking_account === undefined) {
      const clientChecking = (data.client_checking_account || 0) + (data.client_cash || 0);
      const partnerChecking = includePartner ? ((data.partner_checking_account || 0) + (data.partner_cash || 0)) : 0;
      onChange('asset_checking_account', clientChecking + partnerChecking);
    }
  }, [data.client_checking_account, data.client_cash, data.partner_checking_account, data.partner_cash, includePartner]);

  // Auto-populate short-term savings from Reserve step
  useEffect(() => {
    if (data.asset_short_term_savings === undefined) {
      const clientShort = (data.client_savings_account || 0) + (data.client_term_deposit || 0);
      const partnerShort = includePartner ? ((data.partner_savings_account || 0) + (data.partner_term_deposit || 0)) : 0;
      onChange('asset_short_term_savings', clientShort + partnerShort);
    }
  }, [data.client_savings_account, data.client_term_deposit, data.partner_savings_account, data.partner_term_deposit, includePartner]);

  // Auto-populate medium-term savings from Reserve step
  useEffect(() => {
    if (data.asset_medium_term_savings === undefined) {
      const clientMedium = (data.client_mutual_funds || 0) + (data.client_crypto || 0) + (data.client_gold || 0);
      const partnerMedium = includePartner ? ((data.partner_mutual_funds || 0) + (data.partner_crypto || 0) + (data.partner_gold || 0)) : 0;
      onChange('asset_medium_term_savings', clientMedium + partnerMedium);
    }
  }, [data.client_mutual_funds, data.client_crypto, data.client_gold, data.partner_mutual_funds, data.partner_crypto, data.partner_gold, includePartner]);

  // Auto-populate long-term savings from Pension and Children steps
  useEffect(() => {
    if (data.asset_long_term_savings === undefined) {
      const clientPension = data.client_voluntary_pension_total || 0;
      const partnerPension = includePartner ? (data.partner_voluntary_pension_total || 0) : 0;
      const childrenSavings = data.children_current_savings || 0;
      onChange('asset_long_term_savings', clientPension + partnerPension + childrenSavings);
    }
  }, [data.client_voluntary_pension_total, data.partner_voluntary_pension_total, data.children_current_savings, includePartner]);

  // Auto-populate real estate value
  useEffect(() => {
    if (data.asset_real_estate === undefined) {
      const currentHousing = data.current_housing === 'owned' ? (data.current_housing_value || 0) : 0;
      const property2 = data.has_property_2 ? (data.property_2_value || 0) : 0;
      const property3 = data.has_property_3 ? (data.property_3_value || 0) : 0;
      onChange('asset_real_estate', currentHousing + property2 + property3);
    }
  }, [data.current_housing, data.current_housing_value, data.has_property_2, data.property_2_value, data.has_property_3, data.property_3_value]);

  // Auto-populate movable property value
  useEffect(() => {
    if (data.asset_movable_property === undefined) {
      const currentMovable = data.current_housing === 'owned' ? (data.current_housing_movable_value || 0) : 0;
      const property2Movable = data.has_property_2 ? (data.property_2_movable_value || 0) : 0;
      const property3Movable = data.has_property_3 ? (data.property_3_movable_value || 0) : 0;
      const car1 = data.has_car_1 ? (data.car_1_value || 0) : 0;
      const car2 = data.has_car_2 ? (data.car_2_value || 0) : 0;
      const car3 = data.has_car_3 ? (data.car_3_value || 0) : 0;
      onChange('asset_movable_property', currentMovable + property2Movable + property3Movable + car1 + car2 + car3);
    }
  }, [data.current_housing, data.current_housing_movable_value, data.has_property_2, data.property_2_movable_value, data.has_property_3, data.property_3_movable_value, data.has_car_1, data.car_1_value, data.has_car_2, data.car_2_value, data.has_car_3, data.car_3_value]);

  // Auto-populate mortgage from Housing step
  useEffect(() => {
    if (data.liability_mortgage_monthly === undefined && data.current_mortgage_monthly_payment) {
      onChange('liability_mortgage_monthly', data.current_mortgage_monthly_payment);
    }
    if (data.liability_mortgage_remaining === undefined && data.current_mortgage_remaining) {
      onChange('liability_mortgage_remaining', data.current_mortgage_remaining);
    }
  }, [data.current_mortgage_monthly_payment, data.current_mortgage_remaining]);

  // Calculate annual bonus as monthly
  const clientAnnualBonusMonthly = Math.round((data.client_annual_bonus || 0) / 12);
  const partnerAnnualBonusMonthly = Math.round((data.partner_annual_bonus || 0) / 12);

  // Calculate totals
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

  const totalFinancialAssets = (data.asset_checking_account || 0) + (data.asset_long_term_savings || 0) +
    (data.asset_medium_term_savings || 0) + (data.asset_short_term_savings || 0);
  
  const totalPropertyAssets = (data.asset_real_estate || 0) + (data.asset_movable_property || 0);
  
  const totalAssets = totalFinancialAssets + totalPropertyAssets;

  const totalLiabilitiesMonthly = (data.liability_mortgage_monthly || 0) + (data.liability_consumer_loans_monthly || 0) +
    (data.liability_credit_cards_monthly || 0) + (data.liability_leasing_monthly || 0) + (data.liability_overdraft_monthly || 0);

  const totalLiabilitiesRemaining = (data.liability_mortgage_remaining || 0) + (data.liability_consumer_loans_remaining || 0) +
    (data.liability_credit_cards_remaining || 0) + (data.liability_leasing_remaining || 0) + (data.liability_overdraft_remaining || 0);

  const totalInsurance = (data.insurance_life || 0) + (data.insurance_property || 0) +
    (data.insurance_movable || 0) + (data.insurance_civil || 0) + (data.insurance_casco || 0) + (data.insurance_other || 0);

  return (
    <div className="space-y-8">
      {/* Income */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Banknote className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-slate-900">Доходи (месечни, в €)</h3>
        </div>

        <div className={includePartner ? "grid lg:grid-cols-2 gap-8" : ""}>
          {/* Client */}
          <div>
            <h4 className="font-medium text-slate-700 mb-3">Клиент</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4" data-invalid={isFieldInvalid(data.client_gross_income) ? "true" : undefined}>
                <Label className="text-sm">Брутен доход <span className="text-red-500">*</span></Label>
                <Input type="number" min="0" value={data.client_gross_income ?? ''}
                  onChange={(e) => onChange('client_gross_income', e.target.value === '' ? '' : parseInt(e.target.value))} 
                  className={`rounded-lg w-28 ${isFieldInvalid(data.client_gross_income) ? 'border-red-500 bg-red-50' : ''}`} />
              </div>
              <div className="flex items-center justify-between gap-4" data-invalid={isFieldInvalid(data.client_net_income) ? "true" : undefined}>
                <Label className="text-sm">Нетен доход <span className="text-red-500">*</span></Label>
                <Input type="number" min="0" value={data.client_net_income ?? ''}
                  onChange={(e) => onChange('client_net_income', e.target.value === '' ? '' : parseInt(e.target.value))} 
                  className={`rounded-lg w-28 ${isFieldInvalid(data.client_net_income) ? 'border-red-500 bg-red-50' : ''}`} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Годишен бонус</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" min="0" value={data.client_annual_bonus ?? 0}
                    onChange={(e) => onChange('client_annual_bonus', e.target.value === '' ? 0 : parseInt(e.target.value))} 
                    className="rounded-lg w-28" />
                  <Input type="number" min="0" value={clientAnnualBonusMonthly}
                    readOnly className="rounded-lg w-28 bg-slate-100" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Други месечни доходи</Label>
                <Input type="number" min="0" value={data.client_other_monthly_income ?? 0}
                  onChange={(e) => onChange('client_other_monthly_income', e.target.value === '' ? 0 : parseInt(e.target.value))} 
                  className="rounded-lg w-28" />
              </div>
            </div>
          </div>

          {/* Partner */}
          {includePartner && (
            <div>
              <h4 className="font-medium text-slate-700 mb-3">Партньор</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4" data-invalid={isFieldInvalid(data.partner_gross_income) ? "true" : undefined}>
                  <Label className="text-sm">Брутен доход <span className="text-red-500">*</span></Label>
                  <Input type="number" min="0" value={data.partner_gross_income ?? ''}
                    onChange={(e) => onChange('partner_gross_income', e.target.value === '' ? '' : parseInt(e.target.value))} 
                    className={`rounded-lg w-28 ${isFieldInvalid(data.partner_gross_income) ? 'border-red-500 bg-red-50' : ''}`} />
                </div>
                <div className="flex items-center justify-between gap-4" data-invalid={isFieldInvalid(data.partner_net_income) ? "true" : undefined}>
                  <Label className="text-sm">Нетен доход <span className="text-red-500">*</span></Label>
                  <Input type="number" min="0" value={data.partner_net_income ?? ''}
                    onChange={(e) => onChange('partner_net_income', e.target.value === '' ? '' : parseInt(e.target.value))} 
                    className={`rounded-lg w-28 ${isFieldInvalid(data.partner_net_income) ? 'border-red-500 bg-red-50' : ''}`} />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm">Годишен бонус</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" min="0" value={data.partner_annual_bonus ?? 0}
                      onChange={(e) => onChange('partner_annual_bonus', e.target.value === '' ? 0 : parseInt(e.target.value))} 
                      className="rounded-lg w-28" />
                    <Input type="number" min="0" value={partnerAnnualBonusMonthly}
                      readOnly className="rounded-lg w-28 bg-slate-100" />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm">Други месечни доходи</Label>
                  <Input type="number" min="0" value={data.partner_other_monthly_income ?? 0}
                    onChange={(e) => onChange('partner_other_monthly_income', e.target.value === '' ? 0 : parseInt(e.target.value))} 
                    className="rounded-lg w-28" />
                </div>
              </div>
            </div>
          )}
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
          {[
            ['Наем', 'expense_rent'],
            ['Режийни', 'expense_utilities'],
            ['Телефон', 'expense_phone'],
            ['Интернет', 'expense_internet'],
            ['Телевизия', 'expense_tv'],
            ['Други', 'expense_other_housing'],
          ].map(([label, key]) => (
            <div key={key} className="flex items-center justify-between gap-2" data-invalid={isFieldInvalid(data[key]) ? "true" : undefined}>
              <Label className="text-sm">{label} <span className="text-red-500">*</span></Label>
              <Input type="number" min="0" value={data[key] ?? ''}
                onChange={(e) => onChange(key, e.target.value === '' ? '' : parseInt(e.target.value))} 
                className={`rounded-lg w-24 ${isFieldInvalid(data[key]) ? 'border-red-500 bg-red-50' : ''}`} />
            </div>
          ))}
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
          {[
            ['Гориво', 'expense_fuel'],
            ['Поддръжка', 'expense_car_maintenance'],
            ['Други', 'expense_car_other'],
          ].map(([label, key]) => (
            <div key={key} className="flex items-center justify-between gap-2" data-invalid={isFieldInvalid(data[key]) ? "true" : undefined}>
              <Label className="text-sm">{label} <span className="text-red-500">*</span></Label>
              <Input type="number" min="0" value={data[key] ?? ''}
                onChange={(e) => onChange(key, e.target.value === '' ? '' : parseInt(e.target.value))} 
                className={`rounded-lg w-24 ${isFieldInvalid(data[key]) ? 'border-red-500 bg-red-50' : ''}`} />
            </div>
          ))}
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
            ['Образование', 'expense_education'],
            ['Здраве', 'expense_health'],
            ['Козметика', 'expense_cosmetics'],
            ['Хобита', 'expense_hobbies'],
            ['Електроника', 'expense_electronics'],
            ['Данъци', 'expense_taxes'],
            ['Други', 'expense_other'],
          ].map(([label, key]) => (
            <div key={key} className="flex items-center justify-between gap-2" data-invalid={isFieldInvalid(data[key]) ? "true" : undefined}>
              <Label className="text-sm">{label} <span className="text-red-500">*</span></Label>
              <Input type="number" min="0" value={data[key] ?? ''}
                onChange={(e) => onChange(key, e.target.value === '' ? '' : parseInt(e.target.value))} 
                className={`rounded-lg w-24 ${isFieldInvalid(data[key]) ? 'border-red-500 bg-red-50' : ''}`} />
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
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1" data-invalid={isFieldInvalid(data.asset_checking_account) ? "true" : undefined}>
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm">Разплащателна сметка <span className="text-red-500">*</span></Label>
              <Input type="number" min="0" value={data.asset_checking_account ?? ''}
                onChange={(e) => onChange('asset_checking_account', e.target.value === '' ? '' : parseInt(e.target.value))} 
                className={`rounded-lg w-28 ${isFieldInvalid(data.asset_checking_account) ? 'border-red-500 bg-red-50' : ''}`} />
            </div>
            <p className="text-xs text-slate-500">Това е сборът от кеш и суми в разплащателни сметки</p>
          </div>
          <div className="space-y-1" data-invalid={isFieldInvalid(data.asset_short_term_savings) ? "true" : undefined}>
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm">Краткосрочни спестявания <span className="text-red-500">*</span></Label>
              <Input type="number" min="0" value={data.asset_short_term_savings ?? ''}
                onChange={(e) => onChange('asset_short_term_savings', e.target.value === '' ? '' : parseInt(e.target.value))} 
                className={`rounded-lg w-28 ${isFieldInvalid(data.asset_short_term_savings) ? 'border-red-500 bg-red-50' : ''}`} />
            </div>
            <p className="text-xs text-slate-500">Това е сборът от депозити и суми в спестовни сметки</p>
          </div>
          <div className="space-y-1" data-invalid={isFieldInvalid(data.asset_medium_term_savings) ? "true" : undefined}>
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm">Средносрочни спестявания <span className="text-red-500">*</span></Label>
              <Input type="number" min="0" value={data.asset_medium_term_savings ?? ''}
                onChange={(e) => onChange('asset_medium_term_savings', e.target.value === '' ? '' : parseInt(e.target.value))} 
                className={`rounded-lg w-28 ${isFieldInvalid(data.asset_medium_term_savings) ? 'border-red-500 bg-red-50' : ''}`} />
            </div>
            <p className="text-xs text-slate-500">Това е сборът от инвестиции, фондове, крипто, злато и др.</p>
          </div>
          <div className="space-y-1" data-invalid={isFieldInvalid(data.asset_long_term_savings) ? "true" : undefined}>
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm">Дългосрочни спестявания <span className="text-red-500">*</span></Label>
              <Input type="number" min="0" value={data.asset_long_term_savings ?? ''}
                onChange={(e) => onChange('asset_long_term_savings', e.target.value === '' ? '' : parseInt(e.target.value))} 
                className={`rounded-lg w-28 ${isFieldInvalid(data.asset_long_term_savings) ? 'border-red-500 bg-red-50' : ''}`} />
            </div>
            <p className="text-xs text-slate-500">Това е сборът от пенсионни фондове и спестявания за деца.</p>
          </div>
          <div className="space-y-1" data-invalid={isFieldInvalid(data.asset_real_estate) ? "true" : undefined}>
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm">Обща стойност на недвижимо имущество <span className="text-red-500">*</span></Label>
              <Input type="number" min="0" value={data.asset_real_estate ?? ''}
                onChange={(e) => onChange('asset_real_estate', e.target.value === '' ? '' : parseInt(e.target.value))} 
                className={`rounded-lg w-28 ${isFieldInvalid(data.asset_real_estate) ? 'border-red-500 bg-red-50' : ''}`} />
            </div>
            <p className="text-xs text-slate-500">Това е общата стойност на недвижимото имущество попълнено в анализа.</p>
          </div>
          <div className="space-y-1" data-invalid={isFieldInvalid(data.asset_movable_property) ? "true" : undefined}>
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm">Обща стойност на движимо имущество <span className="text-red-500">*</span></Label>
              <Input type="number" min="0" value={data.asset_movable_property ?? ''}
                onChange={(e) => onChange('asset_movable_property', e.target.value === '' ? '' : parseInt(e.target.value))} 
                className={`rounded-lg w-28 ${isFieldInvalid(data.asset_movable_property) ? 'border-red-500 bg-red-50' : ''}`} />
            </div>
            <p className="text-xs text-slate-500">Това е общата стойност на движимото имущество попълнено в анализа. (Автомобили и движимо имущество в апартаменти/къщи)</p>
          </div>
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
        
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center mb-2">
          <div></div>
          <span className="text-xs text-slate-500 text-center w-28">Месечна вноска</span>
          <span className="text-xs text-slate-500 text-center w-28">Оставаща сума</span>
        </div>
        
        <div className="space-y-3">
          {/* Mortgage */}
          <div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center" data-invalid={isFieldInvalid(data.liability_mortgage_monthly) || isFieldInvalid(data.liability_mortgage_remaining) ? "true" : undefined}>
              <Label className="text-sm">Ипотека <span className="text-red-500">*</span></Label>
              <Input type="number" min="0" value={data.liability_mortgage_monthly ?? ''}
                onChange={(e) => onChange('liability_mortgage_monthly', e.target.value === '' ? '' : parseInt(e.target.value))} 
                className={`rounded-lg w-28 ${isFieldInvalid(data.liability_mortgage_monthly) ? 'border-red-500 bg-red-50' : ''}`} />
              <Input type="number" min="0" value={data.liability_mortgage_remaining ?? ''}
                onChange={(e) => onChange('liability_mortgage_remaining', e.target.value === '' ? '' : parseInt(e.target.value))} 
                className={`rounded-lg w-28 ${isFieldInvalid(data.liability_mortgage_remaining) ? 'border-red-500 bg-red-50' : ''}`} />
            </div>
            <p className="text-xs text-slate-500 mt-1">Това е спрямо информация от тема "Ново жилище"</p>
          </div>
          
          {/* Consumer loans */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
            <Label className="text-sm">Потребителски кредити</Label>
            <Input type="number" min="0" value={data.liability_consumer_loans_monthly ?? 0}
              onChange={(e) => onChange('liability_consumer_loans_monthly', e.target.value === '' ? 0 : parseInt(e.target.value))} 
              className="rounded-lg w-28" />
            <Input type="number" min="0" value={data.liability_consumer_loans_remaining ?? 0}
              onChange={(e) => onChange('liability_consumer_loans_remaining', e.target.value === '' ? 0 : parseInt(e.target.value))} 
              className="rounded-lg w-28" />
          </div>
          
          {/* Credit cards */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
            <Label className="text-sm">Кредитни карти</Label>
            <Input type="number" min="0" value={data.liability_credit_cards_monthly ?? 0}
              onChange={(e) => onChange('liability_credit_cards_monthly', e.target.value === '' ? 0 : parseInt(e.target.value))} 
              className="rounded-lg w-28" />
            <Input type="number" min="0" value={data.liability_credit_cards_remaining ?? 0}
              onChange={(e) => onChange('liability_credit_cards_remaining', e.target.value === '' ? 0 : parseInt(e.target.value))} 
              className="rounded-lg w-28" />
          </div>
          
          {/* Leasing */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
            <Label className="text-sm">Лизинг</Label>
            <Input type="number" min="0" value={data.liability_leasing_monthly ?? 0}
              onChange={(e) => onChange('liability_leasing_monthly', e.target.value === '' ? 0 : parseInt(e.target.value))} 
              className="rounded-lg w-28" />
            <Input type="number" min="0" value={data.liability_leasing_remaining ?? 0}
              onChange={(e) => onChange('liability_leasing_remaining', e.target.value === '' ? 0 : parseInt(e.target.value))} 
              className="rounded-lg w-28" />
          </div>
          
          {/* Overdraft */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
            <Label className="text-sm">Овърдрафт</Label>
            <Input type="number" min="0" value={data.liability_overdraft_monthly ?? 0}
              onChange={(e) => onChange('liability_overdraft_monthly', e.target.value === '' ? 0 : parseInt(e.target.value))} 
              className="rounded-lg w-28" />
            <Input type="number" min="0" value={data.liability_overdraft_remaining ?? 0}
              onChange={(e) => onChange('liability_overdraft_remaining', e.target.value === '' ? 0 : parseInt(e.target.value))} 
              className="rounded-lg w-28" />
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-[1fr_auto_auto] gap-2">
          <span className="text-sm font-medium">Общо задължения:</span>
          <span className="font-semibold text-orange-600 text-center w-28">{totalLiabilitiesMonthly.toLocaleString()} €</span>
          <span className="font-semibold text-orange-600 text-center w-28">{totalLiabilitiesRemaining.toLocaleString()} €</span>
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
            ['Движимо имущество', 'insurance_movable'],
            ['Гражданска застраховка', 'insurance_civil'],
            ['Автокаско', 'insurance_casco'],
            ['Други', 'insurance_other'],
          ].map(([label, key]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <Label className="text-sm">{label}</Label>
              <Input type="number" min="0" value={data[key] ?? 0}
                onChange={(e) => onChange(key, e.target.value === '' ? 0 : parseInt(e.target.value))} 
                className="rounded-lg w-24" />
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
        <div className="space-y-4">
          {/* Income */}
          <div className="flex justify-between">
            <span>Общо доходи:</span>
            <span className="font-semibold text-green-600">{totalMonthlyIncome.toLocaleString()} €</span>
          </div>
          
          {/* Expenses breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Променливи разходи:</span>
              <span className="text-red-500">{totalExpenses.toLocaleString()} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Разходи за заеми/кредити:</span>
              <span className="text-red-500">{totalLiabilitiesMonthly.toLocaleString()} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Разходи за застраховане:</span>
              <span className="text-red-500">{totalInsurance.toLocaleString()} €</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Общи разходи:</span>
              <span className="font-semibold text-red-600">{(totalExpenses + totalLiabilitiesMonthly + totalInsurance).toLocaleString()} €</span>
            </div>
          </div>
          
          {/* Assets breakdown */}
          <div className="space-y-2 pt-2 border-t border-blue-200">
            <div className="flex justify-between">
              <span className="text-slate-600">Активи на финансов пазар:</span>
              <span className="text-blue-500">{totalFinancialAssets.toLocaleString()} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Активи от движимо и недвижимо имущество:</span>
              <span className="text-blue-500">{totalPropertyAssets.toLocaleString()} €</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Общо активи:</span>
              <span className="font-semibold text-blue-600">{totalAssets.toLocaleString()} €</span>
            </div>
          </div>
          
          {/* Liabilities */}
          <div className="flex justify-between pt-2 border-t border-blue-200">
            <span className="font-semibold">Общо задължения:</span>
            <span className="font-semibold text-orange-600">{totalLiabilitiesRemaining.toLocaleString()} €</span>
          </div>
          
          {/* Net Worth */}
          <div className="flex justify-between">
            <span className="font-semibold">Нетно имущество:</span>
            <span className={`font-semibold ${(totalAssets - totalLiabilitiesRemaining) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(totalAssets - totalLiabilitiesRemaining).toLocaleString()} €
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200 flex justify-between">
          <span className="font-semibold">Месечен баланс:</span>
          <span className={`font-bold text-lg ${(totalMonthlyIncome - totalExpenses - totalInsurance - totalLiabilitiesMonthly) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(totalMonthlyIncome - totalExpenses - totalInsurance - totalLiabilitiesMonthly).toLocaleString()} €
          </span>
        </div>
      </div>
    </div>
  );
}
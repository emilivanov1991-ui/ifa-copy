import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Home, Building2 } from 'lucide-react';
import { cn } from "@/lib/utils";

const formatBulgarianDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleDateString('bg-BG', { month: 'long' });
  
  let suffix = '-ти';
  if (day === 1) suffix = '-ви';
  else if (day === 2) suffix = '-ри';
  else if (day === 7 || day === 8) suffix = '-ми';
  else if (day === 3) suffix = '-ти';
  
  return `${day}${suffix} ${month}`;
};

const calculateMonthlyPayment = (principal, annualRate, years) => {
  if (!principal || !annualRate || !years) return '';
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  if (monthlyRate === 0) return Math.round(principal / numberOfPayments);
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  return Math.round(payment);
};

const interestRateOptions = [];
for (let rate = 1; rate <= 8; rate += 0.5) {
  interestRateOptions.push(rate);
}

const bankOptions = [
  { value: "allianz", label: "Алианц Банк България АД" },
  { value: "dsk", label: "Банка ДСК АД" },
  { value: "bacb", label: "Българо-Американска Кредитна Банка (БАКБ) АД" },
  { value: "bbr", label: "Българска Банка за Развитие ЕАД" },
  { value: "ccb", label: "Централна Кооперативна Банка (ЦКБ) АД" },
  { value: "investbank", label: "Инвестбанк АД" },
  { value: "iab", label: "Интернешънъл Асет Банк АД" },
  { value: "municipal", label: "Общинска Банка АД" },
  { value: "ubb", label: "Обединена Българска Банка (ОББ) АД" },
  { value: "fibank", label: "Първа Инвестиционна Банка АД (Fibank)" },
  { value: "procredit", label: "ПроКредит Банк (България) ЕАД" },
  { value: "postbank", label: "Пощенска Банка Юробанк България АД" },
  { value: "texim", label: "Тексим Банк АД" },
  { value: "tbi", label: "Ти Би Ай Банк ЕАД" },
  { value: "tokuda", label: "Токуда Банк АД" },
  { value: "tbank", label: "Търговска Банка Д АД" },
  { value: "unicredit", label: "Уникредит Булбанк АД" },
  { value: "eurobank", label: "Юробанк България АД (Пощенска Банка)" },
];

  const MONTHS = {
    bg: ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  const currentMonths = MONTHS[lang] || MONTHS.bg;

  function getBdayLabel(data, lang, t) {
    const clientBday = data.client_birthday_day && data.client_birthday_month
      ? `${data.client_birthday_day}${lang === 'bg' ? '-ти' : ''} ${currentMonths[data.client_birthday_month - 1]}`
      : null;
    const partnerBday = data.include_partner && data.partner_birthday_day && data.partner_birthday_month
      ? `${data.partner_birthday_day}${lang === 'bg' ? '-ти' : ''} ${currentMonths[data.partner_birthday_month - 1]}`
      : null;
  return clientBday
    ? (partnerBday ? `${clientBday} / ${partnerBday}` : clientBday)
    : t(' (въведете рожден ден)', ' (enter birthday)');
}

function BirthdayPlaceQuestion({ data, onChange, lang, t }) {
  const bdayLabel = getBdayLabel(data, lang, t);
  return (
    <div className="space-y-3">
      <Label className="text-slate-700">
        {t('Представете си, че днес е', 'Imagine that today is')} <span className="font-semibold">{bdayLabel}</span> {t('и', 'and')} <span className="font-bold">{t('имате неограничен бюджет', 'you have an unlimited budget')}</span>! {t('Къде бихте празнували своя рожен ден?', 'Where would you celebrate your birthday?')}

      </Label>
      <Input
        placeholder={t('Опишете мястото...', 'Describe the place...')}

        value={data.birthday_celebration_place || ''}
        onChange={(e) => {
          onChange('birthday_celebration_place', e.target.value);
          onChange('birthday_place_ready', false);
          if (e.target.value) {
            clearTimeout(window.birthdayPlaceTimeout);
            window.birthdayPlaceTimeout = setTimeout(() => {
              onChange('birthday_place_ready', true);
            }, 2000);
          }
        }}
        className="rounded-lg"
      />
    </div>
  );
}

function BirthdayPartyQuestion({ data, lang, t }) {
    const clientBday = data.client_birthday_day && data.client_birthday_month
      ? `${data.client_birthday_day}${lang === 'bg' ? '-ти' : ''} ${currentMonths[data.client_birthday_month - 1]}`
      : '';
    const partnerBday = data.include_partner && data.partner_birthday_day && data.partner_birthday_month
      ? ` / ${data.partner_birthday_day}${lang === 'bg' ? '-ти' : ''} ${currentMonths[data.partner_birthday_month - 1]}`
      : '';
  const preposition = /^[аъоуеиАЪОУЕИ]/.test(data.birthday_celebration_place || '') ? 'в' : 'на';
  return (
    <Label className="text-slate-700">
      {t('Представете си, че сте', 'Imagine you are at')} {preposition} <span className="font-semibold">{data.birthday_celebration_place}</span> {t('и е', 'and it is')} {clientBday}{partnerBday}, <span className="font-bold">{t('имате неограничен бюджет и организирате едно голямо парти. Колко човека бихте поканили на едно такова голямо парти?', 'you have an unlimited budget and are organizing a big party. How many people would you invite to such a big party?')}</span>
    </Label>
  );
}

export default function HousingStep({ data, onChange, showErrors, plannerData, lang = 'bg' }) {
  const [showDownPaymentWarning, setShowDownPaymentWarning] = React.useState(false);
  const isFieldInvalid = (value) => showErrors && (value === undefined || value === '' || value === null);
  const t = (bg, en) => lang === 'en' ? en : bg;
  const plannedValue = data.planned_housing_value || 0;
  const extraCosts = data.planned_housing_extra_costs || 0;
  const availableCash = data.available_cash || 0;
  const calculatedLoanAmount = Math.max(0, plannedValue + extraCosts - availableCash);

  const interestRate = data.loan_interest_rate || 3;
  const loanYears = data.loan_term_years || 0;
  const calculatedMonthlyPayment = calculateMonthlyPayment(calculatedLoanAmount, interestRate, loanYears);

  const totalPayments = calculatedMonthlyPayment && loanYears ? calculatedMonthlyPayment * loanYears * 12 : 0;
  const totalOverpayment = totalPayments > calculatedLoanAmount ? totalPayments - calculatedLoanAmount : 0;
  
  const potentialSavingsMin = Math.round(totalOverpayment * 0.30);
  const potentialSavingsMax = Math.round(totalOverpayment * 0.40);

  return (
    <div className="space-y-8">
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Home className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">{t('Сегашна ситуация', 'Current Situation')}</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2" data-invalid={isFieldInvalid(data.current_housing) ? "true" : undefined}>
            <Label>{t('Текущо жилище', 'Current Housing')} <span className="text-red-500">*</span></Label>
            <Select 
              value={data.current_housing || ''} 
              onValueChange={(value) => onChange('current_housing', value)}
            >
              <SelectTrigger className={`rounded-lg ${isFieldInvalid(data.current_housing) ? 'border-red-500 bg-red-50' : ''}`}>
                <SelectValue placeholder={t('Изберете', 'Select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rented">{t('Наето жилище', 'Rented')}</SelectItem>
                <SelectItem value="with_parents">{t('При родители', 'With parents')}</SelectItem>
                <SelectItem value="owned">{t('Собствено жилище', 'Own home')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {data.current_housing && (
            <>
              {(data.current_housing === 'rented' || data.current_housing === 'with_parents') && (
                <div className="space-y-2" data-invalid={isFieldInvalid(data.current_housing_location) ? "true" : undefined}>
                  <Label>{t('Локация', 'Location')} <span className="text-red-500">*</span></Label>
                  <Input
                    value={data.current_housing_location || ''}
                    onChange={(e) => onChange('current_housing_location', e.target.value)}
                    className={`rounded-lg ${isFieldInvalid(data.current_housing_location) ? 'border-red-500 bg-red-50' : ''}`}
                    required
                  />
                </div>
              )}

              {data.current_housing === 'owned' && (
                <div className="space-y-2" data-invalid={isFieldInvalid(data.current_housing_address) ? "true" : undefined}>
                  <Label>{t('Адрес', 'Address')} <span className="text-red-500">*</span></Label>
                  <Input
                    value={data.current_housing_address || ''}
                    onChange={(e) => onChange('current_housing_address', e.target.value)}
                    className={`rounded-lg ${isFieldInvalid(data.current_housing_address) ? 'border-red-500 bg-red-50' : ''}`}
                    required
                  />
                </div>
              )}

              <div className={cn("grid gap-4", (data.current_housing === 'with_parents' || data.current_housing === 'rented') ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4")}>
                <div className="space-y-2" data-invalid={isFieldInvalid(data.current_housing_rooms) ? "true" : undefined}>
                  <Label>{t('Брой стаи', 'Rooms')} <span className="text-red-500">*</span></Label>
                  <Input
                   type="number"
                   min="1"
                   max="20"
                   value={data.current_housing_rooms || ''}
                   onChange={(e) => onChange('current_housing_rooms', parseInt(e.target.value) || '')}
                   className={`rounded-lg ${isFieldInvalid(data.current_housing_rooms) ? 'border-red-500 bg-red-50' : ''}`}
                   required
                  />
                  </div>
                  <div className="space-y-2" data-invalid={isFieldInvalid(data.current_housing_area) ? "true" : undefined}>
                  <Label>{t('Застроена площ (кв.м)', 'Area (sq.m)')} <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="10"
                    value={data.current_housing_area || ''}
                    onChange={(e) => onChange('current_housing_area', parseInt(e.target.value) || '')}
                    className={`rounded-lg ${isFieldInvalid(data.current_housing_area) ? 'border-red-500 bg-red-50' : ''}`}
                    required
                  />
                </div>
                {data.current_housing === 'owned' && (
                  <>
                    <div className="space-y-2" data-invalid={isFieldInvalid(data.current_housing_value) ? "true" : undefined}>
                      <Label>{t('Стойност (€)', 'Value (€)')} <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        min="0"
                        value={data.current_housing_value || ''}
                        onChange={(e) => onChange('current_housing_value', parseInt(e.target.value) || '')}
                        className={`rounded-lg ${isFieldInvalid(data.current_housing_value) ? 'border-red-500 bg-red-50' : ''}`}
                        required
                      />
                    </div>
                    <div className="space-y-2" data-invalid={isFieldInvalid(data.current_housing_movable_value) ? "true" : undefined}>
                      <Label>{t('Движимо имущество (€)', 'Movable property (€)')} <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        min="0"
                        value={data.current_housing_movable_value || ''}
                        onChange={(e) => onChange('current_housing_movable_value', parseInt(e.target.value) || '')}
                        className={`rounded-lg ${isFieldInvalid(data.current_housing_movable_value) ? 'border-red-500 bg-red-50' : ''}`}
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {data.current_housing === 'owned' && (
            <div className="border-t border-slate-200 pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <Label className="cursor-pointer">{t('Има ли ипотека?', 'Is there a mortgage?')}</Label>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-medium", !(data.current_housing_has_mortgage ?? false) ? "text-green-600" : "text-slate-400")}>Не</span>
                  <button
                    type="button"
                    onClick={() => onChange('current_housing_has_mortgage', !(data.current_housing_has_mortgage ?? false))}
                    className={cn(
                      "w-12 h-7 rounded-full transition-colors relative",
                      (data.current_housing_has_mortgage ?? false) ? "bg-red-500" : "bg-green-500"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full absolute top-1 transition-all",
                      (data.current_housing_has_mortgage ?? false) ? "right-1" : "left-1"
                    )} />
                  </button>
                  <span className={cn("text-sm font-medium", (data.current_housing_has_mortgage ?? false) ? "text-red-600" : "text-slate-400")}>Да</span>
                </div>
              </div>

              {data.current_housing_has_mortgage && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-slate-200">
                  <div className="space-y-2" data-invalid={isFieldInvalid(data.current_mortgage_remaining) ? "true" : undefined}>
                    <Label>{t('Остатъчна сума (€)', 'Remaining balance (€)')} <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.current_mortgage_remaining || ''}
                      onChange={(e) => onChange('current_mortgage_remaining', parseInt(e.target.value) || '')}
                      className={`rounded-lg ${isFieldInvalid(data.current_mortgage_remaining) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2" data-invalid={isFieldInvalid(data.current_mortgage_interest_rate) ? "true" : undefined}>
                    <Label>{t('Лихвен процент (%)', 'Interest rate (%)')} <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={data.current_mortgage_interest_rate || ''}
                      onChange={(e) => onChange('current_mortgage_interest_rate', parseFloat(e.target.value) || '')}
                      className={`rounded-lg ${isFieldInvalid(data.current_mortgage_interest_rate) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2" data-invalid={isFieldInvalid(data.current_mortgage_bank) ? "true" : undefined}>
                    <Label>{t('Банка', 'Bank')} <span className="text-red-500">*</span></Label>
                    <Combobox
                      options={bankOptions}
                      value={data.current_mortgage_bank || ''}
                      onValueChange={(value) => onChange('current_mortgage_bank', value)}
                      placeholder={t('Търси банка...', 'Search bank...')}
                      searchPlaceholder={t('Търси банка...', 'Search bank...')}
                      emptyText={t('Няма намерена банка.', 'No bank found.')}
                      triggerClassName={`rounded-lg ${isFieldInvalid(data.current_mortgage_bank) ? 'border-red-500 bg-red-50' : ''}`}
                    />
                  </div>
                  <div className="space-y-2" data-invalid={isFieldInvalid(data.current_mortgage_remaining_years) ? "true" : undefined}>
                    <Label>{t('Оставащ период (години)', 'Remaining term (years)')} <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      max="35"
                      value={data.current_mortgage_remaining_years || ''}
                      onChange={(e) => onChange('current_mortgage_remaining_years', parseInt(e.target.value) || '')}
                      className={`rounded-lg ${isFieldInvalid(data.current_mortgage_remaining_years) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2" data-invalid={isFieldInvalid(data.current_mortgage_monthly_payment) ? "true" : undefined}>
                    <Label>{t('Месечна вноска (€)', 'Monthly payment (€)')} <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.current_mortgage_monthly_payment || ''}
                      onChange={(e) => onChange('current_mortgage_monthly_payment', parseInt(e.target.value) || '')}
                      className={`rounded-lg ${isFieldInvalid(data.current_mortgage_monthly_payment) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">{t('Планирате ли промяна?', 'Are you planning a change?')}</h3>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Label className="cursor-pointer">{t('Планирам промяна', 'I plan a change')}</Label>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", !(data.planning_housing_change ?? true) ? "text-red-600" : "text-slate-400")}>{t('Не', 'No')}</span>
            <button
              type="button"
              onClick={() => onChange('planning_housing_change', !(data.planning_housing_change ?? true))}
              className={cn(
                "w-12 h-7 rounded-full transition-colors relative",
                (data.planning_housing_change ?? true) ? "bg-green-500" : "bg-red-500"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-1 transition-all",
                (data.planning_housing_change ?? true) ? "right-1" : "left-1"
              )} />
            </button>
            <span className={cn("text-sm font-medium", (data.planning_housing_change ?? true) ? "text-green-600" : "text-slate-400")}>{t('Да', 'Yes')}</span>
            </div>
            </div>

            {(data.planning_housing_change ?? true) && (
            <div className="space-y-4">
            <div className="space-y-2" data-invalid={isFieldInvalid(data.planned_housing_type) ? "true" : undefined}>
            <Label>{t('Вид на промяната', 'Type of change')} <span className="text-red-500">*</span></Label>
            <Select 
              value={data.planned_housing_type || ''} 
              onValueChange={(value) => onChange('planned_housing_type', value)}
            >
              <SelectTrigger className={`rounded-lg ${isFieldInvalid(data.planned_housing_type) ? 'border-red-500 bg-red-50' : ''}`}>
                <SelectValue placeholder={t('Изберете', 'Select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">{t('Покупка на Апартамент или Къща', 'Purchase of Apartment or House')}</SelectItem>
                <SelectItem value="house">{t('Строителство на Къща', 'House Construction')}</SelectItem>
                <SelectItem value="reconstruction">{t('Реконструкция и ремонтни дейности', 'Reconstruction and Renovation')}</SelectItem>
              </SelectContent>
            </Select>
            </div>

            {(data.planned_housing_type === 'apartment' || data.planned_housing_type === 'house') && (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2" data-invalid={isFieldInvalid(data.planned_housing_rooms) ? "true" : undefined}>
                    <Label>{t('Брой стаи', 'Rooms')} <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={data.planned_housing_rooms || ''}
                      onChange={(e) => onChange('planned_housing_rooms', parseInt(e.target.value) || '')}
                      className={`rounded-lg ${isFieldInvalid(data.planned_housing_rooms) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2" data-invalid={isFieldInvalid(data.planned_housing_area) ? "true" : undefined}>
                    <Label>{t('Застроена площ (кв.м)', 'Area (sq.m)')} <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="10"
                      value={data.planned_housing_area || ''}
                      onChange={(e) => onChange('planned_housing_area', parseInt(e.target.value) || '')}
                      className={`rounded-lg ${isFieldInvalid(data.planned_housing_area) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2" data-invalid={isFieldInvalid(data.planned_housing_value) ? "true" : undefined}>
                    <Label>{t('Стойност на имота (€)', 'Property value (€)')} <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.planned_housing_value || ''}
                      onChange={(e) => onChange('planned_housing_value', parseInt(e.target.value) || '')}
                      className={`rounded-lg ${isFieldInvalid(data.planned_housing_value) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2" data-invalid={isFieldInvalid(data.planned_housing_timeline_years) ? "true" : undefined}>
                    <Label>{t('Времеви хоризонт (години)', 'Time horizon (years)')} <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={data.planned_housing_timeline_years || ''}
                      onChange={(e) => onChange('planned_housing_timeline_years', parseInt(e.target.value) || '')}
                      className={`rounded-lg ${isFieldInvalid(data.planned_housing_timeline_years) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2" data-invalid={isFieldInvalid(data.planned_housing_extra_costs) ? "true" : undefined}>
                    <Label>{t('Разходи ремонт/обзавеждане (€)', 'Renovation/furnishing costs (€)')} <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.planned_housing_extra_costs || ''}
                      onChange={(e) => onChange('planned_housing_extra_costs', parseInt(e.target.value) || '')}
                      className={`rounded-lg ${isFieldInvalid(data.planned_housing_extra_costs) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('Цена на кв.м. (€)', 'Price per sq.m. (€)')}</Label>
                    <Input
                      type="number"
                      value={data.planned_housing_area > 0 ? Math.round((data.planned_housing_value || 0) / data.planned_housing_area) : ''}
                      readOnly
                      className="rounded-lg bg-slate-100"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {t('В случай на необходимост за определяне на приблизителната стойност на имота кликнете', 'To determine the approximate value of the property click')}{' '}
                  <a href="https://www.imot.bg/sredni-ceni/table" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t('тук', 'here')}</a>!
                </p>
              </>
            )}

            {data.planned_housing_type === 'reconstruction' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2" data-invalid={isFieldInvalid(data.planned_housing_timeline_years) ? "true" : undefined}>
                  <Label>{t('Времеви хоризонт (години)', 'Time horizon (years)')} <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={data.planned_housing_timeline_years || ''}
                    onChange={(e) => onChange('planned_housing_timeline_years', parseInt(e.target.value) || '')}
                    className={`rounded-lg ${isFieldInvalid(data.planned_housing_timeline_years) ? 'border-red-500 bg-red-50' : ''}`}
                    required
                  />
                </div>
                <div className="space-y-2" data-invalid={isFieldInvalid(data.planned_housing_extra_costs) ? "true" : undefined}>
                  <Label>{t('Разходи ремонт/обзавеждане (€)', 'Renovation/furnishing costs (€)')} <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.planned_housing_extra_costs || ''}
                    onChange={(e) => onChange('planned_housing_extra_costs', parseInt(e.target.value) || '')}
                    className={`rounded-lg ${isFieldInvalid(data.planned_housing_extra_costs) ? 'border-red-500 bg-red-50' : ''}`}
                    required
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {(data.planning_housing_change ?? true) && data.planned_housing_type && (
        <div className="bg-slate-50 rounded-xl p-6">
          <h3 className="font-semibold text-slate-900 mb-6">{t('Начин на финансиране', 'Financing Method')}</h3>
          
          <div className="space-y-4">
            <div className="space-y-2" data-invalid={isFieldInvalid(data.financing_method) ? "true" : undefined}>
              <Label>{t('Метод на финансиране', 'Financing method')} <span className="text-red-500">*</span></Label>
              <Select 
                value={data.financing_method || ''} 
                onValueChange={(value) => onChange('financing_method', value)}
              >
                <SelectTrigger className={`rounded-lg ${isFieldInvalid(data.financing_method) ? 'border-red-500 bg-red-50' : ''}`}>
                  <SelectValue placeholder={t('Изберете', 'Select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t('Пари в брой', 'Cash')}</SelectItem>
                  <SelectItem value="cash_and_loan">{t('Пари в брой + заем / кредит', 'Cash + Loan')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.financing_method === 'cash' ? (
              <div className="space-y-2" data-invalid={isFieldInvalid(data.available_cash) ? "true" : undefined}>
                <Label>
                  {t('Наличност в брой към момента на', 'Cash available at the time of')} {
                  data.planned_housing_type === 'apartment' ? t('Закупуването', 'purchase') :
                  data.planned_housing_type === 'house' ? t('строителството', 'construction') :
                  t('Ремонта и реконструкцията', 'renovation')
                  } (€) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                  type="number"
                  min="0"
                  value={data.available_cash || ''}
                  onChange={(e) => onChange('available_cash', parseInt(e.target.value) || '')}
                  className={`rounded-lg ${isFieldInvalid(data.available_cash) ? 'border-red-500 bg-red-50' : ''}`}
                  required
                  />
              </div>
            ) : data.financing_method === 'cash_and_loan' ? (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2" data-invalid={isFieldInvalid(data.available_cash) ? "true" : undefined}>
                    <Label>
                      {t('Наличност в брой към момента на', 'Cash available at the time of')} {
                        data.planned_housing_type === 'apartment' ? t('Закупуването', 'purchase') :
                        data.planned_housing_type === 'house' ? t('строителството', 'construction') :
                        t('Ремонта и реконструкцията', 'renovation')
                      } (€) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.available_cash || ''}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value) || '';
                        onChange('available_cash', newValue);
                        setShowDownPaymentWarning(false);
                        clearTimeout(window.downPaymentWarningTimeout);
                        if (newValue) {
                          window.downPaymentWarningTimeout = setTimeout(() => {
                            setShowDownPaymentWarning(true);
                          }, 1000);
                        }
                      }}
                      className={`rounded-lg ${isFieldInvalid(data.available_cash) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('Размер на заема (€)', 'Loan amount (€)')}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={calculatedLoanAmount}
                      readOnly
                      className="rounded-lg bg-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('Лихвен процент (%)', 'Interest rate (%)')} <span className="text-red-500">*</span></Label>
                    <Select 
                      value={(data.loan_interest_rate || 3).toString()} 
                      onValueChange={(value) => onChange('loan_interest_rate', parseFloat(value))}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {interestRateOptions.map((rate) => (
                          <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2" data-invalid={isFieldInvalid(data.loan_term_years) ? "true" : undefined}>
                    <Label>{t('Срок на изплащане (години)', 'Repayment term (years)')} <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="1"
                      max="35"
                      value={data.loan_term_years || ''}
                      onChange={(e) => onChange('loan_term_years', parseInt(e.target.value) || '')}
                      className={`rounded-lg ${isFieldInvalid(data.loan_term_years) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('Очаквана месечна вноска (€)', 'Expected monthly payment (€)')}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={calculatedMonthlyPayment}
                      readOnly
                      className="rounded-lg bg-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('Общо надплащане (€)', 'Total overpayment (€)')}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={totalOverpayment}
                      readOnly
                      className={cn(
                        "rounded-lg",
                        data.available_cash && data.loan_term_years && calculatedLoanAmount > 0
                          ? "bg-red-100 text-red-700 font-semibold"
                          : "bg-slate-100"
                      )}
                    />
                  </div>
                </div>

                {/* Warning for insufficient down payment */}
                {showDownPaymentWarning && plannedValue > 0 && availableCash > 0 && availableCash < (plannedValue * 0.15) && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-700">
                      <span className="font-semibold">{t('Внимание:', 'Warning:')}</span> {t('Необходимото минимално самоучастие е 15%. Съветваме Ви да го осигурим преди закупуването на имота.', 'The required minimum down payment is 15%. We advise you to secure it before purchasing the property.')}
                    </p>
                  </div>
                )}

                {totalOverpayment > 0 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 font-medium">{t('Можем да спестим между:', 'We can save between:')}</span>
                      <span className="text-green-800 font-bold text-lg">{potentialSavingsMin.toLocaleString('bg-BG')} € - {potentialSavingsMax.toLocaleString('bg-BG')} €</span>
                    </div>
                    <p className="text-green-600 text-sm mt-1">
                      {t('Това е между 30% и 40% от общото надплащане по кредита. Това постигаме, чрез преференциални кредитни условия, по-изгодно застраховане и ефективен Инвестиционно-погасителен план.', 'This is 30-40% of the total loan overpayment, achieved through preferential credit terms, better insurance, and an effective investment-repayment plan.')}
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">{t('Кой от вашите познати:', 'Which of your acquaintances:')}</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-slate-700">{t('Все още не живее в собствено жилище (живее при родителите си, под наем...)', 'Does not yet own a home (renting, with parents...)')}</Label>
            {(data.referrals_no_own_home || ['']).map((name, index) => (
              <Input
                key={`no_home_${index}`}
                placeholder={t('Име на познат', 'Name of acquaintance')}
                value={name}
                onChange={(e) => {
                  const newList = [...(data.referrals_no_own_home || [''])];
                  newList[index] = e.target.value;
                  if (index === newList.length - 1 && e.target.value) {
                    newList.push('');
                  }
                  onChange('referrals_no_own_home', newList);
                }}
                className="rounded-lg"
              />
            ))}
          </div>

          <div className="space-y-3">
            <Label className="text-slate-700">{t('Вече дълго време живее в собствено жилище', 'Has been living in their own home for a long time')}</Label>
            {(data.referrals_own_home_long || ['']).map((name, index) => (
              <Input
                key={`own_home_${index}`}
                placeholder={t('Име на познат', 'Name of acquaintance')}
                value={name}
                onChange={(e) => {
                  const newList = [...(data.referrals_own_home_long || [''])];
                  newList[index] = e.target.value;
                  if (index === newList.length - 1 && e.target.value) {
                    newList.push('');
                  }
                  onChange('referrals_own_home_long', newList);
                }}
                className="rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">{t('Визуализационна помощ за препоръки', 'Visualization aid for referrals')}</h3>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", !(data.birthday_example_enabled ?? false) ? "text-red-600" : "text-slate-400")}>Не</span>
            <button
              type="button"
              onClick={() => onChange('birthday_example_enabled', !(data.birthday_example_enabled ?? false))}
              className={cn(
                "w-12 h-7 rounded-full transition-colors relative",
                (data.birthday_example_enabled ?? false) ? "bg-green-500" : "bg-red-500"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-1 transition-all",
                (data.birthday_example_enabled ?? false) ? "right-1" : "left-1"
              )} />
            </button>
            <span className={cn("text-sm font-medium", (data.birthday_example_enabled ?? false) ? "text-green-600" : "text-slate-400")}>Да</span>
          </div>
        </div>

        {data.birthday_example_enabled && (
          <div className="space-y-6">
            {/* Birthday date inputs */}
            <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
              <div>
                <Label className="text-slate-700 mb-2 block font-medium">
                  Рожден ден на {data.client_first_name || 'Клиент'}
                </Label>
                <div className="flex items-center gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Ден</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      placeholder={t('дд', 'dd')}
                      value={data.client_birthday_day || ''}
                      onChange={(e) => onChange('client_birthday_day', parseInt(e.target.value) || '')}
                      className="rounded-lg w-20"
                    />
                  </div>
                  <div className="space-y-1">
                   <Label className="text-xs text-slate-500">{t('Месец', 'Month')}</Label>
                   <div className="relative">
                     <Input
                       type="number"
                       min="1"
                       max="12"
                       placeholder={t('мм', 'mm')}
                       value={data.client_birthday_month || ''}
                       onChange={(e) => onChange('client_birthday_month', parseInt(e.target.value) || '')}
                       className="rounded-lg w-20"
                     />
                     {data.client_birthday_month >= 1 && data.client_birthday_month <= 12 && (
                       <span className="absolute left-0 -bottom-5 text-xs text-blue-600 whitespace-nowrap">
                         {MONTHS[data.client_birthday_month - 1]}
                       </span>
                     )}
                   </div>
                  </div>
                  {data.client_birthday_day && data.client_birthday_month && (
                    <span className="text-sm text-slate-600 mt-5">
                      → {data.client_birthday_day}{lang === 'bg' ? '-ти' : ''} {currentMonths[data.client_birthday_month - 1]}
                    </span>
                  )}
                </div>
              </div>

              {data.include_partner && (
                <div>
                  <Label className="text-slate-700 mb-2 block font-medium">
                    Рожден ден на {data.partner_first_name || 'Партньор'}
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Ден</Label>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        placeholder={t('дд', 'dd')}
                        value={data.partner_birthday_day || ''}
                        onChange={(e) => onChange('partner_birthday_day', parseInt(e.target.value) || '')}
                        className="rounded-lg w-20"
                      />
                    </div>
                    <div className="space-y-1">
                     <Label className="text-xs text-slate-500">{t('Месец', 'Month')}</Label>
                     <div className="relative">
                       <Input
                         type="number"
                         min="1"
                         max="12"
                         placeholder={t('мм', 'mm')}
                         value={data.partner_birthday_month || ''}
                         onChange={(e) => onChange('partner_birthday_month', parseInt(e.target.value) || '')}
                         className="rounded-lg w-20"
                       />
                       {data.partner_birthday_month >= 1 && data.partner_birthday_month <= 12 && (
                         <span className="absolute left-0 -bottom-5 text-xs text-blue-600 whitespace-nowrap">
                           {MONTHS[data.partner_birthday_month - 1]}
                         </span>
                       )}
                     </div>
                    </div>
                    {data.partner_birthday_day && data.partner_birthday_month && (
                      <span className="text-sm text-slate-600 mt-5">
                        → {data.partner_birthday_day}{lang === 'bg' ? '-ти' : ''} {currentMonths[data.partner_birthday_month - 1]}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Birthday question */}
            <BirthdayPlaceQuestion data={data} onChange={onChange} />

            {data.birthday_celebration_place && data.birthday_place_ready && (
              <div className="space-y-3">
                <BirthdayPartyQuestion data={data} />
                <Input
                  type="number"
                  min="0"
                  placeholder={t('Брой гости', 'Number of guests')}
                  value={data.birthday_party_guests_total || ''}
                  onChange={(e) => onChange('birthday_party_guests_total', parseInt(e.target.value) || '')}
                  className="rounded-lg w-48"
                />
              </div>
            )}

            {data.birthday_party_guests_total > 0 && (
              <div className="space-y-4">
                <Label className="text-slate-700">
                  {t('Вероятно биха били в три категории: Семейство, Приятели и Колеги. Колко от тези', 'They would probably fall into three categories: Family, Friends, and Colleagues. How many of these')} {data.birthday_party_guests_total} {t('биха били Семейство, Приятели, Колеги?', 'would be Family, Friends, Colleagues?')}
                </Label>
                
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">{t('Семейство', 'Family')}</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={data.birthday_guests_family || ''}
                      onChange={(e) => onChange('birthday_guests_family', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{t('Приятели', 'Friends')}</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={data.birthday_guests_friends || ''}
                      onChange={(e) => onChange('birthday_guests_friends', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{t('Колеги', 'Colleagues')}</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={data.birthday_guests_colleagues || ''}
                      onChange={(e) => onChange('birthday_guests_colleagues', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {data.birthday_guests_family !== undefined && data.birthday_guests_family !== '' &&
                 data.birthday_guests_friends !== undefined && data.birthday_guests_friends !== '' &&
                 data.birthday_guests_colleagues !== undefined && data.birthday_guests_colleagues !== '' &&
                 ((data.birthday_guests_family || 0) + (data.birthday_guests_friends || 0) + (data.birthday_guests_colleagues || 0)) < data.birthday_party_guests_total && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                    {t('Общият сбор е по-малък от посоченото по-горе.', 'The total sum is less than indicated above.')}
                  </div>
                )}

                {(data.birthday_guests_family > 0 || data.birthday_guests_friends > 0 || data.birthday_guests_colleagues > 0) && (
                  <div className="space-y-6 mt-6 pt-6 border-t border-slate-200">
                    {data.birthday_guests_family > 0 && (
                      <div className="space-y-3">
                        <Label className="text-slate-700 font-medium">{t('Имена на Семейство', 'Family Names')} ({data.birthday_guests_family})</Label>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Array.from({ length: data.birthday_guests_family }).map((_, index) => (
                            <Input
                              key={`family_${index}`}
                              placeholder={`${t('Семейство', 'Family')} ${index + 1}`}
                              value={(data.birthday_family_names || [])[index] || ''}
                              onChange={(e) => {
                                const newNames = [...(data.birthday_family_names || [])];
                                newNames[index] = e.target.value;
                                onChange('birthday_family_names', newNames);
                              }}
                              className="rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {data.birthday_guests_friends > 0 && (
                      <div className="space-y-3">
                        <Label className="text-slate-700 font-medium">{t('Имена на Приятели', 'Friends Names')} ({data.birthday_guests_friends})</Label>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Array.from({ length: data.birthday_guests_friends }).map((_, index) => (
                            <Input
                              key={`friends_${index}`}
                              placeholder={`${t('Приятел', 'Friend')} ${index + 1}`}
                              value={(data.birthday_friends_names || [])[index] || ''}
                              onChange={(e) => {
                                const newNames = [...(data.birthday_friends_names || [])];
                                newNames[index] = e.target.value;
                                onChange('birthday_friends_names', newNames);
                              }}
                              className="rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {data.birthday_guests_colleagues > 0 && (
                      <div className="space-y-3">
                        <Label className="text-slate-700 font-medium">{t('Имена на Колеги', 'Colleagues Names')} ({data.birthday_guests_colleagues})</Label>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Array.from({ length: data.birthday_guests_colleagues }).map((_, index) => (
                            <Input
                              key={`colleagues_${index}`}
                              placeholder={`${t('Колега', 'Colleague')} ${index + 1}`}
                              value={(data.birthday_colleagues_names || [])[index] || ''}
                              onChange={(e) => {
                                const newNames = [...(data.birthday_colleagues_names || [])];
                                newNames[index] = e.target.value;
                                onChange('birthday_colleagues_names', newNames);
                              }}
                              className="rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
        <Checkbox
          checked={data.include_housing_in_plan || false}
          onCheckedChange={(checked) => onChange('include_housing_in_plan', checked)}
        />
        <span className="font-medium text-blue-800">{t('Да бъде включено във финансовия план', 'Include in financial plan')}</span>
      </label>
    </div>
  );
}
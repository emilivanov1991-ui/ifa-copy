import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PiggyBank, User, Users, TrendingUp, Shield, Scale, Zap, Flame } from 'lucide-react';
import { cn } from "@/lib/utils";

// Bank options - same as in HousingStep
const BANK_OPTIONS = [
  { value: 'allianz', label: 'Алианц Банк България АД' },
  { value: 'dsk', label: 'Банка ДСК АД' },
  { value: 'bacb', label: 'БАКБ АД' },
  { value: 'bbr', label: 'Българска Банка за Развитие ЕАД' },
  { value: 'ccb', label: 'ЦКБ АД' },
  { value: 'investbank', label: 'Инвестбанк АД' },
  { value: 'iab', label: 'Интернешънъл Асет Банк АД' },
  { value: 'municipal', label: 'Общинска Банка АД' },
  { value: 'ubb', label: 'ОББ АД' },
  { value: 'fibank', label: 'Fibank' },
  { value: 'procredit', label: 'ПроКредит Банк ЕАД' },
  { value: 'postbank', label: 'Пощенска Банка' },
  { value: 'texim', label: 'Тексим Банк АД' },
  { value: 'tbi', label: 'Ти Би Ай Банк ЕАД' },
  { value: 'tokuda', label: 'Токуда Банк АД' },
  { value: 'tbank', label: 'Търговска Банка Д АД' },
  { value: 'unicredit', label: 'Уникредит Булбанк АД' },
  { value: 'eurobank', label: 'Юробанк България АД' },
  { value: 'revolut', label: 'Revolut' },
  { value: 'other', label: 'Друга' },
];

export default function ReserveStep({ data, onChange, showErrors, plannerData, lang = 'bg' }) {
  // Helper to check if a field is invalid - only when showErrors is true
  const isFieldInvalid = (value) => showErrors && (value === undefined || value === '' || value === null);
  const t = (bg, en) => lang === 'en' ? en : bg;
  
  // Get names from Financial Planner or from analysis data directly
    const clientName = plannerData?.client_first_name || data.client_first_name || t('Клиент', 'Client');
    const partnerName = plannerData?.partner_first_name || data.partner_first_name || t('Партньор', 'Partner');
  const includePartner = plannerData?.family_type === 'family' || data.include_partner || plannerData?.include_partner;
  // Get total monthly income from input
  const totalMonthlyIncome = data.total_monthly_income || 0;
  
  // Delayed reserve message state
  const [showReserveMessage, setShowReserveMessage] = useState(false);
  const reserveTimerRef = useRef(null);
  
  useEffect(() => {
    // When desired_reserve_amount changes, start a 1 second delay
    if (data.desired_reserve_amount !== undefined && data.desired_reserve_amount !== '') {
      if (reserveTimerRef.current) clearTimeout(reserveTimerRef.current);
      setShowReserveMessage(false);
      reserveTimerRef.current = setTimeout(() => {
        setShowReserveMessage(true);
      }, 1000);
    } else {
      setShowReserveMessage(false);
    }
    return () => {
      if (reserveTimerRef.current) clearTimeout(reserveTimerRef.current);
    };
  }, [data.desired_reserve_amount]);

  // Calculate monthly expenses (income - savings)
  const monthlySavings = data.monthly_savings_amount || 0;
  const monthlyExpenses = totalMonthlyIncome - monthlySavings;

  // Calculate total savings
  const clientTotal = (data.client_checking_account || 0) + (data.client_term_deposit || 0) + 
    (data.client_mutual_funds || 0) + (data.client_savings_account || 0) + (data.client_cash || 0) +
    (data.client_crypto || 0) + (data.client_gold || 0);
  const partnerTotal = data.include_partner ? ((data.partner_checking_account || 0) + (data.partner_term_deposit || 0) + 
    (data.partner_mutual_funds || 0) + (data.partner_savings_account || 0) + (data.partner_cash || 0) +
    (data.partner_crypto || 0) + (data.partner_gold || 0)) : 0;
  const grandTotal = clientTotal + partnerTotal;

  // Recommended reserve range (6 months expenses to 6 months income)
  const recommendedMin = Math.round(monthlyExpenses * 6);
  const recommendedMax = Math.round(totalMonthlyIncome * 6);

  // Helper to check if value is filled (including 0)
  const isFilled = (val) => val !== undefined && val !== '' && val !== null;

  // Calculate if all 4 percentages are filled (including 0)
  const allPercentsFilled = isFilled(data.conservative_percent) && 
                            isFilled(data.moderate_percent) && 
                            isFilled(data.dynamic_percent) && 
                            isFilled(data.aggressive_percent);

  // Get numeric values (treating empty as undefined, but 0 as valid)
  const getPercentValue = (val) => {
    if (val === '' || val === undefined || val === null) return undefined;
    return parseInt(val) || 0;
  };

  const cons = getPercentValue(data.conservative_percent);
  const mod = getPercentValue(data.moderate_percent);
  const dyn = getPercentValue(data.dynamic_percent);
  const agg = getPercentValue(data.aggressive_percent);
  const totalPercent = (cons ?? 0) + (mod ?? 0) + (dyn ?? 0) + (agg ?? 0);

  return (
    <div className="space-y-8">
      {/* Savings Method */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <PiggyBank className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">{t('По какъв начин създавате своя финансов резерв?', 'How do you build your financial reserve?')}</h3>
        </div>

        {/* Monthly Net Income */}
        <div className="mb-6 p-4 bg-white rounded-lg border border-slate-200">
          <h4 className="font-medium text-slate-700 mb-4">{t('Месечен среден нетен доход', 'Average monthly net income')} <span className="text-red-500">*</span></h4>
          <div className={includePartner ? "grid sm:grid-cols-2 gap-4" : ""}>
            <div className="space-y-2" data-invalid={isFieldInvalid(data.client_monthly_net_income) ? "true" : undefined}>
              <Label className="text-sm">{clientName} (€) <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={data.client_monthly_net_income ?? ''}
                onChange={(e) => {
                  const clientIncome = parseInt(e.target.value) || 0;
                  onChange('client_monthly_net_income', clientIncome);
                  onChange('total_monthly_income', clientIncome + (data.partner_monthly_net_income || 0));
                }}
                className={`rounded-lg ${isFieldInvalid(data.client_monthly_net_income) ? 'border-red-500 bg-red-50' : ''}`}
                required
              />
            </div>
            {includePartner && (
              <div className="space-y-2" data-invalid={isFieldInvalid(data.partner_monthly_net_income) ? "true" : undefined}>
                <Label className="text-sm">{partnerName} (€) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.partner_monthly_net_income ?? ''}
                  onChange={(e) => {
                    const partnerIncome = parseInt(e.target.value) || 0;
                    onChange('partner_monthly_net_income', partnerIncome);
                    onChange('total_monthly_income', (data.client_monthly_net_income || 0) + partnerIncome);
                  }}
                  className={`rounded-lg ${isFieldInvalid(data.partner_monthly_net_income) ? 'border-red-500 bg-red-50' : ''}`}
                  required
                />
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
            <span className="text-sm text-slate-600">{t('Общо:', 'Total:')}</span>
            <span className="font-semibold text-blue-600">{(data.total_monthly_income || 0).toLocaleString('bg-BG')} €</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2" data-invalid={isFieldInvalid(data.savings_method) ? "true" : undefined}>
            <Label>{t('Метод на спестяване', 'Savings method')} <span className="text-red-500">*</span></Label>
            <Select 
              value={data.savings_method || ''} 
              onValueChange={(value) => onChange('savings_method', value)}
            >
              <SelectTrigger className={`rounded-lg ${isFieldInvalid(data.savings_method) ? 'border-red-500 bg-red-50' : ''}`}>
                <SelectValue placeholder={t('Изберете', 'Select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('Не спестявам', "I don't save")}</SelectItem>
                <SelectItem value="leftover">{t('Каквото остане след разходи', 'Whatever is left after expenses')}</SelectItem>
                <SelectItem value="fixed">{t('Спестявам в началото на месеца фиксирана сума', 'I save a fixed amount at the start of the month')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(data.savings_method === 'leftover' || data.savings_method === 'fixed') && (
            <div className="space-y-2">
              <Label>{t('Приблизително спестяване месечно (€)', 'Approximate monthly savings (€)')} <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={data.monthly_savings_amount ?? ''}
                onChange={(e) => onChange('monthly_savings_amount', parseInt(e.target.value) || 0)}
                className="rounded-lg w-48"
                required
              />
            </div>
          )}
        </div>
      </div>

      {/* Current Savings and Investments */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-6">{t('Текущи спестявания и инвестиции', 'Current savings and investments')}</h3>

        <div className={includePartner ? "grid lg:grid-cols-2 gap-8" : ""}>
          {/* Client */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-700">{clientName}</span>
            </div>
            
            {/* Header row */}
            <div className="grid grid-cols-3 gap-2 mb-2 px-1">
              <div className="text-xs font-medium text-slate-500"></div>
              <div className="text-xs font-medium text-slate-500 text-center">{t('Сума (€)', 'Amount (€)')}</div>
              <div className="text-xs font-medium text-slate-500 text-center">{t('Банка/Платформа', 'Bank/Platform')}</div>
            </div>
            
            <div className="space-y-3">
              {/* Разплащателна сметка */}
              <div className="grid grid-cols-3 gap-2 items-center" data-invalid={isFieldInvalid(data.client_checking_account) ? "true" : undefined}>
                <Label className="text-sm">{t('Разплащателна сметка', 'Current account')} <span className="text-red-500">*</span></Label>
                <Input
                   type="number"
                   min="0"
                   placeholder="0"
                   value={data.client_checking_account ?? ''}
                   onChange={(e) => onChange('client_checking_account', e.target.value === '' ? '' : parseInt(e.target.value))}
                  className={`rounded-lg text-center ${isFieldInvalid(data.client_checking_account) ? 'border-red-500 bg-red-50' : ''}`}
                  required
                />
                <Combobox
                  options={BANK_OPTIONS}
                  value={data.client_checking_account_bank || ''}
                  onValueChange={(value) => onChange('client_checking_account_bank', value)}
                  placeholder={t('Банка', 'Bank')}
                  searchPlaceholder={t('Търси банка...', 'Search bank...')}
                  emptyText={t('Няма намерена банка.', 'No bank found.')}
                />
              </div>

              {/* Спестовна сметка */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label className="text-sm">{t('Спестовна сметка', 'Savings account')}</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.client_savings_account ?? ''}
                  onChange={(e) => onChange('client_savings_account', parseInt(e.target.value) || 0)}
                  className="rounded-lg text-center"
                />
                <Combobox
                  options={BANK_OPTIONS}
                  value={data.client_savings_account_bank || ''}
                  onValueChange={(value) => onChange('client_savings_account_bank', value)}
                  placeholder={t('Банка', 'Bank')}
                  searchPlaceholder={t('Търси банка...', 'Search bank...')}
                  emptyText={t('Няма намерена банка.', 'No bank found.')}
                />
              </div>

              {/* Срочен депозит */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label className="text-sm">{t('Срочен депозит', 'Term deposit')}</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.client_term_deposit ?? ''}
                  onChange={(e) => onChange('client_term_deposit', parseInt(e.target.value) || 0)}
                  className="rounded-lg text-center"
                />
                <Combobox
                  options={BANK_OPTIONS}
                  value={data.client_term_deposit_bank || ''}
                  onValueChange={(value) => onChange('client_term_deposit_bank', value)}
                  placeholder={t('Банка', 'Bank')}
                  searchPlaceholder={t('Търси банка...', 'Search bank...')}
                  emptyText={t('Няма намерена банка.', 'No bank found.')}
                />
              </div>

              {/* Пари в брой */}
              <div className="grid grid-cols-3 gap-2 items-center" data-invalid={isFieldInvalid(data.client_cash) ? "true" : undefined}>
                <Label className="text-sm">{t('Пари в брой', 'Cash')} <span className="text-red-500">*</span></Label>
                <Input
                 type="number"
                 min="0"
                 placeholder="0"
                 value={data.client_cash ?? ''}
                 onChange={(e) => onChange('client_cash', e.target.value === '' ? '' : parseInt(e.target.value))}
                  className={`rounded-lg text-center ${isFieldInvalid(data.client_cash) ? 'border-red-500 bg-red-50' : ''}`}
                  required
                />
                <div></div>
              </div>

              {/* Взаимни фондове */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label className="text-sm">{t('Взаимни фондове, акции, облигации и др.', 'Mutual funds, stocks, bonds etc.')}</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.client_mutual_funds ?? ''}
                  onChange={(e) => onChange('client_mutual_funds', parseInt(e.target.value) || 0)}
                  className="rounded-lg text-center"
                />
                <Input
                  placeholder={t('Платформа', 'Platform')}
                  value={data.client_mutual_funds_platform || ''}
                  onChange={(e) => onChange('client_mutual_funds_platform', e.target.value)}
                  className="rounded-lg text-sm text-center"
                />
              </div>

              {/* Криптовалути */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label className="text-sm">{t('Криптовалути', 'Cryptocurrencies')}</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.client_crypto ?? ''}
                  onChange={(e) => onChange('client_crypto', parseInt(e.target.value) || 0)}
                  className="rounded-lg text-center"
                />
                <Input
                  placeholder={t('Платформа', 'Platform')}
                  value={data.client_crypto_platform || ''}
                  onChange={(e) => onChange('client_crypto_platform', e.target.value)}
                  className="rounded-lg text-sm text-center"
                />
              </div>

              {/* Злато */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label className="text-sm">{t('Злато и др.', 'Gold etc.')}</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.client_gold ?? ''}
                  onChange={(e) => onChange('client_gold', parseInt(e.target.value) || 0)}
                  className="rounded-lg text-center"
                />
                <div></div>
              </div>
            </div>

            {/* Client subtotal */}
            <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm text-slate-600">{t('Подсума', 'Subtotal')} {clientName}:</span>
              <span className="font-semibold text-slate-700">{clientTotal.toLocaleString('bg-BG')} €</span>
            </div>
          </div>

          {/* Partner - only show if included */}
          {includePartner && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-700">{partnerName}</span>
              </div>
              
              {/* Header row */}
              <div className="grid grid-cols-3 gap-2 mb-2 px-1">
                <div className="text-xs font-medium text-slate-500"></div>
                <div className="text-xs font-medium text-slate-500 text-center">{t('Сума (€)', 'Amount (€)')}</div>
                <div className="text-xs font-medium text-slate-500 text-center">{t('Банка/Платформа', 'Bank/Platform')}</div>
              </div>
              
              <div className="space-y-3">
                {/* Разплащателна сметка */}
                <div className="grid grid-cols-3 gap-2 items-center" data-invalid={isFieldInvalid(data.partner_checking_account) ? "true" : undefined}>
                  <Label className="text-sm">{t('Разплащателна сметка', 'Current account')} <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={data.partner_checking_account ?? ''}
                    onChange={(e) => onChange('partner_checking_account', e.target.value === '' ? '' : parseInt(e.target.value))}
                    className={`rounded-lg text-center ${isFieldInvalid(data.partner_checking_account) ? 'border-red-500 bg-red-50' : ''}`}
                    required
                  />
                  <Combobox
                    options={BANK_OPTIONS}
                    value={data.partner_checking_account_bank || ''}
                    onValueChange={(value) => onChange('partner_checking_account_bank', value)}
                    placeholder={t('Банка', 'Bank')}
                    searchPlaceholder={t('Търси банка...', 'Search bank...')}
                    emptyText={t('Няма намерена банка.', 'No bank found.')}
                  />
                </div>

                {/* Спестовна сметка */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label className="text-sm">{t('Спестовна сметка', 'Savings account')}</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={data.partner_savings_account ?? ''}
                    onChange={(e) => onChange('partner_savings_account', parseInt(e.target.value) || 0)}
                    className="rounded-lg text-center"
                  />
                  <Combobox
                    options={BANK_OPTIONS}
                    value={data.partner_savings_account_bank || ''}
                    onValueChange={(value) => onChange('partner_savings_account_bank', value)}
                    placeholder={t('Банка', 'Bank')}
                    searchPlaceholder={t('Търси банка...', 'Search bank...')}
                    emptyText={t('Няма намерена банка.', 'No bank found.')}
                  />
                </div>

                {/* Срочен депозит */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label className="text-sm">{t('Срочен депозит', 'Term deposit')}</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={data.partner_term_deposit ?? ''}
                    onChange={(e) => onChange('partner_term_deposit', parseInt(e.target.value) || 0)}
                    className="rounded-lg text-center"
                  />
                  <Combobox
                    options={BANK_OPTIONS}
                    value={data.partner_term_deposit_bank || ''}
                    onValueChange={(value) => onChange('partner_term_deposit_bank', value)}
                    placeholder={t('Банка', 'Bank')}
                    searchPlaceholder={t('Търси банка...', 'Search bank...')}
                    emptyText={t('Няма намерена банка.', 'No bank found.')}
                  />
                </div>

                {/* Пари в брой */}
                <div className="grid grid-cols-3 gap-2 items-center" data-invalid={isFieldInvalid(data.partner_cash) ? "true" : undefined}>
                  <Label className="text-sm">Пари в брой <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={data.partner_cash ?? ''}
                    onChange={(e) => onChange('partner_cash', e.target.value === '' ? '' : parseInt(e.target.value))}
                    className={`rounded-lg text-center ${isFieldInvalid(data.partner_cash) ? 'border-red-500 bg-red-50' : ''}`}
                    required
                  />
                  <div></div>
                </div>

                {/* Взаимни фондове */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label className="text-sm">{t('Взаимни фондове, акции, облигации и др.', 'Mutual funds, stocks, bonds etc.')}</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={data.partner_mutual_funds ?? ''}
                    onChange={(e) => onChange('partner_mutual_funds', parseInt(e.target.value) || 0)}
                    className="rounded-lg text-center"
                  />
                  <Input
                    placeholder={t('Платформа', 'Platform')}
                    value={data.partner_mutual_funds_platform || ''}
                    onChange={(e) => onChange('partner_mutual_funds_platform', e.target.value)}
                    className="rounded-lg text-sm text-center"
                  />
                </div>

                {/* Криптовалути */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label className="text-sm">{t('Криптовалути', 'Cryptocurrencies')}</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={data.partner_crypto ?? ''}
                    onChange={(e) => onChange('partner_crypto', parseInt(e.target.value) || 0)}
                    className="rounded-lg text-center"
                  />
                  <Input
                    placeholder={t('Платформа', 'Platform')}
                    value={data.partner_crypto_platform || ''}
                    onChange={(e) => onChange('partner_crypto_platform', e.target.value)}
                    className="rounded-lg text-sm text-center"
                  />
                </div>

                {/* Злато */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label className="text-sm">{t('Злато и др.', 'Gold etc.')}</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={data.partner_gold ?? ''}
                    onChange={(e) => onChange('partner_gold', parseInt(e.target.value) || 0)}
                    className="rounded-lg text-center"
                  />
                  <div></div>
                </div>
              </div>

              {/* Partner subtotal */}
              <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm text-slate-600">{t('Подсума', 'Subtotal')} {partnerName}:</span>
                <span className="font-semibold text-slate-700">{partnerTotal.toLocaleString('bg-BG')} €</span>
              </div>
            </div>
          )}
        </div>

        {/* Grand Total */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">{t('Общ сбор на спестявания и инвестиции:', 'Total savings and investments:')}</span>
            <span className="text-2xl font-bold text-blue-600">{grandTotal.toLocaleString('bg-BG')} €</span>
          </div>
        </div>
      </div>

      {/* Reserve Size */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">{t('Какъв размер на резерва е достатъчен според Вас?', 'What reserve amount do you consider sufficient?')}</h3>
        <div className="space-y-4">
          <div className="space-y-2" data-invalid={isFieldInvalid(data.desired_reserve_amount) ? "true" : undefined}>
            <Label>{t('Желан размер на резерва (€)', 'Desired reserve amount (€)')} <span className="text-red-500">*</span></Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.desired_reserve_amount ?? ''}
              onChange={(e) => onChange('desired_reserve_amount', e.target.value === '' ? '' : parseInt(e.target.value))}
              className={`rounded-lg w-48 ${isFieldInvalid(data.desired_reserve_amount) ? 'border-red-500 bg-red-50' : ''}`}
              required
            />
          </div>

          {totalMonthlyIncome > 0 && (() => {
            const clientLiquid = (data.client_checking_account || 0) + (data.client_savings_account || 0) + 
              (data.client_term_deposit || 0) + (data.client_cash || 0);
            const partnerLiquid = data.include_partner ? ((data.partner_checking_account || 0) + (data.partner_savings_account || 0) + 
              (data.partner_term_deposit || 0) + (data.partner_cash || 0)) : 0;
            const totalLiquid = clientLiquid + partnerLiquid;
            const recommendedReserve = recommendedMax;

            return (
              <>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-blue-700 font-medium">{t('Препоръчителният резерв за Вас е: ', 'The recommended reserve for you is: ')}</span>
                  <span className="text-blue-800 font-bold">
                    {recommendedMin === recommendedMax 
                      ? `${recommendedMin.toLocaleString('bg-BG')} €`
                      : `${recommendedMin.toLocaleString('bg-BG')} € - ${recommendedMax.toLocaleString('bg-BG')} €`
                    }
                  </span>
                </div>

                {showReserveMessage && totalLiquid > recommendedReserve && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">
                      {t('Спестяванията ви надвишават препоръчителния резерв и губите средно', 'Your savings exceed the recommended reserve and you lose an average of')} <span className="font-bold">{Math.round((totalLiquid - recommendedReserve) * 0.05).toLocaleString('bg-BG')} €</span> {t('годишно от инфлация. Ще ви помогнем да реализирате доходност на тези средства!', 'annually to inflation. We will help you earn returns on these funds!')}
                    </p>
                  </div>
                )}

                {showReserveMessage && totalLiquid < recommendedReserve && totalLiquid >= 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">
                      {t('Спестяванията ви са по-малко от препоръчителния резерв с', 'Your savings are below the recommended reserve by')} <span className="font-bold">{(recommendedReserve - totalLiquid).toLocaleString('bg-BG')} €</span>. {t('Ще ви помогнем да достигнете до него чрез правилно финансово планиране!', 'We will help you reach it through proper financial planning!')}
                    </p>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Risk Profile */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">{t('Рисков профил', 'Risk Profile')}</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label>{t('Разпределете инвестицията в % според отделните инструменти (общо 100%)', 'Distribute your investment in % across different instruments (total 100%)')} <span className="text-red-500">*</span></Label>
            
            {/* Visual Risk Profile Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
              {/* Conservative */}
              <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">{t('Консервативен', 'Conservative')} <span className="text-red-500">*</span></span>
                </div>
                <div className="text-xs text-blue-600 mb-2">+2% годишно</div>
                <div className="h-2 bg-blue-200 rounded-full mb-3">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${Math.min(cons ?? 0, 100)}%` }}
                  />
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={data.conservative_percent ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange('conservative_percent', val === '' ? '' : (parseInt(val) || 0));
                  }}
                  className="rounded-lg w-full text-center"
                  required
                />
              </div>

              {/* Balanced */}
              <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50">
                <div className="flex items-center gap-2 mb-3">
                  <Scale className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">{t('Балансиран', 'Balanced')} <span className="text-red-500">*</span></span>
                </div>
                <div className="text-xs text-green-600 mb-2">+7% / -3%</div>
                <div className="h-2 bg-green-200 rounded-full mb-3">
                  <div 
                    className="h-full bg-green-600 rounded-full transition-all"
                    style={{ width: `${Math.min(mod ?? 0, 100)}%` }}
                  />
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={data.moderate_percent ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange('moderate_percent', val === '' ? '' : (parseInt(val) || 0));
                  }}
                  className="rounded-lg w-full text-center"
                  required
                />
              </div>

              {/* Dynamic */}
              <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-5 w-5 text-amber-600" />
                  <span className="font-medium text-amber-800">{t('Динамичен', 'Dynamic')} <span className="text-red-500">*</span></span>
                </div>
                <div className="text-xs text-amber-600 mb-2">+12% / -5%</div>
                <div className="h-2 bg-amber-200 rounded-full mb-3">
                  <div 
                    className="h-full bg-amber-600 rounded-full transition-all"
                    style={{ width: `${Math.min(dyn ?? 0, 100)}%` }}
                  />
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={data.dynamic_percent ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange('dynamic_percent', val === '' ? '' : (parseInt(val) || 0));
                  }}
                  className="rounded-lg w-full text-center"
                  required
                />
              </div>

              {/* Aggressive */}
              <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">{t('Агресивен', 'Aggressive')} <span className="text-red-500">*</span></span>
                </div>
                <div className="text-xs text-red-600 mb-2">+25% / -15%</div>
                <div className="h-2 bg-red-200 rounded-full mb-3">
                  <div 
                    className="h-full bg-red-600 rounded-full transition-all"
                    style={{ width: `${Math.min(agg ?? 0, 100)}%` }}
                  />
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={data.aggressive_percent ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange('aggressive_percent', val === '' ? '' : (parseInt(val) || 0));
                  }}
                  className="rounded-lg w-full text-center"
                  required
                />
              </div>
            </div>

            {/* Diversification Messages */}
            {allPercentsFilled && (
              <>
                {totalPercent !== 100 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-700">
                      {t(`Моля разпределете активите така, че общия сбор да прави 100% (текущо: ${totalPercent}%)`, `Please distribute assets so the total equals 100% (current: ${totalPercent}%)`)}
                    </p>
                  </div>
                ) : (
                  <>
                    {(cons > 80 || mod > 80 || dyn > 80 || agg > 80) ? (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700">
                          {t('Прекалената концентрация в един вид активи води до по-голяма волатилност и риск! Препоръчваме Ви по-широка диверсификация!', 'Excessive concentration in one asset type leads to higher volatility and risk! We recommend broader diversification!')}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700">
                          {t('Поздравления! Явно правилно разбирате идеята за диверсификация на Вашите активи!', 'Congratulations! You clearly understand the concept of asset diversification!')}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          <div className="space-y-2" data-invalid={isFieldInvalid(data.investment_horizon) ? "true" : undefined}>
            <Label>{t('Инвестиционен хоризонт', 'Investment horizon')} <span className="text-red-500">*</span></Label>
            <Select 
              value={data.investment_horizon || ''} 
              onValueChange={(value) => onChange('investment_horizon', value)}
            >
              <SelectTrigger className={`rounded-lg ${isFieldInvalid(data.investment_horizon) ? 'border-red-500 bg-red-50' : ''}`}>
                <SelectValue placeholder={t('Изберете', 'Select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="up_to_1_year">{t('До 1 година', 'Up to 1 year')}</SelectItem>
                <SelectItem value="up_to_5_years">{t('До 5 години', 'Up to 5 years')}</SelectItem>
                <SelectItem value="up_to_7_years">{t('До 7 години', 'Up to 7 years')}</SelectItem>
                <SelectItem value="over_7_years">{t('Над 7 години', 'Over 7 years')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2" data-invalid={isFieldInvalid(data.investment_experience) ? "true" : undefined}>
            <Label>{t('Какъв е Вашият опит с инвестирането?', 'What is your investment experience?')} <span className="text-red-500">*</span></Label>
            <Select 
              value={data.investment_experience || ''} 
              onValueChange={(value) => onChange('investment_experience', value)}
            >
              <SelectTrigger className={`rounded-lg ${isFieldInvalid(data.investment_experience) ? 'border-red-500 bg-red-50' : ''}`}>
                <SelectValue placeholder={t('Изберете', 'Select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('Нямам опит', 'No experience')}</SelectItem>
                <SelectItem value="basic">{t('Основен (спестовни сметки, депозити)', 'Basic (savings accounts, deposits)')}</SelectItem>
                <SelectItem value="intermediate">{t('Среден (взаимни фондове, облигации)', 'Intermediate (mutual funds, bonds)')}</SelectItem>
                <SelectItem value="advanced">{t('Напреднал (акции, структурирани продукти)', 'Advanced (stocks, structured products)')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2" data-invalid={isFieldInvalid(data.reaction_to_10_percent_drop) ? "true" : undefined}>
            <Label>{t('Какво бихте направили, ако стойността на инвестицията падне с 10%?', 'What would you do if your investment drops by 10%?')} <span className="text-red-500">*</span></Label>
            <Select 
              value={data.reaction_to_10_percent_drop || ''} 
              onValueChange={(value) => onChange('reaction_to_10_percent_drop', value)}
            >
              <SelectTrigger className={`rounded-lg ${isFieldInvalid(data.reaction_to_10_percent_drop) ? 'border-red-500 bg-red-50' : ''}`}>
                <SelectValue placeholder={t('Изберете', 'Select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sell_all">{t('Продавам всичко', 'Sell everything')}</SelectItem>
                <SelectItem value="sell_part">{t('Продавам част', 'Sell part')}</SelectItem>
                <SelectItem value="hold">{t('Изчаквам', 'Wait and hold')}</SelectItem>
                <SelectItem value="buy_more">{t('Купувам още', 'Buy more')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2" data-invalid={isFieldInvalid(data.reaction_to_20_percent_gain) ? "true" : undefined}>
            <Label>{t('Какво бихте направили, ако инвестицията нарасне с 20%?', 'What would you do if your investment grows by 20%?')} <span className="text-red-500">*</span></Label>
            <Select 
              value={data.reaction_to_20_percent_gain || ''} 
              onValueChange={(value) => onChange('reaction_to_20_percent_gain', value)}
            >
              <SelectTrigger className={`rounded-lg ${isFieldInvalid(data.reaction_to_20_percent_gain) ? 'border-red-500 bg-red-50' : ''}`}>
                <SelectValue placeholder={t('Изберете', 'Select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sell_all">{t('Продавам всичко', 'Sell everything')}</SelectItem>
                <SelectItem value="sell_part">{t('Продавам част', 'Sell part')}</SelectItem>
                <SelectItem value="hold">{t('Задържам', 'Hold')}</SelectItem>
                <SelectItem value="buy_more">{t('Купувам още', 'Buy more')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Investment Referrals */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">{t('Кои от Вашите близки или познати:', 'Which of your friends or acquaintances:')}</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Have savings but no investments */}
          <div className="space-y-3">
            <Label className="text-slate-700">{t('Имат спестявания, но не са предприели инвестиционни решения?', 'Have savings but have not made any investment decisions?')}</Label>
            {(data.referrals_have_savings || ['']).map((name, index) => {
              // Check if name exists in housing or birthday referrals
              const existingNames = [
                ...(data.referrals_no_own_home || []),
                ...(data.referrals_own_home_long || []),
                ...(data.birthday_family_names || []),
                ...(data.birthday_friends_names || []),
                ...(data.birthday_colleagues_names || [])
              ].filter(n => n && n.trim());
              const isDuplicate = name && name.trim() && existingNames.some(h => h.toLowerCase().trim() === name.toLowerCase().trim());
              
              return (
                <div key={`savings_${index}`}>
                  <Input
                    placeholder={t('Име на познат', 'Name of acquaintance')}
                    value={name}
                    onChange={(e) => {
                      const newList = [...(data.referrals_have_savings || [''])];
                      newList[index] = e.target.value;
                      if (index === newList.length - 1 && e.target.value) {
                        newList.push('');
                      }
                      onChange('referrals_have_savings', newList);
                    }}
                    className={cn("rounded-lg", isDuplicate && "border-amber-500")}
                  />
                  {isDuplicate && (
                    <p className="text-amber-600 text-sm mt-1">
                      {t('Това име бе предоставено на предходната тема. С кого бихме могли да го заменим?', 'This name was provided in the previous section. Who could we replace it with?')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Invest regularly or interested */}
          <div className="space-y-3">
            <Label className="text-slate-700">{t('Инвестират редовно или се интересуват от инвестиции?', 'Invest regularly or are interested in investments?')}</Label>
            {(data.referrals_invest_regularly || ['']).map((name, index) => {
              // Check if name exists in housing or birthday referrals
              const existingNames = [
                ...(data.referrals_no_own_home || []),
                ...(data.referrals_own_home_long || []),
                ...(data.birthday_family_names || []),
                ...(data.birthday_friends_names || []),
                ...(data.birthday_colleagues_names || [])
              ].filter(n => n && n.trim());
              const isDuplicate = name && name.trim() && existingNames.some(h => h.toLowerCase().trim() === name.toLowerCase().trim());
              
              return (
                <div key={`invest_${index}`}>
                  <Input
                    placeholder="Име на познат"
                    value={name}
                    onChange={(e) => {
                      const newList = [...(data.referrals_invest_regularly || [''])];
                      newList[index] = e.target.value;
                      if (index === newList.length - 1 && e.target.value) {
                        newList.push('');
                      }
                      onChange('referrals_invest_regularly', newList);
                    }}
                    className={cn("rounded-lg", isDuplicate && "border-amber-500")}
                  />
                  {isDuplicate && (
                    <p className="text-amber-600 text-sm mt-1">
                      {t('Това име бе предоставено на предходната тема. С кого бихме могли да го заменим?', 'This name was provided in the previous section. Who could we replace it with?')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Include in plan */}
      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
        <Checkbox
          checked={data.include_reserve_in_plan || false}
          onCheckedChange={(checked) => onChange('include_reserve_in_plan', checked)}
        />
        <span className="font-medium text-blue-800">{t('Да бъде включено във финансовия план', 'Include in financial plan')}</span>
      </label>
    </div>
  );
}
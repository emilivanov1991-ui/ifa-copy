import React, { useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Umbrella, User, Users } from 'lucide-react';
import { cn } from "@/lib/utils";

// Pension fund options for II. Pillar (УПФ)
const PENSION_FUND_OPTIONS = [
  { value: 'to_check', label: 'Да се провери допълнително' },
  { value: 'allianz', label: 'УПФ "Алианц България"' },
  { value: 'badeshte', label: 'УПФ "Бъдеще"' },
  { value: 'dallbogg', label: 'УПФ "ДаллБогг: Живот и Здраве"' },
  { value: 'doverie', label: 'УПФ "Доверие"' },
  { value: 'dsk_rodina', label: 'УПФ "ДСК - Родина"' },
  { value: 'obb', label: 'УПФ "ОББ" ЕАД' },
  { value: 'poi', label: 'УПФ "Пенсионноосигурителен институт"' },
  { value: 'saglasie', label: 'УПФ "Съгласие"' },
  { value: 'toplina', label: 'УПФ "Топлина"' },
  { value: 'ckb_sila', label: 'УПФ "ЦКБ - Сила"' },
];

// Pension fund options for III. Pillar (ДПФ)
const VOLUNTARY_PENSION_FUND_OPTIONS = [
  { value: 'allianz', label: 'ДПФ "Алианц България"' },
  { value: 'badeshte', label: 'ДПФ "Бъдеще"' },
  { value: 'dallbogg', label: 'ДПФ "ДаллБогг: Живот и Здраве"' },
  { value: 'doverie', label: 'ДПФ "Доверие"' },
  { value: 'dsk_rodina', label: 'ДПФ "ДСК - Родина"' },
  { value: 'obb', label: 'ДПФ "ОББ" ЕАД' },
  { value: 'poi', label: 'ДПФ "Пенсионноосигурителен институт"' },
  { value: 'saglasie', label: 'ДПФ "Съгласие"' },
  { value: 'toplina', label: 'ДПФ "Топлина"' },
  { value: 'ckb_sila', label: 'ДПФ "ЦКБ - Сила"' },
];

// Calculate expected state pension based on category, age and gross income
const calculateStatePension = (category, retirementAge, grossIncome) => {
  const minAge = category === 'first' ? 55 : category === 'second' ? 60 : 65;
  
  if (!retirementAge || retirementAge < minAge) {
    return { amount: 67, isSocialPension: true };
  }
  
  // 45% of gross income, min 347, max 1739
  const calculated = Math.round((grossIncome || 0) * 0.45);
  const amount = Math.max(347, Math.min(1739, calculated));
  return { amount: calculated > 0 ? amount : 0, isSocialPension: false };
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

// Convert net income to gross income
const netToBruto = (netEUR) => {
  const pragNeto = 1638.6;     // Нетен праг до който 1.28869
  const faktorPodPrag = 1.28869;
  const pragBruto = 2111.64;   // Брутен праг
  
  // До прага: НЕТО × 1.28869
  const brutoPodPrag = netEUR * faktorPodPrag;
  
  if (brutoPodPrag <= pragBruto) {
    return parseFloat(brutoPodPrag.toFixed(2));
  } 
  // Над прага: НЕТО ÷ 0.9 + 291
  else {
    return parseFloat((netEUR / 0.9 + 291).toFixed(2));
  }
};

export default function PensionStep({ data, onChange, showErrors, plannerData }) {
  // Helper to check if a field is invalid - only when showErrors is true
  const isFieldInvalid = (value) => showErrors && (value === undefined || value === '' || value === null);
  
  // Get names from Financial Planner
  const clientName = plannerData?.client_first_name || 'Клиент';
  const partnerName = plannerData?.partner_first_name || 'Партньор';
  const includePartner = plannerData?.family_type === 'family' || data.include_partner;

  // Auto-populate gross income from net income (from Reserve step)
  useEffect(() => {
    if (data.client_monthly_net_income && !data.client_gross_income_pension) {
      const grossIncome = Math.round(netToBruto(data.client_monthly_net_income));
      onChange('client_gross_income_pension', grossIncome);
    }
  }, [data.client_monthly_net_income]);

  useEffect(() => {
    if (includePartner && data.partner_monthly_net_income && !data.partner_gross_income_pension) {
      const grossIncome = Math.round(netToBruto(data.partner_monthly_net_income));
      onChange('partner_gross_income_pension', grossIncome);
    }
  }, [data.partner_monthly_net_income, includePartner]);

  // Auto-calculate client expected pension
  useEffect(() => {
    const result = calculateStatePension(
      data.client_work_category || 'third',
      data.client_retirement_age,
      data.client_gross_income_pension
    );
    if (data.client_retirement_age && data.client_gross_income_pension) {
      onChange('client_expected_state_pension', result.amount);
      onChange('client_pension_is_social', result.isSocialPension);
    }
  }, [data.client_work_category, data.client_retirement_age, data.client_gross_income_pension]);

  // Auto-calculate partner expected pension
  useEffect(() => {
    if (!includePartner) return;
    const result = calculateStatePension(
      data.partner_work_category || 'third',
      data.partner_retirement_age,
      data.partner_gross_income_pension
    );
    if (data.partner_retirement_age && data.partner_gross_income_pension) {
      onChange('partner_expected_state_pension', result.amount);
      onChange('partner_pension_is_social', result.isSocialPension);
    }
  }, [data.partner_work_category, data.partner_retirement_age, data.partner_gross_income_pension, includePartner]);

  const categoryOptions = [
    { value: 'third', label: 'Трета категория' },
    { value: 'second', label: 'Втора категория' },
    { value: 'first', label: 'Първа категория' },
  ];

  // Calculate differences
  const clientDiff = (data.client_desired_pension || 0) - (data.client_expected_state_pension || 0);
  const partnerDiff = includePartner ? (data.partner_desired_pension || 0) - (data.partner_expected_state_pension || 0) : 0;
  const totalMonthlyDiff = clientDiff + partnerDiff;

  // Calculate average current age
  const clientAge = data.client_age || 0;
  const partnerAge = includePartner ? (data.partner_age || 0) : 0;
  const avgCurrentAge = includePartner && partnerAge > 0 
    ? (clientAge + partnerAge) / 2 
    : clientAge;

  // Calculate average retirement age
  const clientRetirementAge = data.client_retirement_age || 0;
  const partnerRetirementAge = includePartner ? (data.partner_retirement_age || 0) : 0;
  const avgRetirementAge = includePartner && partnerRetirementAge > 0 
    ? (clientRetirementAge + partnerRetirementAge) / 2 
    : clientRetirementAge;

  // Investment horizon = avg retirement age - avg current age
  const investmentHorizon = Math.max(1, Math.round(avgRetirementAge - avgCurrentAge));

  // Missing amount = monthly difference * 12 * years until 85
  const yearsUntil85 = Math.max(1, 85 - avgRetirementAge);
  const totalMissingAmount = totalMonthlyDiff * 12 * yearsUntil85;

  // Calculate monthly investment needed
  const monthlyInvestmentNeeded = calculateMonthlyInvestment(totalMissingAmount, investmentHorizon, 0.08);

  // Show calculation message when we have all the data
  const showCalculation = avgCurrentAge > 0 && avgRetirementAge > 0 && totalMonthlyDiff > 0;

  return (
    <div className="space-y-8">
      {/* Retirement Age & Pension */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Umbrella className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">По-добра пенсия</h3>
        </div>

        <div className={includePartner ? "grid lg:grid-cols-2 gap-8" : ""}>
          {/* Client */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-700">Клиент</span>
            </div>
            <div className="space-y-4">
              {/* Work Category */}
              <div className="space-y-2">
                <Label>Категория труд</Label>
                <div className="flex gap-2">
                  {categoryOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onChange('client_work_category', option.value)}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                        (data.client_work_category || 'third') === option.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Gross Income */}
              <div className="space-y-2" data-invalid={isFieldInvalid(data.client_gross_income_pension) ? "true" : undefined}>
                <Label>Брутен доход (€) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min="0"
                  placeholder=""
                  value={data.client_gross_income_pension ?? ''}
                  onChange={(e) => onChange('client_gross_income_pension', e.target.value === '' ? '' : parseInt(e.target.value))}
                  className={`rounded-lg ${isFieldInvalid(data.client_gross_income_pension) ? 'border-red-500 bg-red-50' : ''}`}
                  required
                />
              </div>
              <div className="space-y-2" data-invalid={isFieldInvalid(data.client_retirement_age) ? "true" : undefined}>
                <Label>Кога искате да излезете в пенсия? (възраст) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min="50"
                  max="75"
                  placeholder=""
                  value={data.client_retirement_age ?? ''}
                  onChange={(e) => onChange('client_retirement_age', e.target.value === '' ? '' : parseInt(e.target.value))}
                  className={`rounded-lg ${isFieldInvalid(data.client_retirement_age) ? 'border-red-500 bg-red-50' : ''}`}
                  required
                />
              </div>
              <div className="space-y-2" data-invalid={isFieldInvalid(data.client_desired_pension) ? "true" : undefined}>
                <Label>От каква месечна пенсия ще се нуждаете? (€) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min="0"
                  placeholder=""
                  value={data.client_desired_pension ?? ''}
                  onChange={(e) => onChange('client_desired_pension', e.target.value === '' ? '' : parseInt(e.target.value))}
                  className={`rounded-lg ${isFieldInvalid(data.client_desired_pension) ? 'border-red-500 bg-red-50' : ''}`}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Очаквана държавна пенсия (€)</Label>
                <Input
                  type="number"
                  min="0"
                  value={data.client_expected_state_pension || ''}
                  readOnly
                  className="rounded-lg bg-slate-100"
                />
                {data.client_pension_is_social && (
                  <p className="text-amber-600 text-sm">
                    Калкулирана е социалната пенсия за страната поради липса на необходима пенсионна възраст
                  </p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  Разлика: <span className="font-semibold">
                    {clientDiff.toLocaleString()} €
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Partner - only show if included */}
          {includePartner && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-700">Партньор</span>
              </div>
              <div className="space-y-4">
                {/* Work Category */}
                <div className="space-y-2">
                  <Label>Категория труд</Label>
                  <div className="flex gap-2">
                    {categoryOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange('partner_work_category', option.value)}
                        className={cn(
                          "flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                          (data.partner_work_category || 'third') === option.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Gross Income */}
                <div className="space-y-2" data-invalid={isFieldInvalid(data.partner_gross_income_pension) ? "true" : undefined}>
                  <Label>Брутен доход (€) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder=""
                    value={data.partner_gross_income_pension ?? ''}
                    onChange={(e) => onChange('partner_gross_income_pension', e.target.value === '' ? '' : parseInt(e.target.value))}
                    className={`rounded-lg ${isFieldInvalid(data.partner_gross_income_pension) ? 'border-red-500 bg-red-50' : ''}`}
                    required
                  />
                </div>
                <div className="space-y-2" data-invalid={isFieldInvalid(data.partner_retirement_age) ? "true" : undefined}>
                  <Label>Кога искате да излезете в пенсия? (възраст) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="50"
                    max="75"
                    placeholder=""
                    value={data.partner_retirement_age ?? ''}
                    onChange={(e) => onChange('partner_retirement_age', e.target.value === '' ? '' : parseInt(e.target.value))}
                    className={`rounded-lg ${isFieldInvalid(data.partner_retirement_age) ? 'border-red-500 bg-red-50' : ''}`}
                    required
                  />
                </div>
                <div className="space-y-2" data-invalid={isFieldInvalid(data.partner_desired_pension) ? "true" : undefined}>
                  <Label>От каква месечна пенсия ще се нуждаете? (€) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder=""
                    value={data.partner_desired_pension ?? ''}
                    onChange={(e) => onChange('partner_desired_pension', e.target.value === '' ? '' : parseInt(e.target.value))}
                    className={`rounded-lg ${isFieldInvalid(data.partner_desired_pension) ? 'border-red-500 bg-red-50' : ''}`}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Очаквана държавна пенсия (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.partner_expected_state_pension || ''}
                    readOnly
                    className="rounded-lg bg-slate-100"
                  />
                  {data.partner_pension_is_social && (
                    <p className="text-amber-600 text-sm">
                      Калкулирана е социалната пенсия за страната поради липса на необходима пенсионна възраст
                    </p>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Разлика: <span className="font-semibold">
                      {partnerDiff.toLocaleString()} €
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Investment calculation message */}
        {showCalculation && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              За осигуряване на подобна сума са ви необходими инвестиции в размер на около <span className="font-bold">{monthlyInvestmentNeeded.toLocaleString()} €</span> месечно. Във финансовия план ще откриете по-подробни предложения и проекции.
            </p>
            <p className="text-xs text-blue-600 mt-2">
              (Изчислено при {investmentHorizon} години инвестиционен хоризонт, {yearsUntil85} години пенсия до 85г. и 8% средна годишна доходност)
            </p>
          </div>
        )}
      </div>

      {/* Pension Pillars */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-6">Какво сте направили до сега?</h3>
        
        <div className={includePartner ? "grid lg:grid-cols-2 gap-8" : ""}>
          {/* Client */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-700">Клиент</span>
            </div>
            <div className="space-y-4">
              {/* I. Pillar */}
              <div className="flex items-center gap-3">
                <Label className="flex-1">I. Стълб (държавно осигуряване)</Label>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-medium", (data.client_pillar_1 ?? true) ? "text-green-600" : "text-slate-400")}>Да</span>
                  <button
                    type="button"
                    onClick={() => onChange('client_pillar_1', !(data.client_pillar_1 ?? true))}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      (data.client_pillar_1 ?? true) ? "bg-green-500" : "bg-red-500"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                      (data.client_pillar_1 ?? true) ? "left-0.5" : "left-6"
                    )} />
                  </button>
                  <span className={cn("text-sm font-medium", !(data.client_pillar_1 ?? true) ? "text-red-600" : "text-slate-400")}>Не</span>
                </div>
              </div>

              {/* II. Pillar */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label className="flex-1">II. Стълб (допълнително задължително)</Label>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-medium", (data.client_pillar_2 ?? true) ? "text-green-600" : "text-slate-400")}>Да</span>
                    <button
                      type="button"
                      onClick={() => onChange('client_pillar_2', !(data.client_pillar_2 ?? true))}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        (data.client_pillar_2 ?? true) ? "bg-green-500" : "bg-red-500"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                        (data.client_pillar_2 ?? true) ? "left-0.5" : "left-6"
                      )} />
                    </button>
                    <span className={cn("text-sm font-medium", !(data.client_pillar_2 ?? true) ? "text-red-600" : "text-slate-400")}>Не</span>
                  </div>
                </div>
                {(data.client_pillar_2 ?? true) && (
                    <div className="ml-4 space-y-2" data-invalid={isFieldInvalid(data.client_pension_fund) ? "true" : undefined}>
                      <Label className="text-sm">Име на частен пенсионен фонд? <span className="text-red-500">*</span></Label>
                      <Select 
                        value={data.client_pension_fund || ''} 
                        onValueChange={(value) => onChange('client_pension_fund', value)}
                      >
                        <SelectTrigger className={`rounded-lg ${isFieldInvalid(data.client_pension_fund) ? 'border-red-500 bg-red-50' : ''}`}>
                          <SelectValue placeholder="Изберете" />
                        </SelectTrigger>
                      <SelectContent>
                        {PENSION_FUND_OPTIONS.map(fund => (
                          <SelectItem key={fund.value} value={fund.value}>{fund.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500 mt-2">
                      В случай, на необходимост за откриване на дружеството, което управлява Вашите средства: Телефон за информация на НОИ: <span className="font-bold">0700 10 292</span> !
                    </p>
                  </div>
                )}
                </div>

                {/* III. Pillar */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="flex-1">III. Стълб (доброволно осигуряване)</Label>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-medium", (data.client_pillar_3 ?? false) ? "text-green-600" : "text-slate-400")}>Да</span>
                      <button
                        type="button"
                        onClick={() => onChange('client_pillar_3', !(data.client_pillar_3 ?? false))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative",
                          (data.client_pillar_3 ?? false) ? "bg-green-500" : "bg-red-500"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                          (data.client_pillar_3 ?? false) ? "left-0.5" : "left-6"
                        )} />
                      </button>
                      <span className={cn("text-sm font-medium", !(data.client_pillar_3 ?? false) ? "text-red-600" : "text-slate-400")}>Не</span>
                    </div>
                  </div>
                  {(data.client_pillar_3 ?? false) && (
                    <div className="ml-4 space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Име на частен пенсионен фонд <span className="text-red-500">*</span></Label>
                        <Select 
                          value={data.client_voluntary_pension_fund || ''} 
                          onValueChange={(value) => onChange('client_voluntary_pension_fund', value)}
                        >
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Изберете" />
                          </SelectTrigger>
                          <SelectContent>
                            {VOLUNTARY_PENSION_FUND_OPTIONS.map(fund => (
                              <SelectItem key={fund.value} value={fund.value}>{fund.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Месечна вноска (€) <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder=""
                          value={data.client_voluntary_pension_monthly || ''}
                          onChange={(e) => onChange('client_voluntary_pension_monthly', parseInt(e.target.value) || '')}
                          className="rounded-lg"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Обща стойност на партидата (ориентировъчна стойност) (€) <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder=""
                          value={data.client_voluntary_pension_total || ''}
                          onChange={(e) => onChange('client_voluntary_pension_total', parseInt(e.target.value) || '')}
                          className="rounded-lg"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
                </div>
                </div>

          {/* Partner - only show if included */}
          {includePartner && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-700">Партньор</span>
              </div>
              <div className="space-y-4">
                {/* I. Pillar */}
                <div className="flex items-center gap-3">
                  <Label className="flex-1">I. Стълб (държавно осигуряване)</Label>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-medium", (data.partner_pillar_1 ?? true) ? "text-green-600" : "text-slate-400")}>Да</span>
                    <button
                      type="button"
                      onClick={() => onChange('partner_pillar_1', !(data.partner_pillar_1 ?? true))}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        (data.partner_pillar_1 ?? true) ? "bg-green-500" : "bg-red-500"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                        (data.partner_pillar_1 ?? true) ? "left-0.5" : "left-6"
                      )} />
                    </button>
                    <span className={cn("text-sm font-medium", !(data.partner_pillar_1 ?? true) ? "text-red-600" : "text-slate-400")}>Не</span>
                  </div>
                </div>

                {/* II. Pillar */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="flex-1">II. Стълб (допълнително задължително)</Label>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-medium", (data.partner_pillar_2 ?? true) ? "text-green-600" : "text-slate-400")}>Да</span>
                      <button
                        type="button"
                        onClick={() => onChange('partner_pillar_2', !(data.partner_pillar_2 ?? true))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative",
                          (data.partner_pillar_2 ?? true) ? "bg-green-500" : "bg-red-500"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                          (data.partner_pillar_2 ?? true) ? "left-0.5" : "left-6"
                        )} />
                      </button>
                      <span className={cn("text-sm font-medium", !(data.partner_pillar_2 ?? true) ? "text-red-600" : "text-slate-400")}>Не</span>
                    </div>
                  </div>
                  {(data.partner_pillar_2 ?? true) && (
                    <div className="ml-4 space-y-2" data-invalid={isFieldInvalid(data.partner_pension_fund) ? "true" : undefined}>
                      <Label className="text-sm">Име на частен пенсионен фонд? <span className="text-red-500">*</span></Label>
                      <Select 
                        value={data.partner_pension_fund || ''} 
                        onValueChange={(value) => onChange('partner_pension_fund', value)}
                      >
                        <SelectTrigger className={`rounded-lg ${isFieldInvalid(data.partner_pension_fund) ? 'border-red-500 bg-red-50' : ''}`}>
                          <SelectValue placeholder="Изберете" />
                        </SelectTrigger>
                        <SelectContent>
                          {PENSION_FUND_OPTIONS.map(fund => (
                            <SelectItem key={fund.value} value={fund.value}>{fund.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500 mt-2">
                        В случай, на необходимост за откриване на дружеството, което управлява Вашите средства: Телефон за информация на НОИ: <span className="font-bold">0700 10 292</span> !
                      </p>
                    </div>
                  )}
                  </div>

                  {/* III. Pillar */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="flex-1">III. Стълб (доброволно осигуряване)</Label>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-medium", (data.partner_pillar_3 ?? false) ? "text-green-600" : "text-slate-400")}>Да</span>
                      <button
                        type="button"
                        onClick={() => onChange('partner_pillar_3', !(data.partner_pillar_3 ?? false))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative",
                          (data.partner_pillar_3 ?? false) ? "bg-green-500" : "bg-red-500"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                          (data.partner_pillar_3 ?? false) ? "left-0.5" : "left-6"
                        )} />
                      </button>
                      <span className={cn("text-sm font-medium", !(data.partner_pillar_3 ?? false) ? "text-red-600" : "text-slate-400")}>Не</span>
                    </div>
                  </div>
                  {(data.partner_pillar_3 ?? false) && (
                    <div className="ml-4 space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Име на частен пенсионен фонд <span className="text-red-500">*</span></Label>
                        <Select 
                          value={data.partner_voluntary_pension_fund || ''} 
                          onValueChange={(value) => onChange('partner_voluntary_pension_fund', value)}
                        >
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Изберете" />
                          </SelectTrigger>
                          <SelectContent>
                            {VOLUNTARY_PENSION_FUND_OPTIONS.map(fund => (
                              <SelectItem key={fund.value} value={fund.value}>{fund.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Месечна вноска (€) <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder=""
                          value={data.partner_voluntary_pension_monthly || ''}
                          onChange={(e) => onChange('partner_voluntary_pension_monthly', parseInt(e.target.value) || '')}
                          className="rounded-lg"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Обща стойност на партидата (ориентировъчна стойност) (€) <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder=""
                          value={data.partner_voluntary_pension_total || ''}
                          onChange={(e) => onChange('partner_voluntary_pension_total', parseInt(e.target.value) || '')}
                          className="rounded-lg"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        </div>

      {/* Pension Referrals */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Кой от Вашите приятели и познати:</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Works abroad */}
          <div className="space-y-3">
            <Label className="text-slate-700">Работи в чужбина?</Label>
            {(data.pension_referrals_abroad || ['']).map((name, index) => {
              const existingNames = [
                ...(data.referrals_no_own_home || []),
                ...(data.referrals_own_home_long || []),
                ...(data.birthday_family_names || []),
                ...(data.birthday_friends_names || []),
                ...(data.birthday_colleagues_names || []),
                ...(data.referrals_have_savings || []),
                ...(data.referrals_invest_regularly || [])
              ].filter(n => n && n.trim());
              const isDuplicate = name && name.trim() && existingNames.some(h => h.toLowerCase().trim() === name.toLowerCase().trim());
              
              return (
                <div key={`abroad_${index}`}>
                  <Input
                    placeholder="Име на познат"
                    value={name}
                    onChange={(e) => {
                      const newList = [...(data.pension_referrals_abroad || [''])];
                      newList[index] = e.target.value;
                      if (index === newList.length - 1 && e.target.value) {
                        newList.push('');
                      }
                      onChange('pension_referrals_abroad', newList);
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

          {/* High income */}
          <div className="space-y-3">
            <Label className="text-slate-700">Има доход над средния за страната?</Label>
            {(data.pension_referrals_high_income || ['']).map((name, index) => {
              const existingNames = [
                ...(data.referrals_no_own_home || []),
                ...(data.referrals_own_home_long || []),
                ...(data.birthday_family_names || []),
                ...(data.birthday_friends_names || []),
                ...(data.birthday_colleagues_names || []),
                ...(data.referrals_have_savings || []),
                ...(data.referrals_invest_regularly || [])
              ].filter(n => n && n.trim());
              const isDuplicate = name && name.trim() && existingNames.some(h => h.toLowerCase().trim() === name.toLowerCase().trim());
              
              return (
                <div key={`high_income_${index}`}>
                  <Input
                    placeholder="Име на познат"
                    value={name}
                    onChange={(e) => {
                      const newList = [...(data.pension_referrals_high_income || [''])];
                      newList[index] = e.target.value;
                      if (index === newList.length - 1 && e.target.value) {
                        newList.push('');
                      }
                      onChange('pension_referrals_high_income', newList);
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

          {/* Freelancer / Entrepreneur */}
          <div className="space-y-3">
            <Label className="text-slate-700">Има свободна професия или е предприемач с нисък осигурителен праг?</Label>
            {(data.pension_referrals_entrepreneur || ['']).map((name, index) => {
              const existingNames = [
                ...(data.referrals_no_own_home || []),
                ...(data.referrals_own_home_long || []),
                ...(data.birthday_family_names || []),
                ...(data.birthday_friends_names || []),
                ...(data.birthday_colleagues_names || []),
                ...(data.referrals_have_savings || []),
                ...(data.referrals_invest_regularly || [])
              ].filter(n => n && n.trim());
              const isDuplicate = name && name.trim() && existingNames.some(h => h.toLowerCase().trim() === name.toLowerCase().trim());
              
              return (
                <div key={`entrepreneur_${index}`}>
                  <Input
                    placeholder="Име на познат"
                    value={name}
                    onChange={(e) => {
                      const newList = [...(data.pension_referrals_entrepreneur || [''])];
                      newList[index] = e.target.value;
                      if (index === newList.length - 1 && e.target.value) {
                        newList.push('');
                      }
                      onChange('pension_referrals_entrepreneur', newList);
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

          {/* Young professional */}
          <div className="space-y-3">
            <Label className="text-slate-700">Е млад човек в началото на кариерата си?</Label>
            {(data.pension_referrals_young || ['']).map((name, index) => {
              const existingNames = [
                ...(data.referrals_no_own_home || []),
                ...(data.referrals_own_home_long || []),
                ...(data.birthday_family_names || []),
                ...(data.birthday_friends_names || []),
                ...(data.birthday_colleagues_names || []),
                ...(data.referrals_have_savings || []),
                ...(data.referrals_invest_regularly || [])
              ].filter(n => n && n.trim());
              const isDuplicate = name && name.trim() && existingNames.some(h => h.toLowerCase().trim() === name.toLowerCase().trim());
              
              return (
                <div key={`young_${index}`}>
                  <Input
                    placeholder="Име на познат"
                    value={name}
                    onChange={(e) => {
                      const newList = [...(data.pension_referrals_young || [''])];
                      newList[index] = e.target.value;
                      if (index === newList.length - 1 && e.target.value) {
                        newList.push('');
                      }
                      onChange('pension_referrals_young', newList);
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

      {/* Include in plan */}
      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
        <Checkbox
          checked={data.include_pension_in_plan || false}
          onCheckedChange={(checked) => onChange('include_pension_in_plan', checked)}
        />
        <span className="font-medium text-blue-800">Да бъде включено във финансовия план</span>
      </label>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { User, Users, Baby, Shield, X } from 'lucide-react';
import BulgarianDateInput from '@/components/ui/BulgarianDateInput';

// Bank options
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
import HealthQuestionnaire from './HealthQuestionnaire';

// Helper function to calculate age from birthdate
const calculateAge = (birthdate) => {
  if (!birthdate) return '';
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Bulgarian EGN validation
const validateEGN = (egn) => {
  if (!egn || egn.length !== 10) return { valid: false, error: 'ЕГН трябва да е 10 цифри' };
  if (!/^\d{10}$/.test(egn)) return { valid: false, error: 'ЕГН трябва да съдържа само цифри' };
  
  const weights = [2, 4, 8, 5, 10, 9, 7, 3, 6];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(egn[i]) * weights[i];
  }
  const checkDigit = sum % 11;
  const expectedCheck = checkDigit === 10 ? 0 : checkDigit;
  
  if (parseInt(egn[9]) !== expectedCheck) {
    return { valid: false, error: 'Невалидно ЕГН (грешна контролна цифра)' };
  }
  
  // Validate date from EGN
  const year = parseInt(egn.substring(0, 2));
  let month = parseInt(egn.substring(2, 4));
  const day = parseInt(egn.substring(4, 6));
  
  let fullYear;
  if (month > 40) {
    fullYear = 2000 + year;
    month -= 40;
  } else if (month > 20) {
    fullYear = 1800 + year;
    month -= 20;
  } else {
    fullYear = 1900 + year;
  }
  
  const date = new Date(fullYear, month - 1, day);
  if (date.getFullYear() !== fullYear || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { valid: false, error: 'Невалидна дата в ЕГН' };
  }
  
  return { valid: true, error: null };
};

// Bulgarian ID card number validation (old format: 9 digits, new format: 2 letters + 7 digits)
const validateIDNumber = (idNumber) => {
  if (!idNumber) return { valid: false, error: 'Номерът на личната карта е задължителен' };
  
  // Old format: 9 digits
  if (/^\d{9}$/.test(idNumber)) {
    return { valid: true, error: null };
  }
  
  // New format: 2 letters (Latin or Cyrillic) + 7 digits (e.g., AA1234567 or АА1234567)
  if (/^[A-Za-zА-Яа-я]{2}\d{7}$/.test(idNumber)) {
    return { valid: true, error: null };
  }
  
  return { valid: false, error: 'Невалиден формат (стар: 9 цифри, нов: 2 букви + 7 цифри)' };
};

// Toggle button component with yes/no indicator
const ToggleWithLabel = ({ checked, onChange, defaultYes = false }) => {
  if (defaultYes) {
    return (
      <div className="flex items-center gap-3">
        <span className={`text-sm font-medium ${!checked ? 'text-red-600' : 'text-slate-400'}`}>Не</span>
        <Switch
          checked={checked}
          onCheckedChange={onChange}
          className={checked ? 'data-[state=checked]:bg-green-500' : 'data-[state=unchecked]:bg-red-500'}
        />
        <span className={`text-sm font-medium ${checked ? 'text-green-600' : 'text-slate-400'}`}>Да</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-medium ${!checked ? 'text-green-600' : 'text-slate-400'}`}>Не</span>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className={checked ? 'data-[state=checked]:bg-red-500' : 'data-[state=unchecked]:bg-green-500'}
      />
      <span className={`text-sm font-medium ${checked ? 'text-red-600' : 'text-slate-400'}`}>Да</span>
    </div>
  );
};

export default function PersonalDataStep({ data, onChange, showErrors }) {
  const isInv = (value) => showErrors && (value === undefined || value === '' || value === null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  // Initialize defaults
  useEffect(() => {
    if (data.client_is_employed === undefined) onChange('client_is_employed', true);
    if (data.client_is_good_health === undefined) onChange('client_is_good_health', true);
    if (data.children_economically_dependent === undefined) onChange('children_economically_dependent', true);
  }, []);

  // Auto-calculate client age when birthdate changes
  useEffect(() => {
    if (data.client_birthdate) {
      const age = calculateAge(data.client_birthdate);
      if (age !== data.client_age) {
        onChange('client_age', age);
      }
    }
  }, [data.client_birthdate]);

  // Auto-calculate partner age when birthdate changes
  useEffect(() => {
    if (data.partner_birthdate) {
      const age = calculateAge(data.partner_birthdate);
      if (age !== data.partner_age) {
        onChange('partner_age', age);
      }
    }
  }, [data.partner_birthdate]);

  // Initialize partner defaults when enabled
  useEffect(() => {
    if (data.include_partner) {
      if (data.partner_is_employed === undefined) onChange('partner_is_employed', true);
      if (data.partner_is_good_health === undefined) onChange('partner_is_good_health', true);
    }
  }, [data.include_partner]);

  return (
    <div className="space-y-8 relative">
      {/* Floating Disclaimer */}
      {showDisclaimer && (
        <div className="fixed bottom-4 right-4 max-w-sm bg-blue-600 text-white p-4 rounded-xl shadow-xl z-50">
          <button 
            onClick={() => setShowDisclaimer(false)}
            className="absolute top-2 right-2 text-white/80 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              Ние сме регулирани към Комисията за финансов надзор и сме администратор на лични данни. 
              Информацията е законодателно необходима за изготвяне на Вашия анализ и финансов план. 
              Никога не споделяме данните Ви с трети страни без Вашето съгласие.
            </p>
          </div>
        </div>
      )}

      {/* Client Section */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Клиент</h3>
        </div>
        
        {/* Personal Info */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2" data-invalid={isInv(data.client_first_name) ? "true" : undefined}>
            <Label>Име <span className="text-red-500">*</span></Label>
            <Input value={data.client_first_name || ''} onChange={(e) => onChange('client_first_name', e.target.value)} className={`rounded-lg ${isInv(data.client_first_name) ? 'border-red-500 bg-red-50' : ''}`} required />
          </div>
          <div className="space-y-2" data-invalid={isInv(data.client_middle_name) ? "true" : undefined}>
            <Label>Презиме <span className="text-red-500">*</span></Label>
            <Input value={data.client_middle_name || ''} onChange={(e) => onChange('client_middle_name', e.target.value)} className={`rounded-lg ${isInv(data.client_middle_name) ? 'border-red-500 bg-red-50' : ''}`} required />
          </div>
          <div className="space-y-2" data-invalid={isInv(data.client_last_name) ? "true" : undefined}>
            <Label>Фамилия <span className="text-red-500">*</span></Label>
            <Input value={data.client_last_name || ''} onChange={(e) => onChange('client_last_name', e.target.value)} className={`rounded-lg ${isInv(data.client_last_name) ? 'border-red-500 bg-red-50' : ''}`} required />
          </div>

          <div className="space-y-2" data-invalid={isInv(data.client_birthdate) ? "true" : undefined}>
            <Label>Дата на раждане <span className="text-red-500">*</span></Label>
            <BulgarianDateInput value={data.client_birthdate || ''} onChange={(value) => onChange('client_birthdate', value)} className={`rounded-lg ${isInv(data.client_birthdate) ? 'border-red-500 bg-red-50' : ''}`} required />
          </div>
          <div className="space-y-2">
            <Label>Възраст</Label>
            <Input type="number" value={data.client_age || ''} readOnly className="rounded-lg bg-slate-100" />
          </div>
          <div className="space-y-2" data-invalid={isInv(data.client_gender) ? "true" : undefined}>
            <Label>Пол <span className="text-red-500">*</span></Label>
            <Select value={data.client_gender || ''} onValueChange={(value) => onChange('client_gender', value)}>
              <SelectTrigger className={`rounded-lg ${isInv(data.client_gender) ? 'border-red-500 bg-red-50' : ''}`}><SelectValue placeholder="Изберете" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Мъж</SelectItem>
                <SelectItem value="female">Жена</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2" data-invalid={isInv(data.client_birthplace) ? "true" : undefined}>
            <Label>Място на раждане <span className="text-red-500">*</span></Label>
            <Input value={data.client_birthplace || ''} onChange={(e) => onChange('client_birthplace', e.target.value)} className={`rounded-lg ${isInv(data.client_birthplace) ? 'border-red-500 bg-red-50' : ''}`} required />
          </div>
          <div className="space-y-2" data-invalid={isInv(data.client_egn) ? "true" : undefined}>
            <Label>ЕГН <span className="text-red-500">*</span></Label>
            <Input placeholder="0000000000" value={data.client_egn || ''} onChange={(e) => onChange('client_egn', e.target.value)} className={`rounded-lg ${isInv(data.client_egn) ? 'border-red-500 bg-red-50' : data.client_egn?.length === 10 && !validateEGN(data.client_egn).valid ? 'border-red-500' : data.client_egn?.length === 10 && validateEGN(data.client_egn).valid ? 'border-green-500' : ''}`} required />
            {data.client_egn?.length === 10 && !validateEGN(data.client_egn).valid && (<p className="text-red-500 text-xs">{validateEGN(data.client_egn).error}</p>)}
            {data.client_egn?.length === 10 && validateEGN(data.client_egn).valid && (<p className="text-green-500 text-xs">✓ Валидно ЕГН</p>)}
          </div>
          <div className="space-y-2" data-invalid={isInv(data.client_id_number) ? "true" : undefined}>
            <Label>Номер на лична карта <span className="text-red-500">*</span></Label>
            <Input placeholder="000000000" value={data.client_id_number || ''} onChange={(e) => onChange('client_id_number', e.target.value)} className={`rounded-lg ${isInv(data.client_id_number) ? 'border-red-500 bg-red-50' : data.client_id_number?.length >= 9 && !validateIDNumber(data.client_id_number).valid ? 'border-red-500' : data.client_id_number?.length >= 9 && validateIDNumber(data.client_id_number).valid ? 'border-green-500' : ''}`} required />
            {data.client_id_number?.length >= 9 && !validateIDNumber(data.client_id_number).valid && (<p className="text-red-500 text-xs">{validateIDNumber(data.client_id_number).error}</p>)}
            {data.client_id_number?.length >= 9 && validateIDNumber(data.client_id_number).valid && (<p className="text-green-500 text-xs">✓ Валиден номер</p>)}
          </div>

          <div className="space-y-2" data-invalid={isInv(data.client_id_valid_until) ? "true" : undefined}>
            <Label>Лична карта валидна до <span className="text-red-500">*</span></Label>
            <BulgarianDateInput value={data.client_id_valid_until || ''} onChange={(value) => onChange('client_id_valid_until', value)} className={`rounded-lg ${isInv(data.client_id_valid_until) ? 'border-red-500 bg-red-50' : ''}`} required />
          </div>
          <div className="space-y-2 sm:col-span-2" data-invalid={isInv(data.client_address) ? "true" : undefined}>
            <Label>Постоянен адрес <span className="text-red-500">*</span></Label>
            <Input value={data.client_address || ''} onChange={(e) => onChange('client_address', e.target.value)} className={`rounded-lg ${isInv(data.client_address) ? 'border-red-500 bg-red-50' : ''}`} required />
          </div>

          <div className="space-y-2" data-invalid={isInv(data.client_phone) ? "true" : undefined}>
            <Label>Телефонен номер <span className="text-red-500">*</span></Label>
            <Input placeholder="+359 888 000 000" value={data.client_phone || ''} onChange={(e) => onChange('client_phone', e.target.value)} className={`rounded-lg ${isInv(data.client_phone) ? 'border-red-500 bg-red-50' : ''}`} required />
          </div>
          <div className="space-y-2" data-invalid={isInv(data.client_email) ? "true" : undefined}>
            <Label>Email <span className="text-red-500">*</span></Label>
            <Input type="email" placeholder="email@example.com" value={data.client_email || ''} onChange={(e) => onChange('client_email', e.target.value)} className={`rounded-lg ${isInv(data.client_email) ? 'border-red-500 bg-red-50' : ''}`} required />
          </div>
          <div className="space-y-2" data-invalid={isInv(data.client_marital_status) ? "true" : undefined}>
            <Label>Семейно положение <span className="text-red-500">*</span></Label>
            <Select value={data.client_marital_status || ''} onValueChange={(value) => onChange('client_marital_status', value)}>
              <SelectTrigger className={`rounded-lg ${isInv(data.client_marital_status) ? 'border-red-500 bg-red-50' : ''}`}><SelectValue placeholder="Изберете" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Неженен/Неомъжена</SelectItem>
                <SelectItem value="married">Женен/Омъжена</SelectItem>
                <SelectItem value="divorced">Разведен/а</SelectItem>
                <SelectItem value="widowed">Вдовец/Вдовица</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2" data-invalid={isInv(data.client_nationality) ? "true" : undefined}>
            <Label>Националност <span className="text-red-500">*</span></Label>
            <Select value={data.client_nationality || ''} onValueChange={(value) => onChange('client_nationality', value)}>
              <SelectTrigger className={`rounded-lg ${isInv(data.client_nationality) ? 'border-red-500 bg-red-50' : ''}`}><SelectValue placeholder="Изберете" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bulgarian">Българска</SelectItem>
                <SelectItem value="other_eu">Друга от ЕС</SelectItem>
                <SelectItem value="non_eu">Извън ЕС</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2" data-invalid={isInv(data.client_bank) ? "true" : undefined}>
            <Label>Банка <span className="text-red-500">*</span></Label>
            <Select value={data.client_bank || ''} onValueChange={(value) => onChange('client_bank', value)}>
              <SelectTrigger className={`rounded-lg ${isInv(data.client_bank) ? 'border-red-500 bg-red-50' : ''}`}><SelectValue placeholder="Изберете" /></SelectTrigger>
              <SelectContent>
                {BANK_OPTIONS.map(bank => (<SelectItem key={bank.value} value={bank.value}>{bank.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ZMIP Declaration */}
        <div className="border-t border-slate-200 pt-4 mb-4">
          <h4 className="font-medium text-slate-700 mb-3">Декларация по член 36 от ЗМИП</h4>
          <div className={`flex items-center justify-between p-3 rounded-lg border ${data.client_is_pep ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <Label className="cursor-pointer text-sm">Вие или член на Вашето семейство лице ли сте по член 36 от ЗМИП?</Label>
            <ToggleWithLabel checked={data.client_is_pep || false} onChange={(checked) => onChange('client_is_pep', checked)} defaultYes={false} />
          </div>
        </div>

        {/* Employment Data */}
        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-medium text-slate-700 mb-3">Данни за заетост, доходи и работодател</h4>
          
          <div className={`flex items-center justify-between p-3 rounded-lg border mb-4 ${data.client_is_employed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <Label className="cursor-pointer">Трудова заетост</Label>
            <ToggleWithLabel checked={data.client_is_employed ?? true} onChange={(checked) => onChange('client_is_employed', checked)} defaultYes={true} />
          </div>

          {data.client_is_employed ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2 sm:col-span-2 lg:col-span-3" data-invalid={isInv(data.client_job_description) ? "true" : undefined}>
                <Label>Описание на месторабота и трудови задължения <span className="text-red-500">*</span></Label>
                <Input placeholder="Описание на длъжността..." value={data.client_job_description || ''} onChange={(e) => onChange('client_job_description', e.target.value)} className={`rounded-lg ${isInv(data.client_job_description) ? 'border-red-500 bg-red-50' : ''}`} required />
              </div>
              <div className="space-y-2" data-invalid={isInv(data.client_employer_name) ? "true" : undefined}>
                <Label>Име на работодател <span className="text-red-500">*</span></Label>
                <Input value={data.client_employer_name || ''} onChange={(e) => onChange('client_employer_name', e.target.value)} className={`rounded-lg ${isInv(data.client_employer_name) ? 'border-red-500 bg-red-50' : ''}`} required />
              </div>
              <div className="space-y-2">
                <Label>Град</Label>
                <Input value={data.client_employer_city || ''} onChange={(e) => onChange('client_employer_city', e.target.value)} className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label>Улица</Label>
                <Input value={data.client_employer_street || ''} onChange={(e) => onChange('client_employer_street', e.target.value)} className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label>Пощенски код</Label>
                <Input value={data.client_employer_postal_code || ''} onChange={(e) => onChange('client_employer_postal_code', e.target.value)} className="rounded-lg" />
              </div>
              <div className="space-y-2" data-invalid={isInv(data.client_contract_type) ? "true" : undefined}>
                <Label>Вид договор <span className="text-red-500">*</span></Label>
                <Select value={data.client_contract_type || ''} onValueChange={(value) => onChange('client_contract_type', value)}>
                  <SelectTrigger className={`rounded-lg ${isInv(data.client_contract_type) ? 'border-red-500 bg-red-50' : ''}`}><SelectValue placeholder="Изберете" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="labor">Трудов договор</SelectItem>
                    <SelectItem value="civil">Граждански договор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2" data-invalid={isInv(data.client_contract_term) ? "true" : undefined}>
                <Label>Срок на договора <span className="text-red-500">*</span></Label>
                <Select value={data.client_contract_term || ''} onValueChange={(value) => onChange('client_contract_term', value)}>
                  <SelectTrigger className={`rounded-lg ${isInv(data.client_contract_term) ? 'border-red-500 bg-red-50' : ''}`}><SelectValue placeholder="Изберете" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Срочен договор</SelectItem>
                    <SelectItem value="permanent">Постоянен договор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2" data-invalid={isInv(data.client_income_source) ? "true" : undefined}>
                <Label>Източник на доход <span className="text-red-500">*</span></Label>
                <Input placeholder="Например: Наеми, Дивиденти..." value={data.client_income_source || ''} onChange={(e) => onChange('client_income_source', e.target.value)} className={`rounded-lg ${isInv(data.client_income_source) ? 'border-red-500 bg-red-50' : ''}`} required />
              </div>
              <div className="space-y-2" data-invalid={isInv(data.client_activity) ? "true" : undefined}>
                <Label>Дейност <span className="text-red-500">*</span></Label>
                <Input placeholder="Описание на дейността..." value={data.client_activity || ''} onChange={(e) => onChange('client_activity', e.target.value)} className={`rounded-lg ${isInv(data.client_activity) ? 'border-red-500 bg-red-50' : ''}`} required />
              </div>
            </div>
          )}
        </div>

        {/* Health Questionnaire */}
        <HealthQuestionnaire data={data} onChange={onChange} prefix="client" />
      </div>

      {/* Partner Section */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Партньор</h3>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm cursor-pointer">Включи партньор</Label>
            <Switch checked={data.include_partner || false} onCheckedChange={(checked) => onChange('include_partner', checked)} />
          </div>
        </div>
        
        {data.include_partner && (
          <>
            {/* Personal Info */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2" data-invalid={isInv(data.partner_first_name) ? "true" : undefined}>
                <Label>Име <span className="text-red-500">*</span></Label>
                <Input value={data.partner_first_name || ''} onChange={(e) => onChange('partner_first_name', e.target.value)} className={`rounded-lg ${isInv(data.partner_first_name) ? 'border-red-500 bg-red-50' : ''}`} required />
              </div>
              <div className="space-y-2" data-invalid={isInv(data.partner_middle_name) ? "true" : undefined}>
                <Label>Презиме <span className="text-red-500">*</span></Label>
                <Input value={data.partner_middle_name || ''} onChange={(e) => onChange('partner_middle_name', e.target.value)} className={`rounded-lg ${isInv(data.partner_middle_name) ? 'border-red-500 bg-red-50' : ''}`} required />
              </div>
              <div className="space-y-2" data-invalid={isInv(data.partner_last_name) ? "true" : undefined}>
                <Label>Фамилия <span className="text-red-500">*</span></Label>
                <Input value={data.partner_last_name || ''} onChange={(e) => onChange('partner_last_name', e.target.value)} className={`rounded-lg ${isInv(data.partner_last_name) ? 'border-red-500 bg-red-50' : ''}`} required />
              </div>

              <div className="space-y-2" data-invalid={isInv(data.partner_birthdate) ? "true" : undefined}>
                <Label>Дата на раждане <span className="text-red-500">*</span></Label>
                <BulgarianDateInput value={data.partner_birthdate || ''} onChange={(value) => onChange('partner_birthdate', value)} className={`rounded-lg ${isInv(data.partner_birthdate) ? 'border-red-500 bg-red-50' : ''}`} required />
              </div>
              <div className="space-y-2">
                <Label>Възраст</Label>
                <Input type="number" value={data.partner_age || ''} readOnly className="rounded-lg bg-slate-100" />
              </div>
              <div className="space-y-2" data-invalid={isInv(data.partner_gender) ? "true" : undefined}>
                <Label>Пол <span className="text-red-500">*</span></Label>
                <Select value={data.partner_gender || ''} onValueChange={(value) => onChange('partner_gender', value)}>
                  <SelectTrigger className={`rounded-lg ${isInv(data.partner_gender) ? 'border-red-500 bg-red-50' : ''}`}><SelectValue placeholder="Изберете" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Мъж</SelectItem>
                    <SelectItem value="female">Жена</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2" data-invalid={isInv(data.partner_birthplace) ? "true" : undefined}>
                <Label>Място на раждане <span className="text-red-500">*</span></Label>
                <Input value={data.partner_birthplace || ''} onChange={(e) => onChange('partner_birthplace', e.target.value)} className={`rounded-lg ${isInv(data.partner_birthplace) ? 'border-red-500 bg-red-50' : ''}`} required />
              </div>
              <div className="space-y-2" data-invalid={isInv(data.partner_egn) ? "true" : undefined}>
                <Label>ЕГН <span className="text-red-500">*</span></Label>
                <Input placeholder="0000000000" value={data.partner_egn || ''} onChange={(e) => onChange('partner_egn', e.target.value)} className={`rounded-lg ${isInv(data.partner_egn) ? 'border-red-500 bg-red-50' : data.partner_egn?.length === 10 && !validateEGN(data.partner_egn).valid ? 'border-red-500' : data.partner_egn?.length === 10 && validateEGN(data.partner_egn).valid ? 'border-green-500' : ''}`} required />
                {data.partner_egn?.length === 10 && !validateEGN(data.partner_egn).valid && (<p className="text-red-500 text-xs">{validateEGN(data.partner_egn).error}</p>)}
                {data.partner_egn?.length === 10 && validateEGN(data.partner_egn).valid && (<p className="text-green-500 text-xs">✓ Валидно ЕГН</p>)}
              </div>
              <div className="space-y-2" data-invalid={isInv(data.partner_id_number) ? "true" : undefined}>
                <Label>Номер на лична карта <span className="text-red-500">*</span></Label>
                <Input placeholder="000000000" value={data.partner_id_number || ''} onChange={(e) => onChange('partner_id_number', e.target.value)} className={`rounded-lg ${isInv(data.partner_id_number) ? 'border-red-500 bg-red-50' : data.partner_id_number?.length >= 9 && !validateIDNumber(data.partner_id_number).valid ? 'border-red-500' : data.partner_id_number?.length >= 9 && validateIDNumber(data.partner_id_number).valid ? 'border-green-500' : ''}`} required />
                {data.partner_id_number?.length >= 9 && !validateIDNumber(data.partner_id_number).valid && (<p className="text-red-500 text-xs">{validateIDNumber(data.partner_id_number).error}</p>)}
                {data.partner_id_number?.length >= 9 && validateIDNumber(data.partner_id_number).valid && (<p className="text-green-500 text-xs">✓ Валиден номер</p>)}
              </div>

              <div className="space-y-2" data-invalid={isInv(data.partner_id_valid_until) ? "true" : undefined}>
                <Label>Лична карта валидна до <span className="text-red-500">*</span></Label>
                <BulgarianDateInput value={data.partner_id_valid_until || ''} onChange={(value) => onChange('partner_id_valid_until', value)} className={`rounded-lg ${isInv(data.partner_id_valid_until) ? 'border-red-500 bg-red-50' : ''}`} required />
              </div>
              <div className="space-y-2 sm:col-span-2" data-invalid={isInv(data.partner_address) ? "true" : undefined}>
                <Label>Постоянен адрес <span className="text-red-500">*</span></Label>
                <Input value={data.partner_address || ''} onChange={(e) => onChange('partner_address', e.target.value)} className={`rounded-lg ${isInv(data.partner_address) ? 'border-red-500 bg-red-50' : ''}`} required />
              </div>

              <div className="space-y-2" data-invalid={isInv(data.partner_phone) ? "true" : undefined}>
                <Label>Телефонен номер <span className="text-red-500">*</span></Label>
                <Input placeholder="+359 888 000 000" value={data.partner_phone || ''} onChange={(e) => onChange('partner_phone', e.target.value)} className={`rounded-lg ${isInv(data.partner_phone) ? 'border-red-500 bg-red-50' : ''}`} required />
              </div>
              <div className="space-y-2" data-invalid={isInv(data.partner_email) ? "true" : undefined}>
                <Label>Email <span className="text-red-500">*</span></Label>
                <Input type="email" placeholder="email@example.com" value={data.partner_email || ''} onChange={(e) => onChange('partner_email', e.target.value)} className={`rounded-lg ${isInv(data.partner_email) ? 'border-red-500 bg-red-50' : ''}`} required />
              </div>
              <div className="space-y-2" data-invalid={isInv(data.partner_marital_status) ? "true" : undefined}>
                <Label>Семейно положение <span className="text-red-500">*</span></Label>
                <Select value={data.partner_marital_status || ''} onValueChange={(value) => onChange('partner_marital_status', value)}>
                  <SelectTrigger className={`rounded-lg ${isInv(data.partner_marital_status) ? 'border-red-500 bg-red-50' : ''}`}><SelectValue placeholder="Изберете" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Неженен/Неомъжена</SelectItem>
                    <SelectItem value="married">Женен/Омъжена</SelectItem>
                    <SelectItem value="divorced">Разведен/а</SelectItem>
                    <SelectItem value="widowed">Вдовец/Вдовица</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2" data-invalid={isInv(data.partner_nationality) ? "true" : undefined}>
                <Label>Националност <span className="text-red-500">*</span></Label>
                <Select value={data.partner_nationality || ''} onValueChange={(value) => onChange('partner_nationality', value)}>
                  <SelectTrigger className={`rounded-lg ${isInv(data.partner_nationality) ? 'border-red-500 bg-red-50' : ''}`}><SelectValue placeholder="Изберете" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bulgarian">Българска</SelectItem>
                    <SelectItem value="other_eu">Друга от ЕС</SelectItem>
                    <SelectItem value="non_eu">Извън ЕС</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2" data-invalid={isInv(data.partner_bank) ? "true" : undefined}>
                <Label>Банка <span className="text-red-500">*</span></Label>
                <Select value={data.partner_bank || ''} onValueChange={(value) => onChange('partner_bank', value)}>
                  <SelectTrigger className={`rounded-lg ${isInv(data.partner_bank) ? 'border-red-500 bg-red-50' : ''}`}><SelectValue placeholder="Изберете" /></SelectTrigger>
                  <SelectContent>
                    {BANK_OPTIONS.map(bank => (<SelectItem key={bank.value} value={bank.value}>{bank.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ZMIP Declaration */}
            <div className="border-t border-slate-200 pt-4 mb-4">
              <h4 className="font-medium text-slate-700 mb-3">Декларация по член 36 от ЗМИП</h4>
              <div className={`flex items-center justify-between p-3 rounded-lg border ${data.partner_is_pep ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <Label className="cursor-pointer text-sm">Вие или член на Вашето семейство лице ли сте по член 36 от ЗМИП?</Label>
                <ToggleWithLabel checked={data.partner_is_pep || false} onChange={(checked) => onChange('partner_is_pep', checked)} defaultYes={false} />
              </div>
            </div>

            {/* Employment Data */}
            <div className="border-t border-slate-200 pt-4">
              <h4 className="font-medium text-slate-700 mb-3">Данни за заетост, доходи и работодател</h4>
              
              <div className={`flex items-center justify-between p-3 rounded-lg border mb-4 ${data.partner_is_employed ?? true ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <Label className="cursor-pointer">Трудова заетост</Label>
                <ToggleWithLabel checked={data.partner_is_employed ?? true} onChange={(checked) => onChange('partner_is_employed', checked)} defaultYes={true} />
              </div>

              {(data.partner_is_employed ?? true) ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3" data-invalid={isInv(data.partner_job_description) ? "true" : undefined}>
                    <Label>Описание на месторабота и трудови задължения <span className="text-red-500">*</span></Label>
                    <Input placeholder="Описание на длъжността..." value={data.partner_job_description || ''} onChange={(e) => onChange('partner_job_description', e.target.value)} className={`rounded-lg ${isInv(data.partner_job_description) ? 'border-red-500 bg-red-50' : ''}`} required />
                  </div>
                  <div className="space-y-2" data-invalid={isInv(data.partner_employer_name) ? "true" : undefined}>
                    <Label>Име на работодател <span className="text-red-500">*</span></Label>
                    <Input value={data.partner_employer_name || ''} onChange={(e) => onChange('partner_employer_name', e.target.value)} className={`rounded-lg ${isInv(data.partner_employer_name) ? 'border-red-500 bg-red-50' : ''}`} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Град</Label>
                    <Input value={data.partner_employer_city || ''} onChange={(e) => onChange('partner_employer_city', e.target.value)} className="rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label>Улица</Label>
                    <Input value={data.partner_employer_street || ''} onChange={(e) => onChange('partner_employer_street', e.target.value)} className="rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label>Пощенски код</Label>
                    <Input value={data.partner_employer_postal_code || ''} onChange={(e) => onChange('partner_employer_postal_code', e.target.value)} className="rounded-lg" />
                  </div>
                  <div className="space-y-2" data-invalid={isInv(data.partner_contract_type) ? "true" : undefined}>
                    <Label>Вид договор <span className="text-red-500">*</span></Label>
                    <Select value={data.partner_contract_type || ''} onValueChange={(value) => onChange('partner_contract_type', value)}>
                      <SelectTrigger className={`rounded-lg ${isInv(data.partner_contract_type) ? 'border-red-500 bg-red-50' : ''}`}><SelectValue placeholder="Изберете" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="labor">Трудов договор</SelectItem>
                        <SelectItem value="civil">Граждански договор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2" data-invalid={isInv(data.partner_contract_term) ? "true" : undefined}>
                    <Label>Срок на договора <span className="text-red-500">*</span></Label>
                    <Select value={data.partner_contract_term || ''} onValueChange={(value) => onChange('partner_contract_term', value)}>
                      <SelectTrigger className={`rounded-lg ${isInv(data.partner_contract_term) ? 'border-red-500 bg-red-50' : ''}`}><SelectValue placeholder="Изберете" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Срочен договор</SelectItem>
                        <SelectItem value="permanent">Постоянен договор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2" data-invalid={isInv(data.partner_income_source) ? "true" : undefined}>
                    <Label>Източник на доход <span className="text-red-500">*</span></Label>
                    <Input placeholder="Например: Наеми, Дивиденти..." value={data.partner_income_source || ''} onChange={(e) => onChange('partner_income_source', e.target.value)} className={`rounded-lg ${isInv(data.partner_income_source) ? 'border-red-500 bg-red-50' : ''}`} required />
                  </div>
                  <div className="space-y-2" data-invalid={isInv(data.partner_activity) ? "true" : undefined}>
                    <Label>Дейност <span className="text-red-500">*</span></Label>
                    <Input placeholder="Описание на дейността..." value={data.partner_activity || ''} onChange={(e) => onChange('partner_activity', e.target.value)} className={`rounded-lg ${isInv(data.partner_activity) ? 'border-red-500 bg-red-50' : ''}`} required />
                  </div>
                </div>
              )}
            </div>

            {/* Health Questionnaire */}
            <HealthQuestionnaire data={data} onChange={onChange} prefix="partner" />
          </>
        )}

        {!data.include_partner && (
          <p className="text-slate-500 text-sm text-center py-4">
            Активирайте превключвателя по-горе, за да добавите данни за партньор.
          </p>
        )}
      </div>

      {/* Children Section */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Baby className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Деца</h3>
        </div>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2" data-invalid={isInv(data.children_count) ? "true" : undefined}>
              <Label>Брой деца <span className="text-red-500">*</span></Label>
              <Select value={data.children_count?.toString() || ''} onValueChange={(value) => onChange('children_count', parseInt(value))}>
                <SelectTrigger className={`rounded-lg ${isInv(data.children_count) ? 'border-red-500 bg-red-50' : ''}`}><SelectValue placeholder="Изберете" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Няма</SelectItem>
                  {[1, 2, 3, 4, 5].map(num => (<SelectItem key={num} value={num.toString()}>{num}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg border ${data.children_economically_dependent ?? true ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <Label className="cursor-pointer">Икономическа зависимост</Label>
              <ToggleWithLabel checked={data.children_economically_dependent ?? true} onChange={(checked) => onChange('children_economically_dependent', checked)} defaultYes={true} />
            </div>
          </div>

          {(data.children_count || 0) > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <Label className="text-sm text-slate-600">Данни за децата</Label>
              {Array.from({ length: data.children_count || 0 }).map((_, index) => (
                <div key={index} className="grid sm:grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="space-y-1" data-invalid={isInv(data[`child_${index + 1}_name`]) ? "true" : undefined}>
                    <Label className="text-xs">Дете {index + 1} - Име <span className="text-red-500">*</span></Label>
                    <Input value={data[`child_${index + 1}_name`] || ''} onChange={(e) => onChange(`child_${index + 1}_name`, e.target.value)} className={`rounded-lg ${isInv(data[`child_${index + 1}_name`]) ? 'border-red-500 bg-red-50' : ''}`} required />
                  </div>
                  <div className="space-y-1" data-invalid={isInv(data[`child_${index + 1}_birthdate`]) ? "true" : undefined}>
                    <Label className="text-xs">Дата на раждане <span className="text-red-500">*</span></Label>
                    <BulgarianDateInput value={data[`child_${index + 1}_birthdate`] || ''} onChange={(value) => onChange(`child_${index + 1}_birthdate`, value)} className={`rounded-lg ${isInv(data[`child_${index + 1}_birthdate`]) ? 'border-red-500 bg-red-50' : ''}`} required />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
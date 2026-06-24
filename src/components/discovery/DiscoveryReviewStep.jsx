import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { CheckCircle, Edit2, Shield, Home, PiggyBank, Umbrella, Baby, Wallet, BarChart3, ListOrdered, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTION_ICONS = {
  consent:       Shield,
  housing:       Home,
  reserve:       PiggyBank,
  pension:       Umbrella,
  children:      Baby,
  protection:    Wallet,
  cashflow:      BarChart3,
  priorities:    ListOrdered,
};

const SECTIONS = [
  {
    id: 'consent',
    title: 'Съгласие',
    fields: [
      { key: 'gdpr_consent_a', label: 'Финансов анализ и посредничество', type: 'bool' },
      { key: 'gdpr_consent_b', label: 'Маркетинг и информация', type: 'bool' },
      { key: 'gdpr_consent_c', label: 'Предоставяне на трети лица', type: 'bool' },
    ],
  },
  {
    id: 'housing',
    title: 'Жилище',
    fields: [
      { key: 'current_housing', label: 'Настоящо жилище', type: 'enum', map: { rented: 'Наемател', owned: 'Собственик', with_parents: 'При родители', subrented: 'Пренаем' } },
      { key: 'current_housing_location', label: 'Локация', type: 'text' },
      { key: 'current_housing_value', label: 'Стойност', type: 'currency' },
      { key: 'planning_housing_change', label: 'Планира смяна', type: 'bool' },
      { key: 'planned_housing_value', label: 'Планирана стойност', type: 'currency' },
    ],
  },
  {
    id: 'reserve',
    title: 'Резерв и спестявания',
    fields: [
      { key: 'client_monthly_net_income', label: 'Нетен доход (клиент)', type: 'currency' },
      { key: 'partner_monthly_net_income', label: 'Нетен доход (партньор)', type: 'currency' },
      { key: 'desired_reserve_months', label: 'Желан резерв (месеци)', type: 'number' },
      { key: 'monthly_savings_amount', label: 'Месечни спестявания', type: 'currency' },
      { key: 'risk_profile', label: 'Рисков профил', type: 'enum', map: { conservative: 'Консервативен', moderate: 'Умерен', dynamic: 'Динамичен', aggressive: 'Агресивен' } },
    ],
  },
  {
    id: 'pension',
    title: 'Пенсия',
    fields: [
      { key: 'client_retirement_age', label: 'Пенсионна възраст (клиент)', type: 'number' },
      { key: 'client_desired_pension', label: 'Желана пенсия', type: 'currency' },
      { key: 'client_pension_fund', label: 'Пенсионен фонд', type: 'text' },
      { key: 'partner_retirement_age', label: 'Пенсионна възраст (партньор)', type: 'number' },
    ],
  },
  {
    id: 'children',
    title: 'Деца и цели',
    fields: [
      { key: 'children_count', label: 'Брой деца', type: 'number' },
      { key: 'children_education_costs', label: 'Образование (цел)', type: 'currency' },
      { key: 'children_current_savings', label: 'Текущи спестявания за деца', type: 'currency' },
      { key: 'other_goals_car', label: 'Цел: автомобил', type: 'currency' },
      { key: 'other_goals_vacation', label: 'Цел: почивка', type: 'currency' },
    ],
  },
  {
    id: 'protection',
    title: 'Защита',
    fields: [
      { key: 'income_source', label: 'Източник на доход', type: 'enum', map: { employment: 'Трудово правоотношение', self_employed: 'Самоосигуряващ се', rent: 'Наем', investments: 'Инвестиции', mixed: 'Смесен' } },
      { key: 'has_property_1', label: 'Собствен имот', type: 'bool' },
      { key: 'property_1_value', label: 'Стойност на имот', type: 'currency' },
      { key: 'has_car_1', label: 'Автомобил', type: 'bool' },
    ],
  },
  {
    id: 'cashflow',
    title: 'Финансов поток',
    fields: [
      { key: 'client_gross_income', label: 'Брутен доход', type: 'currency' },
      { key: 'client_net_income', label: 'Нетен доход', type: 'currency' },
      { key: 'liability_mortgage_monthly', label: 'Ипотека (месечна)', type: 'currency' },
      { key: 'liability_consumer_loans_monthly', label: 'Потребителски кредити', type: 'currency' },
      { key: 'asset_checking_account', label: 'Разплащателна сметка', type: 'currency' },
    ],
  },
  {
    id: 'priorities',
    title: 'Приоритети',
    fields: [
      { key: 'priority_income_protection', label: 'Защита на доход', type: 'number' },
      { key: 'priority_pension', label: 'Пенсия', type: 'number' },
      { key: 'priority_reserve', label: 'Резерв', type: 'number' },
      { key: 'monthly_priority_allocation', label: 'Месечна сума за финансов план', type: 'currency' },
    ],
  },
];

function formatValue(value, type, map) {
  if (value === undefined || value === null || value === '') return <span className="text-slate-400 italic">—</span>;
  if (type === 'bool') return value ? <span className="text-green-600 font-medium">Да</span> : <span className="text-slate-400">Не</span>;
  if (type === 'currency') return <span className="font-medium">{Number(value).toLocaleString('bg-BG')} €</span>;
  if (type === 'number') return <span className="font-medium">{value}</span>;
  if (type === 'enum' && map) return <span className="font-medium">{map[value] || value}</span>;
  return <span className="font-medium">{value}</span>;
}

export default function DiscoveryReviewStep({ formData, journeyId, analysisId, onConfirm, onEditSection }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  const handleConfirm = async () => {
    if (!consentConfirmed) return;
    setIsConfirming(true);
    try {
      // Record consent in ConsentRecord entity
      if (journeyId) {
        await base44.entities.ConsentRecord.create({
          journey_id: journeyId,
          consent_key: 'gdpr_analysis',
          version: '1.0',
          language_code: 'bg',
          given_at: new Date().toISOString(),
          source: 'discovery_review',
          device_info: navigator.userAgent?.slice(0, 200),
          gdpr_consent_a: formData.gdpr_consent_a || false,
          gdpr_consent_b: formData.gdpr_consent_b || false,
          gdpr_consent_c: formData.gdpr_consent_c || false,
        }).catch(() => {}); // non-blocking
      }
      onConfirm?.();
    } finally {
      setIsConfirming(false);
    }
  };

  const visibleSections = SECTIONS.filter(sec => {
    if (sec.id === 'pension' && !formData.client_retirement_age) return false;
    if (sec.id === 'children' && !formData.children_count && !formData.other_goals_car) return false;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center pb-2">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Преглед на анализа</h2>
        <p className="text-sm text-slate-500 mt-1">Прегледайте и потвърдете въведените данни преди да генерираме Вашия финансов план.</p>
      </div>

      {/* Sections */}
      {visibleSections.map(sec => {
        const Icon = SECTION_ICONS[sec.id] || CheckCircle;
        const filledFields = sec.fields.filter(f => formData[f.key] !== undefined && formData[f.key] !== null && formData[f.key] !== '');
        if (filledFields.length === 0) return null;

        return (
          <div key={sec.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-800">{sec.title}</span>
              </div>
              {onEditSection && (
                <button
                  onClick={() => onEditSection(sec.id)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Edit2 className="w-3 h-3" />
                  Редактирай
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-50">
              {filledFields.map(f => (
                <div key={f.key} className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-xs text-slate-500">{f.label}</span>
                  <span className="text-xs">{formatValue(formData[f.key], f.type, f.map)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Consent confirmation */}
      <div className={cn(
        'rounded-2xl border p-4 transition-colors',
        consentConfirmed ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'
      )}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentConfirmed}
            onChange={e => setConsentConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-blue-600"
          />
          <span className="text-sm text-slate-700">
            Потвърждавам, че въведените данни са верни и давам съгласие за обработването им за целите на финансовия анализ съгласно GDPR и Политиката за поверителност на IFA.
          </span>
        </label>
      </div>

      {/* Action */}
      <Button
        onClick={handleConfirm}
        disabled={!consentConfirmed || isConfirming}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-4 text-base font-semibold"
      >
        {isConfirming ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Потвърждаване...</>
        ) : (
          <><CheckCircle className="w-4 h-4 mr-2" />Потвърждавам — генерирай моя план</>
        )}
      </Button>
    </motion.div>
  );
}
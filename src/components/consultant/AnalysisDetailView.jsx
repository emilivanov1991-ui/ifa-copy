import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Users, 
  Home, 
  PiggyBank, 
  Umbrella, 
  Baby, 
  Shield, 
  BarChart3,
  ListOrdered,
  Check,
  X,
  Calendar
} from 'lucide-react';

const SectionCard = ({ title, icon: Icon, children }) => (
  <Card>
    <CardHeader className="bg-slate-50">
      <CardTitle className="flex items-center gap-2 text-lg">
        <Icon className="h-5 w-5 text-blue-600" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      {children}
    </CardContent>
  </Card>
);

const DataRow = ({ label, value, highlight = false }) => (
  <div className={`flex justify-between py-2 border-b border-slate-100 last:border-0 ${highlight ? 'bg-blue-50 px-3 -mx-3 rounded' : ''}`}>
    <span className="text-slate-600 font-medium">{label}</span>
    <span className={`text-slate-900 ${highlight ? 'font-semibold text-blue-700' : ''}`}>
      {value !== undefined && value !== null && value !== '' ? value : '-'}
    </span>
  </div>
);

const BooleanIndicator = ({ value, trueLabel = 'Да', falseLabel = 'Не' }) => {
  if (value === undefined || value === null) return <span className="text-slate-400">-</span>;
  return value ? (
    <Badge className="bg-green-100 text-green-700 border-green-300">
      <Check className="h-3 w-3 mr-1" /> {trueLabel}
    </Badge>
  ) : (
    <Badge className="bg-red-100 text-red-700 border-red-300">
      <X className="h-3 w-3 mr-1" /> {falseLabel}
    </Badge>
  );
};

export default function AnalysisDetailView({ analysis }) {
  if (!analysis) return null;

  const clientFirstName = analysis.client_first_name || 'Клиент';
  const partnerFirstName = analysis.partner_first_name || 'Партньор';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Детайли на финансов анализ
            </h2>
            <p className="text-blue-100">
              Създаден на: {new Date(analysis.created_date).toLocaleDateString('bg-BG', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
            Стъпка {analysis.current_step || 1} от 9
          </Badge>
        </div>
      </div>

      {/* Ново жилище */}
      <SectionCard title="Ново жилище" icon={Home}>
        <div className="space-y-2">
          <DataRow label="Текущо жилище" value={
            analysis.current_housing === 'rented' ? 'Наето' :
            analysis.current_housing === 'with_parents' ? 'При родители' :
            analysis.current_housing === 'owned' ? 'Собствено' : '-'
          } />
          
          {analysis.current_housing === 'owned' && (
            <>
              <DataRow label="Адрес" value={analysis.current_housing_address} highlight />
              <DataRow label="Брой стаи" value={analysis.current_housing_rooms} />
              <DataRow label="Застроена площ (кв.м)" value={analysis.current_housing_area} />
              <DataRow label="Стойност (€)" value={analysis.current_housing_value?.toLocaleString()} />
              <DataRow label="Движимо имущество (€)" value={analysis.current_housing_movable_value?.toLocaleString()} highlight />
              
              {analysis.current_housing_has_mortgage && (
                <>
                  <Separator className="my-4" />
                  <p className="font-semibold text-slate-700 mb-2">Ипотека:</p>
                  <DataRow label="Банка" value={analysis.current_mortgage_bank} />
                  <DataRow label="Остатъчна сума (€)" value={analysis.current_mortgage_remaining?.toLocaleString()} />
                  <DataRow label="Лихвен процент (%)" value={analysis.current_mortgage_interest_rate} />
                  <DataRow label="Оставащ период (години)" value={analysis.current_mortgage_remaining_years} />
                  <DataRow label="Месечна вноска (€)" value={analysis.current_mortgage_monthly_payment?.toLocaleString()} />
                </>
              )}
            </>
          )}
          
          {(analysis.current_housing === 'rented' || analysis.current_housing === 'with_parents') && (
            <>
              <DataRow label="Локация" value={analysis.current_housing_location} />
              <DataRow label="Брой стаи" value={analysis.current_housing_rooms} />
              <DataRow label="Застроена площ (кв.м)" value={analysis.current_housing_area} />
            </>
          )}

          {analysis.planning_housing_change && (
            <>
              <Separator className="my-4" />
              <p className="font-semibold text-slate-700 mb-2">Планирана промяна:</p>
              <DataRow label="Вид промяна" value={
                analysis.planned_housing_type === 'apartment' ? 'Апартамент/Къща' :
                analysis.planned_housing_type === 'house' ? 'Строителство на къща' :
                analysis.planned_housing_type === 'reconstruction' ? 'Реконструкция' : '-'
              } />
              {(analysis.planned_housing_type === 'apartment' || analysis.planned_housing_type === 'house') && (
                <>
                  <DataRow label="Брой стаи" value={analysis.planned_housing_rooms} />
                  <DataRow label="Застроена площ (кв.м)" value={analysis.planned_housing_area} />
                  <DataRow label="Стойност (€)" value={analysis.planned_housing_value?.toLocaleString()} />
                </>
              )}
              <DataRow label="Времеви хоризонт (години)" value={analysis.planned_housing_timeline_years} />
              <DataRow label="Разходи ремонт/обзавеждане (€)" value={analysis.planned_housing_extra_costs?.toLocaleString()} />
              
              {analysis.financing_method && (
                <>
                  <DataRow label="Метод на финансиране" value={
                    analysis.financing_method === 'cash' ? 'Пари в брой' :
                    analysis.financing_method === 'cash_and_loan' ? 'Пари в брой + кредит' : '-'
                  } />
                  <DataRow label="Наличност в брой (€)" value={analysis.available_cash?.toLocaleString()} />
                  {analysis.financing_method === 'cash_and_loan' && (
                    <DataRow label="Срок на кредита (години)" value={analysis.loan_term_years} />
                  )}
                </>
              )}
            </>
          )}

          <Separator className="my-4" />
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-slate-700 mb-2 font-medium">Имена за препоръки:</p>
            {(analysis.referrals_no_own_home || []).filter(n => n).length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-600 mb-1">Не живеят в собствено жилище:</p>
                <p className="text-sm text-slate-800">{(analysis.referrals_no_own_home || []).filter(n => n).join(', ')}</p>
              </div>
            )}
            {(analysis.referrals_own_home_long || []).filter(n => n).length > 0 && (
              <div>
                <p className="text-xs text-slate-600 mb-1">Живеят дълго време в собствено:</p>
                <p className="text-sm text-slate-800">{(analysis.referrals_own_home_long || []).filter(n => n).join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Резерв */}
      <SectionCard title="Резерв" icon={PiggyBank}>
        <div className="space-y-2">
          <DataRow 
            label={`Месечен нетен доход - ${clientFirstName}`} 
            value={analysis.client_monthly_net_income ? `${analysis.client_monthly_net_income?.toLocaleString()} €` : '-'} 
            highlight 
          />
          {analysis.include_partner && (
            <DataRow 
              label={`Месечен нетен доход - ${partnerFirstName}`} 
              value={analysis.partner_monthly_net_income ? `${analysis.partner_monthly_net_income?.toLocaleString()} €` : '-'} 
              highlight 
            />
          )}
          
          <DataRow 
            label="Метод на спестяване" 
            value={
              analysis.savings_method === 'leftover' ? 'Спестявам каквото остане' :
              analysis.savings_method === 'fixed' ? 'Спестявам фиксирана сума' :
              analysis.savings_method === 'none' ? 'Не спестявам' : '-'
            }
            highlight
          />
          
          {analysis.savings_method !== 'none' && (
            <DataRow label="Месечна сума за спестяване (€)" value={analysis.monthly_savings_amount?.toLocaleString()} />
          )}

          <Separator className="my-4" />
          <p className="font-semibold text-slate-700 mb-2">Текущи спестявания - {clientFirstName}:</p>
          <DataRow label="Разплащателна сметка (€)" value={analysis.client_checking_account?.toLocaleString()} />
          <DataRow label="Спестовна книжка (€)" value={analysis.client_savings_book?.toLocaleString()} />
          <DataRow label="Срочен депозит (€)" value={analysis.client_term_deposit?.toLocaleString()} />
          <DataRow label="Взаимни фондове (€)" value={analysis.client_mutual_funds?.toLocaleString()} />
          <DataRow label="Спестовна сметка (€)" value={analysis.client_savings_account?.toLocaleString()} />
          <DataRow label="Кеш (€)" value={analysis.client_cash?.toLocaleString()} />

          {analysis.include_partner && (
            <>
              <Separator className="my-4" />
              <p className="font-semibold text-slate-700 mb-2">Текущи спестявания - {partnerFirstName}:</p>
              <DataRow label="Разплащателна сметка (€)" value={analysis.partner_checking_account?.toLocaleString()} />
              <DataRow label="Спестовна книжка (€)" value={analysis.partner_savings_book?.toLocaleString()} />
              <DataRow label="Срочен депозит (€)" value={analysis.partner_term_deposit?.toLocaleString()} />
              <DataRow label="Взаимни фондове (€)" value={analysis.partner_mutual_funds?.toLocaleString()} />
              <DataRow label="Спестовна сметка (€)" value={analysis.partner_savings_account?.toLocaleString()} />
              <DataRow label="Кеш (€)" value={analysis.partner_cash?.toLocaleString()} />
            </>
          )}

          <Separator className="my-4" />
          <DataRow 
            label="Желан размер на резерва (€)" 
            value={analysis.desired_reserve_amount?.toLocaleString()} 
            highlight 
          />

          <Separator className="my-4" />
          <p className="font-semibold text-slate-700 mb-2">Рисков профил:</p>
          <DataRow label="Консервативен (%)" value={analysis.conservative_percent} />
          <DataRow label="Умерен (%)" value={analysis.moderate_percent} />
          <DataRow label="Динамичен (%)" value={analysis.dynamic_percent} />
          <DataRow label="Агресивен (%)" value={analysis.aggressive_percent} />
          
          <DataRow label="Инвестиционен хоризонт" value={
            analysis.investment_horizon === 'up_to_1_year' ? 'До 1 година' :
            analysis.investment_horizon === 'up_to_5_years' ? 'До 5 години' :
            analysis.investment_horizon === 'up_to_7_years' ? 'До 7 години' :
            analysis.investment_horizon === 'over_7_years' ? 'Над 7 години' : '-'
          } />
          
          <DataRow label="Инвестиционен опит" value={
            analysis.investment_experience === 'none' ? 'Няма' :
            analysis.investment_experience === 'basic' ? 'Базов' :
            analysis.investment_experience === 'intermediate' ? 'Среден' :
            analysis.investment_experience === 'advanced' ? 'Напреднал' : '-'
          } />

          <Separator className="my-4" />
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-slate-700 mb-2 font-medium">Имена за препоръки:</p>
            {(analysis.referrals_no_reserve || []).filter(n => n).length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-600 mb-1">Нямат спестявания:</p>
                <p className="text-sm text-slate-800">{(analysis.referrals_no_reserve || []).filter(n => n).join(', ')}</p>
              </div>
            )}
            {(analysis.referrals_has_reserve || []).filter(n => n).length > 0 && (
              <div>
                <p className="text-xs text-slate-600 mb-1">Имат спестявания:</p>
                <p className="text-sm text-slate-800">{(analysis.referrals_has_reserve || []).filter(n => n).join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Пенсия */}
      <SectionCard title="Пенсия" icon={Umbrella}>
        <div className="space-y-2">
          <p className="font-semibold text-slate-700 mb-2">{clientFirstName}:</p>
          <DataRow label="Брутен доход (€)" value={analysis.client_gross_income_pension?.toLocaleString()} />
          <DataRow label="Пенсионна възраст" value={analysis.client_retirement_age} />
          <DataRow label="Желана пенсия (€)" value={analysis.client_desired_pension?.toLocaleString()} />
          <DataRow label="Очаквана държавна пенсия (€)" value={analysis.client_expected_state_pension?.toLocaleString()} />
          
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-medium">I Стълб</span>
            <BooleanIndicator value={analysis.client_pillar_1} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-medium">II Стълб</span>
            <BooleanIndicator value={analysis.client_pillar_2} />
          </div>
          {analysis.client_pillar_2 && (
            <DataRow label="Пенсионен фонд (II стълб)" value={analysis.client_pension_fund} highlight />
          )}
          
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-medium">III Стълб</span>
            <BooleanIndicator value={analysis.client_pillar_3} />
          </div>
          {analysis.client_pillar_3 && (
            <>
              <DataRow label="Пенсионен фонд (III стълб)" value={analysis.client_voluntary_pension_fund} highlight />
              <DataRow label="Месечна вноска (€)" value={analysis.client_voluntary_pension_monthly?.toLocaleString()} />
              <DataRow label="Обща стойност (€)" value={analysis.client_voluntary_pension_total?.toLocaleString()} />
            </>
          )}

          {analysis.include_partner && (
            <>
              <Separator className="my-4" />
              <p className="font-semibold text-slate-700 mb-2">{partnerFirstName}:</p>
              <DataRow label="Брутен доход (€)" value={analysis.partner_gross_income_pension?.toLocaleString()} />
              <DataRow label="Пенсионна възраст" value={analysis.partner_retirement_age} />
              <DataRow label="Желана пенсия (€)" value={analysis.partner_desired_pension?.toLocaleString()} />
              <DataRow label="Очаквана държавна пенсия (€)" value={analysis.partner_expected_state_pension?.toLocaleString()} />
              
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">I Стълб</span>
                <BooleanIndicator value={analysis.partner_pillar_1} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">II Стълб</span>
                <BooleanIndicator value={analysis.partner_pillar_2} />
              </div>
              {analysis.partner_pillar_2 && (
                <DataRow label="Пенсионен фонд (II стълб)" value={analysis.partner_pension_fund} highlight />
              )}
              
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">III Стълб</span>
                <BooleanIndicator value={analysis.partner_pillar_3} />
              </div>
              {analysis.partner_pillar_3 && (
                <>
                  <DataRow label="Пенсионен фонд (III стълб)" value={analysis.partner_voluntary_pension_fund} highlight />
                  <DataRow label="Месечна вноска (€)" value={analysis.partner_voluntary_pension_monthly?.toLocaleString()} />
                  <DataRow label="Обща стойност (€)" value={analysis.partner_voluntary_pension_total?.toLocaleString()} />
                </>
              )}
            </>
          )}

          <Separator className="my-4" />
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-slate-700 mb-2 font-medium">Имена за препоръки:</p>
            {(analysis.referrals_pension_planning || []).filter(n => n).length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-600 mb-1">Планират пенсия:</p>
                <p className="text-sm text-slate-800">{(analysis.referrals_pension_planning || []).filter(n => n).join(', ')}</p>
              </div>
            )}
            {(analysis.referrals_already_retired || []).filter(n => n).length > 0 && (
              <div>
                <p className="text-xs text-slate-600 mb-1">Вече пенсионери:</p>
                <p className="text-sm text-slate-800">{(analysis.referrals_already_retired || []).filter(n => n).join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Деца и Други цели */}
      <SectionCard title="Деца и Други цели" icon={Baby}>
        <div className="space-y-2">
          {!analysis.skip_children_section ? (
            <>
              <p className="font-semibold text-slate-700 mb-2">Разходи за деца:</p>
              <DataRow label="Раждане (€)" value={analysis.children_birth_costs?.toLocaleString()} />
              <DataRow label="Спорт (€)" value={analysis.children_sport_costs?.toLocaleString()} />
              <DataRow label="Образование (€)" value={analysis.children_education_costs?.toLocaleString()} highlight />
              <DataRow label="Сватба (€)" value={analysis.children_wedding_costs?.toLocaleString()} />
              <DataRow label="Начало на живота (€)" value={analysis.children_start_life_costs?.toLocaleString()} />
              <DataRow label="Други (€)" value={analysis.children_other_costs?.toLocaleString()} />
            </>
          ) : (
            <p className="text-slate-500 italic">Разделът за деца е пропуснат</p>
          )}

          {!analysis.skip_other_goals_section && (
            <>
              <Separator className="my-4" />
              <p className="font-semibold text-slate-700 mb-2">Други цели:</p>
              <DataRow label="Кола (€)" value={analysis.other_goals_car?.toLocaleString()} />
              <DataRow label="Почивка (€)" value={analysis.other_goals_vacation?.toLocaleString()} />
              <DataRow label="Други (€)" value={analysis.other_goals_other?.toLocaleString()} />
              <DataRow 
                label="Спестявания за цели (€)" 
                value={analysis.other_goals_savings?.toLocaleString()} 
                highlight 
              />
            </>
          )}

          <Separator className="my-4" />
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-slate-700 mb-2 font-medium">Имена за препоръки:</p>
            {(analysis.referrals_have_children || []).filter(n => n).length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-600 mb-1">Имат деца:</p>
                <p className="text-sm text-slate-800">{(analysis.referrals_have_children || []).filter(n => n).join(', ')}</p>
              </div>
            )}
            {(analysis.referrals_recent_wedding || []).filter(n => n).length > 0 && (
              <div>
                <p className="text-xs text-slate-600 mb-1">Скорошна сватба:</p>
                <p className="text-sm text-slate-800">{(analysis.referrals_recent_wedding || []).filter(n => n).join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Защита на собствеността */}
      <SectionCard title="Защита" icon={Shield}>
        <div className="space-y-2">
          <DataRow label="Източник на доходи" value={
            analysis.income_source === 'employment' ? 'Работа по трудов договор' :
            analysis.income_source === 'self_employed' ? 'Самостоятелна заетост' :
            analysis.income_source === 'rent' ? 'Наем' :
            analysis.income_source === 'investments' ? 'Инвестиции' :
            analysis.income_source === 'mixed' ? 'Смесено' : '-'
          } />

          <Separator className="my-4" />
          <p className="font-semibold text-slate-700 mb-2">Рискове:</p>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-medium">Риск от уволнение</span>
            <BooleanIndicator value={analysis.risk_layoff} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-medium">Майчинство</span>
            <BooleanIndicator value={analysis.risk_maternity} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-medium">Болничен</span>
            <BooleanIndicator value={analysis.risk_sick_leave} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-medium">Инвалидност</span>
            <BooleanIndicator value={analysis.risk_disability} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-medium">Смърт</span>
            <BooleanIndicator value={analysis.risk_death} />
          </div>

          {analysis.has_property_1 && (
            <>
              <Separator className="my-4" />
              <p className="font-semibold text-slate-700 mb-2">Имот 1:</p>
              <DataRow label="Адрес" value={analysis.property_1_address} highlight />
              <DataRow label="Брой стаи" value={analysis.property_1_rooms} highlight />
              <DataRow label="Застроена площ (кв.м)" value={analysis.property_1_area} highlight />
              <DataRow label="Стойност (€)" value={analysis.property_1_value?.toLocaleString()} highlight />
              <DataRow label="Движимо имущество (€)" value={analysis.property_1_movable_value?.toLocaleString()} highlight />
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Има застраховка</span>
                <BooleanIndicator value={analysis.property_1_has_insurance} />
              </div>
              {analysis.property_1_has_insurance && (
                <>
                  <DataRow label="Застраховател" value={analysis.property_1_insurer} />
                  <DataRow label="Валидност до" value={analysis.property_1_insurance_expiry ? new Date(analysis.property_1_insurance_expiry).toLocaleDateString('bg-BG') : '-'} />
                </>
              )}
            </>
          )}

          {analysis.has_car_1 && (
            <>
              <Separator className="my-4" />
              <p className="font-semibold text-slate-700 mb-2">Автомобил 1:</p>
              <DataRow label="Марка и модел" value={`${analysis.car_1_brand || ''} ${analysis.car_1_model || ''}`.trim()} />
              <DataRow label="Година" value={analysis.car_1_year} />
              <DataRow label="Стойност (€)" value={analysis.car_1_value?.toLocaleString()} />
              <DataRow label="ГО застраховател" value={analysis.car_1_go_insurer} />
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Има Каско</span>
                <BooleanIndicator value={analysis.car_1_has_casco} />
              </div>
              {analysis.car_1_has_casco && (
                <>
                  <DataRow label="Каско застраховател" value={analysis.car_1_casco_insurer} />
                  <DataRow label="Валидност до" value={analysis.car_1_casco_expiry ? new Date(analysis.car_1_casco_expiry).toLocaleDateString('bg-BG') : '-'} />
                </>
              )}
            </>
          )}

          <Separator className="my-4" />
          <p className="font-semibold text-slate-700 mb-2">Подсигуряване на доходите:</p>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-medium">{clientFirstName} - Има защита</span>
            <BooleanIndicator value={analysis.client_has_income_protection} />
          </div>
          {analysis.client_has_income_protection && (
            <>
              <DataRow label="Застраховател" value={analysis.client_income_protection_insurer} />
              <DataRow label="Дата" value={analysis.client_income_protection_date ? new Date(analysis.client_income_protection_date).toLocaleDateString('bg-BG') : '-'} />
            </>
          )}

          {analysis.include_partner && (
            <>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">{partnerFirstName} - Има защита</span>
                <BooleanIndicator value={analysis.partner_has_income_protection} />
              </div>
              {analysis.partner_has_income_protection && (
                <>
                  <DataRow label="Застраховател" value={analysis.partner_income_protection_insurer} />
                  <DataRow label="Дата" value={analysis.partner_income_protection_date ? new Date(analysis.partner_income_protection_date).toLocaleDateString('bg-BG') : '-'} />
                </>
              )}
            </>
          )}

          <Separator className="my-4" />
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-slate-700 mb-2 font-medium">Имена за препоръки:</p>
            {(analysis.referrals_property_protection || []).filter(n => n).length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-600 mb-1">Защита на имущество:</p>
                <p className="text-sm text-slate-800">{(analysis.referrals_property_protection || []).filter(n => n).join(', ')}</p>
              </div>
            )}
            {(analysis.referrals_car_protection || []).filter(n => n).length > 0 && (
              <div>
                <p className="text-xs text-slate-600 mb-1">Защита на автомобил:</p>
                <p className="text-sm text-slate-800">{(analysis.referrals_car_protection || []).filter(n => n).join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Финансов поток */}
      <SectionCard title="Финансов поток" icon={BarChart3}>
        <div className="space-y-2">
          <p className="font-semibold text-slate-700 mb-2">Доходи - {clientFirstName}:</p>
          <DataRow label="Брутен доход (€)" value={analysis.client_gross_income?.toLocaleString()} />
          <DataRow label="Нетен доход (€)" value={analysis.client_net_income?.toLocaleString()} />
          <DataRow label="Годишен бонус (€)" value={analysis.client_annual_bonus?.toLocaleString()} />
          <DataRow label="Други месечни доходи (€)" value={analysis.client_other_monthly_income?.toLocaleString()} />

          {analysis.include_partner && (
            <>
              <Separator className="my-4" />
              <p className="font-semibold text-slate-700 mb-2">Доходи - {partnerFirstName}:</p>
              <DataRow label="Брутен доход (€)" value={analysis.partner_gross_income?.toLocaleString()} />
              <DataRow label="Нетен доход (€)" value={analysis.partner_net_income?.toLocaleString()} />
              <DataRow label="Годишен бонус (€)" value={analysis.partner_annual_bonus?.toLocaleString()} />
              <DataRow label="Други месечни доходи (€)" value={analysis.partner_other_monthly_income?.toLocaleString()} />
            </>
          )}

          <Separator className="my-4" />
          <p className="font-semibold text-slate-700 mb-2">Разходи - Жилище:</p>
          <DataRow label="Наем (€)" value={analysis.expense_rent?.toLocaleString()} />
          <DataRow label="Ток/вода/парно (€)" value={analysis.expense_utilities?.toLocaleString()} />
          <DataRow label="Телефон (€)" value={analysis.expense_phone?.toLocaleString()} />
          <DataRow label="Интернет (€)" value={analysis.expense_internet?.toLocaleString()} />
          <DataRow label="ТВ (€)" value={analysis.expense_tv?.toLocaleString()} />
          <DataRow label="Други за жилище (€)" value={analysis.expense_other_housing?.toLocaleString()} />

          <Separator className="my-4" />
          <p className="font-semibold text-slate-700 mb-2">Разходи - Автомобил:</p>
          <DataRow label="Гориво (€)" value={analysis.expense_fuel?.toLocaleString()} />
          <DataRow label="Поддръжка (€)" value={analysis.expense_car_maintenance?.toLocaleString()} />
          <DataRow label="Други (€)" value={analysis.expense_car_other?.toLocaleString()} />

          <Separator className="my-4" />
          <p className="font-semibold text-slate-700 mb-2">Разходи - Променливи:</p>
          <DataRow label="Храна (€)" value={analysis.expense_food?.toLocaleString()} />
          <DataRow label="Облекло (€)" value={analysis.expense_clothing?.toLocaleString()} />
          <DataRow label="Култура (€)" value={analysis.expense_culture?.toLocaleString()} />
          <DataRow label="Пътувания (€)" value={analysis.expense_travel?.toLocaleString()} />
          <DataRow label="Деца (€)" value={analysis.expense_children?.toLocaleString()} />
          <DataRow label="Цигари (€)" value={analysis.expense_cigarettes?.toLocaleString()} />
          <DataRow label="Домашни любимци (€)" value={analysis.expense_pets?.toLocaleString()} />
          <DataRow label="Ваканция (€)" value={analysis.expense_vacation?.toLocaleString()} />
          <DataRow label="Бизнес (€)" value={analysis.expense_business?.toLocaleString()} />
          <DataRow label="Други (€)" value={analysis.expense_other?.toLocaleString()} />
          <DataRow label="Образование (€)" value={analysis.expense_education?.toLocaleString()} highlight />
          <DataRow label="Здраве (€)" value={analysis.expense_health?.toLocaleString()} highlight />
          <DataRow label="Козметика (€)" value={analysis.expense_cosmetics?.toLocaleString()} highlight />
          <DataRow label="Хобита (€)" value={analysis.expense_hobbies?.toLocaleString()} highlight />
          <DataRow label="Електроника (€)" value={analysis.expense_electronics?.toLocaleString()} highlight />
          <DataRow label="Данъци (€)" value={analysis.expense_taxes?.toLocaleString()} highlight />

          <Separator className="my-4" />
          <p className="font-semibold text-slate-700 mb-2">Активи:</p>
          <DataRow label="Разплащателна сметка (€)" value={analysis.asset_checking_account?.toLocaleString()} />
          <DataRow label="Краткосрочни спестявания (€)" value={analysis.asset_short_term_savings?.toLocaleString()} />
          <DataRow label="Средносрочни спестявания (€)" value={analysis.asset_medium_term_savings?.toLocaleString()} />
          <DataRow label="Дългосрочни спестявания (€)" value={analysis.asset_long_term_savings?.toLocaleString()} />
          <DataRow label="Недвижими имоти (€)" value={analysis.asset_real_estate?.toLocaleString()} />
          <DataRow label="Движими имущества (€)" value={analysis.asset_movable_property?.toLocaleString()} />

          <Separator className="my-4" />
          <p className="font-semibold text-slate-700 mb-2">Пасиви:</p>
          <DataRow label="Ипотека - месечна (€)" value={analysis.liability_mortgage_monthly?.toLocaleString()} />
          <DataRow label="Ипотека - остатък (€)" value={analysis.liability_mortgage_remaining?.toLocaleString()} />
          <DataRow label="Потребителски кредити - месечна (€)" value={analysis.liability_consumer_loans_monthly?.toLocaleString()} />
          <DataRow label="Потребителски кредити - остатък (€)" value={analysis.liability_consumer_loans_remaining?.toLocaleString()} />
          <DataRow label="Кредитни карти - месечна (€)" value={analysis.liability_credit_cards_monthly?.toLocaleString()} />
          <DataRow label="Кредитни карти - остатък (€)" value={analysis.liability_credit_cards_remaining?.toLocaleString()} />
          <DataRow label="Лизинг - месечна (€)" value={analysis.liability_leasing_monthly?.toLocaleString()} />
          <DataRow label="Лизинг - остатък (€)" value={analysis.liability_leasing_remaining?.toLocaleString()} />
          <DataRow label="Овърдрафт - месечна (€)" value={analysis.liability_overdraft_monthly?.toLocaleString()} />
          <DataRow label="Овърдрафт - остатък (€)" value={analysis.liability_overdraft_remaining?.toLocaleString()} />

          <Separator className="my-4" />
          <p className="font-semibold text-slate-700 mb-2">Застраховки (месечно):</p>
          <DataRow label="Живот (€)" value={analysis.insurance_life?.toLocaleString()} />
          <DataRow label="Имот (€)" value={analysis.insurance_property?.toLocaleString()} />
          <DataRow label="Движимо имущество (€)" value={analysis.insurance_movable?.toLocaleString()} />
          <DataRow label="Гражданска отговорност (€)" value={analysis.insurance_civil?.toLocaleString()} />
          <DataRow label="Каско (€)" value={analysis.insurance_casco?.toLocaleString()} />
          <DataRow label="Други (€)" value={analysis.insurance_other?.toLocaleString()} />
        </div>
      </SectionCard>

      {/* Обобщение */}
      <SectionCard title="Обобщение" icon={ListOrdered}>
        <div className="space-y-2">
          <p className="font-semibold text-slate-700 mb-2">Приоритети:</p>
          <DataRow label="Подсигуряване на доходите" value={analysis.priority_income_protection} highlight />
          <DataRow label="Защита на собствеността" value={analysis.priority_property_protection} highlight />
          <DataRow label="Резерв" value={analysis.priority_reserve} highlight />
          <DataRow label="Ново жилище" value={analysis.priority_housing} highlight />
          <DataRow label="Пенсия" value={analysis.priority_pension} highlight />
          <DataRow label="Деца" value={analysis.priority_children} highlight />
          <DataRow label="Други" value={analysis.priority_other} highlight />

          <Separator className="my-4" />
          <DataRow 
            label="Месечно заделяне (€)" 
            value={analysis.monthly_priority_allocation?.toLocaleString()} 
            highlight 
          />

          <Separator className="my-4" />
          <div className="flex items-center justify-between py-2 bg-blue-50 px-3 rounded">
            <span className="text-slate-700 font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Следваща среща
            </span>
            <span className="text-blue-700 font-semibold">
              {analysis.next_meeting_datetime ? 
                new Date(analysis.next_meeting_datetime).toLocaleString('bg-BG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '-'
              }
            </span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
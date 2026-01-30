import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, User, Users, Home, DollarSign, Shield, Heart, GraduationCap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function AnalysisViewDialog({ analysisId, open, onOpenChange }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && analysisId) {
      loadAnalysis();
    }
  }, [open, analysisId]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.FinancialAnalysisSubmission.get(analysisId);
      setAnalysis(data);
    } catch (error) {
      toast.error('Грешка при зареждане на анализ');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      // Копираме анализа и създаваме нов
      const { id, created_date, updated_date, created_by, created_by_id, ...analysisData } = analysis;
      
      const newAnalysis = await base44.entities.FinancialAnalysisSubmission.create({
        ...analysisData,
        status: 'new'
      });
      
      toast.success('Създаден е нов анализ за редакция');
      
      // Навигираме към страницата за редакция
      navigate(createPageUrl('FinancialAnalysis') + '?edit=' + newAnalysis.id);
      onOpenChange(false);
    } catch (error) {
      toast.error('Грешка при копиране на анализ');
    }
  };

  if (loading || !analysis) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              Преглед на анализ
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={analysis.status === 'converted' ? 'default' : 'secondary'}>
                {analysis.status === 'new' && 'Нов'}
                {analysis.status === 'contacted' && 'Контактиран'}
                {analysis.status === 'in_progress' && 'В процес'}
                {analysis.status === 'converted' && 'Конвертиран'}
                {analysis.status === 'closed' && 'Затворен'}
              </Badge>
              <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Промени
              </Button>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Създаден на {new Date(analysis.created_date).toLocaleDateString('bg-BG')}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-4">
              <TabsTrigger value="personal">
                <User className="h-4 w-4 mr-2" />
                Лични
              </TabsTrigger>
              <TabsTrigger value="family">
                <Users className="h-4 w-4 mr-2" />
                Семейство
              </TabsTrigger>
              <TabsTrigger value="housing">
                <Home className="h-4 w-4 mr-2" />
                Жилище
              </TabsTrigger>
              <TabsTrigger value="financial">
                <DollarSign className="h-4 w-4 mr-2" />
                Финанси
              </TabsTrigger>
              <TabsTrigger value="protection">
                <Shield className="h-4 w-4 mr-2" />
                Защита
              </TabsTrigger>
              <TabsTrigger value="goals">
                <Heart className="h-4 w-4 mr-2" />
                Цели
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <InfoCard title="Клиент">
                  <InfoRow label="Име" value={`${analysis.client_first_name} ${analysis.client_middle_name} ${analysis.client_last_name}`} />
                  <InfoRow label="Възраст" value={`${analysis.client_age} год.`} />
                  <InfoRow label="Пол" value={analysis.client_gender === 'male' ? 'Мъж' : 'Жена'} />
                  <InfoRow label="ЕГН" value={analysis.client_egn} />
                  <InfoRow label="Телефон" value={analysis.client_phone} />
                  <InfoRow label="Имейл" value={analysis.client_email} />
                  <InfoRow label="Пушач" value={analysis.client_is_smoker ? 'Да' : 'Не'} />
                </InfoCard>

                <InfoCard title="Заетост">
                  <InfoRow label="Статус" value={analysis.client_is_employed ? 'Нает' : 'Безработен'} />
                  <InfoRow label="Длъжност" value={analysis.client_job_description} />
                  <InfoRow label="Работодател" value={analysis.client_employer_name} />
                  <InfoRow label="Тип договор" value={analysis.client_contract_type === 'labor' ? 'Трудов' : 'Граждански'} />
                  <InfoRow label="Срок" value={analysis.client_contract_term === 'permanent' ? 'Безсрочен' : 'Срочен'} />
                </InfoCard>
              </div>
            </TabsContent>

            <TabsContent value="family" className="space-y-4">
              {analysis.include_partner && (
                <InfoCard title="Партньор">
                  <InfoRow label="Име" value={`${analysis.partner_first_name} ${analysis.partner_middle_name} ${analysis.partner_last_name}`} />
                  <InfoRow label="Възраст" value={`${analysis.partner_age} год.`} />
                  <InfoRow label="Пол" value={analysis.partner_gender === 'male' ? 'Мъж' : 'Жена'} />
                  <InfoRow label="Телефон" value={analysis.partner_phone} />
                  <InfoRow label="Пушач" value={analysis.partner_is_smoker ? 'Да' : 'Не'} />
                </InfoCard>
              )}
              {analysis.children_count > 0 && (
                <InfoCard title={`Деца (${analysis.children_count})`}>
                  {[...Array(analysis.children_count)].map((_, i) => {
                    const name = analysis[`child_${i + 1}_name`];
                    const birthdate = analysis[`child_${i + 1}_birthdate`];
                    if (!name) return null;
                    return (
                      <InfoRow key={i} label={`Дете ${i + 1}`} value={`${name} (${birthdate})`} />
                    );
                  })}
                </InfoCard>
              )}
            </TabsContent>

            <TabsContent value="housing" className="space-y-4">
              <InfoCard title="Настоящо жилище">
                <InfoRow label="Тип" value={
                  analysis.current_housing === 'owned' ? 'Собствено' :
                  analysis.current_housing === 'rented' ? 'Под наем' :
                  analysis.current_housing === 'subrented' ? 'Поднаем' : 'При родители'
                } />
                <InfoRow label="Стаи" value={analysis.current_housing_rooms} />
                <InfoRow label="Площ" value={`${analysis.current_housing_area} м²`} />
                {analysis.current_housing_value && (
                  <InfoRow label="Стойност" value={`${analysis.current_housing_value.toLocaleString()} лв`} />
                )}
              </InfoCard>

              {analysis.planning_housing_change && (
                <InfoCard title="Планирана промяна">
                  <InfoRow label="Тип" value={
                    analysis.planned_housing_type === 'apartment' ? 'Апартамент' :
                    analysis.planned_housing_type === 'house' ? 'Къща' :
                    analysis.planned_housing_type === 'reconstruction' ? 'Реконструкция' : 'Оптимизация'
                  } />
                  <InfoRow label="Стойност" value={`${analysis.planned_housing_value?.toLocaleString()} лв`} />
                  <InfoRow label="Срок" value={`${analysis.planned_housing_timeline_years} год.`} />
                  <InfoRow label="Финансиране" value={
                    analysis.financing_method === 'cash' ? 'Кеш' :
                    analysis.financing_method === 'loan' ? 'Кредит' : 'Кеш и кредит'
                  } />
                </InfoCard>
              )}
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <InfoCard title="Доходи">
                  <InfoRow label="Клиент (нето)" value={`${analysis.client_net_income?.toLocaleString()} лв`} />
                  {analysis.include_partner && (
                    <InfoRow label="Партньор (нето)" value={`${analysis.partner_net_income?.toLocaleString()} лв`} />
                  )}
                  <InfoRow label="Общо месечно" value={`${((analysis.client_net_income || 0) + (analysis.partner_net_income || 0)).toLocaleString()} лв`} className="font-semibold" />
                </InfoCard>

                <InfoCard title="Разходи">
                  <InfoRow label="Жилище" value={`${((analysis.expense_rent || 0) + (analysis.expense_utilities || 0)).toLocaleString()} лв`} />
                  <InfoRow label="Комуникации" value={`${((analysis.expense_phone || 0) + (analysis.expense_internet || 0)).toLocaleString()} лв`} />
                  <InfoRow label="Храна" value={`${analysis.expense_food?.toLocaleString()} лв`} />
                  <InfoRow label="Транспорт" value={`${((analysis.expense_fuel || 0) + (analysis.expense_car_maintenance || 0)).toLocaleString()} лв`} />
                </InfoCard>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <InfoCard title="Активи">
                  <InfoRow label="Спестявания" value={`${((analysis.client_savings_book || 0) + (analysis.partner_savings_book || 0)).toLocaleString()} лв`} />
                  <InfoRow label="Депозити" value={`${((analysis.client_term_deposit || 0) + (analysis.partner_term_deposit || 0)).toLocaleString()} лв`} />
                  <InfoRow label="Инвестиции" value={`${((analysis.client_mutual_funds || 0) + (analysis.partner_mutual_funds || 0)).toLocaleString()} лв`} />
                </InfoCard>

                <InfoCard title="Задължения">
                  <InfoRow label="Ипотека" value={`${analysis.liability_mortgage?.toLocaleString() || 0} лв`} />
                  <InfoRow label="Потребителски" value={`${analysis.liability_consumer_loans?.toLocaleString() || 0} лв`} />
                  <InfoRow label="Кредитни карти" value={`${analysis.liability_credit_cards?.toLocaleString() || 0} лв`} />
                </InfoCard>
              </div>
            </TabsContent>

            <TabsContent value="protection" className="space-y-4">
              <InfoCard title="Защита на доходите">
                <InfoRow label="Интерес" value={analysis.include_income_protection_in_plan ? 'Да' : 'Не'} />
                <InfoRow label="Рискове" value={
                  [
                    analysis.risk_layoff && 'Уволнение',
                    analysis.risk_maternity && 'Майчинство',
                    analysis.risk_sick_leave && 'Болнични',
                    analysis.risk_disability && 'Инвалидност',
                    analysis.risk_death && 'Смърт'
                  ].filter(Boolean).join(', ') || 'Няма'
                } />
              </InfoCard>

              <InfoCard title="Застраховки">
                <InfoRow label="Жилище" value={analysis.has_property_insurance ? 'Да' : 'Не'} />
                <InfoRow label="Каско" value={analysis.has_casco_insurance ? 'Да' : 'Не'} />
                <InfoRow label="Здраве от работодател" value={analysis.has_employer_health_insurance ? 'Да' : 'Не'} />
              </InfoCard>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4">
              <InfoCard title="Приоритети">
                <InfoRow label="Защита доходи" value={analysis.priority_income_protection} />
                <InfoRow label="Защита имущество" value={analysis.priority_property_protection} />
                <InfoRow label="Резерв" value={analysis.priority_reserve} />
                <InfoRow label="Жилище" value={analysis.priority_housing} />
                <InfoRow label="Пенсия" value={analysis.priority_pension} />
                <InfoRow label="Деца" value={analysis.priority_children} />
              </InfoCard>

              <InfoCard title="Инвестиции">
                <InfoRow label="Месечна фиксирана" value={`${analysis.monthly_fixed_investment?.toLocaleString() || 0} лв`} />
                <InfoRow label="Месечна променлива" value={`${analysis.monthly_variable_investment?.toLocaleString() || 0} лв`} />
                <InfoRow label="Еднократна" value={`${analysis.one_time_investment?.toLocaleString() || 0} лв`} />
                <InfoRow label="Рисков профил" value={
                  analysis.risk_profile === 'conservative' ? 'Консервативен' :
                  analysis.risk_profile === 'moderate' ? 'Умерен' :
                  analysis.risk_profile === 'dynamic' ? 'Динамичен' : 'Агресивен'
                } />
              </InfoCard>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <h3 className="font-semibold text-slate-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value, className }) {
  if (!value) return null;
  return (
    <div className={`flex justify-between text-sm ${className || ''}`}>
      <span className="text-slate-600">{label}:</span>
      <span className="text-slate-900 font-medium">{value}</span>
    </div>
  );
}
import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Shield, ChevronDown } from 'lucide-react';

export default function ConsentStep({ data, onChange, showErrors }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-blue-200 rounded-xl bg-blue-50">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-6 text-left hover:bg-blue-100/50 transition-colors rounded-xl">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-900">Съгласие за използване на лични данни</h3>
              <p className="text-sm text-slate-600">
                Съгласно Закона за личните данни и Регламент (ЕС) 2016/679 (GDPR)
              </p>
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-6 pb-6">
          <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 space-y-3 max-h-96 overflow-y-auto">
            <p>
              С настоящото по смисъла на Закона за личните данни и на Регламент (ЕС) 2016/679 на Европейския парламент и на Съвета от 27 април 2016 година относно защитата на физическите лица във връзка с обработването на лични данни и относно свободното движение на такива данни и за отмяна на Директива 95/46/EО (Общ регламент относно защитата на данните) (по-долу наричан само „Приложимо законодателство") Давам съгласието си на "Интегрити Файненшъл Адвайзърс" ЕООД, с ЕИК: 208597115, със седалище и адрес на управление в гр. Бургас (8001), ул.Поморие, 20, ет. 5, ап. 1 ("Компанията") да обработва личните ми данни, посочени в този анализ.
            </p>
            <p>
              Данните включва: Име, фамилия адрес на електронна поща, телефон и друг начин за връзка, финансово-икономическо състояние, данни на низходящи (деца), брой деца, кредитна информация, доходи.
            </p>
            <p>
              Декларирам, че съм взел предвид и съм съгласен/а, че Компанията има право, на основание на даденото с настоящото от мен изрично съгласие, да обработва личните ми данни в съответствие с Приложимото законодателство, най-вече използвайки автоматизирани и не автоматизирани средства.
            </p>
            <p>
              Своето съгласие за обработване на личните ми данни по смисъла на Приложимото право давам за определен срок, а именно за срока, необходим за обработването на предоставените от мен лични данни, но за не повече от 2 години.
            </p>
            <p>
              С настоящото декларирам, че съм информиран и разбирам, че Компанията има основание да обработва моите лични данни и на база сключения с мен писмен договор.
            </p>
            <p className="font-medium text-slate-700">
              Имам право с писмена молба от Компанията да изисквам:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>удостоверение дали личните ми данни са обработени или не</li>
              <li>информация за състоянието на обработката на личните ми данни</li>
              <li>точна информация за източника, от който са били получени данните</li>
              <li>списък на личните ми данни, които са обработвани</li>
              <li>поправка или заличаване на неправилните, непълните или неактуалните ми лични данни</li>
              <li>заличаване на личните ми данни, които са изпълнили своята цел</li>
              <li>блокиране на личните ми данни поради оттегляне на съгласието ми</li>
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="space-y-4">
        <label 
          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
            showErrors && !data.gdpr_consent_a 
              ? 'border-red-500 bg-red-50' 
              : 'border-slate-200 hover:border-blue-300'
          }`}
          data-invalid={showErrors && !data.gdpr_consent_a ? "true" : undefined}
        >
          <Checkbox
            checked={data.gdpr_consent_a || false}
            onCheckedChange={(checked) => onChange('gdpr_consent_a', checked)}
            className="mt-1"
          />
          <div>
            <p className="font-medium text-slate-900">а) Финансов анализ и посредничество <span className="text-red-500">*</span></p>
            <p className="text-sm text-slate-600 mt-1">
              Съгласие за анализиране на личните ми финанси, финансово посредничество, 
              предлагане и посредничество при избора на финансови продукти.
            </p>
          </div>
        </label>

        <label 
          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
            showErrors && !data.gdpr_consent_c 
              ? 'border-red-500 bg-red-50' 
              : 'border-slate-200 hover:border-blue-300'
          }`}
          data-invalid={showErrors && !data.gdpr_consent_c ? "true" : undefined}
        >
          <Checkbox
            checked={data.gdpr_consent_c || false}
            onCheckedChange={(checked) => onChange('gdpr_consent_c', checked)}
            className="mt-1"
          />
          <div>
            <p className="font-medium text-slate-900">б) Предоставяне на трети лица <span className="text-red-500">*</span></p>
            <p className="text-sm text-slate-600 mt-1">
              Съгласие за предоставяне на личните ми данни на застраховател, кредитна институция, 
              пенсионноосигурително дружество или инвестиционен посредник.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 cursor-pointer transition-colors">
          <Checkbox
            checked={data.gdpr_consent_b || false}
            onCheckedChange={(checked) => onChange('gdpr_consent_b', checked)}
            className="mt-1"
          />
          <div>
            <p className="font-medium text-slate-900">в) Маркетинг и информация</p>
            <p className="text-sm text-slate-600 mt-1">
              Съгласие за информиране относно условия по предоставяни услуги, други услуги и продукти, 
              информация от финансовите пазари и директен маркетинг.
            </p>
          </div>
        </label>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Съгласието е валидно за срок от 2 години от датата на подписване.
      </p>
    </div>
  );
}
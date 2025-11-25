import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield } from 'lucide-react';

export default function ConsentStep({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Shield className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Съгласие за използване на лични данни</h3>
            <p className="text-sm text-slate-600">
              Съгласно Закона за личните данни и Регламент (ЕС) 2016/679 (GDPR)
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 cursor-pointer transition-colors">
          <Checkbox
            checked={data.gdpr_consent_a || false}
            onCheckedChange={(checked) => onChange('gdpr_consent_a', checked)}
            className="mt-1"
          />
          <div>
            <p className="font-medium text-slate-900">а) Финансов анализ и посредничество</p>
            <p className="text-sm text-slate-600 mt-1">
              Съгласие за анализиране на личните ми финанси, финансово посредничество, 
              предлагане и посредничество при избора на финансови продукти.
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
            <p className="font-medium text-slate-900">б) Маркетинг и информация</p>
            <p className="text-sm text-slate-600 mt-1">
              Съгласие за информиране относно условия по предоставяни услуги, други услуги и продукти, 
              информация от финансовите пазари и директен маркетинг.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 cursor-pointer transition-colors">
          <Checkbox
            checked={data.gdpr_consent_c || false}
            onCheckedChange={(checked) => onChange('gdpr_consent_c', checked)}
            className="mt-1"
          />
          <div>
            <p className="font-medium text-slate-900">в) Предоставяне на трети лица</p>
            <p className="text-sm text-slate-600 mt-1">
              Съгласие за предоставяне на личните ми данни на застраховател, кредитна институция, 
              пенсионноосигурително дружество или инвестиционен посредник.
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
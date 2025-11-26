import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { HeartPulse } from 'lucide-react';

const healthQuestions = [
  {
    id: 'q1a',
    text: 'a) Високо кръвно налягане, аномалия или болест на сърцето, сърдечен инфаркт, сърцебиене, остър ставен ревматизъм, сърдечен шум или друго заболяване на сърцето и кръвоносните съдове, повишен холестерол, повишено ниво на липиди'
  },
  {
    id: 'q1b',
    text: 'б) Диабет, анемия или други заболявания на кръвта, заболявания на щитовидната жлеза или на жлезите с вътрешна секреция'
  },
  {
    id: 'q1c',
    text: 'в) Мозъчен инсулт, говорен дефект, световъртеж, припадъци, гърчове, главоболие, епилепсия, парализа или други нарушения на нервната система, неврологични и психични заболявания, употреба на наркотици'
  },
  {
    id: 'q1d',
    text: 'г) Кожни заболявания, заболявания на лимфните възли, киста, тумор, рак, неоплазма или всяка друга форма на злокачествено новообразувание'
  },
  {
    id: 'q1e',
    text: 'д) Хепатит или всяко друго заболяване на черния дроб, панкреаса, стомаха, храносмилателната и отделителната система, червата, бъбреците или половата система'
  },
  {
    id: 'q1f',
    text: 'е) Заболявания на дихателната система и белите дробове'
  }
];

const additionalHealthQuestions = [
  {
    id: 'q10a',
    text: 'a) Заболявания на очите, ушите, носа и гърлото'
  },
  {
    id: 'q10b',
    text: 'б) Заболявания на мускулите, костите, ставите, гръбначния стълб, гърба и кръста'
  },
  {
    id: 'q10c',
    text: 'в) Неврит, ишиас, ревматизъм, артрит, подагра'
  },
  {
    id: 'q10d',
    text: 'г) Каквито и да е други заболявания, травми и аномалии'
  }
];

// Toggle component with yes/no labels
const HealthToggle = ({ checked, onChange }) => {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className={`text-xs font-medium ${!checked ? 'text-green-600' : 'text-slate-400'}`}>Не</span>
      <Switch
        checked={checked || false}
        onCheckedChange={onChange}
        className={checked ? 'data-[state=checked]:bg-red-500' : 'data-[state=unchecked]:bg-green-500'}
      />
      <span className={`text-xs font-medium ${checked ? 'text-red-600' : 'text-slate-400'}`}>Да</span>
    </div>
  );
};

export default function HealthQuestionnaire({ data, onChange, prefix }) {
  const isGoodHealth = data[`${prefix}_is_good_health`] ?? true;
  
  return (
    <div className="border-t border-slate-200 pt-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <HeartPulse className="h-5 w-5 text-red-500" />
        <h4 className="font-medium text-slate-700">Здравен статус</h4>
      </div>
      
      {/* Main health question */}
      <div className={`p-4 rounded-lg border mb-4 ${isGoodHealth ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-start justify-between gap-4">
          <Label className="cursor-pointer text-sm leading-relaxed flex-1">
            Доколкото Ви е известно Вие в добро здраве и без физически недъзи, умствени разстройства и сериозни и/или хронични заболявания ли сте?
          </Label>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`text-sm font-medium ${!isGoodHealth ? 'text-green-600' : 'text-slate-400'}`}>Не</span>
            <Switch
              checked={isGoodHealth}
              onCheckedChange={(checked) => onChange(`${prefix}_is_good_health`, checked)}
              className={isGoodHealth ? 'data-[state=checked]:bg-green-500' : ''}
            />
            <span className={`text-sm font-medium ${isGoodHealth ? 'text-green-600' : 'text-slate-400'}`}>Да</span>
          </div>
        </div>
      </div>

      {/* Health questionnaire - only shown if not in good health */}
      {isGoodHealth === false && (
        <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="space-y-2">
            <Label>Пояснение</Label>
            <Textarea
              placeholder="Моля, опишете здравословните си проблеми..."
              value={data[`${prefix}_health_explanation`] || ''}
              onChange={(e) => onChange(`${prefix}_health_explanation`, e.target.value)}
              className="rounded-lg bg-white"
              rows={3}
            />
          </div>

          <div className="border-t border-red-200 pt-4">
            <p className="text-sm font-medium text-slate-700 mb-3">
              1. През последните 10 години били ли сте консултирани от лекар, лекувани, изследвани и проявявали ли сте симптоми на някое от следните:
            </p>
            <div className="space-y-3">
              {healthQuestions.map((q) => (
                <div key={q.id} className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${data[`${prefix}_health_${q.id}`] ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <Label className="cursor-pointer text-xs leading-relaxed flex-1">{q.text}</Label>
                  <HealthToggle
                    checked={data[`${prefix}_health_${q.id}`] || false}
                    onChange={(checked) => onChange(`${prefix}_health_${q.id}`, checked)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-red-200 pt-4">
            <div className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${data[`${prefix}_health_under_treatment`] ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <Label className="cursor-pointer text-sm leading-relaxed flex-1">
                2. В момента намирате ли се под наблюдение или лечение (включително медикаментозно) за каквото и да е състояние/заболяване?
              </Label>
              <HealthToggle
                checked={data[`${prefix}_health_under_treatment`] || false}
                onChange={(checked) => onChange(`${prefix}_health_under_treatment`, checked)}
              />
            </div>
          </div>

          <div className="border-t border-red-200 pt-4">
            <div className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${data[`${prefix}_health_hospitalized`] ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <Label className="cursor-pointer text-sm leading-relaxed flex-1">
                4. Били ли сте хоспитализирани или оперирани през последните 5 години?
              </Label>
              <HealthToggle
                checked={data[`${prefix}_health_hospitalized`] || false}
                onChange={(checked) => onChange(`${prefix}_health_hospitalized`, checked)}
              />
            </div>
          </div>

          <div className="border-t border-red-200 pt-4">
            <div className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${data[`${prefix}_health_family_history`] ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <Label className="cursor-pointer text-sm leading-relaxed flex-1">
                5. Някой от Вашите биологични роднини бил ли е някога диагностициран с кардиомиопатия, CADASIL, порфирия, мускулна дистрофия, моторно невронно заболяване, множествена склероза, болест на Хънтингтън, деменция, Паркинсон, поликистозно бъбречно заболяване, меланом или рак на: червата, гърдата, дебелото черво, яйчниците или простатата?
              </Label>
              <HealthToggle
                checked={data[`${prefix}_health_family_history`] || false}
                onChange={(checked) => onChange(`${prefix}_health_family_history`, checked)}
              />
            </div>
          </div>

          <div className="border-t border-red-200 pt-4">
            <div className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${data[`${prefix}_health_risky_activities`] ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <Label className="cursor-pointer text-sm leading-relaxed flex-1">
                6. Занимавате ли се или възнамерявате да се занимавате с някаква рискова дейност или спорт като: пилотиране на самолет или други летателни апарати, парашутизъм, параглайдинг, гмуркане с акваланг, рафтинг, скално катерене, състезание с каквото и да е летателно, пара, водно или моторно средство, ски състезание/скокове или каране на ски в участък без маркировка, управление или возене на дву- или триколесно пътно превозно средство, мотоциклет, моторен скутер, ATV, включително такова с електрически двигател за задвижване, с или без място за сядане, с максимална конструктивна мощност по-голяма от 11kW или 125 куб. см. или друга опасна дейност?
              </Label>
              <HealthToggle
                checked={data[`${prefix}_health_risky_activities`] || false}
                onChange={(checked) => onChange(`${prefix}_health_risky_activities`, checked)}
              />
            </div>
          </div>

          <div className="border-t border-red-200 pt-4">
            <div className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${data[`${prefix}_health_travel_abroad`] ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <Label className="cursor-pointer text-sm leading-relaxed flex-1">
                7. Планирате ли да прекарате 2 месеца или повече на територията на страна, различна от Република България?
              </Label>
              <HealthToggle
                checked={data[`${prefix}_health_travel_abroad`] || false}
                onChange={(checked) => onChange(`${prefix}_health_travel_abroad`, checked)}
              />
            </div>
          </div>

          <div className="border-t border-red-200 pt-4">
            <div className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${data[`${prefix}_health_smoking`] ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <Label className="cursor-pointer text-sm leading-relaxed flex-1">
                8. Употреба на цигари
              </Label>
              <HealthToggle
                checked={data[`${prefix}_health_smoking`] || false}
                onChange={(checked) => onChange(`${prefix}_health_smoking`, checked)}
              />
            </div>
          </div>

          <div className="border-t border-red-200 pt-4 grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>9. Ръст в сантиметри</Label>
              <Input
                type="number"
                placeholder="170"
                value={data[`${prefix}_height_cm`] || ''}
                onChange={(e) => onChange(`${prefix}_height_cm`, e.target.value)}
                className="rounded-lg bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>10. Тегло в килограми</Label>
              <Input
                type="number"
                placeholder="70"
                value={data[`${prefix}_weight_kg`] || ''}
                onChange={(e) => onChange(`${prefix}_weight_kg`, e.target.value)}
                className="rounded-lg bg-white"
              />
            </div>
          </div>

          <div className="border-t border-red-200 pt-4">
            <p className="text-sm font-medium text-slate-700 mb-3">
              През последните 10 години били ли сте лекувани, изследвани или имали ли сте оплаквания, свързани с някое от следните:
            </p>
            <div className="space-y-3">
              {additionalHealthQuestions.map((q) => (
                <div key={q.id} className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${data[`${prefix}_health_${q.id}`] ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <Label className="cursor-pointer text-xs leading-relaxed flex-1">{q.text}</Label>
                  <HealthToggle
                    checked={data[`${prefix}_health_${q.id}`] || false}
                    onChange={(checked) => onChange(`${prefix}_health_${q.id}`, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
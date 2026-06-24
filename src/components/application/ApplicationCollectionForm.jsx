import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Loader2, User, CreditCard, Phone, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import HealthQuestionnaire from '@/components/analysis/HealthQuestionnaire';

/**
 * ApplicationCollectionForm
 * Collects the missing data needed to complete ApplicationData entity.
 * Props: journeyId, planId, analysisData, onComplete(applicationId)
 */
export default function ApplicationCollectionForm({ journeyId, planId, analysisData, onComplete }) {
  const [step, setStep] = useState(1); // 1=beneficiaries, 2=bank, 3=health, 4=confirm
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Health questionnaire data
  const [healthData, setHealthData] = useState({
    client_is_good_health: true,
  });

  const [beneficiary, setBeneficiary] = useState({
    full_name: '',
    egn: '',
    relationship: 'spouse',
    percentage: 100,
  });

  const [bank, setBank] = useState({
    account_holder: analysisData?.client_first_name ? `${analysisData.client_first_name} ${analysisData.client_last_name}` : '',
    iban: '',
    bank_name: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  const handleHealthChange = (key, value) => {
    setHealthData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const healthStatus = healthData.client_is_good_health ? 'completed' : 'requires_underwriting';
      
      const appData = await base44.entities.ApplicationData.create({
        journey_id: journeyId,
        plan_id: planId,
        client_id: analysisData?.client_id || '',
        application_status: 'ready_for_signing',
        beneficiary_data: {
          primary_beneficiaries: [beneficiary],
          contingent_beneficiaries: [],
        },
        bank_account: bank,
        payment_method: paymentMethod,
        health_questionnaire_status: healthStatus,
        additional_questions: healthData,
      });

      await base44.functions.invoke('advanceJourneyPublic', {
        journey_id: journeyId,
        to_state: 'application_ready_for_signing',
      }).catch(() => {});

      onComplete(appData.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none text-sm transition-colors";
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1";

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Progress */}
      <div className="flex">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={cn("flex-1 h-1.5 transition-colors", s <= step ? "bg-blue-600" : "bg-slate-200")} />
        ))}
      </div>

      <div className="p-6">
        {/* Step 1: Beneficiaries */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900">Бенефициент</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Кой получава обезщетението при настъпване на застрахователно събитие?</p>

            <div className="space-y-3">
              <div>
                <label className={labelClass}>Пълно ime</label>
                <input className={inputClass} value={beneficiary.full_name} onChange={e => setBeneficiary(p => ({ ...p, full_name: e.target.value }))} placeholder="Иван Петров Иванов" />
              </div>
              <div>
                <label className={labelClass}>ЕГН</label>
                <input className={inputClass} value={beneficiary.egn} onChange={e => setBeneficiary(p => ({ ...p, egn: e.target.value }))} placeholder="0000000000" maxLength={10} />
              </div>
              <div>
                <label className={labelClass}>Родствена връзка</label>
                <select className={inputClass} value={beneficiary.relationship} onChange={e => setBeneficiary(p => ({ ...p, relationship: e.target.value }))}>
                  <option value="spouse">Съпруг/а</option>
                  <option value="child">Дете</option>
                  <option value="parent">Родител</option>
                  <option value="sibling">Брат/Сестра</option>
                  <option value="other">Друго</option>
                </select>
              </div>
            </div>

            <Button
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
              onClick={() => setStep(2)}
              disabled={!beneficiary.full_name || beneficiary.egn.length !== 10}
            >
              Продължи
            </Button>
          </motion.div>
        )}

        {/* Step 3: Health Questionnaire */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900">Здравен въпросник</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Моля, отговорете на въпросите за здравословното си състояние.</p>

            <div className="max-h-96 overflow-y-auto pr-2 mb-4">
              <HealthQuestionnaire 
                data={healthData} 
                onChange={handleHealthChange} 
                prefix="client"
                showErrors={false}
              />
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(2)}>Назад</Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                onClick={() => setStep(4)}
              >
                Продължи
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Bank */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900">Банкова сметка</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">За директен дебит и изплащане на обезщетения.</p>

            <div className="space-y-3">
              <div>
                <label className={labelClass}>Титуляр на сметката</label>
                <input className={inputClass} value={bank.account_holder} onChange={e => setBank(p => ({ ...p, account_holder: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>IBAN</label>
                <input className={inputClass} value={bank.iban} onChange={e => setBank(p => ({ ...p, iban: e.target.value.toUpperCase() }))} placeholder="BG00XXXX00000000000000" />
              </div>
              <div>
                <label className={labelClass}>Банка</label>
                <select className={inputClass} value={bank.bank_name} onChange={e => setBank(p => ({ ...p, bank_name: e.target.value }))}>
                  <option value="">Изберете</option>
                  <option value="UniCredit">УниКредит Булбанк</option>
                  <option value="DSK">ДСК</option>
                  <option value="OBB">ОББ</option>
                  <option value="PostBank">Пощенска банка</option>
                  <option value="Raiffeisen">Райфайзенбанк</option>
                  <option value="SG Expressbank">СЖ Експресбанк</option>
                  <option value="Other">Друга</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Начин на плащане</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { value: 'bank_transfer', label: 'Банков превод' },
                    { value: 'credit_card', label: 'Карта' },
                    { value: 'direct_debit', label: 'Директен дебит' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPaymentMethod(opt.value)}
                      className={cn(
                        "py-2 px-2 rounded-xl border-2 text-xs font-medium transition-all",
                        paymentMethod === opt.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(1)}>Назад</Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                onClick={() => setStep(3)}
                disabled={!bank.account_holder || !bank.iban || !bank.bank_name}
              >
                Продължи
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-bold text-slate-900">Потвърждение</h3>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Бенефициент</p>
                <p className="text-sm font-semibold text-slate-900">{beneficiary.full_name}</p>
                <p className="text-xs text-slate-500">ЕГН: {beneficiary.egn} · {beneficiary.relationship}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Банкова сметка</p>
                <p className="text-sm font-semibold text-slate-900">{bank.account_holder}</p>
                <p className="text-xs text-slate-500">{bank.iban} · {bank.bank_name}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Плащане</p>
                <p className="text-sm font-semibold text-slate-900">{paymentMethod === 'bank_transfer' ? 'Банков превод' : paymentMethod === 'credit_card' ? 'Кредитна карта' : 'Директен дебит'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Здравен статус</p>
                <p className="text-sm font-semibold text-slate-900">{healthData.client_is_good_health ? 'В добро здраве' : 'Изисква медицинска оценка'}</p>
                {!healthData.client_is_good_health && (
                  <p className="text-xs text-slate-500 mt-1">Попълнен здравен въпросник с допълнителни въпроси</p>
                )}
              </div>
            </div>

            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(3)}>Назад</Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Потвърди и подпиши
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
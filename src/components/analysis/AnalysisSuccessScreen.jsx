import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { CheckCircle, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../../utils';

export default function AnalysisSuccessScreen({ analysisRecordId }) {
  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-12"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-semibold text-slate-900 mb-4 text-center">
            Поздравления! 🎉
          </h2>
          <p className="text-lg text-slate-700 mb-2 text-center font-medium">
            Вашият финансов анализ е завършен успешно!
          </p>
          <p className="text-slate-600 mb-8 text-center">
            Досието Ви е запазено и готово за генериране на финансов план.
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
            <p className="text-slate-700 font-medium mb-4 text-center">Вашият персонализиран финансов план очаква генериране</p>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-6 border-2 border-blue-300 hover:border-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-md"
              onClick={async () => {
                if (!analysisRecordId) {
                  alert('Грешка: Анализът не е запазен. Моля опитайте отново.');
                  return;
                }
                try {
                  const result = await base44.functions.invoke('generateFinancialPlan', {
                    analysis_id: analysisRecordId,
                  });
                  
                  if (result.plan_id) {
                    window.location.href = createPageUrl('FinancialPlanView') + `?id=${result.plan_id}`;
                  } else {
                    alert('Грешка при генериране на плана. Моля опитайте отново.');
                  }
                } catch (error) {
                  console.error('Plan generation error:', error);
                  alert('Грешка: ' + (error.message || 'Неуспешно генериране на плана'));
                }
              }}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-center">Вашият финансов план е готов!</h3>
              <p className="text-sm text-slate-600 text-center mb-4">
                Прегледайте вашия персонализиран финансов план веднага
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Виж плана сега
              </Button>
            </motion.div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs text-slate-600 text-center">
              💡 <span className="font-medium">Добре е да знаете:</span> Досието Ви е запазено и можете да го прегледате по всяко време от клиентския портал.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
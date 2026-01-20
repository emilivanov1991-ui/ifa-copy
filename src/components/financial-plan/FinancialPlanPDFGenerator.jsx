import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Helper to create HTML template for PDF
const createPDFTemplate = (planData, clientData) => {
  return `
    <div id="pdf-content" style="font-family: Arial, sans-serif; width: 210mm; background: white;">
      <!-- Page 1 - Cover -->
      <div style="height: 297mm; display: flex; flex-direction: column; position: relative; overflow: hidden;">
        <!-- Gradient Header -->
        <div style="height: 180px; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%); position: relative;">
          <div style="position: absolute; top: 20px; left: 20px; width: 50px; height: 50px; background: white; border-radius: 50%;"></div>
        </div>
        
        <!-- Title -->
        <div style="text-align: center; margin-top: 40px;">
          <h1 style="font-size: 42px; font-weight: bold; color: #0f172a; margin: 0; line-height: 1.2;">
            Персонализиран<br/>Финансов план
          </h1>
          <p style="color: #64748b; font-size: 16px; margin-top: 10px;">
            Вашият път към финансова свобода
          </p>
        </div>
        
        <!-- Client Info -->
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #64748b; font-size: 14px; margin-bottom: 5px;">Подготвен за:</p>
          <p style="font-size: 24px; font-weight: bold; color: #0f172a; margin: 5px 0;">
            ${clientData.name || 'Клиент'}
          </p>
          ${clientData.age ? `<p style="color: #64748b; font-size: 14px; margin-top: 5px;">${clientData.age} години</p>` : ''}
        </div>
        
        <!-- Date Info -->
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #64748b; font-size: 12px;">
            Дата: ${new Date().toLocaleDateString('bg-BG')}<br/>
            Валидност: 30 дни
          </p>
        </div>
        
        <!-- Guarantees Box -->
        <div style="margin: 30px 40px; padding: 25px; background: #f8fafc; border-radius: 12px;">
          <h3 style="color: #2563eb; font-size: 16px; margin-bottom: 15px;">🛡️ Вашите гаранции</h3>
          <div style="font-size: 12px; color: #0f172a; line-height: 1.8;">
            <div>✓ 20 дни за канселиране с пълно възстановяване</div>
            <div>✓ Данъчно облекчение до 10% годишно</div>
            <div>✓ 24/7 Customer Support винаги на линия</div>
            <div>✓ Личен консултант - среща в рамките на 3 работни дни</div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; color: #94a3b8; font-size: 11px;">
          APEX Financial - Независими финансови консултанти
        </div>
      </div>

      <!-- Page 2 - Investment Summary -->
      <div style="height: 297mm; display: flex; flex-direction: column; page-break-before: always;">
        <!-- Header -->
        <div style="background: #2563eb; padding: 20px 40px; color: white;">
          <h2 style="font-size: 26px; margin: 0; font-weight: bold;">Инвестиционен план</h2>
        </div>
        
        <!-- Price Box -->
        <div style="margin: 30px 40px; padding: 25px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 16px; text-align: center; border: 2px solid #bfdbfe;">
          <p style="color: #64748b; font-size: 13px; margin-bottom: 5px;">Инвестиция от само</p>
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <span style="font-size: 56px; font-weight: bold; color: #2563eb;">
              ${planData.total_monthly_premium?.toFixed(0) || '0'}
            </span>
            <div style="text-align: left;">
              <p style="font-size: 20px; font-weight: 600; color: #0f172a; margin: 0;">лв/месец</p>
              <p style="font-size: 13px; color: #64748b; margin: 3px 0 0 0;">
                или ${planData.calculations?.dailyCostInsurance || '0'} лв/ден
              </p>
            </div>
          </div>
          <div style="margin-top: 15px;">
            <span style="background: #d1fae5; color: #047857; padding: 8px 16px; border-radius: 20px; font-size: 13px; border: 1px solid #6ee7b7;">
              Периодичност: ${
                planData.payment_frequency === 'annual' ? 'Годишна' :
                planData.payment_frequency === 'semiannual' ? 'Полугодишна' :
                planData.payment_frequency === 'quarterly' ? 'Тримесечна' : 'Месечна'
              }
            </span>
          </div>
        </div>
        
        <!-- Products List -->
        <div style="margin: 0 40px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 15px;">
            Включени продукти:
          </h3>
          ${(planData.products || []).map(product => `
            <div style="background: #f8fafc; padding: 18px; border-radius: 12px; margin-bottom: 12px; display: flex; align-items: start; border: 1px solid #e2e8f0;">
              <div style="width: 24px; height: 24px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; flex-shrink: 0;">✓</div>
              <div style="flex: 1; margin-left: 15px;">
                <p style="font-size: 14px; font-weight: bold; color: #0f172a; margin: 0;">
                  ${product.name}
                </p>
                <p style="font-size: 12px; color: #64748b; margin: 3px 0 0 0;">
                  ${product.benefit}
                </p>
                ${product.coverage ? `<p style="font-size: 11px; color: #94a3b8; margin: 3px 0 0 0;">Покритие: ${product.coverage.toLocaleString()} лв</p>` : ''}
              </div>
              <div style="text-align: right; margin-left: 15px;">
                <p style="font-size: 16px; font-weight: bold; color: #2563eb; margin: 0;">
                  ${product.monthlyPremium === 0 ? 'БЕЗПЛАТНО' : `${product.monthlyPremium.toFixed(0)} лв/мес`}
                </p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Page 3 - Financial Impact -->
      <div style="height: 297mm; display: flex; flex-direction: column; page-break-before: always;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 20px 40px; color: white;">
          <h2 style="font-size: 26px; margin: 0; font-weight: bold;">Финансов ефект</h2>
        </div>
        
        <!-- Metrics Grid -->
        <div style="margin: 30px 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <!-- Metric 1 -->
          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 20px; border-radius: 12px; border: 1px solid #93c5fd;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 20px;">🛡️</span>
              <p style="font-size: 12px; color: #475569; margin: 0;">Защитен трудов капитал</p>
            </div>
            <p style="font-size: 28px; font-weight: bold; color: #2563eb; margin: 5px 0;">
              ${((planData.calculations?.laborCapital || 0) / 1000000).toFixed(1)}M лв
            </p>
            <p style="font-size: 10px; color: #64748b; margin: 0;">Вашият бъдещ доход защитен</p>
          </div>
          
          <!-- Metric 2 -->
          <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 20px; border-radius: 12px; border: 1px solid #6ee7b7;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 20px;">📈</span>
              <p style="font-size: 12px; color: #475569; margin: 0;">Данъчно облекчение</p>
            </div>
            <p style="font-size: 28px; font-weight: bold; color: #16a34a; margin: 5px 0;">
              ${(planData.calculations?.totalTaxRelief || 0).toLocaleString()} лв
            </p>
            <p style="font-size: 10px; color: #64748b; margin: 0;">
              Спестени данъци за ${clientData.yearsToRetirement || 0} години
            </p>
          </div>
          
          <!-- Metric 3 -->
          <div style="background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%); padding: 20px; border-radius: 12px; border: 1px solid #c084fc;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 20px;">✨</span>
              <p style="font-size: 12px; color: #475569; margin: 0;">Прогнозна стойност</p>
            </div>
            <p style="font-size: 28px; font-weight: bold; color: #9333ea; margin: 5px 0;">
              ${((planData.calculations?.projectedValue || 0) / 1000000).toFixed(1)}M лв
            </p>
            <p style="font-size: 10px; color: #64748b; margin: 0;">
              При пенсиониране (${clientData.retirementAge || 65} години)
            </p>
          </div>
          
          <!-- Metric 4 -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; border: 1px solid #fcd34d;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 20px;">💰</span>
              <p style="font-size: 12px; color: #475569; margin: 0;">Резерв след план</p>
            </div>
            <p style="font-size: 28px; font-weight: bold; color: #d97706; margin: 5px 0;">
              ${(planData.calculations?.reserveMonths || 0).toFixed(1)} мес
            </p>
            <p style="font-size: 10px; color: #64748b; margin: 0;">
              ${(planData.calculations?.reserveAfterPlan || 0).toLocaleString()} лв наличност
            </p>
          </div>
        </div>
        
        <!-- Important Notice -->
        <div style="margin: 20px 40px; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
          <div style="display: flex; align-items: start; gap: 12px;">
            <span style="font-size: 20px;">⚠️</span>
            <div>
              <p style="font-weight: bold; color: #92400e; margin: 0 0 5px 0; font-size: 14px;">
                Този план важи 30 дни
              </p>
              <p style="color: #b45309; font-size: 12px; margin: 0;">
                Пазарните условия се променят. Запазете вашите условия днес.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Page 4 - Guarantees & Next Steps -->
      <div style="height: 297mm; display: flex; flex-direction: column; page-break-before: always;">
        <!-- Dark Header -->
        <div style="background: #0f172a; padding: 30px 40px; color: white;">
          <h2 style="font-size: 28px; margin: 0; font-weight: bold;">🛡️ Вашите гаранции</h2>
        </div>
        
        <!-- Guarantees Grid -->
        <div style="margin: 30px 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          ${[
            { title: '20 дни за канселиране', desc: 'Пълно възстановяване без въпроси' },
            { title: 'Данъчно облекчение', desc: 'До 10% годишно спестяване' },
            { title: '24/7 Customer Support', desc: 'Винаги на линия за вас' },
            { title: 'Личен консултант', desc: 'Среща в рамките на 3 работни дни' }
          ].map(g => `
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="display: flex; align-items: start; gap: 10px;">
                <span style="color: #22c55e; font-weight: bold; font-size: 16px;">✓</span>
                <div>
                  <p style="font-weight: bold; color: #0f172a; margin: 0; font-size: 13px;">${g.title}</p>
                  <p style="color: #64748b; font-size: 11px; margin: 3px 0 0 0;">${g.desc}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <!-- Social Proof -->
        <div style="margin: 20px 40px; padding: 25px; background: linear-gradient(135deg, #f1f5f9 0%, #e0f2fe 100%); border-radius: 12px; border: 1px solid #bae6fd;">
          <h3 style="font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 20px; text-align: center;">
            Защо клиентите ни избират:
          </h3>
          <div style="display: flex; justify-content: space-around; text-align: center;">
            ${[
              { value: '500+', label: 'Доволни клиенти' },
              { value: '15+ год', label: 'Опит в бранша' },
              { value: '98%', label: 'Препоръки' },
              { value: '50M+ лв', label: 'Защитен капитал' }
            ].map(stat => `
              <div>
                <p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 0;">${stat.value}</p>
                <p style="font-size: 11px; color: #64748b; margin: 5px 0 0 0;">${stat.label}</p>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Next Steps -->
        <div style="margin: 20px 40px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 15px;">
            Следващи стъпки:
          </h3>
          ${[
            'Свържете се с вашия личен консултант',
            'Насрочете среща на удобно за вас време',
            'Получете детайлна презентация на плана',
            'Започнете инвестициите и защитете бъдещето си'
          ].map((step, idx) => `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
              <div style="width: 28px; height: 28px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">
                ${idx + 1}
              </div>
              <p style="color: #0f172a; font-size: 13px; margin: 0;">${step}</p>
            </div>
          `).join('')}
        </div>
        
        <!-- CTA -->
        <div style="margin: 30px 40px; padding: 25px; background: #2563eb; border-radius: 16px; text-align: center;">
          <p style="color: white; font-size: 20px; font-weight: bold; margin: 0 0 10px 0;">
            📞 Запазете среща с консултант
          </p>
          <p style="color: #bfdbfe; font-size: 13px; margin: 0;">
            Телефон: +359 2 123 4567 | Email: info@apex-financial.bg
          </p>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: auto; padding: 20px; text-align: center; color: #94a3b8; font-size: 11px;">
          APEX Financial - Независими финансови консултанти
        </div>
      </div>
    </div>
  `;
};

export const downloadFinancialPlanPDF = async (planData, clientData) => {
  // Create temporary container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.innerHTML = createPDFTemplate(planData, clientData);
  document.body.appendChild(container);

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfContent = container.querySelector('#pdf-content');
    const pages = pdfContent.children;

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage();
      
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }

    const fileName = `Финансов_План_${clientData.name?.replace(/\s+/g, '_') || 'Клиент'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
  } finally {
    // Cleanup
    document.body.removeChild(container);
  }
};
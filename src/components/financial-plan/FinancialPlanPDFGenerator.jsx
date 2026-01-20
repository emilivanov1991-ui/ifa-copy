import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Calculate wealth projection
const calculateWealthProjection = (planData, clientData) => {
  const monthsToRetirement = (clientData.yearsToRetirement || 0) * 12;
  const monthlyBalance = planData.calculations?.monthlyBalance || 0;
  
  // Without plan - just savings
  const withoutPlan = monthlyBalance * monthsToRetirement;
  
  // With plan - all investments
  const upfValue = planData.calculations?.upfAccumulated || 0;
  const mortgageInterestSavings = (planData.calculations?.mortgageInterestSaved || 0) * 0.3;
  const propertyValue = planData.calculations?.futurePropertyValue || 0;
  const ulInvestments = planData.calculations?.ulInvestmentValue || 0;
  const ulJuniorInvestments = planData.calculations?.ulJuniorValue || 0;
  const reserveGrowth = (planData.calculations?.reserveAfterPlan || 0) * monthsToRetirement * 0.05; // 5% annual growth
  
  const withPlan = upfValue + mortgageInterestSavings + propertyValue + ulInvestments + ulJuniorInvestments + reserveGrowth;
  
  return { withoutPlan, withPlan };
};

// Calculate allocation breakdown
const calculateAllocation = (planData) => {
  const products = planData.products || [];
  let investments = 0;
  let incomeProtection = 0;
  let propertyProtection = 0;
  let loans = 0;
  
  products.forEach(p => {
    const premium = p.monthlyPremium || 0;
    if (p.name.includes('Unit Linked') || p.name.includes('УПФ')) {
      investments += premium;
    } else if (p.name.includes('Uniqa') || p.name.includes('Generali') || p.name.includes('Срочен живот') || p.name.includes('Care')) {
      incomeProtection += premium;
    } else if (p.name.includes('Дом') || p.name.includes('Каско')) {
      propertyProtection += premium;
    } else if (p.name.includes('кредит') || p.name.includes('Ипотека')) {
      loans += premium;
    }
  });
  
  const total = investments + incomeProtection + propertyProtection + loans || 1;
  
  return {
    investments: { amount: investments, percent: (investments / total) * 100 },
    incomeProtection: { amount: incomeProtection, percent: (incomeProtection / total) * 100 },
    propertyProtection: { amount: propertyProtection, percent: (propertyProtection / total) * 100 },
    loans: { amount: loans, percent: (loans / total) * 100 }
  };
};

// Helper to create HTML template for PDF
const createPDFTemplate = (planData, clientData) => {
  const wealth = calculateWealthProjection(planData, clientData);
  const allocation = calculateAllocation(planData);
  const totalTaxRelief = planData.calculations?.totalTaxRelief || 0;
  const dailyCost = ((planData.total_monthly_premium || 0) / 30).toFixed(2);
  
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

      <!-- Page 2 - Capital Growth Chart -->
      <div style="height: 297mm; display: flex; flex-direction: column; page-break-before: always;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); padding: 20px 40px; color: white;">
          <h2 style="font-size: 26px; margin: 0; font-weight: bold;">Вашата финансова стратегия</h2>
        </div>
        
        <!-- Capital Chart -->
        <div style="margin: 30px 40px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 20px; text-align: center;">
            Трудов vs Финансов капитал през годините
          </h3>
          
          <!-- SVG Chart -->
          <div style="background: white; border: 2px solid #dc2626; border-radius: 12px; padding: 30px; position: relative; height: 300px;">
            <svg width="100%" height="280" viewBox="0 0 800 280" style="overflow: visible;">
              <!-- Grid lines -->
              <line x1="50" y1="20" x2="50" y2="240" stroke="#e2e8f0" stroke-width="2"/>
              <line x1="50" y1="240" x2="750" y2="240" stroke="#e2e8f0" stroke-width="2"/>
              
              <!-- Age labels -->
              <text x="50" y="265" fill="#64748b" font-size="16" font-weight="bold">${clientData.age || 24}</text>
              <text x="720" y="265" fill="#64748b" font-size="16" font-weight="bold">65</text>
              <text x="380" y="265" fill="#64748b" font-size="14">Пенсионна възраст</text>
              
              <!-- Labor Capital (declining red line) -->
              <path d="M 50,40 L 200,100 L 350,140 L 500,180 L 650,220 L 750,240" 
                    stroke="#dc2626" stroke-width="4" fill="none"/>
              <text x="60" y="50" fill="#dc2626" font-size="14" font-weight="bold">ТР. КАПИТАЛ</text>
              
              <!-- Financial Capital (growing blue wave) -->
              <path d="M 50,240 Q 150,230 200,220 T 300,200 T 400,170 T 500,140 T 600,100 T 700,60 L 750,40" 
                    stroke="#2563eb" stroke-width="4" fill="none"/>
              <text x="500" y="55" fill="#2563eb" font-size="14" font-weight="bold">ФИН. КАПИТАЛ</text>
              
              <!-- Protection zone -->
              <rect x="50" y="140" width="350" height="100" fill="#dc2626" opacity="0.1" rx="8"/>
              <text x="150" y="200" fill="#dc2626" font-size="18" font-weight="bold">ЗАЩИТА</text>
              
              <!-- Investment zone -->
              <ellipse cx="650" cy="80" rx="120" ry="60" fill="none" stroke="#dc2626" stroke-width="3"/>
              <text x="600" y="30" fill="#dc2626" font-size="16" font-weight="bold">ИНВЕСТИЦИИ</text>
              
              <!-- Vertical divider at pension age -->
              <line x1="750" y1="20" x2="750" y2="240" stroke="#dc2626" stroke-width="3" stroke-dasharray="5,5"/>
            </svg>
          </div>
          
          <!-- Explanation -->
          <div style="margin-top: 20px; background: #f1f5f9; padding: 20px; border-radius: 12px; border-left: 4px solid #2563eb;">
            <p style="color: #0f172a; font-size: 14px; line-height: 1.6; margin: 0;">
              <strong style="color: #2563eb;">Стратегия:</strong> Докато вашият <strong style="color: #dc2626;">трудов капитал</strong> 
              постепенно намалява с приближаването на пенсионната възраст, ние изграждаме вашия 
              <strong style="color: #2563eb;">финансов капитал</strong> чрез инвестиции. През целия период осигуряваме 
              <strong style="color: #dc2626;">защита</strong> на дохода ви, за да гарантираме плавния преход към финансова независимост.
            </p>
          </div>
        </div>
      </div>

      <!-- Page 3 - Investment Summary with Comparison -->
      <div style="height: 297mm; display: flex; flex-direction: column; page-break-before: always;">
        <!-- Header -->
        <div style="background: #2563eb; padding: 20px 40px; color: white;">
          <h2 style="font-size: 26px; margin: 0; font-weight: bold;">Вашата инвестиция</h2>
        </div>
        
        <!-- Price Box with Animation -->
        <div style="margin: 30px 40px;">
          <div style="padding: 30px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 16px; text-align: center; border: 3px solid #2563eb; box-shadow: 0 10px 40px rgba(37,99,235,0.3);">
            <p style="color: #64748b; font-size: 14px; margin-bottom: 5px;">Вашата месечна инвестиция</p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin: 15px 0;">
              <span style="font-size: 64px; font-weight: bold; color: #2563eb; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
                ${planData.total_monthly_premium?.toFixed(0) || '0'}
              </span>
              <div style="text-align: left;">
                <p style="font-size: 22px; font-weight: 600; color: #0f172a; margin: 0;">лв/месец</p>
                <p style="font-size: 16px; color: #16a34a; margin: 5px 0 0 0; font-weight: 600;">
                  само ${dailyCost} лв/ден
                </p>
              </div>
            </div>
            
            <!-- Wealth Comparison Chart -->
            <div style="margin-top: 30px; padding: 25px; background: white; border-radius: 12px;">
              <h4 style="font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 20px;">
                Растеж на имуществото до пенсиониране
              </h4>
              
              <div style="display: flex; align-items: end; justify-content: center; gap: 40px; height: 200px;">
                <!-- Without Plan Bar -->
                <div style="text-align: center; flex: 1;">
                  <div style="background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%); height: ${Math.min((wealth.withoutPlan / wealth.withPlan) * 180, 180)}px; border-radius: 12px 12px 0 0; display: flex; align-items: center; justify-content: center; position: relative; box-shadow: 0 -4px 12px rgba(0,0,0,0.1);">
                    <span style="color: white; font-weight: bold; font-size: 18px; writing-mode: vertical-rl; transform: rotate(180deg);">
                      ${(wealth.withoutPlan / 1000).toFixed(0)}K лв
                    </span>
                  </div>
                  <p style="color: #64748b; font-size: 13px; margin-top: 10px; font-weight: 600;">
                    БЕЗ план
                  </p>
                </div>
                
                <!-- With Plan Bar -->
                <div style="text-align: center; flex: 1;">
                  <div style="background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%); height: 180px; border-radius: 12px 12px 0 0; display: flex; align-items: center; justify-content: center; position: relative; box-shadow: 0 -4px 20px rgba(34,197,94,0.4);">
                    <span style="color: white; font-weight: bold; font-size: 22px; writing-mode: vertical-rl; transform: rotate(180deg);">
                      ${((wealth.withPlan) / 1000000).toFixed(1)}M лв
                    </span>
                    <div style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%); background: #fbbf24; color: #78350f; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; white-space: nowrap;">
                      +${(((wealth.withPlan - wealth.withoutPlan) / wealth.withoutPlan) * 100).toFixed(0)}% ръст! 🚀
                    </div>
                  </div>
                  <p style="color: #16a34a; font-size: 13px; margin-top: 10px; font-weight: bold;">
                    С НАШИЯ план
                  </p>
                </div>
              </div>
              
              <p style="color: #64748b; font-size: 11px; margin-top: 15px; font-style: italic;">
                *Проекция при ${clientData.yearsToRetirement || 0} години инвестиции до ${clientData.retirementAge || 65} г. възраст
              </p>
            </div>
          </div>
        </div>
        
          <h3 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 15px;">
            Продукти в детайли:
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

      <!-- Page 4 - Advantages & Allocation -->
      <div style="height: 297mm; display: flex; flex-direction: column; page-break-before: always;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 20px 40px; color: white;">
          <h2 style="font-size: 26px; margin: 0; font-weight: bold;">Предимства на плана</h2>
        </div>
        
        <!-- Advantages Grid -->
        <div style="margin: 20px 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          ${[
            { title: 'Гъвкавост', desc: 'възможност да се променят сумите, определени за отделните цели', color: '#3b82f6' },
            { title: 'Променливост', desc: 'възможност да се добавят и променят финансовите решения', color: '#8b5cf6' },
            { title: 'Качество', desc: 'финансови решения от качествени институции', color: '#ec4899' },
            { title: 'Надежност', desc: 'във всяка ситуация ще има финансов съветник, който ще се грижи за Вас', color: '#f59e0b' },
            { title: 'Обслужване', desc: 'актуализиране при промяна на финансовото състояние или на пазара', color: '#06b6d4' },
            { title: 'Данъчно облекчение', desc: 'спестяване от данъци за целия период', color: '#10b981' }
          ].map(adv => `
            <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid ${adv.color}; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              <h4 style="color: ${adv.color}; font-size: 14px; font-weight: bold; margin: 0 0 5px 0;">${adv.title}</h4>
              <p style="color: #64748b; font-size: 11px; margin: 0; line-height: 1.4;">${adv.desc}</p>
            </div>
          `).join('')}
        </div>
        
        <!-- Tax Relief Visualization -->
        <div style="margin: 15px 40px; padding: 20px; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; border: 2px solid #10b981;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <h4 style="color: #065f46; font-size: 16px; margin: 0 0 5px 0; font-weight: bold;">💰 Данъчно облекчение</h4>
              <p style="color: #047857; font-size: 12px; margin: 0;">Спестени данъци за ${clientData.yearsToRetirement || 0} години</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 36px; font-weight: bold; color: #10b981; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
                ${totalTaxRelief.toLocaleString()} лв
              </p>
            </div>
          </div>
        </div>
        
        <!-- Allocation Chart -->
        <div style="margin: 15px 40px;">
          <h3 style="font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 15px; text-align: center;">
            Разпределение на вашите спестявания
          </h3>
          
          <!-- Treemap-style allocation -->
          <div style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; height: 220px; display: flex; flex-wrap: wrap; gap: 8px;">
            ${allocation.investments.percent > 0 ? `
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 8px; padding: 15px; flex: ${allocation.investments.percent}; min-width: ${allocation.investments.percent}%; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; box-shadow: 0 4px 12px rgba(59,130,246,0.3);">
                <p style="font-size: 24px; font-weight: bold; margin: 0;">${allocation.investments.percent.toFixed(0)}%</p>
                <p style="font-size: 12px; margin: 5px 0 0 0; text-align: center; line-height: 1.3;">Инвестиции</p>
                <p style="font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">${allocation.investments.amount.toFixed(0)} лв</p>
              </div>
            ` : ''}
            
            ${allocation.incomeProtection.percent > 0 ? `
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; padding: 15px; flex: ${allocation.incomeProtection.percent}; min-width: ${allocation.incomeProtection.percent}%; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">
                <p style="font-size: 24px; font-weight: bold; margin: 0;">${allocation.incomeProtection.percent.toFixed(0)}%</p>
                <p style="font-size: 12px; margin: 5px 0 0 0; text-align: center; line-height: 1.3;">Защита доход</p>
                <p style="font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">${allocation.incomeProtection.amount.toFixed(0)} лв</p>
              </div>
            ` : ''}
            
            ${allocation.propertyProtection.percent > 0 ? `
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 8px; padding: 15px; flex: ${allocation.propertyProtection.percent}; min-width: ${allocation.propertyProtection.percent}%; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; box-shadow: 0 4px 12px rgba(245,158,11,0.3);">
                <p style="font-size: 24px; font-weight: bold; margin: 0;">${allocation.propertyProtection.percent.toFixed(0)}%</p>
                <p style="font-size: 12px; margin: 5px 0 0 0; text-align: center; line-height: 1.3;">Защита имущество</p>
                <p style="font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">${allocation.propertyProtection.amount.toFixed(0)} лв</p>
              </div>
            ` : ''}
            
            ${allocation.loans.percent > 0 ? `
              <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 8px; padding: 15px; flex: ${allocation.loans.percent}; min-width: ${allocation.loans.percent}%; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; box-shadow: 0 4px 12px rgba(139,92,246,0.3);">
                <p style="font-size: 24px; font-weight: bold; margin: 0;">${allocation.loans.percent.toFixed(0)}%</p>
                <p style="font-size: 12px; margin: 5px 0 0 0; text-align: center; line-height: 1.3;">Кредити</p>
                <p style="font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">${allocation.loans.amount.toFixed(0)} лв</p>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Page 5 - Products List -->
      <div style="height: 297mm; display: flex; flex-direction: column; page-break-before: always;">
        <div style="background: #2563eb; padding: 20px 40px; color: white;">
          <h2 style="font-size: 26px; margin: 0; font-weight: bold;">Вашите продукти</h2>
        </div>
        
        <div style="margin: 20px 40px;">
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

      <!-- Page 7 - Guarantees & Next Steps -->
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
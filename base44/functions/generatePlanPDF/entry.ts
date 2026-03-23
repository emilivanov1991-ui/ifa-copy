import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan_id } = await req.json();

    if (!plan_id) {
      return Response.json({ error: 'plan_id е задължително' }, { status: 400 });
    }

    // Fetch plan
    const planData = await base44.entities.FinancialPlan.filter({ id: plan_id });
    if (!planData || planData.length === 0) {
      return Response.json({ error: 'Планът не е намерен' }, { status: 404 });
    }
    const plan = planData[0];

    // Fetch analysis
    const analysisData = await base44.entities.FinancialAnalysisSubmission.filter({ 
      id: plan.analysis_id 
    });
    const analysis = analysisData[0];

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Константи за цветове
    const PRIMARY_COLOR = [37, 99, 235]; // Blue-600
    const PRIMARY_DARK = [29, 78, 216]; // Blue-700
    const TEXT_COLOR = [51, 65, 85]; // Slate-700
    const LIGHT_BG = [248, 250, 252]; // Slate-50

    // ==================== СТРАНИЦА 1: КОРИЦА ====================
    doc.addPage();
    
    // Заглавие с градиент ефект (симулиран)
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(margin, 40, pageWidth - 2 * margin, 60, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.setFont(undefined, 'bold');
    doc.text('FINANCIAL PLAN', pageWidth / 2, 75, { align: 'center' });

    // Клиент информация
    doc.setTextColor(...TEXT_COLOR);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Клиент', margin, 120);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(`${analysis.client_first_name} ${analysis.client_last_name}`, margin, 128);
    
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_COLOR);
    doc.setFont(undefined, 'normal');
    doc.text(`Email: ${analysis.client_email || ''}`, margin, 135);
    doc.text(`Телефон: ${analysis.client_phone || ''}`, margin, 142);

    // Валидност
    doc.text('ВАЛИДЕН ДО', margin, 160);
    doc.setFont(undefined, 'bold');
    doc.text(new Date(plan.valid_until).toLocaleDateString('bg-BG'), margin, 167);

    // Консултант (от user)
    doc.setFont(undefined, 'normal');
    doc.text('Финансов консултант', margin, 185);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFont(undefined, 'bold');
    doc.text(user.full_name || 'Консултант', margin, 192);
    doc.setTextColor(...TEXT_COLOR);
    doc.setFont(undefined, 'normal');
    doc.text(`Email: ${user.email}`, margin, 199);

    // ==================== СТРАНИЦА 2: ФИНАНСОВ ПЛАН (главна) ====================
    doc.addPage();
    
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('ФИНАНСОВ ПЛАН', margin, 30);

    const monthlyDeposit = plan.total_monthly_premium || 0;
    const fixedMonthly = (plan.products || []).filter(p => p.product_type === 'term_life' || p.product_type === 'mlc_health')
      .reduce((sum, p) => sum + (p.monthly_premium || 0), 0);
    const variableMonthly = monthlyDeposit - fixedMonthly;

    // Ляво - Месечен депозит
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Месечен депозит', margin, 50);

    doc.setFontSize(20);
    doc.text(`${monthlyDeposit.toFixed(2)} EUR`, margin, 60);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...TEXT_COLOR);
    doc.text(`Фиксиран: ${fixedMonthly.toFixed(2)} EUR`, margin, 70);
    doc.text(`Променлив: ${variableMonthly.toFixed(2)} EUR`, margin, 77);

    // Трудов капитал
    const laborCapital = (analysis.client_net_income || 0) * 12 * (plan.years_to_retirement_p1 || 30) * 1.03;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('Трудов капитал:', margin, 95);
    doc.setFontSize(16);
    doc.text(`${laborCapital.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} EUR`, margin, 105);

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...TEXT_COLOR);
    doc.text('(При прогнозен ръст на възнагражденията от 3% годишно)', margin, 112);

    // Имущество
    const netWorth = (analysis.property_apartment_value || 0) + (analysis.property_house_value || 0);
    const liabilities = (analysis.liability_mortgage || 0) + (analysis.liability_consumer_loans || 0);
    
    doc.setFontSize(10);
    doc.text(`Имущество: ${netWorth.toLocaleString('bg-BG')} EUR`, margin, 125);
    doc.text(`Задължения: ${liabilities.toLocaleString('bg-BG')} EUR`, margin, 132);
    doc.setFont(undefined, 'bold');
    doc.text(`Общо нетно имущество: ${(netWorth - liabilities).toLocaleString('bg-BG')} EUR`, margin, 139);

    // Предимства
    doc.setFontSize(12);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('ПРЕДИМСТВА', margin, 160);
    
    const advantages = [
      'Гъвкавост - възможност да се променят сумите',
      'Променливост - добавяне на нови решения',
      'Качество - решения от качествени институции',
      'Надежност - винаги има финансов съветник',
      'Обслужване - актуализиране при промени'
    ];

    let advY = 170;
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_COLOR);
    doc.setFont(undefined, 'normal');
    advantages.forEach(adv => {
      doc.text(`• ${adv}`, margin, advY);
      advY += 7;
    });

    // Данъчно облекчение
    const taxBenefit = Math.round(monthlyDeposit * 12 * (plan.years_to_retirement_p1 || 20) * 0.1);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(`Данъчно облекчение: ${taxBenefit.toLocaleString('bg-BG')} EUR`, margin, advY + 10);

    // ==================== СТРАНИЦА 3: МЕСЕЧНА ВНОСКА С/БЕЗ ПЛАН ====================
    doc.addPage();
    
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('РЕЗЮМЕ НА ВАШИЯ ФИНАНСОВ ПЛАН', pageWidth / 2, 30, { align: 'center' });

    const monthlyIncome = plan.total_monthly_income || 0;
    const redistributionPercent = monthlyIncome > 0 ? Math.round((monthlyDeposit / monthlyIncome) * 100) : 0;

    // Без финансов план
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38); // Red-600
    doc.text('БЕЗ ФИНАНСОВ ПЛАН', margin, 50);

    const withoutPlanProblems = [
      'Няма защита на дохода',
      'Няма активи за бъдещето',
      'Няма изградена стратегия',
      'Няма подсигуряване при заболяване',
      'Неоптимизиран ефект на спестяванията',
      'Незащитени от инфлация средства'
    ];

    let yPos = 60;
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_COLOR);
    doc.setFont(undefined, 'normal');
    withoutPlanProblems.forEach(problem => {
      doc.text(`- ${problem}`, margin, yPos);
      yPos += 7;
    });

    // С финансов план
    yPos = 50;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(22, 163, 74); // Green-600
    doc.text('С ФИНАНСОВ ПЛАН', pageWidth / 2 + 10, yPos);

    const withPlanBenefits = [
      'Адекватна защита на дохода',
      'Качествена защита при заболяване',
      'Създаване на дългосрочни активи',
      'Създаване на достойна пенсия',
      'Подсигуряване на децата',
      'Създаване на резерв'
    ];

    yPos = 60;
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_COLOR);
    doc.setFont(undefined, 'normal');
    withPlanBenefits.forEach(benefit => {
      doc.text(`+ ${benefit}`, pageWidth / 2 + 10, yPos);
      yPos += 7;
    });

    // Обобщение
    doc.setFillColor(...LIGHT_BG);
    doc.rect(margin, 120, pageWidth - 2 * margin, 30, 'F');
    doc.setFontSize(11);
    doc.setTextColor(...PRIMARY_COLOR);
    const summaryText = `Преразпределяме Вашите настоящи средства, така че ${redistributionPercent}% от месечния Ви доход (${monthlyDeposit.toFixed(2)} EUR) работи за постигане на финансовите Ви цели.`;
    const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 2 * margin - 10);
    doc.text(summaryLines, margin + 5, 130);

    // Графика на месечните вноски (опростена)
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('МЕСЕЧНА ВНОСКА - СРАВНЕНИЕ', margin, 165);

    // Без план
    doc.setFillColor(203, 213, 225); // Slate-300
    doc.rect(margin, 175, 60, 20, 'F');
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_COLOR);
    doc.text('Без план', margin + 5, 182);
    doc.text('0 EUR', margin + 5, 190);

    // С план
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(margin + 70, 175, 60, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('С план', margin + 75, 182);
    doc.text(`${monthlyDeposit.toFixed(0)} EUR`, margin + 75, 190);

    // ==================== СТРАНИЦА 4: ЗАЩИТА НА ДОХОДА ====================
    doc.addPage();
    
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('ЗАЩИТА НА ДОХОДА', margin, 30);

    doc.setFontSize(12);
    doc.text(`Трудов капитал: ${laborCapital.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} EUR`, margin, 45);

    // Таблица с покрития
    const protectionItems = [
      { name: 'Смърт', current: 0, recommended: plan.protection_need_p1 || 0 },
      { name: 'Смърт от злополука', current: 0, recommended: plan.protection_need_p1 || 0 },
      { name: 'Трайна неработоспособност', current: 0, recommended: (plan.protection_need_p1 || 0) * 2 },
      { name: 'Тежки заболявания', current: 0, recommended: (analysis.client_net_income || 0) * 24 },
      { name: 'Критични заболявания', current: 0, recommended: 50000 }
    ];

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...TEXT_COLOR);
    
    let tableY = 60;
    doc.text('Покритие', margin, tableY);
    doc.text('Текущо', margin + 80, tableY);
    doc.text('Препоръчано', margin + 120, tableY);
    
    doc.setFont(undefined, 'normal');
    tableY += 8;
    
    protectionItems.forEach(item => {
      doc.text(item.name, margin, tableY);
      doc.text(`${item.current.toLocaleString('bg-BG')} EUR`, margin + 80, tableY);
      doc.text(`${item.recommended.toLocaleString('bg-BG')} EUR`, margin + 120, tableY);
      tableY += 7;
    });

    // ==================== СТРАНИЦА 5: РАЗПРЕДЕЛЕНИЕ НА СРЕДСТВАТА ====================
    doc.addPage();
    
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('РАЗПРЕДЕЛЕНИЕ НА СРЕДСТВАТА', margin, 30);

    const fundAllocations = (plan.products || []).filter(p => ['ul_investment', 'pension_plan', 'education_plan'].includes(p.product_type))
      .map(p => ({
        goal: p.product_type === 'pension_plan' ? 'Пенсия' : 
              p.product_type === 'education_plan' ? 'Образование' : 'Инвестиции',
        deposit: p.monthly_premium * 12 * (p.term_years || 10),
        value: p.expected_value || 0,
        years: p.term_years || 10
      }));

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    
    let allocY = 50;
    doc.text('Цел', margin, allocY);
    doc.text('Депозит', margin + 50, allocY);
    doc.text('Стойност', margin + 90, allocY);
    doc.text('Години', margin + 130, allocY);
    
    doc.setFont(undefined, 'normal');
    allocY += 8;
    
    fundAllocations.forEach(item => {
      doc.text(item.goal, margin, allocY);
      doc.text(`${item.deposit.toLocaleString('bg-BG')} EUR`, margin + 50, allocY);
      doc.text(`${item.value.toLocaleString('bg-BG')} EUR`, margin + 90, allocY);
      doc.text(item.years.toString(), margin + 130, allocY);
      allocY += 7;
    });

    // Времева алокация (опростена)
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('ВРЕМЕВА АЛОКАЦИЯ', margin, allocY + 15);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...TEXT_COLOR);
    doc.text('Дългосрочни средства - инвестиции и пенсия', margin, allocY + 28);
    doc.text('Средносрочни средства - резерв и други цели', margin, allocY + 35);
    doc.text('Краткосрочни средства - ликвидност', margin, allocY + 42);

    // ==================== СТРАНИЦА 6: ПРОДУКТИ ====================
    doc.addPage();
    
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('ПРОДУКТИ В ПЛАНА', margin, 30);

    const productTypes = {
      'ul_investment': 'Инвестиции и спестявания',
      'health_insurance': 'Здравни застраховки',
      'pension_plan': 'Пенсионно осигуряване',
      'term_life': 'Застраховки живот',
      'insurance': 'Застраховки'
    };

    const grouped = {};
    (plan.products || []).forEach(product => {
      const type = product.product_type;
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(product);
    });

    let prodY = 45;
    Object.entries(grouped).forEach(([type, products]) => {
      if (prodY > 250) {
        doc.addPage();
        prodY = 30;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...PRIMARY_COLOR);
      doc.text(productTypes[type] || type, margin, prodY);
      prodY += 8;
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(...TEXT_COLOR);
      
      products.forEach((product, idx) => {
        doc.setFont(undefined, 'bold');
        doc.text(`${idx + 1}. ${product.product_name} (${product.provider})`, margin + 5, prodY);
        prodY += 6;
        
        doc.setFont(undefined, 'normal');
        doc.text(`   Бенефициент: ${product.beneficiary_name}`, margin + 5, prodY);
        prodY += 5;
        doc.text(`   Месечна премия: ${product.monthly_premium.toFixed(2)} EUR`, margin + 5, prodY);
        prodY += 5;
        
        if (product.coverage_amount > 0) {
          doc.text(`   Покритие: ${product.coverage_amount.toLocaleString()} EUR`, margin + 5, prodY);
          prodY += 5;
        }
        
        if (product.expected_value > 0) {
          doc.text(`   Прогнозна стойност: ${product.expected_value.toLocaleString()} EUR`, margin + 5, prodY);
          prodY += 5;
        }
        
        prodY += 3;
      });
      
      prodY += 5;
    });

    // ==================== СТРАНИЦА 7: ФИНАНСОВИ ПОКАЗАТЕЛИ И БЕЛЕЖКИ ====================
    doc.addPage();
    
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('ФИНАНСОВИ ПОКАЗАТЕЛИ', margin, 30);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...TEXT_COLOR);
    
    let finY = 45;
    doc.text(`Трудов капитал (общо): ${laborCapital.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} EUR`, margin, finY);
    finY += 7;
    doc.text(`Месечен доход: ${plan.total_monthly_income.toFixed(2)} EUR`, margin, finY);
    finY += 7;
    doc.text(`Месечни разходи: ${plan.total_monthly_expenses.toFixed(2)} EUR`, margin, finY);
    finY += 7;
    doc.text(`Наличен баланс: ${plan.available_for_investment.toFixed(2)} EUR`, margin, finY);
    finY += 7;
    doc.text(`Данъчно облекчение (годишно): ${(monthlyDeposit * 12 * 0.1).toFixed(2)} EUR`, margin, finY);
    finY += 15;

    // Бележки
    if (plan.notes) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...PRIMARY_COLOR);
      doc.text('ДОПЪЛНИТЕЛНИ БЕЛЕЖКИ', margin, finY);
      finY += 10;
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(...TEXT_COLOR);
      
      const noteLines = plan.notes.split('\n');
      noteLines.forEach(line => {
        if (line.trim()) {
          if (finY > 270) {
            doc.addPage();
            finY = 30;
          }
          const wrappedLines = doc.splitTextToSize(line, pageWidth - 2 * margin);
          doc.text(wrappedLines, margin, finY);
          finY += wrappedLines.length * 5;
        }
      });
    }

    // Footer на всички страници
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('Този документ е генериран автоматично.', margin, pageHeight - 10);
      doc.text(`Страница ${i} от ${totalPages}`, pageWidth - margin - 30, pageHeight - 10);
    }

    // Generate PDF as base64
    const pdfBase64 = doc.output('dataurlstring').split(',')[1];

    return Response.json({
      success: true,
      pdf_base64: pdfBase64,
      filename: `financial_plan_${plan_id}_${Date.now()}.pdf`
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});
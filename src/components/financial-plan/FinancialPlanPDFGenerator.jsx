import { jsPDF } from 'jspdf';

export const generateFinancialPlanPDF = (planData, clientData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors (RGB)
  const primaryBlue = [37, 99, 235]; // blue-600
  const secondaryIndigo = [99, 102, 241]; // indigo-500
  const accentGreen = [34, 197, 94]; // green-500
  const textDark = [15, 23, 42]; // slate-900
  const textGray = [100, 116, 139]; // slate-500
  
  let yPos = 20;

  // Helper function to add gradient header (simulated with rectangles)
  const addGradientHeader = () => {
    doc.setFillColor(...primaryBlue);
    doc.rect(0, 0, pageWidth / 2, 60, 'F');
    doc.setFillColor(...secondaryIndigo);
    doc.rect(pageWidth / 2, 0, pageWidth / 2, 60, 'F');
  };

  // Page 1 - Cover
  addGradientHeader();
  
  // Logo/Icon placeholder
  doc.setFillColor(255, 255, 255);
  doc.circle(30, 30, 8, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont(undefined, 'bold');
  doc.text('Персонализиран', pageWidth / 2, 85, { align: 'center' });
  doc.text('Финансов план', pageWidth / 2, 100, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('Вашият път към финансова свобода', pageWidth / 2, 115, { align: 'center' });
  
  // Client info
  doc.setTextColor(...textDark);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  yPos = 140;
  doc.text('Подготвен за:', pageWidth / 2, yPos, { align: 'center' });
  
  doc.setFontSize(18);
  yPos += 10;
  doc.text(`${clientData.name || 'Клиент'}`, pageWidth / 2, yPos, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...textGray);
  yPos += 8;
  if (clientData.age) {
    doc.text(`${clientData.age} години`, pageWidth / 2, yPos, { align: 'center' });
  }
  
  // Date
  yPos = 170;
  doc.setFontSize(10);
  doc.text(`Дата: ${new Date().toLocaleDateString('bg-BG')}`, pageWidth / 2, yPos, { align: 'center' });
  doc.text(`Валидност: 30 дни`, pageWidth / 2, yPos + 6, { align: 'center' });
  
  // Guarantees box
  yPos = 200;
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(15, yPos, pageWidth - 30, 60, 3, 3, 'F');
  
  doc.setTextColor(...primaryBlue);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('🛡️ Вашите гаранции', 20, yPos + 10);
  
  doc.setTextColor(...textDark);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  const guarantees = [
    '✓ 20 дни за канселиране с пълно възстановяване',
    '✓ Данъчно облекчение до 10% годишно',
    '✓ 24/7 Customer Support винаги на линия',
    '✓ Личен консултант - среща в рамките на 3 работни дни'
  ];
  
  guarantees.forEach((g, idx) => {
    doc.text(g, 25, yPos + 20 + (idx * 7));
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...textGray);
  doc.text('APEX Financial - Независими финансови консултанти', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Page 2 - Investment Summary
  doc.addPage();
  yPos = 20;
  
  // Header
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Инвестиционен план', 20, 25);
  
  yPos = 55;
  
  // Main price box
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'F');
  
  doc.setTextColor(...textGray);
  doc.setFontSize(9);
  doc.text('Инвестиция от само', pageWidth / 2, yPos + 8, { align: 'center' });
  
  doc.setTextColor(...primaryBlue);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text(`${planData.total_monthly_premium?.toFixed(0) || '0'} лв/месец`, pageWidth / 2, yPos + 20, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...textGray);
  doc.text(`или ${planData.calculations?.dailyCostInsurance || '0'} лв/ден`, pageWidth / 2, yPos + 28, { align: 'center' });
  
  yPos += 45;
  
  // Products list
  doc.setTextColor(...textDark);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Включени продукти:', 20, yPos);
  yPos += 10;
  
  if (planData.products && planData.products.length > 0) {
    planData.products.forEach((product, idx) => {
      // Product box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, yPos, pageWidth - 30, 20, 2, 2, 'F');
      
      // Check icon
      doc.setFillColor(...accentGreen);
      doc.circle(22, yPos + 10, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('✓', 22, yPos + 11, { align: 'center' });
      
      // Product name
      doc.setTextColor(...textDark);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(product.name, 30, yPos + 8);
      
      // Benefit
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(...textGray);
      doc.text(product.benefit, 30, yPos + 14);
      
      // Price
      doc.setTextColor(...primaryBlue);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      const priceText = product.monthlyPremium === 0 ? 'БЕЗПЛАТНО' : `${product.monthlyPremium.toFixed(0)} лв/мес`;
      doc.text(priceText, pageWidth - 20, yPos + 10, { align: 'right' });
      
      yPos += 25;
      
      // Add new page if needed
      if (yPos > 250 && idx < planData.products.length - 1) {
        doc.addPage();
        yPos = 20;
      }
    });
  }
  
  // Page 3 - Financial Impact
  doc.addPage();
  yPos = 20;
  
  // Header
  doc.setFillColor(...secondaryIndigo);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Финансов ефект', 20, 25);
  
  yPos = 55;
  
  // Key metrics in grid
  const metrics = [
    {
      icon: '🛡️',
      label: 'Защитен трудов капитал',
      value: `${((planData.calculations?.laborCapital || 0) / 1000000).toFixed(1)}M лв`,
      subtitle: 'Вашият бъдещ доход защитен',
      color: [59, 130, 246] // blue
    },
    {
      icon: '📈',
      label: 'Данъчно облекчение',
      value: `${(planData.calculations?.totalTaxRelief || 0).toLocaleString()} лв`,
      subtitle: `Спестени данъци за ${clientData.yearsToRetirement || 0} години`,
      color: [34, 197, 94] // green
    },
    {
      icon: '✨',
      label: 'Прогнозна стойност',
      value: `${((planData.calculations?.projectedValue || 0) / 1000000).toFixed(1)}M лв`,
      subtitle: `При пенсиониране (${clientData.retirementAge || 65} години)`,
      color: [168, 85, 247] // purple
    },
    {
      icon: '💰',
      label: 'Резерв след план',
      value: `${(planData.calculations?.reserveMonths || 0).toFixed(1)} мес`,
      subtitle: `${(planData.calculations?.reserveAfterPlan || 0).toLocaleString()} лв наличност`,
      color: [245, 158, 11] // amber
    }
  ];
  
  metrics.forEach((metric, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 15 + col * (pageWidth / 2 - 5);
    const y = yPos + row * 45;
    
    // Box
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(x, y, (pageWidth / 2 - 20), 40, 3, 3, 'F');
    
    // Icon & Label
    doc.setFontSize(16);
    doc.text(metric.icon, x + 5, y + 12);
    
    doc.setTextColor(...textGray);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(metric.label, x + 15, y + 10);
    
    // Value
    doc.setTextColor(...metric.color);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(metric.value, x + 15, y + 22);
    
    // Subtitle
    doc.setTextColor(...textGray);
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.text(metric.subtitle, x + 15, y + 30);
  });
  
  yPos += 100;
  
  // Payment frequency info
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, 'F');
  
  doc.setTextColor(...textDark);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Препоръчителна периодичност на плащане:', 20, yPos + 10);
  
  doc.setTextColor(...accentGreen);
  doc.setFontSize(12);
  const frequencyText = 
    planData.payment_frequency === 'annual' ? 'Годишна' :
    planData.payment_frequency === 'semiannual' ? 'Полугодишна' :
    planData.payment_frequency === 'quarterly' ? 'Тримесечна' : 'Месечна';
  doc.text(frequencyText, 20, yPos + 20);
  
  yPos += 35;
  
  // Important notes
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(15, yPos, pageWidth - 30, 30, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(180, 83, 9);
  doc.setFont(undefined, 'bold');
  doc.text('⚠️ Важно:', 20, yPos + 10);
  
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('Този план важи 30 дни. Пазарните условия се променят.', 20, yPos + 18);
  doc.text('Запазете вашите условия днес.', 20, yPos + 24);
  
  // Page 4 - Guarantees & Next Steps
  doc.addPage();
  yPos = 20;
  
  // Dark header for guarantees
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('🛡️ Вашите гаранции', 20, 30);
  
  yPos = 65;
  
  const guaranteesList = [
    {
      title: '20 дни за канселиране',
      desc: 'Пълно възстановяване без въпроси'
    },
    {
      title: 'Данъчно облекчение',
      desc: 'До 10% годишно спестяване'
    },
    {
      title: '24/7 Customer Support',
      desc: 'Винаги на линия за вас'
    },
    {
      title: 'Личен консултант',
      desc: 'Среща в рамките на 3 работни дни'
    }
  ];
  
  guaranteesList.forEach((guarantee, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 15 + col * (pageWidth / 2 - 5);
    const y = yPos + row * 25;
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, (pageWidth / 2 - 20), 20, 2, 2, 'F');
    
    doc.setTextColor(...accentGreen);
    doc.setFontSize(8);
    doc.text('✓', x + 5, y + 10);
    
    doc.setTextColor(...textDark);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(guarantee.title, x + 10, y + 8);
    
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...textGray);
    doc.text(guarantee.desc, x + 10, y + 14);
  });
  
  yPos += 60;
  
  // Social proof
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(15, yPos, pageWidth - 30, 40, 3, 3, 'F');
  
  doc.setTextColor(...textDark);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Защо клиентите ни избират:', 20, yPos + 12);
  
  const stats = [
    { value: '500+', label: 'Доволни клиенти' },
    { value: '15+ год', label: 'Опит в бранша' },
    { value: '98%', label: 'Препоръки' },
    { value: '50M+ лв', label: 'Защитен капитал' }
  ];
  
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  const statsY = yPos + 22;
  stats.forEach((stat, idx) => {
    const statX = 20 + idx * 42;
    doc.setTextColor(...primaryBlue);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(stat.value, statX, statsY);
    
    doc.setTextColor(...textGray);
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.text(stat.label, statX, statsY + 6);
  });
  
  yPos += 50;
  
  // Next steps
  doc.setTextColor(...textDark);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Следващи стъпки:', 20, yPos);
  yPos += 10;
  
  const steps = [
    'Свържете се с вашия личен консултант',
    'Насрочете среща на удобно за вас време',
    'Получете детайлна презентация на плана',
    'Започнете инвестициите и защитете бъдещето си'
  ];
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...textDark);
  steps.forEach((step, idx) => {
    doc.setFillColor(...primaryBlue);
    doc.circle(22, yPos + 5 + idx * 10, 2, 'F');
    doc.text(`${idx + 1}. ${step}`, 28, yPos + 7 + idx * 10);
  });
  
  yPos += 50;
  
  // Contact CTA
  doc.setFillColor(...primaryBlue);
  doc.roundedRect(15, yPos, pageWidth - 30, 30, 5, 5, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('📞 Запазете среща с консултант', pageWidth / 2, yPos + 12, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('Телефон: +359 2 123 4567 | Email: info@apex-financial.bg', pageWidth / 2, yPos + 22, { align: 'center' });
  
  // Footer on all pages
  for (let i = 1; i <= doc.getNumberOfPages(); i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...textGray);
    doc.text(`Страница ${i} от ${doc.getNumberOfPages()}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
  }
  
  return doc;
};

export const downloadFinancialPlanPDF = (planData, clientData) => {
  const doc = generateFinancialPlanPDF(planData, clientData);
  const fileName = `Финансов_План_${clientData.name?.replace(/\s+/g, '_') || 'Клиент'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
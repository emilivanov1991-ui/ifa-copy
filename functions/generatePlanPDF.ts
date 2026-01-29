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

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // Helper function to add text with wrapping
    const addText = (text, fontSize = 10, isBold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont(undefined, isBold ? 'bold' : 'normal');
      
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      doc.text(lines, margin, y);
      y += lines.length * (fontSize * 0.5) + 5;
    };

    // Title
    addText('ФИНАНСОВ ПЛАН', 18, true);
    y += 5;

    // Client info
    addText(`Клиент: ${analysis.client_first_name} ${analysis.client_last_name}`, 12, true);
    addText(`Възраст: ${analysis.client_age} години`);
    addText(`Дата на плана: ${new Date(plan.created_date).toLocaleDateString('bg-BG')}`);
    addText(`Валиден до: ${new Date(plan.valid_until).toLocaleDateString('bg-BG')}`);
    y += 5;

    // Summary
    addText('ОБОБЩЕНИЕ', 14, true);
    addText(`Обща месечна премия: ${plan.total_monthly_premium.toFixed(2)} EUR`);
    addText(`Брой продукти: ${plan.products?.length || 0}`);
    addText(`Общо покритие: ${plan.total_coverage.toLocaleString()} EUR`);
    y += 10;

    // Products
    addText('ПРОДУКТИ В ПЛАНА', 14, true);
    
    // Group products by type
    const productTypes = {
      'ul_investment': 'Инвестиции и спестявания',
      'health_insurance': 'Здравни застраховки',
      'pension_plan': 'Пенсионно осигуряване',
      'insurance': 'Застраховки',
      'property_insurance': 'Имотни застраховки',
      'car_insurance': 'Автомобилни застраховки',
      'investment': 'Инвестиции',
      'term_life': 'Застраховки живот'
    };

    const grouped = {};
    (plan.products || []).forEach(product => {
      const type = product.product_type;
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(product);
    });

    Object.entries(grouped).forEach(([type, products]) => {
      y += 5;
      addText(productTypes[type] || type, 12, true);
      
      products.forEach((product, idx) => {
        addText(`${idx + 1}. ${product.product_name} (${product.provider})`, 10, true);
        addText(`   Бенефициент: ${product.beneficiary_name}`);
        addText(`   Месечна премия: ${product.monthly_premium.toFixed(2)} EUR`);
        
        if (product.coverage_amount > 0) {
          addText(`   Покритие: ${product.coverage_amount.toLocaleString()} EUR`);
        }
        
        if (product.expected_value > 0) {
          addText(`   Прогнозна стойност: ${product.expected_value.toLocaleString()} EUR`);
        }
        
        y += 3;
      });
    });

    // Financial calculations
    if (y > 200) {
      doc.addPage();
      y = 20;
    }
    
    y += 10;
    addText('ФИНАНСОВИ ПОКАЗАТЕЛИ', 14, true);
    addText(`Общ трудов капитал: ${(plan.protection_need_p1 * 2 + plan.protection_need_p2 * 2).toLocaleString()} EUR`);
    addText(`Месечен доход: ${plan.total_monthly_income.toFixed(2)} EUR`);
    addText(`Месечни разходи: ${plan.total_monthly_expenses.toFixed(2)} EUR`);
    addText(`Наличен баланс: ${plan.available_for_investment.toFixed(2)} EUR`);

    // Notes section
    if (plan.notes) {
      if (y > 200) {
        doc.addPage();
        y = 20;
      }
      
      y += 10;
      addText('ДОПЪЛНИТЕЛНИ БЕЛЕЖКИ', 14, true);
      
      // Parse notes and add them
      const noteLines = plan.notes.split('\n');
      noteLines.forEach(line => {
        if (line.trim()) {
          addText(line);
        }
      });
    }

    // Footer on last page
    y = 280;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Този документ е генериран автоматично от системата за финансово планиране.', margin, y);
    doc.text(`Страница ${doc.internal.getNumberOfPages()}`, pageWidth - margin - 20, y);

    // Generate PDF as base64
    const pdfBase64 = doc.output('dataurlstring').split(',')[1];

    return Response.json({
      success: true,
      pdf_base64: pdfBase64,
      filename: `plan_${plan_id}_${Date.now()}.pdf`
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

// Product type templates configuration
const PRODUCT_TEMPLATES = {
  term_life: {
    title: 'Заявление за Срочна Застраховка Живот',
    sections: ['personal', 'coverage', 'beneficiaries', 'health', 'payment', 'declarations']
  },
  ul_investment: {
    title: 'Заявление за Unit Linked Инвестиция',
    sections: ['personal', 'investment', 'fund_allocation', 'coverage', 'beneficiaries', 'payment', 'declarations']
  },
  education_plan: {
    title: 'Заявление за Образователен План',
    sections: ['personal', 'child_info', 'investment', 'fund_allocation', 'beneficiaries', 'payment', 'declarations']
  },
  health_insurance: {
    title: 'Заявление за Здравна Застраховка',
    sections: ['personal', 'health_coverage', 'health', 'payment', 'declarations']
  },
  critical_illness: {
    title: 'Заявление за Застраховка Критични Заболявания',
    sections: ['personal', 'coverage', 'health', 'beneficiaries', 'payment', 'declarations']
  },
  pension_plan: {
    title: 'Заявление за Пенсионен План',
    sections: ['personal', 'pension_options', 'investment', 'beneficiaries', 'payment', 'declarations']
  },
  personal_accident: {
    title: 'Заявление за Застраховка Злополука',
    sections: ['personal', 'coverage', 'occupation', 'beneficiaries', 'payment', 'declarations']
  },
  property_insurance: {
    title: 'Заявление за Имуществена Застраховка',
    sections: ['personal', 'property_details', 'coverage', 'payment', 'declarations']
  },
  partners_regular: {
    title: 'Заявление за Partners Регулярна Инвестиция',
    sections: ['personal', 'investment', 'fund_allocation', 'payment', 'declarations']
  },
  partners_single: {
    title: 'Заявление за Partners Еднократна Инвестиция',
    sections: ['personal', 'investment', 'fund_allocation', 'payment', 'declarations']
  }
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('bg-BG');
};

const formatCurrency = (amount, currency = 'EUR') => {
  if (!amount) return '0.00 ' + currency;
  return new Intl.NumberFormat('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + ' ' + currency;
};

// Generate HTML content for PDF
const generatePDFContent = (application, analysis, template) => {
  const styles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 11px; line-height: 1.4; color: #1e293b; }
      .page { padding: 40px; max-width: 210mm; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
      .logo { font-size: 24px; font-weight: bold; color: #1e40af; }
      .title { font-size: 16px; font-weight: bold; margin-top: 10px; }
      .subtitle { font-size: 12px; color: #64748b; margin-top: 5px; }
      .app-number { background: #eff6ff; padding: 8px 16px; border-radius: 4px; display: inline-block; margin-top: 10px; }
      .section { margin-bottom: 20px; }
      .section-title { font-size: 13px; font-weight: bold; color: #1e40af; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
      .row { display: flex; margin-bottom: 8px; }
      .label { width: 180px; font-weight: 500; color: #64748b; }
      .value { flex: 1; color: #1e293b; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      .box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
      .box-title { font-weight: bold; margin-bottom: 10px; color: #1e40af; }
      .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 3px; }
      .amount { font-size: 14px; font-weight: bold; color: #059669; }
      .signature-area { margin-top: 40px; display: flex; justify-content: space-between; }
      .signature-box { width: 200px; text-align: center; }
      .signature-line { border-top: 1px solid #1e293b; margin-top: 60px; padding-top: 5px; }
      .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; text-align: center; }
      .declaration { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px; font-size: 10px; }
      .checkbox { display: inline-block; width: 14px; height: 14px; border: 1px solid #64748b; margin-right: 8px; vertical-align: middle; }
      .checked { background: #3b82f6; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; }
      th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
      th { background: #f1f5f9; font-weight: 600; }
    </style>
  `;

  const header = `
    <div class="header">
      <div class="logo">APEX Financial</div>
      <div class="title">${template.title}</div>
      <div class="subtitle">${application.provider || ''} - ${application.product_name || ''}</div>
      <div class="app-number">Заявление № ${application.application_number || 'DRAFT'}</div>
    </div>
  `;

  // Personal Information Section
  const personalSection = `
    <div class="section">
      <div class="section-title">1. ЛИЧНИ ДАННИ НА ЗАСТРАХОВАНОТО ЛИЦЕ</div>
      <div class="grid-2">
        <div>
          <div class="row"><span class="label">Име:</span><span class="value">${analysis?.client_first_name || ''} ${analysis?.client_middle_name || ''} ${analysis?.client_last_name || ''}</span></div>
          <div class="row"><span class="label">ЕГН:</span><span class="value">${analysis?.client_egn || ''}</span></div>
          <div class="row"><span class="label">Дата на раждане:</span><span class="value">${formatDate(analysis?.client_birthdate)}</span></div>
          <div class="row"><span class="label">Пол:</span><span class="value">${analysis?.client_gender === 'male' ? 'Мъж' : 'Жена'}</span></div>
          <div class="row"><span class="label">Гражданство:</span><span class="value">${analysis?.client_nationality === 'bulgarian' ? 'Българско' : analysis?.client_nationality || ''}</span></div>
        </div>
        <div>
          <div class="row"><span class="label">Адрес:</span><span class="value">${analysis?.client_address || ''}</span></div>
          <div class="row"><span class="label">Телефон:</span><span class="value">${analysis?.client_phone || ''}</span></div>
          <div class="row"><span class="label">Email:</span><span class="value">${analysis?.client_email || ''}</span></div>
          <div class="row"><span class="label">Л.К. №:</span><span class="value">${analysis?.client_id_number || ''}</span></div>
          <div class="row"><span class="label">Валидна до:</span><span class="value">${formatDate(analysis?.client_id_valid_until)}</span></div>
        </div>
      </div>
    </div>
  `;

  // Employment Section
  const employmentSection = analysis?.client_is_employed ? `
    <div class="section">
      <div class="section-title">2. ДАННИ ЗА ЗАЕТОСТ</div>
      <div class="row"><span class="label">Работодател:</span><span class="value">${analysis?.client_employer_name || ''}</span></div>
      <div class="row"><span class="label">Длъжност:</span><span class="value">${analysis?.client_job_description || ''}</span></div>
      <div class="row"><span class="label">Адрес на работодател:</span><span class="value">${analysis?.client_employer_city || ''}, ${analysis?.client_employer_street || ''}</span></div>
      <div class="row"><span class="label">Вид договор:</span><span class="value">${analysis?.client_contract_type === 'labor' ? 'Трудов' : 'Граждански'}</span></div>
    </div>
  ` : '';

  // Coverage Section
  const coverageSection = `
    <div class="section">
      <div class="section-title">3. ПАРАМЕТРИ НА ЗАСТРАХОВКАТА</div>
      <div class="box">
        <table>
          <tr>
            <th>Параметър</th>
            <th>Стойност</th>
          </tr>
          <tr>
            <td>Продукт</td>
            <td><strong>${application.product_name || ''}</strong></td>
          </tr>
          <tr>
            <td>Доставчик</td>
            <td>${application.provider || ''}</td>
          </tr>
          <tr>
            <td>Застрахователна сума</td>
            <td class="amount">${formatCurrency(application.coverage_amount)}</td>
          </tr>
          <tr>
            <td>Срок</td>
            <td>${application.term_years || ''} години</td>
          </tr>
          <tr>
            <td>Месечна премия</td>
            <td class="amount">${formatCurrency(application.monthly_premium)}</td>
          </tr>
          <tr>
            <td>Годишна премия</td>
            <td class="amount">${formatCurrency(application.annual_premium)}</td>
          </tr>
        </table>
      </div>
    </div>
  `;

  // Payment Section
  const paymentSection = `
    <div class="section">
      <div class="section-title">4. НАЧИН НА ПЛАЩАНЕ</div>
      <div class="row"><span class="label">Метод на плащане:</span><span class="value">${
        application.payment_method === 'card' ? 'Банкова карта' :
        application.payment_method === 'bank_transfer' ? 'Банков превод' : 'Директен дебит'
      }</span></div>
      <div class="row"><span class="label">Периодичност:</span><span class="value">${
        application.payment_frequency === 'monthly' ? 'Месечно' :
        application.payment_frequency === 'quarterly' ? 'Тримесечно' :
        application.payment_frequency === 'semiannual' ? 'Шестмесечно' : 'Годишно'
      }</span></div>
    </div>
  `;

  // Declarations Section
  const declarationsSection = `
    <div class="section">
      <div class="section-title">5. ДЕКЛАРАЦИИ</div>
      <div class="declaration">
        <div><span class="checkbox ${analysis?.gdpr_consent_a ? 'checked' : ''}"></span> Съгласен/а съм личните ми данни да бъдат обработвани за целите на застраховането.</div>
      </div>
      <div class="declaration">
        <div><span class="checkbox ${analysis?.gdpr_consent_b ? 'checked' : ''}"></span> Декларирам, че предоставената информация е вярна и точна.</div>
      </div>
      <div class="declaration">
        <div><span class="checkbox"></span> Запознат/а съм с Общите условия на застраховката и ги приемам.</div>
      </div>
      <div class="declaration">
        <div><span class="checkbox"></span> Декларирам, че не съм политически значима личност (ПЗЛ).</div>
      </div>
    </div>
  `;

  // Signature Section
  const signatureSection = `
    <div class="signature-area">
      <div class="signature-box">
        <div class="signature-line">Подпис на застрахования</div>
      </div>
      <div class="signature-box">
        <div class="signature-line">Дата</div>
      </div>
      <div class="signature-box">
        <div class="signature-line">Подпис на консултант</div>
      </div>
    </div>
  `;

  // Footer
  const footer = `
    <div class="footer">
      <p>Документът е генериран автоматично от APEX Financial System на ${formatDate(new Date())}</p>
      <p>Заявление № ${application.application_number || 'DRAFT'} | ${application.provider || ''} | ${application.product_name || ''}</p>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html lang="bg">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${styles}
    </head>
    <body>
      <div class="page">
        ${header}
        ${personalSection}
        ${employmentSection}
        ${coverageSection}
        ${paymentSection}
        ${declarationsSection}
        ${signatureSection}
        ${footer}
      </div>
    </body>
    </html>
  `;
};

export async function generateApplicationPDF(application, analysis) {
  const template = PRODUCT_TEMPLATES[application.product_type] || PRODUCT_TEMPLATES.term_life;
  const htmlContent = generatePDFContent(application, analysis, template);
  
  // Create a Blob from HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const file = new File([blob], `application_${application.application_number || 'draft'}.html`, { type: 'text/html' });
  
  // Upload to storage
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  
  // Update application with PDF URL
  if (application.id) {
    await base44.entities.ClientApplication.update(application.id, {
      application_pdf_url: file_url
    });
  }
  
  return file_url;
}

export default function ApplicationPDFGenerator({ application, analysis, onGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(application?.application_pdf_url || null);

  const handleGenerate = async () => {
    if (!application || !analysis) {
      toast.error('Липсват данни за генериране на заявление');
      return;
    }

    setIsGenerating(true);
    try {
      const url = await generateApplicationPDF(application, analysis);
      setPdfUrl(url);
      toast.success('Заявлението е генерирано успешно');
      onGenerated?.(url);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Грешка при генериране на заявление');
    } finally {
      setIsGenerating(false);
    }
  };

  const template = PRODUCT_TEMPLATES[application?.product_type] || PRODUCT_TEMPLATES.term_life;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium">{template.title}</h3>
            <p className="text-sm text-slate-500">
              {application?.provider} - {application?.product_name}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {pdfUrl && (
            <Button variant="outline" asChild className="gap-2">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4" />
                Изтегли
              </a>
            </Button>
          )}
          <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Генериране...
              </>
            ) : pdfUrl ? (
              <>
                <Check className="w-4 h-4" />
                Обнови PDF
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Генерирай PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {pdfUrl && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-800">
            PDF заявлението е генерирано и запазено успешно
          </span>
        </div>
      )}
    </div>
  );
}

export { PRODUCT_TEMPLATES };
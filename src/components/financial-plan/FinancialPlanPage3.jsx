import React, { useMemo } from 'react';
import { 
  EUR_BGN_RATE, 
  PROVIDER_LOGOS 
} from './FinancialPlanConstants';

/**
 * Финансов План - Страница 3
 * Структура на портфейла - динамична визуализация на избраните продукти
 */
export default function FinancialPlanPage3({ analysis, plan, productOffers = [] }) {
  
  const portfolioData = useMemo(() => {
    if (!analysis) return null;

    const clientName = analysis.client_first_name || 'Клиент';
    const partnerName = analysis.partner_first_name || 'Партньор';
    const includePartner = analysis.include_partner;
    const childrenCount = analysis.children_count || 0;

    // Дата на плана
    const planDate = new Date().toLocaleDateString('bg-BG', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });

    // Категоризиране на продуктите
    const categorizeProducts = () => {
      const categories = {
        // Горна част - Резерв, Други цели, Самоучастие
        reserve: { label: 'Резерв', value: 0, color: '#be123c' },
        otherGoals: { label: 'Други цели', value: 0, color: '#be123c' },
        downPayment: { label: 'Самоучастие', value: 0, color: '#be123c' },
        
        // Месечно спестяване (центрирано горе)
        monthlySavings: { 
          monthly: 0, 
          annual: 0 
        },

        // Настоящи продукти (СЕГА)
        currentProducts: [],
        
        // Бъдещи продукти (БЪДЕЩ)
        futureProducts: []
      };

      // Резерв от анализа
      const desiredMonths = analysis.desired_reserve_months || 6;
      const monthlyExpenses = (analysis.expense_rent || 0) + (analysis.expense_utilities || 0) +
                              (analysis.expense_food || 0) + (analysis.expense_fuel || 0) +
                              (analysis.expense_other || 0);
      categories.reserve.value = Math.round(monthlyExpenses * desiredMonths * EUR_BGN_RATE);

      // Други цели
      categories.otherGoals.value = Math.round(
        ((analysis.other_goals_car || 0) + (analysis.other_goals_vacation || 0) + 
         (analysis.other_goals_other || 0)) * EUR_BGN_RATE
      );

      // Самоучастие
      categories.downPayment.value = Math.round((analysis.available_cash || 0) * EUR_BGN_RATE);

      // Обработка на продуктовите оферти
      productOffers.forEach(offer => {
        const monthlyPremium = (offer.monthly_premium || 0) * EUR_BGN_RATE;
        const annualPremium = (offer.annual_premium || monthlyPremium * 12);
        const quarterlyPremium = annualPremium / 4;
        const semiAnnualPremium = annualPremium / 2;

        // Добавяме към месечното спестяване
        categories.monthlySavings.monthly += monthlyPremium;
        categories.monthlySavings.annual += annualPremium;

        // Определяме бенефициента
        let beneficiaryName = clientName;
        if (offer.beneficiary === 'partner2') beneficiaryName = partnerName;
        else if (offer.beneficiary?.startsWith('child')) {
          const childIndex = parseInt(offer.beneficiary.replace('child', '')) || 1;
          beneficiaryName = analysis[`child_${childIndex}_name`] || `Дете ${childIndex}`;
        } else if (offer.beneficiary_name) {
          beneficiaryName = offer.beneficiary_name;
        }

        // Определяме доставчика и логото
        const provider = offer.provider || 'MetLife';
        const logo = PROVIDER_LOGOS[provider] || null;

        // Определяме периодичността
        let frequency = 'Годишно';
        let displayAmount = annualPremium;
        if (offer.payment_frequency === 'monthly') {
          frequency = 'Месечно';
          displayAmount = monthlyPremium;
        } else if (offer.payment_frequency === 'quarterly') {
          frequency = 'Тримесечно';
          displayAmount = quarterlyPremium;
        } else if (offer.payment_frequency === 'semiannual') {
          frequency = 'Полугодишно';
          displayAmount = semiAnnualPremium;
        }

        // Определяме типа на продукта и етикета
        const productTypeLabels = {
          'term_life': 'Достойна пенсия и Подсигуряване на дохода',
          'ul_investment': 'Инвестиции',
          'ul_telemedicine': 'Телемедицина',
          'critical_illness': 'Лечение на критични заболявания',
          'health_insurance': 'Допълнително здравно осигуряване',
          'education_plan': 'Бъдеще и защита на детето',
          'ul_child_protection': 'Бъдеще и защита на детето',
          'pension_plan': 'Пенсионно осигуряване',
          'partners_regular': 'Инвестиции',
          'partners_single': 'Инвестиции (еднократна)',
          'property_insurance': 'Защита за Дома',
          'car_insurance': 'Каско',
          'car_liability': 'Гражданска отговорност'
        };

        const productLabel = productTypeLabels[offer.product_type] || offer.product_name || 'Финансов продукт';

        // Допълнителни лога за инвестиционни продукти
        const investmentLogos = [];
        if (offer.product_type === 'ul_investment' || offer.product_type === 'partners_regular' || offer.product_type === 'partners_single') {
          investmentLogos.push('iShares', 'LYXOR');
        }

        // Определяме дали е настоящ или бъдещ продукт
        const isFuture = offer.start_date && new Date(offer.start_date) > new Date();
        const startAfterYears = offer.start_after_years || 0;

        const productData = {
          id: offer.id,
          beneficiary: beneficiaryName,
          label: productLabel,
          provider,
          logo,
          investmentLogos,
          frequency,
          monthlyAmount: monthlyPremium,
          annualAmount: annualPremium,
          displayAmount,
          productType: offer.product_type,
          strategy: offer.strategy,
          entryFee: offer.entry_fee,
          startAfterYears,
          isFuture: isFuture || startAfterYears > 0
        };

        if (productData.isFuture) {
          categories.futureProducts.push(productData);
        } else {
          categories.currentProducts.push(productData);
        }
      });

      // Групиране на продуктите по позиция
      const groupedProducts = {
        left: [], // Лява колона
        centerTop: [], // Център горе
        centerMiddle: [], // Център среда
        centerBottom: [], // Център долу
        right: [] // Дясна колона
      };

      // Разпределяме продуктите по позиция
      categories.currentProducts.forEach((product, idx) => {
        const beneficiary = product.beneficiary;
        const isClient = beneficiary === clientName;
        const isPartner = beneficiary === partnerName;
        const isChild = beneficiary.includes('Дете') || (!isClient && !isPartner);

        // Пенсионни и здравни - ляво за клиент
        if (isClient && (product.productType === 'pension_plan' || product.productType === 'health_insurance')) {
          groupedProducts.left.push(product);
        }
        // Term life и UL - център
        else if (product.productType === 'term_life' || product.productType === 'ul_investment') {
          if (isClient) {
            groupedProducts.centerTop.push(product);
          } else if (isPartner) {
            groupedProducts.centerTop.push(product);
          }
        }
        // Критични болести и деца - център долу
        else if (product.productType === 'critical_illness' || product.productType === 'education_plan' || product.productType === 'ul_child_protection') {
          groupedProducts.centerBottom.push(product);
        }
        // Имуществени - дясно
        else if (product.productType === 'property_insurance' || product.productType === 'car_insurance') {
          groupedProducts.right.push(product);
        }
        // Инвестиции Partners - ляво долу
        else if (product.productType === 'partners_regular' || product.productType === 'partners_single') {
          groupedProducts.left.push(product);
        }
        // Здравни за партньор - дясно
        else if (isPartner && product.productType === 'health_insurance') {
          groupedProducts.right.push(product);
        }
        // Останалите
        else {
          if (isClient) groupedProducts.left.push(product);
          else if (isPartner) groupedProducts.right.push(product);
          else groupedProducts.centerMiddle.push(product);
        }
      });

      return {
        ...categories,
        groupedProducts,
        clientName,
        partnerName,
        planDate
      };
    };

    return categorizeProducts();
  }, [analysis, plan, productOffers]);

  if (!portfolioData) {
    return <div className="p-8 text-center text-slate-500">Няма данни за анализ</div>;
  }

  const formatCurrency = (value) => {
    return Math.round(value).toLocaleString('bg-BG') + ' лв.';
  };

  const formatCurrencyShort = (value) => {
    return Math.round(value).toLocaleString('bg-BG');
  };

  // Компонент за продуктова карта
  const ProductCard = ({ product, position = 'center' }) => {
    const bgColor = product.isFuture ? 'bg-slate-100' : 'bg-white';
    const borderColor = product.isFuture ? 'border-slate-300 border-dashed' : 'border-red-200';
    
    return (
      <div className={`${bgColor} border ${borderColor} rounded-lg p-3 shadow-sm text-xs relative`}>
        {/* Frequency badge */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-red-700 text-white px-2 py-0.5 rounded text-[10px] font-medium">
          {product.frequency}
        </div>

        {/* Provider Logo */}
        {product.logo && (
          <div className="flex justify-center mb-2 mt-1">
            <img 
              src={product.logo} 
              alt={product.provider} 
              className="h-6 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}
        
        {/* Product Info */}
        <div className="text-center">
          <div className="font-semibold text-red-800">{product.beneficiary}</div>
          <div className="text-slate-600 text-[10px] leading-tight">{product.label}</div>
          <div className="mt-1 font-bold">
            {formatCurrencyShort(product.monthlyAmount)} лв. на месец
          </div>
          <div className="text-slate-500 text-[9px]">
            ( {formatCurrencyShort(product.annualAmount)} лв. на година )
          </div>
        </div>

        {/* Investment Logos */}
        {product.investmentLogos && product.investmentLogos.length > 0 && (
          <div className="flex justify-center gap-1 mt-2 opacity-60">
            {product.investmentLogos.map((logo, idx) => (
              <img 
                key={idx}
                src={PROVIDER_LOGOS[logo]} 
                alt={logo} 
                className="h-3"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ))}
          </div>
        )}

        {/* Strategy & Entry Fee for investments */}
        {(product.productType === 'partners_regular' || product.productType === 'partners_single') && (
          <div className="mt-1 text-[9px] text-slate-500 text-center">
            {product.strategy && <div>Strategy: {product.strategy}</div>}
            {product.entryFee && <div>Начална такса: {(product.entryFee * 100).toFixed(1)}%</div>}
          </div>
        )}

        {/* Future indicator */}
        {product.isFuture && product.startAfterYears > 0 && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-500 text-white px-2 py-0.5 rounded text-[9px]">
            След {product.startAfterYears} г.
          </div>
        )}
      </div>
    );
  };

  // Компонент за стрелка
  const Arrow = ({ direction = 'down', color = '#be123c' }) => {
    const rotations = {
      up: 'rotate-180',
      down: '',
      left: 'rotate-90',
      right: '-rotate-90'
    };
    
    return (
      <div className={`flex justify-center ${rotations[direction]}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
          <path d="M12 16l-6-6h12l-6 6z"/>
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-white p-4 min-h-[900px] relative font-sans text-xs overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-red-800 font-bold text-lg">СТРУКТУРА НА ПОРТФЕЙЛА</h1>
        <div className="text-right text-slate-600 text-[10px]">
          към {portfolioData.planDate}
        </div>
      </div>

      {/* Top Section - Reserve, Goals, Down Payment */}
      <div className="flex justify-between items-start mb-6">
        {/* Left - Reserve circles */}
        <div className="flex flex-col gap-2">
          <div className="bg-red-700 text-white rounded-full w-20 h-20 flex flex-col items-center justify-center text-center p-1">
            <span className="text-[9px]">Резерв</span>
            <span className="font-bold text-[10px]">{formatCurrency(portfolioData.reserve.value)}</span>
          </div>
          <div className="bg-red-700 text-white rounded-full w-20 h-20 flex flex-col items-center justify-center text-center p-1">
            <span className="text-[9px]">Други цели</span>
            <span className="font-bold text-[10px]">{formatCurrency(portfolioData.otherGoals.value)}</span>
          </div>
          <div className="bg-red-700 text-white rounded-full w-20 h-20 flex flex-col items-center justify-center text-center p-1">
            <span className="text-[9px]">Самоучастие</span>
            <span className="font-bold text-[10px]">{formatCurrency(portfolioData.downPayment.value)}</span>
          </div>
        </div>

        {/* Center - Monthly Savings */}
        <div className="flex-1 flex flex-col items-center">
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-full px-8 py-4 text-center">
            <div className="text-2xl font-bold text-red-800">
              {formatCurrency(portfolioData.monthlySavings.monthly)}
            </div>
            <div className="text-red-600 text-sm">Ежемесечно спестяване</div>
            <div className="text-slate-600 text-xs">
              {formatCurrency(portfolioData.monthlySavings.annual)} на година
            </div>
          </div>
          
          <Arrow direction="down" />
        </div>

        {/* Right - Property placeholder */}
        <div className="w-32">
          {portfolioData.groupedProducts.right.filter(p => p.productType === 'property_insurance').map((product, idx) => (
            <ProductCard key={idx} product={product} />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-4 gap-4">
        {/* Left Column - Pension, Health, Investments */}
        <div className="space-y-4">
          {/* Pension products */}
          {portfolioData.groupedProducts.left.filter(p => p.productType === 'pension_plan').map((product, idx) => (
            <div key={`pension-${idx}`}>
              <ProductCard product={product} />
              <Arrow direction="down" />
            </div>
          ))}
          
          {/* Health products */}
          {portfolioData.groupedProducts.left.filter(p => p.productType === 'health_insurance').map((product, idx) => (
            <div key={`health-${idx}`}>
              <ProductCard product={product} />
            </div>
          ))}

          {/* Partners Investments */}
          {portfolioData.groupedProducts.left.filter(p => p.productType === 'partners_regular' || p.productType === 'partners_single').map((product, idx) => (
            <div key={`inv-${idx}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Center Columns - Main products (Client and Partner) */}
        <div className="col-span-2 space-y-4">
          {/* Term Life / UL for Client and Partner */}
          <div className="grid grid-cols-2 gap-4">
            {portfolioData.groupedProducts.centerTop.map((product, idx) => (
              <div key={`center-top-${idx}`}>
                <ProductCard product={product} />
                <Arrow direction="down" />
              </div>
            ))}
          </div>

          {/* Critical Illness and Children */}
          <div className="grid grid-cols-2 gap-4">
            {portfolioData.groupedProducts.centerBottom.map((product, idx) => (
              <div key={`center-bottom-${idx}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Center Middle - additional products */}
          {portfolioData.groupedProducts.centerMiddle.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {portfolioData.groupedProducts.centerMiddle.map((product, idx) => (
                <div key={`center-middle-${idx}`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Partner health, Property */}
        <div className="space-y-4">
          {portfolioData.groupedProducts.right.filter(p => p.productType !== 'property_insurance').map((product, idx) => (
            <div key={`right-${idx}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Future Products Section */}
      {portfolioData.futureProducts.length > 0 && (
        <div className="mt-8 border-t-2 border-dashed border-slate-300 pt-4">
          <h3 className="text-slate-600 font-semibold mb-3">Бъдещи продукти</h3>
          <div className="grid grid-cols-4 gap-4">
            {portfolioData.futureProducts.map((product, idx) => (
              <ProductCard key={`future-${idx}`} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 text-[10px]">
        <div className="font-bold text-slate-700 mb-1">ЛЕГЕНДА</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-red-700 rounded"></div>
          <span>СЕГА</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-400 rounded border border-dashed border-slate-500"></div>
          <span>БЪДЕЩ</span>
        </div>
      </div>

      {/* Provider Logos Footer */}
      <div className="absolute bottom-4 right-4 flex gap-2 opacity-50">
        {Object.entries(PROVIDER_LOGOS).slice(0, 6).map(([name, url], idx) => (
          <img 
            key={idx}
            src={url} 
            alt={name} 
            className="h-4"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ))}
      </div>
    </div>
  );
}
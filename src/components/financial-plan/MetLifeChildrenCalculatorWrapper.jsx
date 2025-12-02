import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Baby, FileText, Download, Printer } from 'lucide-react';
import MetLifeChildULCalculator from './MetLifeChildULCalculator';
import MetLifeChildULOfferPDF from './MetLifeChildULOfferPDF';
import { generateMetLifeULProjection } from './FinancialPlanConstants';

export default function MetLifeChildrenCalculatorWrapper({ 
  childrenCount = 1, 
  childrenData = [],
  onSaveAll 
}) {
  const [activeTab, setActiveTab] = useState('child1');
  const [childOffers, setChildOffers] = useState({
    child1: { data: null, premium: null, projection: [] },
    child2: { data: null, premium: null, projection: [] },
    child3: { data: null, premium: null, projection: [] }
  });
  const [viewMode, setViewMode] = useState('calculator'); // 'calculator' | 'offer'

  const handleSaveChild = (childKey, formData, premiumBreakdown) => {
    // Generate projection for this child
    const projection = generateMetLifeULProjection({
      age: formData.childAge,
      annualPremium: formData.annualSavings,
      faceAmount: 0, // Children don't have life coverage
      strategy: 'balanced',
      isSinglePremium: false,
      maxYears: Math.min(40, 80 - formData.childAge),
      expectedReturn: premiumBreakdown.expectedReturn
    });

    // Add coverage data for PDF
    const pdfData = {
      ...formData,
      expectedReturn: premiumBreakdown.expectedReturn,
      fundAllocation: {
        globalStocks: formData.fundGlobalStocks,
        emergingMarkets: formData.fundEmergingMarkets,
        globalBonds: formData.fundBonds
      },
      coverages: {
        permanentDisability: formData.ptdCoverage,
        dailyHospital: formData.hospitalDaily,
        surgical: formData.surgicalBenefit,
        fractures: formData.fracturesCoverage,
        childProtection: premiumBreakdown.coverages.childProtection?.premium || 0
      }
    };

    // Recalculate premium breakdown with correct structure for PDF
    const pdfPremiumBreakdown = {
      ...premiumBreakdown,
      totalCoveragesPremium: Object.values(premiumBreakdown.coverages).reduce((sum, c) => sum + (c.premium || 0), 0),
      totalAnnualPremium: premiumBreakdown.annualPremium,
      semiAnnualPremium: premiumBreakdown.semiAnnualPremium,
      quarterlyPremium: premiumBreakdown.quarterlyPremium,
      coverages: {
        permanentDisability: premiumBreakdown.coverages.ptd || { premium: 0 },
        hospitalization: premiumBreakdown.coverages.hospitalDaily || { premium: 0 },
        surgical: premiumBreakdown.coverages.surgical || { premium: 0 },
        fractures: premiumBreakdown.coverages.fractures || { premium: 0 },
        childProtection: premiumBreakdown.coverages.childProtection || { premium: 0 }
      }
    };

    setChildOffers(prev => ({
      ...prev,
      [childKey]: { 
        data: pdfData, 
        premium: pdfPremiumBreakdown, 
        projection 
      }
    }));
  };

  const getChildLabel = (index) => {
    const names = ['Дете 1', 'Дете 2', 'Дете 3'];
    const childData = childrenData[index - 1];
    if (childData?.name) return childData.name;
    return names[index - 1];
  };

  const getInitialData = (index) => {
    const childData = childrenData[index - 1] || {};
    return {
      childName: childData.name || '',
      childAge: childData.age || 5,
      policyholderName: childData.policyholderName || '',
      policyholderAge: childData.policyholderAge || 35,
      annualSavings: childData.annualSavings || 1200
    };
  };

  const totalAnnualPremium = Object.values(childOffers)
    .filter(o => o.premium)
    .reduce((sum, o) => sum + (o.premium.totalAnnualPremium || 0), 0);

  const hasAnyOffer = Object.values(childOffers).some(o => o.data);

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'calculator' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calculator')}
          >
            <Baby className="w-4 h-4 mr-2" />
            Калкулатор
          </Button>
          <Button
            variant={viewMode === 'offer' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('offer')}
            disabled={!hasAnyOffer}
          >
            <FileText className="w-4 h-4 mr-2" />
            Преглед на офертата
          </Button>
        </div>

        {hasAnyOffer && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              Общо годишна премия: <span className="font-bold text-purple-700">{totalAnnualPremium.toFixed(2)} €</span>
            </span>
          </div>
        )}
      </div>

      {/* Children Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(childrenCount, 3)}, 1fr)` }}>
          {Array.from({ length: Math.min(childrenCount, 3) }, (_, i) => (
            <TabsTrigger 
              key={`child${i + 1}`} 
              value={`child${i + 1}`}
              className="flex items-center gap-2"
            >
              <Baby className="w-4 h-4" />
              {getChildLabel(i + 1)}
              {childOffers[`child${i + 1}`]?.premium && (
                <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                  ✓
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {Array.from({ length: Math.min(childrenCount, 3) }, (_, i) => {
          const childKey = `child${i + 1}`;
          const offer = childOffers[childKey];

          return (
            <TabsContent key={childKey} value={childKey} className="mt-6">
              {viewMode === 'calculator' ? (
                <MetLifeChildULCalculator
                  initialData={getInitialData(i + 1)}
                  onSave={(formData, premiumBreakdown) => handleSaveChild(childKey, formData, premiumBreakdown)}
                />
              ) : offer.data ? (
                <MetLifeChildULOfferPDF
                  data={offer.data}
                  premiumBreakdown={offer.premium}
                  projection={offer.projection}
                />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Baby className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">
                      Моля, първо попълнете калкулатора и запазете офертата за {getChildLabel(i + 1)}
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setViewMode('calculator')}
                    >
                      Към калкулатора
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Summary Card */}
      {hasAnyOffer && viewMode === 'calculator' && (
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Общо за всички деца</h3>
                <p className="text-purple-100 text-sm">
                  {Object.values(childOffers).filter(o => o.premium).length} от {Math.min(childrenCount, 3)} оферти готови
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{totalAnnualPremium.toFixed(2)} €</p>
                <p className="text-purple-100 text-sm">годишно</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
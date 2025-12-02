import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, UserPlus } from 'lucide-react';

import MetLifeTermLifeCalculator from './MetLifeTermLifeCalculator';
import MetLifeCareCalculator from './MetLifeCareCalculator';
import MetLifeULCalculator from './MetLifeULCalculator';
import MetLifeCarePDF from './MetLifeCarePDF';
import MetLifeTermLifeCarePDF from './MetLifeTermLifeCarePDF';

export default function MetLifeCalculatorWrapper({ 
  calculatorType = 'termLife', // 'termLife', 'care', 'ul', 'termLifeCare'
  analysis = null,
  plan = null,
  onSave
}) {
  const [activePersonTab, setActivePersonTab] = useState('client');
  const [showPDF, setShowPDF] = useState(false);
  
  // Client data
  const [clientData, setClientData] = useState(null);
  const [clientPremium, setClientPremium] = useState(null);
  
  // Partner data
  const [partnerData, setPartnerData] = useState(null);
  const [partnerPremium, setPartnerPremium] = useState(null);

  // Extract initial data from analysis
  const getInitialDataForPerson = (person) => {
    if (!analysis) return {};
    
    if (person === 'client') {
      return {
        clientName: `${analysis.client_first_name || ''} ${analysis.client_last_name || ''}`.trim(),
        age: plan?.partner1_age || calculateAge(analysis.client_birthdate) || 35,
        riskClass: 1
      };
    } else {
      return {
        clientName: `${analysis.partner_first_name || ''} ${analysis.partner_last_name || ''}`.trim(),
        age: plan?.partner2_age || calculateAge(analysis.partner_birthdate) || 35,
        riskClass: 1
      };
    }
  };

  const calculateAge = (birthdate) => {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const today = new Date();
    return Math.floor((today - birth) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const handleClientSave = (data, premium) => {
    setClientData(data);
    setClientPremium(premium);
    if (onSave) onSave('client', data, premium);
  };

  const handlePartnerSave = (data, premium) => {
    setPartnerData(data);
    setPartnerPremium(premium);
    if (onSave) onSave('partner', data, premium);
  };

  const hasPartner = analysis?.include_partner;

  // Render the appropriate calculator
  const renderCalculator = (person) => {
    const initialData = getInitialDataForPerson(person);
    const handleSave = person === 'client' ? handleClientSave : handlePartnerSave;

    switch (calculatorType) {
      case 'termLife':
        return (
          <MetLifeTermLifeCalculator 
            initialData={initialData}
            onSave={handleSave}
          />
        );
      case 'care':
        return (
          <MetLifeCareCalculator 
            initialData={initialData}
            onSave={handleSave}
          />
        );
      case 'ul':
        return (
          <MetLifeULCalculator 
            initialData={initialData}
            onSave={handleSave}
          />
        );
      case 'termLifeCare':
        return (
          <div className="space-y-6">
            <MetLifeTermLifeCalculator 
              initialData={initialData}
              onSave={(data, premium) => {
                if (person === 'client') {
                  setClientData(prev => ({ ...prev, termLife: data, termLifePremium: premium }));
                } else {
                  setPartnerData(prev => ({ ...prev, termLife: data, termLifePremium: premium }));
                }
              }}
            />
            <MetLifeCareCalculator 
              initialData={initialData}
              onSave={(data, premium) => {
                if (person === 'client') {
                  setClientData(prev => ({ ...prev, care: data, carePremium: premium }));
                } else {
                  setPartnerData(prev => ({ ...prev, care: data, carePremium: premium }));
                }
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Tab content for both persons
  const renderBothPersons = () => {
    return (
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Клиент: {analysis?.client_first_name} {analysis?.client_last_name}
          </h3>
          {renderCalculator('client')}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-violet-700 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Партньор: {analysis?.partner_first_name} {analysis?.partner_last_name}
          </h3>
          {renderCalculator('partner')}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Person Selector Tabs */}
      <Tabs value={activePersonTab} onValueChange={setActivePersonTab}>
        <TabsList className={`grid w-full ${hasPartner ? 'grid-cols-3' : 'grid-cols-1'}`}>
          <TabsTrigger value="client" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Клиент
            {analysis && (
              <span className="text-xs opacity-70">
                ({analysis.client_first_name})
              </span>
            )}
          </TabsTrigger>
          {hasPartner && (
            <>
              <TabsTrigger value="partner" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Партньор
                {analysis && (
                  <span className="text-xs opacity-70">
                    ({analysis.partner_first_name})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="both" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Двамата
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="client" className="mt-6">
          {renderCalculator('client')}
        </TabsContent>

        {hasPartner && (
          <>
            <TabsContent value="partner" className="mt-6">
              {renderCalculator('partner')}
            </TabsContent>
            <TabsContent value="both" className="mt-6">
              {renderBothPersons()}
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Combined Summary for Both */}
      {activePersonTab === 'both' && clientPremium && partnerPremium && (
        <Card className="bg-gradient-to-r from-blue-600 to-violet-600 text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-blue-200 text-sm">Клиент - годишно</p>
                <p className="text-2xl font-bold">
                  {(clientPremium.annualPremium || 0).toFixed(2)} €
                </p>
              </div>
              <div>
                <p className="text-violet-200 text-sm">Партньор - годишно</p>
                <p className="text-2xl font-bold">
                  {(partnerPremium.annualPremium || 0).toFixed(2)} €
                </p>
              </div>
              <div className="border-l border-white/30 pl-6">
                <p className="text-white/80 text-sm">ОБЩО годишно</p>
                <p className="text-3xl font-bold">
                  {((clientPremium.annualPremium || 0) + (partnerPremium.annualPremium || 0)).toFixed(2)} €
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
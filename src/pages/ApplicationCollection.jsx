import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import ApplicationCollectionForm from '@/components/application/ApplicationCollectionForm';
import JourneyCompletedScreen from '@/components/application/JourneyCompletedScreen';

/**
 * ApplicationCollection page
 * Route: /ApplicationCollection/:journeyId
 * Full application form with health questionnaire
 */
export default function ApplicationCollection() {
  const { journeyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [journey, setJourney] = useState(null);
  const [plan, setPlan] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [applicationId, setApplicationId] = useState(null);

  useEffect(() => {
    loadData();
  }, [journeyId]);

  const loadData = async () => {
    try {
      const [journeyData] = await base44.entities.Journey.filter({ id: journeyId });
      if (!journeyData) {
        navigate('/');
        return;
      }
      setJourney(journeyData);

      if (journeyData.plan_id) {
        const [planData] = await base44.entities.FinancialPlan.filter({ id: journeyData.plan_id });
        setPlan(planData);
      }

      if (journeyData.analysis_id) {
        const [analysisData] = await base44.entities.FinancialAnalysisSubmission.filter({ id: journeyData.analysis_id });
        setAnalysis(analysisData);
      }
    } catch (error) {
      console.error('Error loading application data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (appId) => {
    setApplicationId(appId);
    setCompleted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (completed) {
    return <JourneyCompletedScreen applicationId={applicationId} journeyId={journeyId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Завършване на кандидатурата
          </h1>
          <p className="text-slate-600">
            Моля, попълнете необходимата информация за вашите застрахователни продукти
          </p>
        </div>

        {/* Form */}
        <ApplicationCollectionForm
          journeyId={journeyId}
          planId={plan?.id}
          analysisData={analysis}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
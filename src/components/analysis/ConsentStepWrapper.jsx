import React from 'react';
import ConsentCaptureFlow from '@/components/consent/ConsentCaptureFlow';
import ConsentStep from '@/components/analysis/ConsentStep';

/**
 * ConsentStepWrapper
 * 
 * Wraps ConsentCaptureFlow for use inside DiscoveryShell (step 1).
 * Falls back to the classic ConsentStep if no journey/userId context is available.
 * 
 * DiscoveryShell passes: { data, onChange, showErrors, plannerData }
 * ConsentCaptureFlow needs: { journeyId, userId, language, onComplete }
 */
export default function ConsentStepWrapper({ data, onChange, showErrors, plannerData }) {
  const journeyId = plannerData?.journey_id || data?.journey_id || null;
  const userId = plannerData?.user_id || data?.user_id || null;
  const language = data?.language_code || plannerData?.language_code || 'bg';

  // If no journeyId — fall back to classic consent checkboxes
  if (!journeyId) {
    return <ConsentStep data={data} onChange={onChange} showErrors={showErrors} plannerData={plannerData} />;
  }

  const handleComplete = (newRecordIds) => {
    // Mark consents as given in formData so validateStep(1) passes
    onChange('gdpr_consent_a', true);
    onChange('gdpr_consent_c', true);
    onChange('consent_record_ids', newRecordIds);
  };

  return (
    <ConsentCaptureFlow
      journeyId={journeyId}
      userId={userId}
      language={language}
      onComplete={handleComplete}
    />
  );
}
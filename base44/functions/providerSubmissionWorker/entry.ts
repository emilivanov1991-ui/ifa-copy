import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Provider Submission Worker
 * Submits client applications to insurance providers.
 * 
 * Supports multiple submission methods:
 * - API_JSON: Direct API integration
 * - EMAIL: Send application via email
 * - SFTP: Upload to provider's SFTP server
 * - PORTAL_DOWNLOAD_ONLY: Provider downloads from portal
 * 
 * This function is called by scheduled automation every 5 minutes
 * to process pending submissions.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This is called by automation — no user auth needed
    // But we should verify it's called from a scheduled automation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Allow calls from Base44 service role
      console.log('Provider submission worker called without auth header');
    }

    // Fetch pending AND temporary_failure submissions (both need retrying)
    const now = new Date();
    const [pendingBatch, retryBatch] = await Promise.all([
      base44.asServiceRole.entities.ProviderSubmission.filter({ status: 'pending' }, '-created_date', 50),
      base44.asServiceRole.entities.ProviderSubmission.filter({ status: 'temporary_failure' }, '-last_attempt_at', 50),
    ]);

    // Filter both: only those where next_attempt_at is in the past (or not set)
    const pendingSubmissions = [...pendingBatch, ...retryBatch].filter(s =>
      !s.next_attempt_at || new Date(s.next_attempt_at) <= now
    );

    console.log(`Found ${allPending.length} pending total, ${pendingSubmissions.length} due for attempt`);

    const results = [];

    for (const submission of pendingSubmissions) {
      try {
        // Check if max attempts reached
        if (submission.attempt_number >= (submission.max_attempts || 5)) {
          await base44.asServiceRole.entities.ProviderSubmission.update(submission.id, {
            status: 'permanent_failure',
            error_message: 'Max attempts reached',
            last_attempt_at: new Date().toISOString(),
          });
          results.push({
            submission_id: submission.id,
            status: 'permanent_failure',
            reason: 'Max attempts reached',
          });
          continue;
        }

        // Get application and journey data
        const applications = await base44.asServiceRole.entities.ApplicationData.filter({
          id: submission.application_id,
        });
        
        if (applications.length === 0) {
          console.error('Application not found:', submission.application_id);
          continue;
        }

        const application = applications[0];

        const journeys = await base44.asServiceRole.entities.Journey.filter({
          id: submission.journey_id,
        });

        if (journeys.length === 0) {
          console.error('Journey not found:', submission.journey_id);
          continue;
        }

        const journey = journeys[0];

        // Get client data
        const clients = await base44.asServiceRole.entities.Client.filter({
          id: application.client_id || journey.client_id,
        });

        if (clients.length === 0) {
          console.error('Client not found');
          continue;
        }

        const client = clients[0];

        // Increment attempt counter
        const attempt_number = (submission.attempt_number || 0) + 1;

        // Submit based on method
        let submissionResult;
        
        if (submission.submission_method === 'EMAIL') {
          submissionResult = await submitViaEmail({
            base44,
            submission,
            application,
            client,
            attempt_number,
          });
        } else if (submission.submission_method === 'API_JSON') {
          submissionResult = await submitViaAPI({
            base44,
            submission,
            application,
            client,
            attempt_number,
          });
        } else if (submission.submission_method === 'SFTP') {
          submissionResult = await submitViaSFTP({
            base44,
            submission,
            application,
            client,
            attempt_number,
          });
        } else if (submission.submission_method === 'PORTAL_DOWNLOAD_ONLY') {
          // Provider downloads from portal — mark as success
          submissionResult = {
            success: true,
            status: 'success',
            response_code: '200',
            response_body: 'Provider portal ready for download',
          };
        } else {
          throw new Error(`Unknown submission method: ${submission.submission_method}`);
        }

        // Update submission record
        const updateData: any = {
          attempt_number,
          last_attempt_at: new Date().toISOString(),
          status: submissionResult.status,
          response_code: submissionResult.response_code,
          response_body: submissionResult.response_body,
        };

        if (submissionResult.status === 'success') {
          updateData.submitted_at = new Date().toISOString();
        } else if (submissionResult.status === 'permanent_failure') {
          updateData.error_message = submissionResult.error_message;
        } else {
          // temporary_failure — schedule next attempt
          updateData.next_attempt_at = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min
          updateData.error_message = submissionResult.error_message;
        }

        await base44.asServiceRole.entities.ProviderSubmission.update(submission.id, updateData);

        // If successful, update journey state
        if (submissionResult.status === 'success') {
          try {
            await base44.functions.invoke('journeyStateMachine', {
              journey_id: submission.journey_id,
              to_state: 'completed',
              extra_data: {
                provider_submitted_at: new Date().toISOString(),
                provider_name: submission.provider_name,
              },
            });
          } catch (e) {
            console.error('Failed to update journey state:', e);
          }
        }

        results.push({
          submission_id: submission.id,
          status: submissionResult.status,
          attempt: attempt_number,
        });

      } catch (error) {
        console.error(`Error processing submission ${submission.id}:`, error);
        results.push({
          submission_id: submission.id,
          status: 'error',
          error: error.message,
        });
      }
    }

    return Response.json({
      processed: results.length,
      results,
    });

  } catch (error) {
    console.error('Provider submission worker error:', error);
    return Response.json({
      error: error.message,
    }, { status: 500 });
  }
});

// ─── Submission Methods ──────────────────────────────────────────────────────

async function submitViaEmail({ base44, submission, application, client, attempt_number }) {
  // Get provider email from ProductCatalog or configuration
  // For now, use a placeholder
  const providerEmail = `submissions@${submission.provider_name.toLowerCase()}.com`;
  
  // Generate application PDF if not already generated
  let pdfUrl = application.application_pdf_url;
  if (!pdfUrl) {
    try {
      const pdfResult = await base44.functions.invoke('generatePlanPDF', {
        plan_id: application.plan_id,
        application_id: application.id,
      });
      pdfUrl = pdfResult.data?.pdf_url;
    } catch (e) {
      return {
        status: 'temporary_failure',
        error_message: 'Failed to generate PDF',
      };
    }
  }

  // Send email via Base44 SendEmail integration
  // Note: This requires email integration setup
  try {
    await base44.integrations.Core.SendEmail({
      to: providerEmail,
      subject: `Application Submission: ${client.first_name} ${client.last_name} - ${application.product_name}`,
      body: `
Provider: ${submission.provider_name}
Client: ${client.first_name} ${client.last_name}
Email: ${client.email}
Phone: ${client.phone}
Product: ${application.product_name}
Monthly Premium: ${application.monthly_premium} €
Coverage: ${application.coverage_amount} €

Application PDF: ${pdfUrl}

---
Submitted via Integrity Financial Advisors Platform
Journey ID: ${submission.journey_id}
Application ID: ${application.id}
      `,
    });

    return {
      status: 'success',
      response_code: '200',
      response_body: 'Email sent successfully',
    };
  } catch (error) {
    return {
      status: 'temporary_failure',
      error_message: `Email send failed: ${error.message}`,
    };
  }
}

async function submitViaAPI({ base44, submission, application, client, attempt_number }) {
  // Get provider API endpoint from ProductCatalog or configuration
  const providerApiUrl = `https://api.${submission.provider_name.toLowerCase()}.com/v1/applications`;
  const providerApiKey = Deno.env.get(`${submission.provider_name.toUpperCase()}_API_KEY`);

  if (!providerApiKey) {
    return {
      status: 'permanent_failure',
      error_message: `Provider API key not configured for ${submission.provider_name}`,
    };
  }

  // Prepare application payload
  const payload = {
    client: {
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone: client.phone,
    },
    product: {
      type: application.product_type,
      name: application.product_name,
      monthly_premium: application.monthly_premium,
      coverage_amount: application.coverage_amount,
      term_years: application.term_years,
    },
    metadata: {
      journey_id: submission.journey_id,
      application_id: application.id,
    },
  };

  try {
    const response = await fetch(providerApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${providerApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.text();

    if (response.ok) {
      return {
        status: 'success',
        response_code: response.status.toString(),
        response_body: responseData,
      };
    } else if (response.status >= 500) {
      return {
        status: 'temporary_failure',
        error_message: `Provider API error: ${response.status}`,
      };
    } else {
      return {
        status: 'permanent_failure',
        error_message: `Provider API error: ${response.status} - ${responseData}`,
      };
    }
  } catch (error) {
    return {
      status: 'temporary_failure',
      error_message: `API request failed: ${error.message}`,
    };
  }
}

async function submitViaSFTP({ base44, submission, application, client, attempt_number }) {
  // SFTP submission requires additional setup
  // This is a placeholder — actual implementation would need SFTP library
  return {
    status: 'temporary_failure',
    error_message: 'SFTP submission not yet implemented',
  };
}
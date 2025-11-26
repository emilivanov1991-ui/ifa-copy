// Client Types
export const CLIENT_TYPES = {
  lead: { label: 'Lead', color: 'bg-amber-100 text-amber-700', order: 1 },
  opportunity: { label: 'Opportunity', color: 'bg-blue-100 text-blue-700', order: 2 },
  customer: { label: 'Customer', color: 'bg-green-100 text-green-700', order: 3 },
};

// Lead Types
export const LEAD_TYPES = {
  client: { label: 'Клиент', color: 'bg-blue-100 text-blue-700' },
  recruiting: { label: 'Рекрутинг', color: 'bg-purple-100 text-purple-700' },
};

// Lead Statuses
export const LEAD_STATUSES = {
  new: { label: 'Нов', color: 'bg-slate-100 text-slate-700', nextAction: null },
  not_picked_up: { label: 'Not Picked Up', color: 'bg-red-100 text-red-700', nextAction: null },
  voice_mail: { label: 'Voice Mail', color: 'bg-amber-100 text-amber-700', nextAction: null },
  hung_up: { label: 'Hung Up', color: 'bg-orange-100 text-orange-700', nextAction: null },
  picked_up_not_arranged: { label: 'Picked Up - Not Arranged', color: 'bg-blue-100 text-blue-700', nextAction: null },
  picked_up_arranged: { label: 'Picked Up - Arranged', color: 'bg-green-100 text-green-700', nextAction: 'lp_meeting', requiresDateTime: true },
  lp_not_interested: { label: 'LP - Analysis Not Interested', color: 'bg-red-100 text-red-700', nextAction: null, final: true },
  lp_analysis_scheduled: { label: 'LP - Analysis Scheduled', color: 'bg-green-100 text-green-700', nextAction: 'analysis_meeting', requiresDateTime: true },
  lp_not_show_up: { label: 'LP - Not Show Up', color: 'bg-orange-100 text-orange-700', nextAction: null },
  analysis_done: { label: 'Analysis Done', color: 'bg-emerald-100 text-emerald-700', nextAction: 'convert_to_opportunity', convertsTo: 'opportunity' },
};

// Opportunity Statuses  
export const OPPORTUNITY_STATUSES = {
  analysis_done: { label: 'Analysis Done', color: 'bg-emerald-100 text-emerald-700', nextAction: 'fpp_meeting', requiresDateTime: true },
  analysis_fpp_not_interested: { label: 'Analysis - FPP Not Interested', color: 'bg-red-100 text-red-700', nextAction: null, final: true },
  analysis_fpp_scheduled: { label: 'Analysis - FPP Scheduled', color: 'bg-blue-100 text-blue-700', nextAction: 'fpp_presentation', requiresDateTime: true },
  analysis_fpp_presented: { label: 'Analysis - FPP Presented', color: 'bg-purple-100 text-purple-700', nextAction: 'signing_meeting', requiresDateTime: true },
  fpp_rejected: { label: 'FPP Rejected', color: 'bg-red-100 text-red-700', nextAction: null, final: true },
  fpp_to_be_signed: { label: 'FPP To Be Signed', color: 'bg-green-100 text-green-700', nextAction: 'convert_to_customer', convertsTo: 'customer' },
};

// Customer Statuses
export const CUSTOMER_STATUSES = {
  signed_and_paid: { label: 'Signed and Paid', color: 'bg-green-100 text-green-700', nextAction: null },
};

// Get all statuses for a client type
export const getStatusesForType = (type) => {
  switch (type) {
    case 'lead': return LEAD_STATUSES;
    case 'opportunity': return OPPORTUNITY_STATUSES;
    case 'customer': return CUSTOMER_STATUSES;
    default: return {};
  }
};

// Get status info
export const getStatusInfo = (type, status) => {
  const statuses = getStatusesForType(type);
  return statuses[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
};

// LP Meeting outcomes (after Picked Up - Arranged)
export const LP_MEETING_OUTCOMES = [
  { id: 'lp_not_interested', label: 'LP - Analysis Not Interested', description: 'Клиентът не е заинтересован от анализ', newStatus: 'lp_not_interested', newType: 'lead' },
  { id: 'lp_analysis_scheduled', label: 'LP - Analysis Scheduled', description: 'Насрочен е финансов анализ', newStatus: 'lp_analysis_scheduled', newType: 'lead', requiresDateTime: true },
  { id: 'lp_not_show_up', label: 'LP - Not Show Up', description: 'Клиентът не се появи', newStatus: 'lp_not_show_up', newType: 'lead' },
];

// Analysis Meeting outcomes (after LP - Analysis Scheduled)
export const ANALYSIS_MEETING_OUTCOMES = [
  { id: 'analysis_done', label: 'Analysis Done', description: 'Анализът е завършен успешно', newStatus: 'analysis_done', newType: 'opportunity', convertsTo: 'opportunity' },
  { id: 'lp_not_interested', label: 'LP - Analysis Not Interested', description: 'Клиентът не е заинтересован', newStatus: 'lp_not_interested', newType: 'lead' },
];

// FPP Meeting outcomes (after Analysis Done - schedule FPP)
export const FPP_SCHEDULE_OUTCOMES = [
  { id: 'analysis_fpp_scheduled', label: 'Analysis - FPP Scheduled', description: 'Насрочена е презентация на финансов план', newStatus: 'analysis_fpp_scheduled', newType: 'opportunity', requiresDateTime: true },
  { id: 'analysis_fpp_not_interested', label: 'Analysis - FPP Not Interested', description: 'Клиентът не желае презентация', newStatus: 'analysis_fpp_not_interested', newType: 'opportunity' },
];

// FPP Presentation outcomes (after FPP Scheduled meeting)
export const FPP_PRESENTATION_OUTCOMES = [
  { id: 'analysis_fpp_presented', label: 'Analysis - FPP Presented', description: 'Презентацията е направена', newStatus: 'analysis_fpp_presented', newType: 'opportunity', requiresDateTime: true },
  { id: 'analysis_fpp_not_interested', label: 'Analysis - FPP Not Interested', description: 'Клиентът не е заинтересован', newStatus: 'analysis_fpp_not_interested', newType: 'opportunity' },
];

// Signing outcomes (after FPP Presented)
export const SIGNING_OUTCOMES = [
  { id: 'fpp_to_be_signed', label: 'FPP To Be Signed', description: 'Готов за подписване', newStatus: 'fpp_to_be_signed', newType: 'opportunity', convertsTo: 'customer' },
  { id: 'analysis_fpp_presented', label: 'Analysis - FPP Presented', description: 'Нужна е още една среща', newStatus: 'analysis_fpp_presented', newType: 'opportunity', requiresDateTime: true },
  { id: 'fpp_rejected', label: 'FPP Rejected', description: 'Клиентът отказва', newStatus: 'fpp_rejected', newType: 'opportunity' },
];

// Get outcomes based on current status and meeting type
export const getOutcomesForMeeting = (type, status) => {
  if (type === 'lead') {
    if (status === 'picked_up_arranged') return LP_MEETING_OUTCOMES;
    if (status === 'lp_analysis_scheduled') return ANALYSIS_MEETING_OUTCOMES;
  }
  if (type === 'opportunity') {
    if (status === 'analysis_done') return FPP_SCHEDULE_OUTCOMES;
    if (status === 'analysis_fpp_scheduled') return FPP_PRESENTATION_OUTCOMES;
    if (status === 'analysis_fpp_presented') return SIGNING_OUTCOMES;
  }
  return [];
};

// Meeting type labels
export const MEETING_TYPE_LABELS = {
  lp_meeting: 'Life Planner среща',
  analysis_meeting: 'Финансов анализ',
  fpp_meeting: 'FPP Презентация (насрочване)',
  fpp_presentation: 'FPP Презентация',
  signing_meeting: 'Подписване на договор',
};
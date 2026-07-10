# IFA — Integrity Financial Advisors: Project Handover Document

> **Цел на документа:** Пълен архитектурен наръчник за поемане на проекта (напр. от Claude Code).
> Платформа: **Base44** (React + Vite frontend, Deno backend функции, Base44 BaaS за auth/DB/storage).
> Езици: Български (основен) + Английски. Валута: EUR (BGN изведен от употреба 01.01.2026).

---

## 1. Какво е това приложение

Автоматизиран 3-стъпков процес на независим финансов консултант:

1. **Discovery / Финансов анализ** — guided форми с говорещ аватар (pre-recorded/TTS гласови промпти, НЕ live AI)
2. **Генериране на финансов план** — детерминистичен rules engine (JSON RULEBOOK + тарифи)
3. **Презентация, кандидатстване, подписване (Evrotrust), плащане (Stripe)** — тук влиза AI агент

Ключов принцип: **Всички бизнес решения идват от детерминистична логика в Base44.** AI/гласовите слоеве са само презентационни.

---

## 2. Структура на кода

```
src/
  pages/               — всички страници (Home, Onboarding, FinancialPlanner,
                         FinancialAnalysis, FinancialPlanPresentation,
                         ApplicationCollection, ConsultantPortal, ClientPortal...)
  components/
    discovery/         — DiscoveryShell (главен контейнер), стъпки, contradiction check,
                         ResponseBandFeedback, ReverificationDialog, GracefulStopScreen
    voice/             — VoiceManager (TTS engine), JourneyStateManager (hook),
                         AvatarFrame, MobileAudioUX
    analysis/          — 9-те стъпки на финансовия анализ (ConsentStep, PersonalDataStep,
                         HousingStep, ReserveStep, PensionStep, ChildrenGoalsStep,
                         ProtectionStep, FinancialFlowStep, PrioritiesStep)
    financial-plan/    — FinancialPlanPresentation (слайдове), калкулатори по продукти,
                         PDF генератори
    application/       — ApplicationCollectionForm, SigningFlow, PaymentCheckout,
                         DocumentGenerationPanel, SigningStatusPoller
    consultant/        — CRM, dashboards, конфигурация (ConsultantPortal табове)
    consent/           — ConsentCaptureFlow, ConsentWithdrawalFlow, ConsentManager
    planner/           — PlannerStep1–9 (лек Financial Planner преди анализа)
  hooks/useSessionManager.js — session persistence (24h expiry, activity tracking)
  lib/deviceId.js      — device fingerprint + Device entity sync

base44/
  entities/            — 40+ JSON схеми (виж §4)
  functions/           — 30+ Deno backend функции (виж §5)
  agents/              — presentation_advisor, financial_plan_analyzer, voice_rulebook_agent
```

Роутинг: `src/App.jsx` — pagesConfig loop + експлицитни Route елементи.

---

## 3. Journey State Machine (ядрото)

Файл: `base44/functions/journeyStateMachine/entry.ts`
Всички преходи на `journey_state` минават през тази функция (никога директен entity update).

Състояния: discovery_not_started → discovery_intro_in_progress → discovery_collecting
→ (discovery_resumed_pending_reverification при връщане ≤14 дни) → discovery_ready_for_review
→ analysis_approved → plan_generating → plan_ready | plan_auto_sell_blocked
→ presentation_intro_pending → presentation_in_progress → application_collecting
→ application_ready_for_signing → signing_in_progress → payment_in_progress
→ provider_submission_in_progress → completed
Терминални: graceful_stop, expired. Всяко блокиране създава FollowUpTask.

Transition guards: plan_generating изисква analysis_id; presentation изисква plan_id; и т.н.

**14-дневна resume политика:** Journey се намира по client_id / device_id / localStorage
(`JourneyStateManager.jsx`). При връщане в 14 дни → reverification екран ("Актуални ли са данните?").
След 14 дни → нов journey, старият се архивира.

---

## 4. Entities (база данни) — най-важните

| Entity | Роля |
|---|---|
| **Journey** | Централен запис на процеса: journey_state, client_id, device_id, analysis_id, plan_id, reverification flags, rulebook_version, ruleset_hash |
| **FinancialAnalysisSubmission** | ~400 полета: лични данни, партньор, деца, жилище, коли, доходи, разходи, активи, пасиви, застраховки, пенсия, приоритети |
| **FinancialPlan** | Генерираният план: products[], premiums, auto_sell_eligible, rulebook refs |
| **JsonRulebookVersion** | Версиониран JSON RULEBOOK: всички тарифи (MetLife UL, Term Life, CI32/CI40, Uniqa, DZI, Generali, mortality tables), правила, лимити |
| **TariffTableVersion** | Отделни тарифни таблици по provider/product |
| **VoiceRulebook** | step_id → text_fallback/audio_url/avatar_state за гласовите промпти (bg+en) |
| **ResponseLogicDefinition / ResponseBandDefinition** | Формули + response bands за персонализирана обратна връзка в Discovery |
| **Device / Session / OtpSession** | Device fingerprint, сесии (24h), email OTP auth |
| **Client / VerifiedClientProfile** | Клиентски профил; verified profile се създава при analysis_approved |
| **ApplicationData / GeneratedDocument / DocumentTemplate** | Кандидатстване, PDF генериране, шаблони |
| **SigningEvent / PaymentEvent / ProviderSubmission** | Evrotrust подписване (max 3 опита × 24h), Stripe плащания, async provider submission |
| **ConsentTemplate / ConsentRecord** | GDPR съгласия (A/B/C) с версии |
| **ComplianceAuditRecord / SecureLogReference / ObjectionEvent** | Одит, secure log referencing, обработка на възражения |
| **FollowUpTask** | Задачи за консултант при блокирана автоматизация (reason enum, priority, queue) |
| **FinancialPlanRules** | Бизнес правила: лимити на плана, ценова психология, payment frequency rules |
| **PresentationModel / PlanExplanation** | Модели за AI презентацията на плана |

Пълните схеми: `base44/entities/*.jsonc`.

---

## 5. Backend функции (Deno, base44/functions/)

**Journey & Discovery:**
- `journeyStateMachine` — единствен път за смяна на състояние (transitions + guards)
- `advanceJourneyPublic` — публичен вариант
- `evaluateInteractionLogic` — сърцето на гласовата логика: VoiceRulebook lookup → response bands → формули (safe expression eval) → TTS генериране
- `generateVoiceAudio`, `testVoice` — TTS
- `safeExpressionEvaluator` — безопасни формули (без eval)
- `sessionManager`, `sessionCleanupWorker` — сесии

**Plan Engine:**
- `generateFinancialPlan` — v3.0, детерминистичен: чете тарифи от JsonRulebookVersion, изчислява UL projections (mortality tables), corpus за пенсия, бюджетни тавани (ceiling 1: 150%/200% годишен доход; ceiling 2: 40%/66% месечен баланс), подбира продукти по йерархия (MetLife UL → Junior → Credit Guard → Uniqa → MetLife Грижа → Generali → ОББ УПФ), auto_sell_eligible + block reasons
- `seedRulebookData` — seed на тарифи + VoiceRulebook (36 записа bg/en)
- `generatePlanExplanation`, `generatePresentationModel` — модели за AI презентатора
- `analyzeFinancialPlan`, `testULProjection`

**Auth:** `sendOTP`, `verifyOTP` (email + 6-цифрен код, 10 min expiry)

**Application → Signing → Payment:**
- `generateApplicationDocuments`, `generatePlanPDF` (jsPDF)
- `createEvrotrustSigningSession`, `evrotrustWebhook`, `signingReminderWorker`
- `createStripeCheckout`, `stripeWebhook` (секрети: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
- `providerSubmissionWorker` — async submission (МVP: EMAIL; API_JSON частично)

**CRM / Compliance:**
- `createFollowUpTask`, `notifyClientOnFollowUp`, `sendNotification`
- `createVerifiedProfile`, `autoComplianceLogger`, `journeyAuditLogger`, `logObjectionEvent`
- `setupConsultant`, `hashHelper` (SHA-256 за consultant пароли)

**Live voice (частично):** `createRetellWebCall` — планирано да се замени с Base44 AI Agent.

---

## 6. Гласова архитектура (Discovery)

- **VoiceManager.jsx** — local-first: зарежда целия VoiceRulebook за езика, играе pre-recorded audio_url ако има, иначе вика `evaluateInteractionLogic` за TTS; prefetch на следващата стъпка; audio cache.
- **Стъпки:** `planner_step_1..9`, `analysis_step_1..9`; response bands: `analysis_reserve_band_*`, `analysis_debt_band_*`, `analysis_pension_band_*`; `completion`; validation errors.
- **Avatar states:** talking / listening / thinking / celebrating / concerned / idle (GuideAvatar + AvatarFrame).
- **ResponseBandFeedback.jsx** — real-time рули-базирана обратна връзка при попълване (debounce + cache).
- **useContradictionCheck.jsx** — клиентски contradiction rules за формата.

---

## 7. Статус на завършеност (към юли 2026)

**Готово (>85%):** state machine, plan engine с тарифи, auth (Google/Apple/OTP), DiscoveryShell + 14-day reverification, financial analysis форма, VoiceRulebook + TTS, GracefulStop + FollowUpTask, plan presentation слайдове.

**Частично (40–80%):** application completion (липсва MISSING_FIELDS диф логика), Evrotrust retry policy, Stripe failure paths, consent seeding, VerifiedClientProfile автоматизация, PlanExplanation/PresentationModel не са вързани в journey flow, CRM (липсва compliance audit view), provider submission (само EMAIL).

**Липсва (<40%):** AI Agent UI за презентацията (agent config съществува: `base44/agents/presentation_advisor.jsonc`, но няма chat UI), замяна на Retell с Base44 Agent, avatar intro experience в Onboarding (сега видео placeholder), страници "Система на работа" и "Правила за сътрудничество", системен audit trail, health questionnaire → graceful_stop връзка.

**Приоритети за следваща фаза:**
1. AI Agent chat UI за plan presentation (вързан към plan_ready state)
2. Автоматично тригериране на PlanExplanation/PresentationModel при analysis_approved
3. APPLICATION_MISSING_FIELDS логика
4. System of Work + Cooperation Rules страници
5. Систематичен VerifiedClientProfile при analysis_approved

---

## 8. Критични зависимости от Base44 платформата

- **SDK:** `@base44/sdk` — entities CRUD, auth, functions.invoke, integrations (TTS/LLM/UploadFile), agents
- **Секрети:** STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET (+ Evrotrust/Retell при активиране)
- **Auth:** Base44 платформен login (Google/Apple) + собствен OTP слой
- **Backend:** Deno Deploy runtime — функциите НЕ вървят извън Base44
- **Данни:** Base44 managed DB — експорт през Dashboard → Data → CSV

Миграция извън Base44 = замяна на SDK, auth, DB, functions runtime — отделен проект.

---

## 9. Бизнес правила — бърза справка

- Валута EUR, курс 1.95583 BGN/EUR за конверсии на легаси продукти
- MetLife UL: min 300 EUR/год., premium bonus 0–4%, AV charge 0.5–2%, investible rate год.1: 30%, год.2: 60%, год.3+: 100%, policy fee 15 EUR/год.
- Пенсионен corpus: 3% инфлация, 4% post-retirement return, 240 месеца
- Junior UL: деца ≤11 г., хоризонт до 20 г., 70/30 бюджет split при недостиг
- Данъчно облекчение: 10% от годишна премия (UL/пенсия/здравно, до 65 г.)
- Резерв: цел 6× (променливи разходи + вноски по кредити); Mode A/B тавани
- Auto-sell блокери: NO_INCOME, NO_BUDGET, CLIENT_OVER_65, NO_PRODUCTS_GENERATED, BUDGET_EXCEEDED
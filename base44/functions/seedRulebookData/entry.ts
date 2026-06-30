/**
 * seedRulebookData — Попълва JsonRulebookVersion и TariffTableVersion с тарифни данни
 * Изпълнява се еднократно при деплой или при промяна на тарифите
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify admin role
    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const rulebookVersion = '3.0';
    const validFrom = new Date().toISOString().split('T')[0];

    // ──────────────────────────────────────────────────────────
    // TARIFFS — same as original generateFinancialPlan
    // ──────────────────────────────────────────────────────────

    const TERM_LIFE_BASIC_RATES = {
      15:{5:3.65,10:3.6,15:3.69,20:3.66,25:3.85,30:4.19},
      16:{5:3.74,10:3.66,15:3.75,20:3.73,25:3.95,30:4.34},
      17:{5:3.82,10:3.73,15:3.79,20:3.8,25:4.05,30:4.5},
      18:{5:3.91,10:3.78,15:3.85,20:3.87,25:4.15,30:4.68},
      19:{5:3.96,10:3.82,15:3.9,20:3.95,25:4.27,30:4.88},
      20:{5:4,10:3.84,15:3.94,20:4.02,25:4.41,30:5.07},
      21:{5:4.04,10:3.87,15:3.99,20:4.12,25:4.57,30:5.3},
      22:{5:4.09,10:3.9,15:4.05,20:4.22,25:4.75,30:5.55},
      23:{5:4.1,10:3.94,15:4.13,20:4.33,25:4.95,30:5.82},
      24:{5:4.13,10:3.99,15:4.2,20:4.47,25:5.18,30:6.13},
      25:{5:4.14,10:4.03,15:4.29,20:4.63,25:5.4,30:6.46},
      26:{5:4.15,10:4.09,15:4.41,20:4.83,25:5.68,30:6.82},
      27:{5:4.16,10:4.16,15:4.52,20:5.04,25:5.98,30:7.22},
      28:{5:4.22,10:4.27,15:4.67,20:5.3,25:6.32,30:7.64},
      29:{5:4.3,10:4.37,15:4.84,20:5.59,25:6.69,30:8.13},
      30:{5:4.38,10:4.5,15:5.06,20:5.88,25:7.11,30:8.66},
      31:{5:4.49,10:4.67,15:5.32,20:6.23,25:7.54,30:9.22},
      32:{5:4.61,10:4.84,15:5.6,20:6.61,25:8.04,30:9.81},
      33:{5:4.77,10:5.04,15:5.93,20:7.03,25:8.56,30:10.45},
      34:{5:4.9,10:5.26,15:6.29,20:7.5,25:9.15,30:11.12},
      35:{5:5.08,10:5.56,15:6.65,20:8.01,25:9.8,30:11.86},
      36:{5:5.32,10:5.9,15:7.09,20:8.55,25:10.47,30:12.6},
      37:{5:5.55,10:6.27,15:7.56,20:9.16,25:11.18,30:13.45},
      38:{5:5.78,10:6.7,15:8.07,20:9.79,25:11.95,30:14.31},
      39:{5:6.11,10:7.18,15:8.65,20:10.52,25:12.77,30:15.26},
      40:{5:6.55,10:7.64,15:9.28,20:11.31,25:13.66,30:16.26},
      41:{5:6.97,10:8.19,15:9.92,20:12.12,25:14.55,30:17.33},
      42:{5:7.51,10:8.8,15:10.67,20:12.99,25:15.56,30:18.49},
      43:{5:8.16,10:9.47,15:11.44,20:13.94,25:16.62,30:19.73},
      44:{5:8.79,10:10.2,15:12.32,20:14.92,25:17.75,30:21.05},
      45:{5:9.3,10:10.95,15:13.24,20:15.97,25:18.92,30:22.45},
      46:{5:9.99,10:11.71,15:14.19,20:17.02,25:20.19,30:23.98},
      47:{5:10.68,10:12.6,15:15.18,20:18.21,25:21.56,30:25.52},
      48:{5:11.38,10:13.45,15:16.24,20:19.42,25:23,30:27.15},
      49:{5:12.22,10:14.48,15:17.35,20:20.74,25:24.56,30:28.9},
      50:{5:13.24,10:15.65,15:18.61,20:22.16,25:26.26,30:30.8},
      51:{5:14.1,10:16.77,15:19.81,20:23.66,25:28.08,30:null},
      52:{5:15.22,10:17.95,15:21.2,20:25.29,25:29.95,30:null},
      53:{5:16.24,10:19.24,15:22.61,20:27.04,25:31.92,30:null},
      54:{5:17.5,10:20.53,15:24.13,20:28.9,25:34.04,30:null},
      55:{5:18.86,10:21.97,15:25.73,20:30.9,25:36.32,30:null},
      56:{5:20.29,10:23.4,15:27.51,20:33.14,25:null,30:null},
      57:{5:21.57,10:25,15:29.38,20:35.36,25:null,30:null},
      58:{5:23.19,10:26.69,15:31.46,20:37.79,25:null,30:null},
      59:{5:24.55,10:28.43,15:33.6,20:40.35,25:null,30:null},
      60:{5:26.09,10:30.22,15:35.93,20:43.12,25:null,30:null},
      61:{5:27.57,10:32.28,15:38.57,20:null,25:null,30:null},
      62:{5:29.57,10:34.57,15:41.28,20:null,25:null,30:null},
      63:{5:31.39,10:37.02,15:44.16,20:null,25:null,30:null},
      64:{5:33.6,10:39.76,15:47.37,20:null,25:null,30:null},
      65:{5:35.75,10:42.71,15:50.86,20:null,25:null,30:null},
    };

    const CI32_RATES = {
      18:{yr5:1.4,yr10:1.85},19:{yr5:1.4,yr10:1.85},20:{yr5:1.4,yr10:1.85},
      21:{yr5:1.4,yr10:1.85},22:{yr5:1.4,yr10:1.85},23:{yr5:1.4,yr10:1.85},
      24:{yr5:1.4,yr10:1.85},25:{yr5:1.4,yr10:1.85},
      26:{yr5:2.35,yr10:3.19},27:{yr5:2.35,yr10:3.19},28:{yr5:2.35,yr10:3.19},
      29:{yr5:2.35,yr10:3.19},30:{yr5:2.35,yr10:3.19},
      31:{yr5:4.63,yr10:6.23},32:{yr5:4.63,yr10:6.23},33:{yr5:4.63,yr10:6.23},
      34:{yr5:4.63,yr10:6.23},35:{yr5:4.63,yr10:6.23},
      36:{yr5:7.24,yr10:9.57},37:{yr5:7.24,yr10:9.57},38:{yr5:7.24,yr10:9.57},
      39:{yr5:7.24,yr10:9.57},40:{yr5:7.24,yr10:9.57},
      41:{yr5:12.31,yr10:16},42:{yr5:12.31,yr10:16},43:{yr5:12.31,yr10:16},
      44:{yr5:12.31,yr10:16},45:{yr5:12.31,yr10:16},
      46:{yr5:20.45,yr10:25.47},47:{yr5:20.45,yr10:25.47},48:{yr5:20.45,yr10:25.47},
      49:{yr5:20.45,yr10:25.47},50:{yr5:20.45,yr10:25.47},
      51:{yr5:31.79,yr10:38.07},52:{yr5:31.79,yr10:38.07},53:{yr5:31.79,yr10:38.07},
      54:{yr5:31.79,yr10:38.07},55:{yr5:31.79,yr10:38.07},
      56:{yr5:46.34,yr10:null},57:{yr5:46.34,yr10:null},58:{yr5:46.34,yr10:null},
      59:{yr5:46.34,yr10:null},60:{yr5:46.34,yr10:null},
    };

    const CI40_COEFFICIENTS = {
      18:225.733634311512,19:218.818380743982,20:212.314225053079,21:206.185567010309,
      22:200.400801603206,23:194.552529182879,24:188.679245283019,25:182.815356489945,
      26:177.304964539007,27:171.232876712329,28:165.837479270315,29:160.25641025641,
      30:154.798761609907,31:149.253731343284,32:143.884892086331,33:138.504155124654,
      34:133.333333333333,35:128.040973111396,36:122.850122850123,37:117.508813160987,
      38:112.485939257593,39:107.52688172043,40:102.669404517454,41:97.9431929480901,
      42:93.3706816059757,43:88.9679715302491,44:84.7457627118644,45:80.7102502017756,
      46:76.8639508070715,47:73.2064421669107,48:69.6864111498258,49:66.35700066357,
      50:63.0914826498423,51:60.0600600600601,52:57.0776255707763,53:54.2005420054201,
      54:51.2820512820513,55:48.3325277912035,56:46.3177396943029,57:43.917435221783,
      58:41.5800415800416,59:39.1083300743058,60:36.5363536719035,61:36.0750360750361,
      62:35.5998576005696,63:34.9406009783368,64:33.2667997338656,65:31.1720698254364,
    };

    const RISK_CLASS_1 = { pi: 1.5, fracturesAndBurns: 16, accidentalDeath: 1.5 };

    const AV_CHARGE_TABLE = [
      { from: 300,  annual: 300,  rate: 0.0200 },
      { from: 720,  annual: 720,  rate: 0.0175 },
      { from: 960,  annual: 960,  rate: 0.0150 },
      { from: 1200, annual: 1200, rate: 0.0125 },
      { from: 1500, annual: 1500, rate: 0.0100 },
      { from: 2400, annual: 2400, rate: 0.0075 },
      { from: 3600, annual: 3600, rate: 0.0050 },
      { from: 4800, annual: 4800, rate: 0.0050 },
      { from: 6000, annual: 6000, rate: 0.0050 },
    ];

    const PREMIUM_BONUS_TABLE = [
      { from: 0,    to: 1200,    bonus: 0 },
      { from: 1200, to: 1800,    bonus: 0.01 },
      { from: 1800, to: 3000,    bonus: 0.02 },
      { from: 3000, to: 4200,    bonus: 0.03 },
      { from: 4200, to: Infinity, bonus: 0.04 },
    ];

    const UNIQA_EUROPA_TARIFFS = {
      '0-17':  { monthly: 6.48,  annual: 74.04  },
      '18-30': { monthly: 12.54, annual: 143.32 },
      '31-40': { monthly: 13.71, annual: 156.64 },
      '41-45': { monthly: 16.48, annual: 188.32 },
      '46-50': { monthly: 20.02, annual: 228.80 },
      '51-55': { monthly: 24.71, annual: 282.36 },
      '56-60': { monthly: 30.50, annual: 348.60 },
      '61-65': { monthly: 37.40, annual: 427.43 },
    };

    const GENERALI_BASIC_MONTHLY_EUR = 60;
    const GENERALI_BASIC_ANNUAL_EUR = 720;

    const DZI_ZAKRILA_PLATINUM = {
      monthly: 30,
      annual: 360,
      coverages: {
        deathAccident: 50000, deathRTA: 75000,
        disabilityAccident: 50000, disabilityRTA: 75000,
        fracturesAndBurns: 20000, hospitalDaily: 100
      }
    };

    const CHILD_FRACTURES_RATE = 33;
    const CHILD_FRACTURES_AMOUNT = 750;

    const CHILD_PROTECTION_COEFFICIENTS = {
      18:0.0438, 19:0.0438, 20:0.0438, 21:0.0438, 22:0.0438,
      23:0.0438, 24:0.0438, 25:0.0438, 26:0.0438, 27:0.0438,
      28:0.0438, 29:0.0438, 30:0.0438,
      31:0.044,  32:0.044,  33:0.044,  34:0.044,  35:0.044,
      36:0.045,  37:0.045,  38:0.045,  39:0.045,  40:0.045,
      41:0.048,  42:0.048,  43:0.048,  44:0.048,  45:0.048,
      46:0.052,  47:0.052,  48:0.052,  49:0.052,  50:0.052,
      51:0.058,  52:0.058,  53:0.058,  54:0.058,  55:0.058,
    };

    const ML_CARE_PACKAGES = {
      'Бронзов':      { disability: 10000,  ptd: 10000,  ci40: 10000,  cancer: 10000,  inSitu: 5000  },
      'Сребърен':     { disability: 25000,  ptd: 25000,  ci40: 25000,  cancer: 25000,  inSitu: 12500 },
      'Златен':       { disability: 50000,  ptd: 50000,  ci40: 50000,  cancer: 50000,  inSitu: 25000 },
      'Платинен':     { disability: 100000, ptd: 100000, ci40: 100000, cancer: 100000, inSitu: 50000 },
    };

    const METLIFE_CARE_AGE_RATES = {
      18: { disability: 2.82,  ci40: 4.43,  cancer: 3.84,  inSitu: 4.55328  },
      19: { disability: 2.94,  ci40: 4.57,  cancer: 3.97,  inSitu: 4.61448  },
      20: { disability: 2.94,  ci40: 4.71,  cancer: 4.09,  inSitu: 4.70016  },
      21: { disability: 3.06,  ci40: 4.85,  cancer: 4.21,  inSitu: 4.77360  },
      22: { disability: 3.06,  ci40: 4.99,  cancer: 4.33,  inSitu: 4.87152  },
      23: { disability: 3.18,  ci40: 5.14,  cancer: 4.46,  inSitu: 4.98168  },
      24: { disability: 3.18,  ci40: 5.30,  cancer: 4.60,  inSitu: 5.09184  },
      25: { disability: 3.30,  ci40: 5.47,  cancer: 4.74,  inSitu: 5.21424  },
      26: { disability: 3.30,  ci40: 5.64,  cancer: 4.90,  inSitu: 5.33664  },
      27: { disability: 3.43,  ci40: 5.84,  cancer: 5.06,  inSitu: 5.47128  },
      28: { disability: 3.55,  ci40: 6.03,  cancer: 5.23,  inSitu: 5.63040  },
      29: { disability: 3.67,  ci40: 6.24,  cancer: 5.40,  inSitu: 5.78952  },
      30: { disability: 3.79,  ci40: 6.46,  cancer: 5.59,  inSitu: 5.94864  },
      31: { disability: 3.92,  ci40: 6.70,  cancer: 5.79,  inSitu: 6.12000  },
      32: { disability: 4.04,  ci40: 6.95,  cancer: 6.01,  inSitu: 6.30360  },
      33: { disability: 4.16,  ci40: 7.22,  cancer: 6.24,  inSitu: 6.49944  },
      34: { disability: 4.41,  ci40: 7.50,  cancer: 6.49,  inSitu: 6.71976  },
      35: { disability: 4.53,  ci40: 7.81,  cancer: 6.74,  inSitu: 6.95232  },
      36: { disability: 4.77,  ci40: 8.14,  cancer: 7.04,  inSitu: 7.18488  },
      37: { disability: 5.02,  ci40: 8.51,  cancer: 7.34,  inSitu: 7.45416  },
      38: { disability: 5.26,  ci40: 8.89,  cancer: 7.67,  inSitu: 7.73568  },
      39: { disability: 5.51,  ci40: 9.30,  cancer: 8.03,  inSitu: 8.04168  },
      40: { disability: 5.75,  ci40: 9.74,  cancer: 8.41,  inSitu: 8.34768  },
      41: { disability: 6.00,  ci40: 10.21, cancer: 8.81,  inSitu: 8.65368  },
      42: { disability: 6.24,  ci40: 10.71, cancer: 9.23,  inSitu: 8.95968  },
      43: { disability: 6.61,  ci40: 11.24, cancer: 9.68,  inSitu: 9.25344  },
      44: { disability: 6.98,  ci40: 11.80, cancer: 10.17, inSitu: 9.54720  },
      45: { disability: 7.34,  ci40: 12.39, cancer: 10.67, inSitu: 9.86544  },
      46: { disability: 7.71,  ci40: 13.01, cancer: 11.20, inSitu: 10.24488 },
      47: { disability: 8.20,  ci40: 13.66, cancer: 11.76, inSitu: 10.66104 },
      48: { disability: 8.57,  ci40: 14.35, cancer: 12.34, inSitu: 11.11392 },
      49: { disability: 9.18,  ci40: 15.07, cancer: 12.96, inSitu: 11.60352 },
      50: { disability: 9.67,  ci40: 15.85, cancer: 13.62, inSitu: 12.15432 },
      51: { disability: 10.28, ci40: 16.65, cancer: 14.31, inSitu: 12.77856 },
      52: { disability: 10.89, ci40: 17.52, cancer: 15.06, inSitu: 13.43952 },
      53: { disability: 11.51, ci40: 18.45, cancer: 15.85, inSitu: 14.14944 },
      54: { disability: 12.12, ci40: 19.50, cancer: 16.73, inSitu: 14.89608 },
      55: { disability: 12.85, ci40: 20.69, cancer: 17.74, inSitu: 15.83856 },
      56: { disability: 13.71, ci40: 21.59, cancer: 18.53, inSitu: 16.70760 },
      57: { disability: 14.57, ci40: 22.77, cancer: 19.54, inSitu: 17.79696 },
      58: { disability: 15.67, ci40: 24.05, cancer: 20.59, inSitu: 19.00872 },
      59: { disability: 16.65, ci40: 25.57, cancer: 21.89, inSitu: 20.51424 },
      60: { disability: 18.12, ci40: 27.37, cancer: 23.43, inSitu: 22.31352 },
      61: { disability: 18.60, ci40: 27.72, cancer: 23.72, inSitu: 22.90104 },
      62: { disability: 19.34, ci40: 28.09, cancer: 24.03, inSitu: 23.47632 },
      63: { disability: 20.20, ci40: 28.62, cancer: 24.53, inSitu: 24.21072 },
      64: { disability: 21.42, ci40: 30.06, cancer: 25.70, inSitu: 25.52040 },
      65: { disability: 23.75, ci40: 32.08, cancer: 27.42, inSitu: 27.52776 },
    };

    const ML_CARE_RULES = {
      min_age: 18,
      max_age_disability: 65,
      max_age_ptd: 65,
      max_age_ci40: 65,
      max_age_cancer: 69,
      max_age_inSitu: 64,
      max_age_telemedicine: 64,
      min_annual_premium: 50,
      min_disability_coverage: 3000,
      insurance_tax: 0.02,
      semi_annual_factor: 0.51,
      quarterly_factor: 0.26,
    };

    // Bulgarian NSI life tables (deaths per 1000), ages 0–101
    const MORTALITY_QX = {
      0:{m:10.4667,f:8.3265},   1:{m:0.8631,f:0.8105},    2:{m:0.2755,f:0.4431},
      3:{m:0.4692,f:0.2624},    4:{m:0.3255,f:0.1807},    5:{m:0.4914,f:0.1928},
      6:{m:0.3448,f:0.2442},    7:{m:0.2900,f:0.2166},    8:{m:0.2470,f:0.1696},
      9:{m:0.3493,f:0.2300},    10:{m:0.1934,f:0.2031},   11:{m:0.3457,f:0.1327},
      12:{m:0.3490,f:0.3376},   13:{m:0.3329,f:0.2078},   14:{m:0.3901,f:0.2413},
      15:{m:0.4320,f:0.2681},   16:{m:0.5632,f:0.3168},   17:{m:0.6590,f:0.3991},
      18:{m:0.7820,f:0.4778},   19:{m:0.9968,f:0.3351},   20:{m:0.9754,f:0.3689},
      21:{m:0.9902,f:0.3905},   22:{m:1.1783,f:0.3851},   23:{m:1.1208,f:0.3416},
      24:{m:1.2253,f:0.3714},   25:{m:1.1798,f:0.3714},   26:{m:1.2500,f:0.4100},
      27:{m:1.3200,f:0.4400},   28:{m:1.4000,f:0.4800},   29:{m:1.5100,f:0.5200},
      30:{m:1.6200,f:0.5700},   31:{m:1.7400,f:0.6300},   32:{m:1.8700,f:0.6900},
      33:{m:2.0100,f:0.7600},   34:{m:2.1700,f:0.8400},   35:{m:2.3400,f:0.9300},
      36:{m:2.5400,f:1.0300},   37:{m:2.7600,f:1.1400},   38:{m:3.0100,f:1.2700},
      39:{m:3.2900,f:1.4200},   40:{m:3.6100,f:1.5900},   41:{m:3.9700,f:1.7800},
      42:{m:4.3800,f:2.0000},   43:{m:4.8400,f:2.2500},   44:{m:5.3600,f:2.5300},
      45:{m:5.9500,f:2.8500},   46:{m:6.6300,f:3.2200},   47:{m:7.4000,f:3.6400},
      48:{m:8.2800,f:4.1200},   49:{m:9.2800,f:4.6700},   50:{m:10.40,f:5.2900},
      51:{m:11.65,f:5.9900},    52:{m:13.06,f:6.7900},    53:{m:14.65,f:7.7000},
      54:{m:16.44,f:8.7400},    55:{m:18.45,f:9.9200},    56:{m:20.71,f:11.27},
      57:{m:23.24,f:12.80},     58:{m:26.07,f:14.54},     59:{m:29.22,f:16.52},
      60:{m:32.72,f:18.76},     61:{m:36.60,f:21.29},     62:{m:40.92,f:24.16},
      63:{m:45.71,f:27.41},     64:{m:51.03,f:31.08},     65:{m:57.04,f:35.28},
      66:{m:63.76,f:40.07},     67:{m:71.31,f:45.53},     68:{m:79.74,f:51.74},
      69:{m:89.16,f:58.80},     70:{m:99.68,f:66.82},     71:{m:111.4,f:76.00},
      72:{m:124.5,f:86.50},     73:{m:139.2,f:98.50},     74:{m:155.6,f:112.3},
      75:{m:173.9,f:128.1},     76:{m:194.4,f:146.2},     77:{m:217.2,f:167.0},
      78:{m:242.6,f:191.0},     79:{m:271.0,f:218.4},     80:{m:302.5,f:249.8},
      81:{m:337.5,f:285.4},     82:{m:376.2,f:325.5},     83:{m:418.9,f:370.1},
      84:{m:465.7,f:419.3},     85:{m:516.7,f:473.1},     86:{m:571.7,f:531.2},
      87:{m:630.6,f:593.5},     88:{m:693.0,f:659.5},     89:{m:758.4,f:728.8},
      90:{m:826.2,f:800.9},     91:{m:895.9,f:874.9},     92:{m:920.0,f:900.0},
      93:{m:940.0,f:920.0},     94:{m:955.0,f:938.0},     95:{m:967.0,f:952.0},
      96:{m:975.0,f:963.0},     97:{m:982.0,f:971.0},     98:{m:987.0,f:978.0},
      99:{m:991.0,f:984.0},     100:{m:994.0,f:989.0},    101:{m:999.0,f:999.0},
    };

    const CG_RULES = {
      min_age: 18,
      max_age: 65,
      min_sum: 10000,
      max_sum: 2000000,
      reference_sum: 100000,
      available_terms: [5, 10, 15, 20, 25, 30, 35],
    };

    // ──────────────────────────────────────────────────────────
    // BUILD RULEBOOK JSON
    // ──────────────────────────────────────────────────────────

    const rulebookJson = {
      version: rulebookVersion,
      generated_at: new Date().toISOString(),
      tariffs: {
        TERM_LIFE_BASIC_RATES,
        CI32_RATES,
        CI40_COEFFICIENTS,
        RISK_CLASS_1,
        AV_CHARGE_TABLE,
        PREMIUM_BONUS_TABLE,
        UNIQA_EUROPA_TARIFFS,
        GENERALI_BASIC_MONTHLY_EUR,
        GENERALI_BASIC_ANNUAL_EUR,
        DZI_ZAKRILA_PLATINUM,
        CHILD_FRACTURES_RATE,
        CHILD_FRACTURES_AMOUNT,
        CHILD_PROTECTION_COEFFICIENTS,
        METLIFE_CARE_AGE_RATES,
        ML_CARE_PACKAGES,
        ML_CARE_RULES,
        MORTALITY_QX,
        CG_RULES,
      },
      optimization_rules: {
        mortgage: { breakeven_months: 24, refinancing_costs_formula: "(remaining * 0.002) * 1.20 + 60 + 70" },
        ceilings_mode_a: { ceiling_1: "income * 1.5 / 12", ceiling_2: "balance * 0.40" },
        ceilings_mode_b: { ceiling_1: "income * 2.0 / 12", ceiling_2: "balance * 0.66" },
      },
      product_selection_hierarchy: ["ul_investment", "term_life", "dzi_zakrila"],
      investment_goals: {
        junior_target_age: 20,
        pension_retirement_age: 65,
        assumed_return: 0.08,
        post_retirement_return: 0.04,
      }
    };

    // Calculate ruleset hash
    const rulebookPayload = `v${rulebookVersion}|${validFrom}`;
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rulebookPayload));
    const ruleset_hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');

    // ──────────────────────────────────────────────────────────
    // CHECK IF EXISTS
    // ──────────────────────────────────────────────────────────

    const existingRulebooks = await base44.asServiceRole.entities.JsonRulebookVersion.filter({ version: rulebookVersion });
    
    if (existingRulebooks && existingRulebooks.length > 0) {
      // Update existing
      await base44.asServiceRole.entities.JsonRulebookVersion.update(existingRulebooks[0].id, {
        ruleset_hash,
        valid_from: validFrom,
        rulebook_json: rulebookJson,
        changelog: 'v3.0 — Entity-based tariffs',
        is_active: true,
        approved_by: user.email || 'admin',
        approved_at: new Date().toISOString(),
      });
    } else {
      // Create new
      await base44.asServiceRole.entities.JsonRulebookVersion.create({
        version: rulebookVersion,
        ruleset_hash,
        valid_from: validFrom,
        rulebook_json: rulebookJson,
        changelog: 'v3.0 — Entity-based tariffs',
        is_active: true,
        created_by: user.email || 'admin',
        approved_by: user.email || 'admin',
        approved_at: new Date().toISOString(),
      });
    }

    // ──────────────────────────────────────────────────────────
    // CREATE TARIFF TABLE VERSIONS
    // ──────────────────────────────────────────────────────────

    // Credit Guard tariff table (placeholder - to be filled with actual data)
    const CG_TARIFF_PLACEHOLDER = {};

    const existingCgTariffs = await base44.asServiceRole.entities.TariffTableVersion.filter({
      provider: 'MetLife',
      product_type: 'credit_guard',
      is_active: true,
    });

    if (existingCgTariffs && existingCgTariffs.length > 0) {
      await base44.asServiceRole.entities.TariffTableVersion.update(existingCgTariffs[0].id, {
        table_json: CG_TARIFF_PLACEHOLDER,
        is_active: true,
      });
    } else {
      await base44.asServiceRole.entities.TariffTableVersion.create({
        provider: 'MetLife',
        product_type: 'credit_guard',
        table_name: 'CREDIT_GUARD_TARIFF',
        version: '3.0',
        effective_date: validFrom,
        table_json: CG_TARIFF_PLACEHOLDER,
        currency: 'EUR',
        source_document: 'MetLife Credit Guard Constants',
        is_active: true,
        created_by: user.email || 'admin',
      });
    }

    // ──────────────────────────────────────────────────────────
    // VOICE RULEBOOK — Discovery steps (bg + en)
    // ──────────────────────────────────────────────────────────

    const voiceEntries = [
      // ── Planner steps ──
      { step_id: 'planner_step_1', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Здравейте! Аз съм вашият финансов асистент. Нека заедно разберем вашата финансова ситуация. Как се казвате?' },
      { step_id: 'planner_step_2', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Чудесно! Кажете ми малко повече за вашето семейно положение — живеете ли сами или имате партньор и деца?' },
      { step_id: 'planner_step_3', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Отлично. Сега нека поговорим за вашето жилище. Наемате ли, или имате собствен дом?' },
      { step_id: 'planner_step_4', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Разбрах. А имате ли автомобил? Ще ми е полезно да знам за вашите активи.' },
      { step_id: 'planner_step_5', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Сега нека поговорим за доходите ви. Какъв е вашият месечен нетен доход?' },
      { step_id: 'planner_step_6', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Много добре. Успявате ли да спестявате всеки месец и колко приблизително?' },
      { step_id: 'planner_step_7', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Страхотно. Каква е общата сума на вашите спестявания и инвестиции в момента?' },
      { step_id: 'planner_step_8', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'А имате ли кредити или заеми? Ипотека, потребителски кредит или кредитна карта?' },
      { step_id: 'planner_step_9', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'celebrating',
        text_fallback: 'Благодаря ви! Събрах достатъчно информация, за да изготвя вашия финансов профил. Нека видим резултатите.' },

      // ── Analysis steps ──
      { step_id: 'analysis_step_1', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Добре дошли в детайлния финансов анализ. Ще попълним заедно вашия пълен финансов профил. Нека започнем с личните данни.' },
      { step_id: 'analysis_step_2', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Сега ще попълним информация за вашето жилище и имоти. Това е важно за цялостната картина.' },
      { step_id: 'analysis_step_3', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Отлично. Нека разгледаме вашите финансови потоци — доходи и разходи месечно.' },
      { step_id: 'analysis_step_4', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Сега ще разгледаме вашите активи и пасиви — спестявания, инвестиции и кредити.' },
      { step_id: 'analysis_step_5', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Нека поговорим за вашата защита. Имате ли застраховки живот или здраве?' },
      { step_id: 'analysis_step_6', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Много важна тема — пенсионното планиране. Разкажете ми за вашите пенсионни очаквания.' },
      { step_id: 'analysis_step_7', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Ако имате деца, нека планираме и тяхното бъдеще — образование, старт в живота.' },
      { step_id: 'analysis_step_8', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Почти готово! Нека поговорим за вашите приоритети — кое е най-важно за вас в момента?' },
      { step_id: 'analysis_step_9', language_code: 'bg', trigger_type: 'step_enter', avatar_state: 'celebrating',
        text_fallback: 'Прекрасно! Успешно попълнихте финансовия анализ. Ще генерирам вашия персонален план.' },

      // ── Response bands ──
      { step_id: 'analysis_reserve_band_critical', language_code: 'bg', trigger_type: 'response_band', avatar_state: 'concerned',
        text_fallback: 'Вашият резерв е под 1 месец. Това е критично — предлагам незабавно да изградим авариен фонд.' },
      { step_id: 'analysis_reserve_band_low', language_code: 'bg', trigger_type: 'response_band', avatar_state: 'concerned',
        text_fallback: 'Резервът ви е между 1 и 3 месеца. Препоръчвам увеличаване до поне 3-6 месечни разхода.' },
      { step_id: 'analysis_reserve_band_ok', language_code: 'bg', trigger_type: 'response_band', avatar_state: 'talking',
        text_fallback: 'Резервът ви е между 3 и 6 месеца. Добра основа! Можем да насочим допълнителни средства към инвестиции.' },
      { step_id: 'analysis_reserve_band_excellent', language_code: 'bg', trigger_type: 'response_band', avatar_state: 'celebrating',
        text_fallback: 'Отличен резерв — над 6 месеца! Можем смело да планираме агресивно инвестиционно портфолио.' },
      { step_id: 'analysis_debt_band_high', language_code: 'bg', trigger_type: 'response_band', avatar_state: 'concerned',
        text_fallback: 'Вашата задлъжнялост надвишава 40% от дохода. Ще включим оптимизация на кредитите в плана.' },
      { step_id: 'analysis_debt_band_ok', language_code: 'bg', trigger_type: 'response_band', avatar_state: 'talking',
        text_fallback: 'Вашите кредити са в разумни граници. Добре се справяте с управлението на дълга.' },
      { step_id: 'analysis_pension_band_gap', language_code: 'bg', trigger_type: 'response_band', avatar_state: 'concerned',
        text_fallback: 'Има значителна разлика между очакваната и желаната пенсия. Ще планираме допълнително спестяване.' },
      { step_id: 'analysis_pension_band_ok', language_code: 'bg', trigger_type: 'response_band', avatar_state: 'talking',
        text_fallback: 'Пенсионната ви ситуация е добра. Ще оптимизираме допълнително с Unit Linked продукт.' },

      // ── Completion ──
      { step_id: 'completion', language_code: 'bg', trigger_type: 'completion', avatar_state: 'celebrating',
        text_fallback: 'Поздравления! Вашият финансов план е готов. Разгледайте го внимателно — той е изготвен специално за вас.' },

      // ── Validation errors ──
      { step_id: 'validation_income_missing', language_code: 'bg', trigger_type: 'validation_error', avatar_state: 'listening',
        text_fallback: 'Нуждаем се от информация за вашия доход, за да продължим. Моля, попълнете полето.' },
      { step_id: 'validation_age_missing', language_code: 'bg', trigger_type: 'validation_error', avatar_state: 'listening',
        text_fallback: 'Моля, въведете вашата дата на раждане, за да продължим с анализа.' },

      // ── EN versions ──
      { step_id: 'planner_step_1', language_code: 'en', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Welcome! I am your financial assistant. Let us understand your financial situation together. What is your name?' },
      { step_id: 'planner_step_2', language_code: 'en', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Great! Tell me a bit more about your family status — do you live alone or do you have a partner and children?' },
      { step_id: 'planner_step_3', language_code: 'en', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Perfect. Now let us talk about your housing situation. Do you rent or own your home?' },
      { step_id: 'planner_step_4', language_code: 'en', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Understood. Do you own a car? Knowing your assets will help me build a complete picture.' },
      { step_id: 'planner_step_5', language_code: 'en', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Now let us talk about your income. What is your monthly net income?' },
      { step_id: 'planner_step_6', language_code: 'en', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Very good. Are you able to save each month, and approximately how much?' },
      { step_id: 'planner_step_7', language_code: 'en', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Excellent. What is the total amount of your current savings and investments?' },
      { step_id: 'planner_step_8', language_code: 'en', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Do you have any loans or credit? A mortgage, consumer loan, or credit card?' },
      { step_id: 'planner_step_9', language_code: 'en', trigger_type: 'step_enter', avatar_state: 'celebrating',
        text_fallback: 'Thank you! I have gathered enough information to build your financial profile. Let us see the results.' },
      { step_id: 'analysis_step_1', language_code: 'en', trigger_type: 'step_enter', avatar_state: 'talking',
        text_fallback: 'Welcome to the detailed financial analysis. We will fill in your complete financial profile together. Let us start with your personal information.' },
      { step_id: 'analysis_step_9', language_code: 'en', trigger_type: 'step_enter', avatar_state: 'celebrating',
        text_fallback: 'Wonderful! You have successfully completed the financial analysis. I will now generate your personalized plan.' },
      { step_id: 'analysis_reserve_band_critical', language_code: 'en', trigger_type: 'response_band', avatar_state: 'concerned',
        text_fallback: 'Your reserve is below 1 month. This is critical — I strongly recommend building an emergency fund immediately.' },
      { step_id: 'analysis_reserve_band_low', language_code: 'en', trigger_type: 'response_band', avatar_state: 'concerned',
        text_fallback: 'Your reserve is between 1 and 3 months. I recommend increasing it to at least 3-6 months of expenses.' },
      { step_id: 'analysis_reserve_band_ok', language_code: 'en', trigger_type: 'response_band', avatar_state: 'talking',
        text_fallback: 'Your reserve is between 3 and 6 months. A solid foundation! We can direct extra funds toward investments.' },
      { step_id: 'analysis_reserve_band_excellent', language_code: 'en', trigger_type: 'response_band', avatar_state: 'celebrating',
        text_fallback: 'Excellent reserve — over 6 months! We can confidently plan an aggressive investment portfolio.' },
      { step_id: 'completion', language_code: 'en', trigger_type: 'completion', avatar_state: 'celebrating',
        text_fallback: 'Congratulations! Your financial plan is ready. Review it carefully — it has been crafted specifically for you.' },
    ];

    // Upsert each VoiceRulebook entry by step_id + language_code
    let voiceCreated = 0, voiceUpdated = 0;
    for (const entry of voiceEntries) {
      const existing = await base44.asServiceRole.entities.VoiceRulebook.filter({
        step_id: entry.step_id,
        language_code: entry.language_code,
      });
      if (existing && existing.length > 0) {
        await base44.asServiceRole.entities.VoiceRulebook.update(existing[0].id, {
          trigger_type: entry.trigger_type,
          text_fallback: entry.text_fallback,
          avatar_state: entry.avatar_state,
          is_active: true,
          version: rulebookVersion,
        });
        voiceUpdated++;
      } else {
        await base44.asServiceRole.entities.VoiceRulebook.create({
          ...entry,
          is_active: true,
          version: rulebookVersion,
        });
        voiceCreated++;
      }
    }

    return Response.json({
      success: true,
      message: 'Rulebook data seeded successfully',
      version: rulebookVersion,
      ruleset_hash,
      voice_rulebook: { created: voiceCreated, updated: voiceUpdated, total: voiceEntries.length },
    });

  } catch (error) {
    console.error('seedRulebookData error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});
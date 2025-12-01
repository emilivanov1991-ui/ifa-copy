// ============================================================
// ТЕХНИЧЕСКИ КОНСТАНТИ ОТ EXCEL ФАЙЛА
// ============================================================

// Валутен курс EUR/BGN
export const EUR_BGN_RATE = 1.96;

// ============================================================
// ЛОГОТА НА ЗАСТРАХОВАТЕЛИ И ФИНАНСОВИ ПАРТНЬОРИ
// ============================================================

export const PROVIDER_LOGOS = {
  // Международни застрахователи
  'MetLife': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/MetLife_logo.svg/200px-MetLife_logo.svg.png',
  'Allianz': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Allianz_logo.svg/200px-Allianz_logo.svg.png',
  'UNIQA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/UNIQA_Insurance_Group_logo.svg/200px-UNIQA_Insurance_Group_logo.svg.png',
  'Generali': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Generali_logo.svg/200px-Generali_logo.svg.png',
  'GRAWE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Grawe_logo.svg/200px-Grawe_logo.svg.png',
  
  // Български застрахователи
  'ДЗИ': 'https://www.dzi.bg/images/dzi-logo.png',
  'Армеец': 'https://www.armeec.bg/images/logo.png',
  'Булинс': 'https://bulins.bg/wp-content/uploads/2020/07/bulins-logo.png',
  'ЛЕВ ИНС': 'https://www.lev-ins.com/images/logo.png',
  'Бул Инс': 'https://www.bulins.bg/images/logo.png',
  'ЕВРОИНС': 'https://www.euroins.bg/images/euroins-logo.png',
  'EUROINS': 'https://www.euroins.bg/images/euroins-logo.png',
  'Застраховане': 'https://www.zastrahovane.bg/images/logo.png',
  'Bulgaria Insurance': 'https://www.bulgariainsurance.bg/images/logo.png',
  'Asset Insurance': 'https://www.assetinsurance.bg/images/logo.png',
  'БАЕЗ': 'https://www.baez.bg/images/logo.png',
  'Булстрад': 'https://www.bulstrad.bg/images/bulstrad-logo.png',
  
  // Пенсионни фондове
  'ОББ': 'https://www.ubb.bg/images/ubb-logo.png',
  'ОББ Пенсионно': 'https://www.ubb.bg/images/ubb-logo.png',
  'Пенсионноосигурителен институт': 'https://www.poi.bg/images/logo.png',
  'ЦКБ Сила': 'https://www.ckbsila.bg/images/logo.png',
  'Доверие': 'https://www.doverie.bg/images/logo.png',
  'Съгласие': 'https://www.saglasie.bg/images/logo.png',
  'ДСК-Родина': 'https://www.dskrodina.bg/images/logo.png',
  'Бъдеще': 'https://www.badeshte.bg/images/logo.png',
  'Топлина': 'https://www.toplina.bg/images/logo.png',
  'ДаллБогг': 'https://www.dallbogg.bg/images/logo.png',
  'DallBogg': 'https://www.dallbogg.bg/images/logo.png',
  
  // Инвестиционни компании
  'Partners Investments': 'https://www.partners.bg/images/logo.png',
  'Partners Group': 'https://www.partners.bg/images/logo.png',
  
  // Инвестиционни мениджъри и ETF доставчици
  'iShares': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/IShares_logo.svg/200px-IShares_logo.svg.png',
  'BlackRock': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/IShares_logo.svg/200px-IShares_logo.svg.png',
  'LYXOR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Lyxor_logo.svg/200px-Lyxor_logo.svg.png',
  'Amundi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Amundi_logo.svg/200px-Amundi_logo.svg.png',
  'Best Doctors': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Best_Doctors_logo.svg/200px-Best_Doctors_logo.svg.png',
  
  // Банки
  'Postbank': 'https://www.postbank.bg/images/logo.png',
  'ЦКБ': 'https://www.ccbank.bg/images/logo.png',
  'Централна Кооперативна Банка': 'https://www.ccbank.bg/images/logo.png',
  'Fibank': 'https://www.fibank.bg/images/logo.png',
  'Първа Инвестиционна Банка': 'https://www.fibank.bg/images/logo.png',
  'UniCredit Bulbank': 'https://www.unicreditbulbank.bg/images/logo.png',
  'Банка ДСК': 'https://www.dskbank.bg/images/logo.png',
  'DSK Bank': 'https://www.dskbank.bg/images/logo.png',
  'Texim Bank': 'https://www.teximbank.bg/images/logo.png',
  'Токуда Банк': 'https://www.tokudabank.bg/images/logo.png',
  'Tokuda Bank': 'https://www.tokudabank.bg/images/logo.png',
  'Общинска Банка': 'https://www.municipalbank.bg/images/logo.png',
  'TBI Bank': 'https://www.tbibank.bg/images/logo.png',
  'ProCredit Bank': 'https://www.procreditbank.bg/images/logo.png',
  'BNP Paribas': 'https://www.bnpparibas.bg/images/logo.png',
  'iBank': 'https://www.ibank.bg/images/logo.png',
  'Ziraat Bank': 'https://www.ziraatbank.bg/images/logo.png',
  'D Bank': 'https://www.dbank.bg/images/logo.png',
  'International Asset Bank': 'https://www.iabank.bg/images/logo.png',
  'Bulgarian American Credit Bank': 'https://www.bacb.bg/images/logo.png',
  'BACB': 'https://www.bacb.bg/images/logo.png',
  'Citibank': 'https://www.citibank.bg/images/logo.png',
  'Citi': 'https://www.citibank.bg/images/logo.png'
};

// Списък на всички доставчици по категория
export const PROVIDERS_BY_CATEGORY = {
  international: ['MetLife', 'Allianz', 'UNIQA', 'Generali', 'GRAWE'],
  bulgarian_insurance: ['ДЗИ', 'Армеец', 'Булинс', 'ЛЕВ ИНС', 'ЕВРОИНС', 'Булстрад', 'БАЕЗ'],
  pension_funds: ['ОББ', 'Пенсионноосигурителен институт', 'ЦКБ Сила', 'Доверие', 'Съгласие', 'ДСК-Родина', 'Алианц', 'Бъдеще', 'Топлина', 'ДаллБогг'],
  investments: ['Partners Investments', 'Partners Group'],
  banks: ['Postbank', 'ОББ', 'ЦКБ', 'Fibank', 'UniCredit Bulbank', 'Банка ДСК', 'Texim Bank', 'Токуда Банк', 'Общинска Банка', 'TBI Bank', 'ProCredit Bank', 'BNP Paribas', 'iBank', 'Ziraat Bank', 'D Bank', 'International Asset Bank', 'BACB', 'Citibank']
};

// Конвертиране дни в години
export const DAYS_PER_YEAR = 365.25;

// ============================================================
// ТАРИФНИ ТАБЛИЦИ - TERM LIFE (TK) от Excel "Term Rates"
// ============================================================

// RIDER тарифи - по възраст и срок (години)
// Структура: { възраст: { срок: тарифа } }
export const TERM_LIFE_RIDER_RATES = {
  0: { 5: 0, 10: 0, 15: 0, 20: 0, 25: 0, 30: 0, 80: 0 },
  15: { 5: 2.25, 10: 2.31, 15: 2.41, 20: 2.46, 25: 2.65, 30: 3, 80: 3.09 },
  16: { 5: 2.34, 10: 2.38, 15: 2.46, 20: 2.53, 25: 2.75, 30: 3.14, 80: 3.25 },
  17: { 5: 2.42, 10: 2.45, 15: 2.51, 20: 2.6, 25: 2.85, 30: 3.3, 80: 3.43 },
  18: { 5: 2.51, 10: 2.49, 15: 2.56, 20: 2.67, 25: 2.95, 30: 3.48, 80: 3.62 },
  19: { 5: 2.56, 10: 2.53, 15: 2.62, 20: 2.75, 25: 3.07, 30: 3.68, 80: 3.81 },
  20: { 5: 2.6, 10: 2.56, 15: 2.66, 20: 2.82, 25: 3.21, 30: 3.87, 80: 4.03 },
  21: { 5: 2.64, 10: 2.59, 15: 2.71, 20: 2.92, 25: 3.37, 30: 4.1, 80: 4.27 },
  22: { 5: 2.69, 10: 2.62, 15: 2.77, 20: 3.02, 25: 3.55, 30: 4.35, 80: 4.54 },
  23: { 5: 2.7, 10: 2.65, 15: 2.84, 20: 3.13, 25: 3.75, 30: 4.62, 80: 4.83 },
  24: { 5: 2.73, 10: 2.7, 15: 2.92, 20: 3.27, 25: 3.98, 30: 4.93, 80: 5.16 },
  25: { 5: 2.74, 10: 2.75, 15: 3, 20: 3.43, 25: 4.2, 30: 5.26, 80: 5.5 },
  26: { 5: 2.75, 10: 2.81, 15: 3.12, 20: 3.63, 25: 4.48, 30: 5.61, 80: 5.89 },
  27: { 5: 2.76, 10: 2.87, 15: 3.24, 20: 3.84, 25: 4.78, 30: 6.02, 80: 6.29 },
  28: { 5: 2.82, 10: 2.98, 15: 3.38, 20: 4.1, 25: 5.12, 30: 6.44, 80: 6.76 },
  29: { 5: 2.9, 10: 3.08, 15: 3.56, 20: 4.38, 25: 5.49, 30: 6.93, 80: 7.27 },
  30: { 5: 2.98, 10: 3.21, 15: 3.78, 20: 4.67, 25: 5.9, 30: 7.46, 80: 7.8 },
  31: { 5: 3.09, 10: 3.38, 15: 4.03, 20: 5.03, 25: 6.34, 30: 8.01, 80: 8.37 },
  32: { 5: 3.21, 10: 3.56, 15: 4.32, 20: 5.41, 25: 6.84, 30: 8.6, 80: 8.99 },
  33: { 5: 3.37, 10: 3.75, 15: 4.65, 20: 5.83, 25: 7.36, 30: 9.24, 80: 9.64 },
  34: { 5: 3.5, 10: 3.98, 15: 5, 20: 6.29, 25: 7.95, 30: 9.91, 80: 10.34 },
  35: { 5: 3.67, 10: 4.27, 15: 5.36, 20: 6.8, 25: 8.59, 30: 10.65, 80: 11.07 },
  36: { 5: 3.92, 10: 4.61, 15: 5.8, 20: 7.34, 25: 9.26, 30: 11.4, 80: 11.88 },
  37: { 5: 4.14, 10: 4.98, 15: 6.27, 20: 7.96, 25: 9.97, 30: 12.24, 80: 12.72 },
  38: { 5: 4.37, 10: 5.41, 15: 6.78, 20: 8.58, 25: 10.74, 30: 13.11, 80: 13.62 },
  39: { 5: 4.7, 10: 5.88, 15: 7.36, 20: 9.31, 25: 11.56, 30: 14.05, 80: 14.59 },
  40: { 5: 5.13, 10: 6.35, 15: 7.99, 20: 10.1, 25: 12.45, 30: 15.05, 80: 15.63 },
  41: { 5: 5.56, 10: 6.9, 15: 8.63, 20: 10.91, 25: 13.33, 30: 16.12, 80: 16.73 },
  42: { 5: 6.1, 10: 7.5, 15: 9.38, 20: 11.78, 25: 14.35, 30: 17.28, 80: 17.93 },
  43: { 5: 6.74, 10: 8.17, 15: 10.15, 20: 12.73, 25: 15.4, 30: 18.52, 80: 19.21 },
  44: { 5: 7.37, 10: 8.9, 15: 11.02, 20: 13.7, 25: 16.53, 30: 19.84, 80: 20.57 },
  45: { 5: 7.88, 10: 9.65, 15: 11.94, 20: 14.75, 25: 17.71, 30: 21.24, 80: 22.03 },
  46: { 5: 8.56, 10: 10.41, 15: 12.89, 20: 15.8, 25: 18.97, 30: 22.76, 80: 23.53 },
  47: { 5: 9.25, 10: 11.3, 15: 13.88, 20: 16.99, 25: 20.34, 30: 24.3, 80: 25.1 },
  48: { 5: 9.95, 10: 12.14, 15: 14.94, 20: 18.2, 25: 21.78, 30: 25.92, 80: 26.78 },
  49: { 5: 10.79, 10: 13.17, 15: 16.04, 20: 19.51, 25: 23.33, 30: 27.67, 80: 28.58 },
  50: { 5: 11.8, 10: 14.34, 15: 17.3, 20: 20.94, 25: 25.03, 30: 29.57, 80: 29.57 },
  51: { 5: 12.66, 10: 15.46, 15: 18.5, 20: 22.43, 25: 26.85, 30: null, 80: 30.58 },
  52: { 5: 13.77, 10: 16.64, 15: 19.89, 20: 24.06, 25: 28.72, 30: null, 80: 31.64 },
  53: { 5: 14.79, 10: 17.92, 15: 21.3, 20: 25.8, 25: 30.69, 30: null, 80: 32.75 },
  54: { 5: 16.03, 10: 19.21, 15: 22.82, 20: 27.66, 25: 32.8, 30: null, 80: 33.89 },
  55: { 5: 17.39, 10: 20.64, 15: 24.41, 20: 29.66, 25: 35.08, 30: null, 80: 35.08 },
  56: { 5: 18.81, 10: 22.07, 15: 26.19, 20: 31.9, 25: null, 30: null, 80: 36.36 },
  57: { 5: 20.09, 10: 23.66, 15: 28.05, 20: 34.12, 25: null, 30: null, 80: 37.65 },
  58: { 5: 21.7, 10: 25.35, 15: 30.12, 20: 36.54, 25: null, 30: null, 80: 39.04 },
  59: { 5: 23.06, 10: 27.08, 15: 32.27, 20: 39.09, 25: null, 30: null, 80: 40.42 },
  60: { 5: 24.59, 10: 28.87, 15: 34.59, 20: 41.86, 25: null, 30: null, 80: 41.86 },
  61: { 5: 26.06, 10: 30.92, 15: 37.22, 20: null, 25: null, 30: null, 80: 42.59 },
  62: { 5: 28.05, 10: 33.21, 15: 39.93, 20: null, 25: null, 30: null, 80: 44.2 },
  63: { 5: 29.86, 10: 35.65, 15: 42.8, 20: null, 25: null, 30: null, 80: 45.85 },
  64: { 5: 32.07, 10: 38.39, 15: 46, 20: null, 25: null, 30: null, 80: 47.65 },
  65: { 5: 34.2, 10: 41.32, 15: 49.48, 20: null, 25: null, 30: null, 80: 49.48 }
};

// BASIC тарифи - по възраст и срок (години)
export const TERM_LIFE_BASIC_RATES = {
  0: { 5: 0, 10: 0, 15: 0, 20: 0, 25: 0, 30: 0 },
  15: { 5: 3.65, 10: 3.6, 15: 3.69, 20: 3.66, 25: 3.85, 30: 4.19 },
  16: { 5: 3.74, 10: 3.66, 15: 3.75, 20: 3.73, 25: 3.95, 30: 4.34 },
  17: { 5: 3.82, 10: 3.73, 15: 3.79, 20: 3.8, 25: 4.05, 30: 4.5 },
  18: { 5: 3.91, 10: 3.78, 15: 3.85, 20: 3.87, 25: 4.15, 30: 4.68 },
  19: { 5: 3.96, 10: 3.82, 15: 3.9, 20: 3.95, 25: 4.27, 30: 4.88 },
  20: { 5: 4, 10: 3.84, 15: 3.94, 20: 4.02, 25: 4.41, 30: 5.07 },
  21: { 5: 4.04, 10: 3.87, 15: 3.99, 20: 4.12, 25: 4.57, 30: 5.3 },
  22: { 5: 4.09, 10: 3.9, 15: 4.05, 20: 4.22, 25: 4.75, 30: 5.55 },
  23: { 5: 4.1, 10: 3.94, 15: 4.13, 20: 4.33, 25: 4.95, 30: 5.82 },
  24: { 5: 4.13, 10: 3.99, 15: 4.2, 20: 4.47, 25: 5.18, 30: 6.13 },
  25: { 5: 4.14, 10: 4.03, 15: 4.29, 20: 4.63, 25: 5.4, 30: 6.46 },
  26: { 5: 4.15, 10: 4.09, 15: 4.41, 20: 4.83, 25: 5.68, 30: 6.82 },
  27: { 5: 4.16, 10: 4.16, 15: 4.52, 20: 5.04, 25: 5.98, 30: 7.22 },
  28: { 5: 4.22, 10: 4.27, 15: 4.67, 20: 5.3, 25: 6.32, 30: 7.64 },
  29: { 5: 4.3, 10: 4.37, 15: 4.84, 20: 5.59, 25: 6.69, 30: 8.13 },
  30: { 5: 4.38, 10: 4.5, 15: 5.06, 20: 5.88, 25: 7.11, 30: 8.66 },
  31: { 5: 4.49, 10: 4.67, 15: 5.32, 20: 6.23, 25: 7.54, 30: 9.22 },
  32: { 5: 4.61, 10: 4.84, 15: 5.6, 20: 6.61, 25: 8.04, 30: 9.81 },
  33: { 5: 4.77, 10: 5.04, 15: 5.93, 20: 7.03, 25: 8.56, 30: 10.45 },
  34: { 5: 4.9, 10: 5.26, 15: 6.29, 20: 7.5, 25: 9.15, 30: 11.12 },
  35: { 5: 5.08, 10: 5.56, 15: 6.65, 20: 8.01, 25: 9.8, 30: 11.86 },
  36: { 5: 5.32, 10: 5.9, 15: 7.09, 20: 8.55, 25: 10.47, 30: 12.6 },
  37: { 5: 5.55, 10: 6.27, 15: 7.56, 20: 9.16, 25: 11.18, 30: 13.45 },
  38: { 5: 5.78, 10: 6.7, 15: 8.07, 20: 9.79, 25: 11.95, 30: 14.31 },
  39: { 5: 6.11, 10: 7.18, 15: 8.65, 20: 10.52, 25: 12.77, 30: 15.26 },
  40: { 5: 6.55, 10: 7.64, 15: 9.28, 20: 11.31, 25: 13.66, 30: 16.26 },
  41: { 5: 6.97, 10: 8.19, 15: 9.92, 20: 12.12, 25: 14.55, 30: 17.33 },
  42: { 5: 7.51, 10: 8.8, 15: 10.67, 20: 12.99, 25: 15.56, 30: 18.49 },
  43: { 5: 8.16, 10: 9.47, 15: 11.44, 20: 13.94, 25: 16.62, 30: 19.73 },
  44: { 5: 8.79, 10: 10.2, 15: 12.32, 20: 14.92, 25: 17.75, 30: 21.05 },
  45: { 5: 9.3, 10: 10.95, 15: 13.24, 20: 15.97, 25: 18.92, 30: 22.45 },
  46: { 5: 9.99, 10: 11.71, 15: 14.19, 20: 17.02, 25: 20.19, 30: 23.98 },
  47: { 5: 10.68, 10: 12.6, 15: 15.18, 20: 18.21, 25: 21.56, 30: 25.52 },
  48: { 5: 11.38, 10: 13.45, 15: 16.24, 20: 19.42, 25: 23, 30: 27.15 },
  49: { 5: 12.22, 10: 14.48, 15: 17.35, 20: 20.74, 25: 24.56, 30: 28.9 },
  50: { 5: 13.24, 10: 15.65, 15: 18.61, 20: 22.16, 25: 26.26, 30: 30.8 },
  51: { 5: 14.1, 10: 16.77, 15: 19.81, 20: 23.66, 25: 28.08, 30: null },
  52: { 5: 15.22, 10: 17.95, 15: 21.2, 20: 25.29, 25: 29.95, 30: null },
  53: { 5: 16.24, 10: 19.24, 15: 22.61, 20: 27.04, 25: 31.92, 30: null },
  54: { 5: 17.5, 10: 20.53, 15: 24.13, 20: 28.9, 25: 34.04, 30: null },
  55: { 5: 18.86, 10: 21.97, 15: 25.73, 20: 30.9, 25: 36.32, 30: null },
  56: { 5: 20.29, 10: 23.4, 15: 27.51, 20: 33.14, 25: null, 30: null },
  57: { 5: 21.57, 10: 25, 15: 29.38, 20: 35.36, 25: null, 30: null },
  58: { 5: 23.19, 10: 26.69, 15: 31.46, 20: 37.79, 25: null, 30: null },
  59: { 5: 24.55, 10: 28.43, 15: 33.6, 20: 40.35, 25: null, 30: null },
  60: { 5: 26.09, 10: 30.22, 15: 35.93, 20: 43.12, 25: null, 30: null },
  61: { 5: 27.57, 10: 32.28, 15: 38.57, 20: null, 25: null, 30: null },
  62: { 5: 29.57, 10: 34.57, 15: 41.28, 20: null, 25: null, 30: null },
  63: { 5: 31.39, 10: 37.02, 15: 44.16, 20: null, 25: null, 30: null },
  64: { 5: 33.6, 10: 39.76, 15: 47.37, 20: null, 25: null, 30: null },
  65: { 5: 35.75, 10: 42.71, 15: 50.86, 20: null, 25: null, 30: null }
};

// Legacy compatibility - keep old structure for backward compatibility
export const TERM_LIFE_RATES = {
  // Използва RIDER тарифите по подразбиране
  male_nonsmoker: TERM_LIFE_RIDER_RATES,
  male_smoker: {}, // Ще се попълни с множител 1.5
  female_nonsmoker: {}, // Ще се попълни с по-ниски тарифи
  female_smoker: {} // Ще се попълни с множител 1.5
};

// ============================================================
// ТАРИФНИ ТАБЛИЦИ - EDUCATION PLAN (детски UL)
// ============================================================

// Коефициенти за образователен план по години до образование
// колона 19 от Excel таблицата
export const EDUCATION_PLAN_COEFFICIENTS = {
  1: 0.98,
  2: 0.95,
  3: 0.92,
  4: 0.88,
  5: 0.85,
  6: 0.82,
  7: 0.79,
  8: 0.76,
  9: 0.73,
  10: 0.70,
  11: 0.67,
  12: 0.64,
  13: 0.61,
  14: 0.58,
  15: 0.55,
  16: 0.52,
  17: 0.49,
  18: 0.46
};

// ============================================================
// ТАРИФНИ ТАБЛИЦИ - UL INVESTMENT
// ============================================================

// Такси за UL продукти
export const UL_FEES = {
  entry_fee_percent: 3.0,        // Входна такса %
  management_fee_percent: 1.5,   // Годишна такса за управление %
  exit_fee_year_1: 5.0,          // Изходна такса година 1
  exit_fee_year_2: 4.0,
  exit_fee_year_3: 3.0,
  exit_fee_year_4: 2.0,
  exit_fee_year_5: 1.0,
  exit_fee_year_6_plus: 0.0
};

// MetLife Unit Linked - детайлни такси от Sheet7/8/9
// Прилага се за: Клиент (Sheet7), Партньор (Sheet8), Дете1/2/3 (Sheet9)
export const METLIFE_UL_FEES = {
  policy_fee_annual: 15,          // €15/година Policy Fee
  fixed_fee_monthly: 0,           // €0/месец Fixed Fee
  variable_fee_percent: 1.75,     // 1.75% * Account Value
  ph_irr: 0.0574890383883506      // ~5.75% вътрешна норма на възвръщаемост
};

// ============================================================
// METLIFE UL - CAL! TAB ДАННИ
// Таблици със смъртност, surrender charges, premium bonuses
// ============================================================

// Mortality Tables - Bulgarian 2008-2010 (qx per 1000)
// Структура: възраст -> { male: qx, female: qx }
export const METLIFE_MORTALITY_TABLES = {
  male_weight: 0.8,    // Тегло за мъже в смесена смъртност
  female_weight: 0.2,  // Тегло за жени в смесена смъртност
  qx: {
    0: { male: 10.4667, female: 8.3265 },
    1: { male: 0.8631, female: 0.8105 },
    2: { male: 0.2755, female: 0.4431 },
    3: { male: 0.4692, female: 0.2624 },
    4: { male: 0.3255, female: 0.1807 },
    5: { male: 0.4914, female: 0.1928 },
    10: { male: 0.1934, female: 0.2031 },
    15: { male: 0.4320, female: 0.2681 },
    20: { male: 0.9754, female: 0.3689 },
    25: { male: 1.1798, female: 0.4777 },
    30: { male: 1.2442, female: 0.6015 },
    35: { male: 1.8178, female: 0.8255 },
    40: { male: 3.1639, female: 1.2941 },
    45: { male: 5.4322, female: 2.4594 },
    50: { male: 9.2432, female: 3.4757 },
    55: { male: 13.7477, female: 5.8224 },
    60: { male: 21.6724, female: 7.7226 },
    65: { male: 29.2752, female: 12.1736 }
  }
};

// Surrender Charges по години (B3 секция от Cal!)
export const METLIFE_UL_SURRENDER_CHARGES = {
  regular_premium: {
    1: 1.00,   // 100%
    2: 1.00,
    3: 0.60,
    4: 0.50,
    5: 0.40,
    6: 0.30,
    7: 0.20,
    8: 0.10,
    9: 0,
    10: 0,
    11: 0,
    12: 0
  },
  single_premium: {
    1: 0.05,   // 5%
    2: 0.03,
    3: 0.02,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0
  }
};

// Premium Bonus структура (B2 секция от Cal!)
export const METLIFE_UL_PREMIUM_BONUS = {
  regular_premium: [
    { from: 0, to: 1200, bonus: 0 },
    { from: 1200, to: 1800, bonus: 0.01 },
    { from: 1800, to: 3000, bonus: 0.02 },
    { from: 3000, to: 4200, bonus: 0.03 },
    { from: 4200, to: Infinity, bonus: 0.04 }
  ],
  single_premium: [
    { from: 0, to: 25000, bonus: 0 },
    { from: 25000, to: 50000, bonus: 0.01 },
    { from: 50000, to: 75000, bonus: 0.02 },
    { from: 75000, to: 100000, bonus: 0.03 },
    { from: 100000, to: Infinity, bonus: 0.04 }
  ]
};

// AV % Charge based on premium level (B5 секция от Cal!)
export const METLIFE_UL_AV_CHARGES = {
  regular_premium: [
    { from_monthly: 25, annual: 300, charge: 0.02 },
    { from_monthly: 60, annual: 720, charge: 0.0175 },
    { from_monthly: 80, annual: 960, charge: 0.015 },
    { from_monthly: 100, annual: 1200, charge: 0.0125 },
    { from_monthly: 125, annual: 1500, charge: 0.01 },
    { from_monthly: 200, annual: 2400, charge: 0.0075 },
    { from_monthly: 300, annual: 3600, charge: 0.005 },
    { from_monthly: 400, annual: 4800, charge: 0.005 },
    { from_monthly: 500, annual: 6000, charge: 0.005 }
  ],
  single_premium: [
    { from: 5000, charge: 0.015 },
    { from: 15000, charge: 0.0125 },
    { from: 25000, charge: 0.01 },
    { from: 50000, charge: 0.0075 },
    { from: 100000, charge: 0.0075 }
  ]
};

// Min Face Amount multiplier по възраст (B4 секция от Cal!)
export const METLIFE_UL_FACE_AMOUNT_RULES = {
  age_brackets: [
    { from: 0, to: 17, min_multiplier: null, max_multiplier: null },
    { from: 18, to: 25, min_multiplier: 10, max_multiplier: null },
    { from: 26, to: 35, min_multiplier: 8, max_multiplier: null },
    { from: 36, to: 45, min_multiplier: 6, max_multiplier: null },
    { from: 46, to: 55, min_multiplier: 4, max_multiplier: null },
    { from: 56, to: 65, min_multiplier: 2, max_multiplier: null }
  ]
};

// Investible Premium коефициенти по години (B1 секция от Cal!)
export const METLIFE_UL_INVESTIBLE_PREMIUM = {
  regular_premium: {
    year_1: 0.30,    // 100% - 70% = 30% investible
    year_2: 0.60,    // 100% - 40% = 60% investible
    year_3_plus: 1.00 // 100% investible
  },
  single_premium: {
    all_years: 1.00   // 100% investible
  }
};

// Fund Allocation стратегии (от Cal! горен десен ъгъл)
export const METLIFE_UL_FUND_ALLOCATION = {
  conservative: { globalBond: 0.60, globalStock: 0.30, emergingMarkets: 0.10, commodities: 0 },
  balanced: { globalBond: 0.20, globalStock: 0.55, emergingMarkets: 0.25, commodities: 0 },
  aggressive: { globalBond: 0.10, globalStock: 0.35, emergingMarkets: 0.55, commodities: 0 }
};

// Historical ETF returns (от Cal! долен ъгъл)
export const METLIFE_UL_ETF_RETURNS = {
  // Средни исторически доходности по фонд тип
  globalBond: 0.0564,      // Citi G7 in Euro
  globalStock: 0.0817,     // MSCI World NR Euro
  emergingMarkets: 0.0477, // MSCI EM NR Euro (adjusted)
  commodities: 0.0682      // Reuters/Jefferies in Euro
};

// Очаквана доходност по стратегии (годишна)
export const STRATEGY_RETURNS = {
  conservative: 0.03,   // 3%
  balanced: 0.06,       // 6%
  dynamic: 0.08,        // 8%
  aggressive: 0.10      // 10%
};

// ============================================================
// PARTNERS INVESTMENTS - МИНИМАЛНИ ИЗИСКВАНИЯ
// ============================================================

// Минимални изисквания за регулярни инвестиции
export const PARTNERS_INVESTMENTS_REGULAR_MIN = {
  real_estate: {
    strategy: 'Real Estate',
    min_period_years: 7,
    min_monthly_eur: 30,
    min_total_eur: 2520  // 7 години * 12 месеца * 30 EUR
  },
  conservative: {
    strategy: 'Conservative',
    min_period_years: 5,
    min_monthly_eur: 30,
    min_total_eur: 1800  // 5 години * 12 месеца * 30 EUR
  },
  balanced: {
    strategy: 'Balanced',
    min_period_years: 7,
    min_monthly_eur: 30,
    min_total_eur: 2520  // 7 години * 12 месеца * 30 EUR
  },
  dynamic: {
    strategy: 'Dynamic',
    min_period_years: 10,
    min_monthly_eur: 30,
    min_total_eur: 3600  // 10 години * 12 месеца * 30 EUR
  },
  max_period_years: 30  // Максимален срок на инвестиция
};

// Минимални изисквания за еднократни инвестиции
export const PARTNERS_INVESTMENTS_SINGLE_MIN = {
  min_amount_eur: 5000,  // Минимум 5000 EUR за еднократна инвестиция
  strategies: ['Conservative', 'Balanced', 'Dynamic', 'Real Estate']
};

// ============================================================
// ФИНАНСОВ ПЛАН - СПИСЪК НА ПРОДУКТИТЕ И ПРИОРИТЕТИ
// ============================================================

// Видове продукти в плана
export const FINANCIAL_PLAN_PRODUCTS = {
  // Застрахователни продукти
  insurance: [
    { id: 'term_life', name: 'METLIFE Срочен Живот', provider: 'MetLife', coverages: ['Смърт', 'Смърт от злополука', 'Тежки заболявания (40)', 'Трайна загуба на работоспособност', 'Фрактури и изгаряния'] },
    { id: 'critical_illness', name: 'UNIQA Здраве и ценност Европа', provider: 'UNIQA', coverages: ['Лечение на критични заболявания'] },
    { id: 'ul_telemedicine', name: 'METLIFE UL Телемедицина', provider: 'MetLife', coverages: ['Телемедицина'] },
    { id: 'health_supplementary', name: 'Допълнително Здравно', provider: 'Various', coverages: ['Допълнително здравно осигуряване'] },
    { id: 'ul_child_protection', name: 'METLIFE UL Детска защита', provider: 'MetLife', coverages: ['Споразумение за защита на детето'] },
    { id: 'best_doctors', name: 'Best Doctors', provider: 'ДЗИ/MetLife', coverages: ['Критични заболявания'] },
    { id: 'uniqa_health', name: 'Уника Здр. и ценност', provider: 'UNIQA', coverages: ['Здравни пакети'] },
    { id: 'dzi_zakrila', name: 'ДЗИ Закрила', provider: 'ДЗИ', coverages: ['Злополука'] },
    { id: 'dzi_dinamik', name: 'ДЗИ Динамик', provider: 'ДЗИ', coverages: ['Злополука'] },
    { id: 'mountain_abroad', name: 'Планинска/За Чужбина', provider: 'UNIQA/ДЗИ/Generali', coverages: ['Пътуване'] }
  ],
  
  // Инвестиционни продукти
  investment: [
    { id: 'ul_investment', name: 'Unit Linked Инвестиция', provider: 'MetLife', type: 'regular' },
    { id: 'partners_regular', name: 'Partners Investments Регулярна', provider: 'Partners Investments', type: 'regular' },
    { id: 'partners_single', name: 'Partners Investments Еднократна', provider: 'Partners Investments', type: 'single' }
  ],
  
  // Пенсионни продукти
  pension: [
    { id: 'pillar_2', name: 'Универсален Пенсионен Фонд', provider: 'Various', type: 'mandatory' },
    { id: 'pillar_3', name: 'Доброволно Пенсионно Осигуряване', provider: 'Various', type: 'voluntary' }
  ],
  
  // Имуществени застраховки
  property: [
    { id: 'apartment', name: 'Застраховка Апартамент', provider: 'Various', type: 'property' },
    { id: 'car_liability', name: 'ГО на автомобил', provider: 'Various', type: 'car' },
    { id: 'car_kasko', name: 'КАСКО на автомобил', provider: 'Various', type: 'car' },
    { id: 'home', name: 'Застраховка за дома', provider: 'Various', type: 'property' }
  ]
};

// Приоритети в плана
export const FINANCIAL_PLAN_PRIORITIES = {
  1: { name: 'Защита на дохода', description: 'Осигуряване на доход при загуба на работоспособност или смърт' },
  2: { name: 'Увеличаване на резервите', description: 'Изграждане на финансов резерв за извънредни ситуации' },
  3: { name: 'Ново жилище', description: 'Финансиране на покупка или подобрение на жилище' },
  4: { name: 'Достойна пенсия', description: 'Осигуряване на доходи след пенсиониране' },
  5: { name: 'Подсигуряване на децата', description: 'Образование и старт в живота на децата' },
  6: { name: 'Защита на собствеността', description: 'Застраховка на имущество и активи' }
};

// Препоръчителна периодичност на плащане по доставчик
export const PAYMENT_FREQUENCY_RECOMMENDATIONS = {
  'MetLife': 'annual',      // Годишно
  'UNIQA': 'annual',
  'ДЗИ': 'annual',
  'Generali': 'annual',
  'Partners Investments': 'monthly'  // Месечно за инвестиции
};

// Лихвени проценти за различни типове заеми (за оптимизация)
export const LOAN_INTEREST_RATES = {
  mortgage: 0.022,           // 2.2% ипотечен кредит
  mortgage_refinance: 0.022, // 2.2% рефинансиране ипотечен
  consumer: 0.044,           // 4.4% потребителски кредит
  consumer_refinance: 0.044, // 4.4% рефинансиране потребителски
  credit_card: 0.127,        // 12.7% кредитни карти
  leasing: 0.054,            // 5.4% лизинг
  overdraft: 0.074,          // 7.4% овърдрафт
  installment: 0.162         // 16.2% продукти на изплащане
};

// Данъчно облекчение параметри
export const TAX_RELIEF = {
  rate: 0.10,  // 10% данъчна ставка за облекчение
  max_percent_income: 0.10,  // Макс 10% от дохода
  max_amount_bgn: 2400  // Макс 2400 лв годишно (вече записано в PENSION_PLAN_RATES)
};

// Правила за резерв
export const RESERVE_RULES = {
  recommended_months: 6,  // Препоръчителни 6 месеца разходи
  calculation_formula: 'monthly_expenses * desired_months'
};

// ============================================================
// ТАРИФНИ ТАБЛИЦИ - PENSION PLAN
// ============================================================

export const PENSION_PLAN_RATES = {
  // Доходност на УПФ по доставчици
  providers: {
    'ОББ': { return_24m: 6.01, return_since_2004: 3.21, origin: 'Белгия' },
    'ДСК-Родина': { return_24m: 5.49, return_since_2004: 2.92, origin: 'Унгария' },
    'Съгласие': { return_24m: 5.20, return_since_2004: 2.80, origin: 'България' },
    'Доверие': { return_24m: 4.90, return_since_2004: 2.65, origin: 'България' },
    'Алианц': { return_24m: 4.80, return_since_2004: 2.55, origin: 'Германия' }
  },
  // Данъчно облекчение - max 10% от дохода, max 2400 лв/год
  tax_benefit_percent: 0.10,
  tax_benefit_max_bgn: 2400
};

// ============================================================
// ТАРИФНИ ТАБЛИЦИ - CRITICAL ILLNESS (MLC)
// UNIQA СЕЛЕКТ - Лечение на критични заболявания
// ============================================================

// План "Европа" - Застрахователни премии в EUR
// Структура: { възрастова_група: { месечна, тримесечна, шестмесечна, годишна } }
export const UNIQA_SELECT_EUROPA_RATES = {
  '0-17':  { monthly: 6.6096, quarterly: 19.4412, semiannual: 38.5152, annual: 75.5208 },
  '18-30': { monthly: 12.7908, quarterly: 37.6482, semiannual: 74.562, annual: 145.1864 },
  '31-40': { monthly: 13.9842, quarterly: 41.1498, semiannual: 81.4776, annual: 159.7728 },
  '41-45': { monthly: 16.8096, quarterly: 49.4598, semiannual: 97.9608, annual: 192.0864 },
  '46-50': { monthly: 20.2044, quarterly: 60.0984, semiannual: 119.0288, annual: 233.376 },
  '51-55': { monthly: 25.2042, quarterly: 74.1642, semiannual: 146.88, annual: 288.0072 },
  '56-60': { monthly: 31.11, quarterly: 91.5552, semiannual: 181.3356, annual: 355.572 },
  '61-65': { monthly: 38.148, quarterly: 112.2714, semiannual: 222.3468, annual: 435.8928 }
};

// План "Свят" - Застрахователни премии в EUR  
// ВСИЧКИ СУМИ СА С ВКЛЮЧЕН 2% ДАНЪК, СУМАТА Е ФИНАЛНА
export const UNIQA_SELECT_WORLD_RATES = {
  '0-17':  { monthly: 13.2192, quarterly: 38.8926, semiannual: 77.0406, annual: 151.0416 },
  '18-30': { monthly: 25.5816, quarterly: 75.2862, semiannual: 149.1138, annual: 292.3728 },
  '31-40': { monthly: 27.9582, quarterly: 82.2884, semiannual: 162.9552, annual: 319.5456 },
  '46-50': { monthly: 40.8408, quarterly: 120.1866, semiannual: 238.0476, annual: 466.752 },
  '51-55': { monthly: 50.8982, quarterly: 148.3584, semiannual: 293.76, annual: 576.0144 },
  '56-60': { monthly: 62.7096, quarterly: 184.5312, semiannual: 362.6712, annual: 711.144 },
  '61-65': { monthly: 76.296, quarterly: 224.5326, semiannual: 444.6804, annual: 871.7856 }
};

// ============================================================
// ДЗИ БЕСТ ДОКТОРС - Лечение на критични заболявания
// Застрахователни премии в EUR (с включен 2% данък)
// ============================================================

// Премия за индивидуални и семейни застраховки (EUR)
export const DZI_BEST_DOCTORS_INDIVIDUAL_RATES = {
  '0-18':  { annual: 124.032, semiannual: 62.016, quarterly: 31.008, monthly: 10.404 },
  '19-44': { annual: 251.124, semiannual: 125.562, quarterly: 62.832, monthly: 21.012 },
  '45-49': { annual: 357.918, semiannual: 179.01, quarterly: 89.556, monthly: 29.886 },
  '50-54': { annual: 411.672, semiannual: 205.836, quarterly: 102.918, monthly: 34.374 },
  '55-64': { annual: 517.65, semiannual: 258.876, quarterly: 129.438, monthly: 43.146 }
};

// Премия за индивидуални (групови застраховки) (EUR)
export const DZI_BEST_DOCTORS_GROUP_RATES = {
  '0-18':  { annual: 114.138, semiannual: 57.12, quarterly: 28.56, monthly: 9.588 },
  '19-44': { annual: 231.234, semiannual: 115.668, quarterly: 57.834, monthly: 19.326 },
  '45-49': { annual: 329.562, semiannual: 164.832, quarterly: 82.416, monthly: 27.54 },
  '50-54': { annual: 379.092, semiannual: 189.516, quarterly: 94.758, monthly: 31.62 },
  '55-64': { annual: 485.826, semiannual: 238.374, quarterly: 119.238, monthly: 39.78 }
};

// Премия за индивидуални и семейни застраховки 65-85 (EUR)
export const DZI_BEST_DOCTORS_SENIOR_INDIVIDUAL_RATES = {
  '65-85': { annual: 674.78, semiannual: 311.016, quarterly: 155.958, monthly: 52.02 }
};

// Премия за групови застраховки 65-85 (EUR)
export const DZI_BEST_DOCTORS_SENIOR_GROUP_RATES = {
  '65-85': { annual: 576.06, semiannual: 287.13, quarterly: 143.616, monthly: 47.94 }
};

// ============================================================
// ДЗИ ЗАКРИЛА - Бюджетна застраховка (ако няма средства за MetLife)
// Използва се САМО ако клиентът няма възможност за по-добра застраховка
// ============================================================

export const DZI_ZAKRILA_PLANS = {
  silver: {
    name: 'Silver',
    monthly_premium: 10,
    coverages: {
      death_accident: 20000,           // Смърт вследствие на злополука
      death_traffic: 30000,            // Смърт вследствие на ПТП
      disability_50_accident: 20000,   // Инвалидност над 50% от злополука
      disability_50_traffic: 30000,    // Инвалидност над 50% от ПТП
      temporary_disability: 2000,      // Временна неработоспособност (% от)
      fractures_burns: 8000,           // Счупени кости и изгаряния (% от)
      surgery_organs: 1000,            // Суми за оперативно лечение (% от)
      hospital_daily: 10               // Дневни пари за болничен престой
    }
  },
  gold: {
    name: 'Gold',
    monthly_premium: 15,
    coverages: {
      death_accident: 30000,
      death_traffic: 50000,
      disability_50_accident: 30000,
      disability_50_traffic: 50000,
      temporary_disability: 5000,
      fractures_burns: 10000,
      surgery_organs: 3000,
      hospital_daily: 30
    }
  },
  platinum: {
    name: 'Platinum',
    monthly_premium: 30,
    coverages: {
      death_accident: 50000,
      death_traffic: 75000,
      disability_50_accident: 50000,
      disability_50_traffic: 75000,
      temporary_disability: 10000,
      fractures_burns: 20000,
      surgery_organs: 10000,
      hospital_daily: 100
    }
  }
};

// Помощна функция - препоръчва ДЗИ Закрила само ако няма бюджет за MetLife
export const shouldRecommendDziZakrila = (availableBudget) => {
  // Ако месечният бюджет е под 30 EUR, препоръчваме ДЗИ Закрила
  return availableBudget < 30;
};

// Legacy compatibility
export const CRITICAL_ILLNESS_RATES = {
  // Тарифа на 1000 EUR покритие по възраст (стара структура)
  male: {
    17: 6.61, 25: 12.79, 30: 12.79, 35: 13.98, 40: 13.98, 45: 16.81, 50: 20.20, 55: 25.20, 60: 31.11, 65: 38.15
  },
  female: {
    17: 6.61, 25: 12.79, 30: 12.79, 35: 13.98, 40: 13.98, 45: 16.81, 50: 20.20, 55: 25.20, 60: 31.11, 65: 38.15
  }
};

// Помощна функция за избор на по-изгодна оферта (UNIQA vs ДЗИ)
// По подразбиране приоритизира UNIQA освен ако ДЗИ не е по-евтино
export const getBestCriticalIllnessRate = (age, preferProvider = null) => {
  // Определяме възрастова група за UNIQA
  let uniqaGroup;
  if (age <= 17) uniqaGroup = '0-17';
  else if (age <= 30) uniqaGroup = '18-30';
  else if (age <= 40) uniqaGroup = '31-40';
  else if (age <= 45) uniqaGroup = '41-45';
  else if (age <= 50) uniqaGroup = '46-50';
  else if (age <= 55) uniqaGroup = '51-55';
  else if (age <= 60) uniqaGroup = '56-60';
  else uniqaGroup = '61-65';
  
  // Определяме възрастова група за ДЗИ
  let dziGroup;
  if (age <= 18) dziGroup = '0-18';
  else if (age <= 44) dziGroup = '19-44';
  else if (age <= 49) dziGroup = '45-49';
  else if (age <= 54) dziGroup = '50-54';
  else if (age <= 64) dziGroup = '55-64';
  else dziGroup = '65-85';
  
  const uniqaRate = UNIQA_SELECT_EUROPA_RATES[uniqaGroup]?.monthly || 999;
  const dziRate = age <= 64 
    ? DZI_BEST_DOCTORS_INDIVIDUAL_RATES[dziGroup]?.monthly 
    : DZI_BEST_DOCTORS_SENIOR_INDIVIDUAL_RATES[dziGroup]?.monthly || 999;
  
  // Ако има предпочитан доставчик
  if (preferProvider === 'UNIQA') {
    return { provider: 'UNIQA', rate: uniqaRate, plan: 'План Европа' };
  }
  if (preferProvider === 'DZI') {
    return { provider: 'ДЗИ', rate: dziRate, plan: 'Бест Докторс' };
  }
  
  // По подразбиране: UNIQA освен ако ДЗИ не е по-евтино
  if (dziRate < uniqaRate) {
    return { provider: 'ДЗИ', rate: dziRate, plan: 'Бест Докторс' };
  }
  return { provider: 'UNIQA', rate: uniqaRate, plan: 'План Европа' };
};

// ============================================================
// ТАРИФНИ ТАБЛИЦИ - HEALTH INSURANCE
// ============================================================

// GENERALI HEALTH LINE - Доброволно здравно осигуряване
// Премии в BGN с включен 2% данък
export const GENERALI_HEALTH_LINE_RATES = {
  // За здравноосигурени лица (с НЗОК)
  insured: {
    basic: {
      annual: 459.00,       // Еднократно
      semiannual: 252.45,   // На 2 вноски
      quarterly: 126.23     // На 4 вноски
    },
    plus: {
      annual: 571.20,
      semiannual: 314.16,
      quarterly: 157.08
    }
  },
  // За лица без здравна осигуровка (без НЗОК)
  uninsured: {
    basic: {
      annual: 596.70,
      semiannual: 327.93,
      quarterly: 163.97
    },
    plus: {
      annual: 828.24,
      semiannual: 455.43,
      quarterly: 227.72
    }
  }
};

// ============================================================
// UNIQA ДОБРОВОЛНО ЗДРАВНО ОСИГУРЯВАНЕ
// Всички суми са с включен 2% данък, финални
// ============================================================

// Здравен пакет "Извънболнично (амбулаторно) лечение"
export const UNIQA_HEALTH_OUTPATIENT_RATES = {
  // Индивидуални и семейни застраховки по възрастови групи
  individual: {
    '0-17':   { standard: { annual: 57.12, semiannual: 31.11, quarterly: 16.88 }, comfort: { annual: 72.42, semiannual: 39.44, quarterly: 21.40 }, premium: { annual: 170.54, semiannual: 92.89, quarterly: 50.39 }},
    '18-30':  { standard: { annual: 80.58, semiannual: 43.89, quarterly: 23.81 }, comfort: { annual: 102.00, semiannual: 55.56, quarterly: 30.14 }, premium: { annual: 240.21, semiannual: 130.84, quarterly: 70.97 }},
    '31-40':  { standard: { annual: 105.06, semiannual: 57.22, quarterly: 31.04 }, comfort: { annual: 133.11, semiannual: 72.50, quarterly: 39.33 }, premium: { annual: 313.45, semiannual: 170.74, quarterly: 92.62 }},
    '41-50':  { standard: { annual: 129.13, semiannual: 70.33, quarterly: 38.15 }, comfort: { annual: 163.60, semiannual: 89.11, quarterly: 48.34 }, premium: { annual: 385.25, semiannual: 209.85, quarterly: 113.84 }},
    '51-60':  { standard: { annual: 191.25, semiannual: 104.17, quarterly: 56.51 }, comfort: { annual: 242.28, semiannual: 131.97, quarterly: 71.59 }, premium: { annual: 570.56, semiannual: 310.77, quarterly: 168.57 }},
    '61-70':  { standard: { annual: 268.26, semiannual: 146.12, quarterly: 79.26 }, comfort: { annual: 339.91, semiannual: 185.14, quarterly: 100.44 }, premium: { annual: 800.49, semiannual: 436.04, quarterly: 236.55 }}
  },
  // Групови застраховки
  group: {
    '0-17':   { standard: 45.70, comfort: 57.94, premium: 136.43 },
    '18-30':  { standard: 64.46, comfort: 81.60, premium: 192.17 },
    '31-40':  { standard: 84.05, comfort: 106.49, premium: 250.76 },
    '41-50':  { standard: 103.30, comfort: 130.88, premium: 308.20 },
    '51-60':  { standard: 153.00, comfort: 193.82, premium: 456.45 },
    '61-70':  { standard: 214.61, comfort: 271.93, premium: 640.39 }
  }
};

// Здравен пакет "Болнично лечение"
export const UNIQA_HEALTH_HOSPITAL_RATES = {
  individual: {
    '0-17':   { standard: { annual: 53.00, semiannual: 28.87, quarterly: 15.66 }, comfort: { annual: 77.97, semiannual: 42.47, quarterly: 23.04 }, premium: { annual: 91.22, semiannual: 49.69, quarterly: 26.96 }},
    '18-30':  { standard: { annual: 74.76, semiannual: 40.72, quarterly: 22.09 }, comfort: { annual: 109.96, semiannual: 59.90, quarterly: 32.49 }, premium: { annual: 128.65, semiannual: 70.08, quarterly: 38.01 }},
    '31-40':  { standard: { annual: 88.26, semiannual: 48.07, quarterly: 26.08 }, comfort: { annual: 129.81, semiannual: 70.72, quarterly: 38.36 }, premium: { annual: 151.87, semiannual: 82.73, quarterly: 44.88 }},
    '41-50':  { standard: { annual: 123.73, semiannual: 67.40, quarterly: 36.56 }, comfort: { annual: 182.02, semiannual: 99.15, quarterly: 53.79 }, premium: { annual: 212.96, semiannual: 116.00, quarterly: 62.93 }},
    '51-60':  { standard: { annual: 225.16, semiannual: 122.65, quarterly: 66.54 }, comfort: { annual: 331.24, semiannual: 180.40, quarterly: 97.86 }, premium: { annual: 387.54, semiannual: 211.08, quarterly: 114.51 }},
    '61-70':  { standard: { annual: 345.51, semiannual: 188.19, quarterly: 102.09 }, comfort: { annual: 508.26, semiannual: 276.89, quarterly: 150.19 }, premium: { annual: 594.61, semiannual: 323.94, quarterly: 175.71 }}
  },
  group: {
    '0-17':   { standard: 42.40, comfort: 62.38, premium: 72.98 },
    '18-30':  { standard: 59.81, comfort: 87.97, premium: 102.92 },
    '31-40':  { standard: 70.61, comfort: 103.85, premium: 121.50 },
    '41-50':  { standard: 98.98, comfort: 145.62, premium: 170.37 },
    '51-60':  { standard: 180.13, comfort: 265.00, premium: 310.03 },
    '61-70':  { standard: 276.41, comfort: 406.61, premium: 475.69 }
  }
};

// Здравен пакет "Дентално лечение"
export const UNIQA_HEALTH_DENTAL_RATES = {
  individual: {
    '0-17':   { standard: { annual: 22.24, semiannual: 12.12, quarterly: 6.57 }, comfort: { annual: 96.16, semiannual: 52.38, quarterly: 28.41 }, premium: { annual: 130.56, semiannual: 71.13, quarterly: 38.58 }},
    '18-30':  { standard: { annual: 75.28, semiannual: 41.01, quarterly: 22.25 }, comfort: { annual: 110.72, semiannual: 60.31, quarterly: 32.71 }, premium: { annual: 150.34, semiannual: 81.90, quarterly: 44.43 }},
    '31-40':  { standard: { annual: 83.33, semiannual: 45.39, quarterly: 24.62 }, comfort: { annual: 122.55, semiannual: 66.76, quarterly: 36.22 }, premium: { annual: 166.40, semiannual: 90.65, quarterly: 49.16 }},
    '41-50':  { standard: { annual: 99.14, semiannual: 54.01, quarterly: 29.30 }, comfort: { annual: 145.80, semiannual: 79.42, quarterly: 43.09 }, premium: { annual: 198.00, semiannual: 107.86, quarterly: 58.51 }},
    '51-60':  { standard: { annual: 127.30, semiannual: 69.34, quarterly: 37.62 }, comfort: { annual: 187.20, semiannual: 101.97, quarterly: 55.31 }, premium: { annual: 254.20, semiannual: 138.47, quarterly: 75.11 }},
    '61-70':  { standard: { annual: 146.88, semiannual: 80.01, quarterly: 43.40 }, comfort: { annual: 216.00, semiannual: 117.66, quarterly: 63.83 }, premium: { annual: 293.28, semiannual: 159.76, quarterly: 86.67 }}
  },
  group: {
    '0-17':   { standard: 17.79, comfort: 76.93, premium: 104.45 },
    '18-30':  { standard: 60.22, comfort: 88.58, premium: 120.27 },
    '31-40':  { standard: 66.66, comfort: 98.04, premium: 133.12 },
    '41-50':  { standard: 79.31, comfort: 116.64, premium: 158.40 },
    '51-60':  { standard: 101.84, comfort: 149.76, premium: 203.36 },
    '61-70':  { standard: 117.50, comfort: 172.80, premium: 234.62 }
  }
};

// Здравен пакет "Медицински средства"
export const UNIQA_HEALTH_MEDICAL_SUPPLIES_RATES = {
  individual: {
    '0-17':   { standard: { annual: 56.30, semiannual: 30.67, quarterly: 16.64 }, comfort: { annual: 73.85, semiannual: 40.22, quarterly: 21.82 }, premium: { annual: 113.46, semiannual: 61.80, quarterly: 33.53 }},
    '18-30':  { standard: { annual: 27.44, semiannual: 14.95, quarterly: 8.11 }, comfort: { annual: 36.00, semiannual: 19.61, quarterly: 10.64 }, premium: { annual: 55.33, semiannual: 30.14, quarterly: 16.35 }},
    '31-40':  { standard: { annual: 50.18, semiannual: 27.33, quarterly: 14.83 }, comfort: { annual: 65.82, semiannual: 35.85, quarterly: 19.45 }, premium: { annual: 101.18, semiannual: 55.11, quarterly: 29.90 }},
    '41-50':  { standard: { annual: 72.93, semiannual: 39.72, quarterly: 21.55 }, comfort: { annual: 95.66, semiannual: 52.10, quarterly: 28.26 }, premium: { annual: 147.02, semiannual: 80.09, quarterly: 43.44 }},
    '51-60':  { standard: { annual: 123.32, semiannual: 67.17, quarterly: 36.44 }, comfort: { annual: 161.77, semiannual: 88.12, quarterly: 47.80 }, premium: { annual: 248.68, semiannual: 135.45, quarterly: 73.48 }},
    '61-70':  { standard: { annual: 168.71, semiannual: 91.90, quarterly: 49.85 }, comfort: { annual: 221.27, semiannual: 120.52, quarterly: 65.38 }, premium: { annual: 340.14, semiannual: 185.26, quarterly: 100.50 }}
  }
};

// Здравен пакет "Услуги свързани с битови и други допълнителни условия"
export const UNIQA_HEALTH_AMENITIES_RATES = {
  individual: {
    '0-17':   { annual: 11.06, semiannual: 6.02, quarterly: 3.27 },
    '18-30':  { annual: 7.80, semiannual: 4.25, quarterly: 2.31 },
    '31-40':  { annual: 12.08, semiannual: 6.58, quarterly: 3.57 },
    '41-50':  { annual: 16.99, semiannual: 9.26, quarterly: 5.02 },
    '51-60':  { annual: 27.10, semiannual: 14.76, quarterly: 8.01 },
    '61-70':  { annual: 39.27, semiannual: 21.39, quarterly: 11.60 }
  }
};

// Здравен пакет "Профилактика"
export const UNIQA_HEALTH_PREVENTION_RATES = {
  individual: {
    '0-17':   { standard: { annual: 18.77, semiannual: 10.22, quarterly: 5.55 }, comfort: { annual: 26.01, semiannual: 14.17, quarterly: 7.69 }},
    '18-70':  { standard: { annual: 18.77, semiannual: 10.22, quarterly: 5.55 }, comfort: { annual: 26.01, semiannual: 14.17, quarterly: 7.69 }}
  },
  group: { standard: 15.02, comfort: 20.81 }
};

// Здравен пакет "Дневни пари за болничен престой"
export const UNIQA_HEALTH_DAILY_BENEFIT_RATES = {
  // Обезщетение 30 EUR/ден при болничен престой
  eur30: {
    '0-17':   { annual: 17.85, semiannual: 9.72, quarterly: 5.27 },
    '18-30':  { annual: 19.99, semiannual: 10.89, quarterly: 5.91 },
    '31-40':  { annual: 21.19, semiannual: 11.54, quarterly: 6.26 },
    '41-50':  { annual: 22.93, semiannual: 12.49, quarterly: 6.78 },
    '51-60':  { annual: 30.04, semiannual: 16.36, quarterly: 8.88 },
    '61-70':  { annual: 44.46, semiannual: 24.22, quarterly: 13.14 }
  }
};

// Здравен пакет "Обезщетение за операции"
export const UNIQA_HEALTH_SURGERY_BENEFIT_RATES = {
  // Лимит 1000 EUR
  eur1000: { annual: 3.47 },
  // Лимит 1500 EUR
  eur1500: { annual: 7.65 }
};

// Здравен пакет "Второ медицинско мнение"
export const UNIQA_HEALTH_SECOND_OPINION_RATES = {
  individual: { annual: 7.80 },
  group: { annual: 7.14 }
};

// Здравен пакет "Здравни услуги оказвани на бременни"
export const UNIQA_HEALTH_PREGNANCY_RATES = {
  // Секция "Проследяване на нормална бременност"
  monitoring: {
    '18-30': { annual: 120.36, semiannual: 65.56, quarterly: 35.57 },
    '31-40': { annual: 133.26, semiannual: 72.59, quarterly: 39.38 },
    '41-50': { annual: 158.51, semiannual: 86.35, quarterly: 46.84 }
  },
  // Секция "Раждане"
  birth: {
    '18-30': { annual: 143.82, semiannual: 78.33, quarterly: 42.49 },
    '31-40': { annual: 159.22, semiannual: 86.73, quarterly: 47.05 },
    '41-50': { annual: 189.45, semiannual: 103.20, quarterly: 55.98 }
  }
};

// Правила за завишения и отстъпки
export const UNIQA_HEALTH_RULES = {
  // Завишения
  surcharges: {
    children_individual: 0.30,        // +30% за деца до 17г. с индивидуален договор
    private_hospital: 0.50,           // +50% за частно здравно - болнично лечение
    private_amenities: 0.50,          // +50% за частно здравно - битови условия
    private_birth: 0.50,              // +50% за частно здравно - раждане
    private_outpatient: 0.25,         // +25% за частно здравно - извънболнично
    private_pregnancy_monitoring: 0.25, // +25% за частно здравно - проследяване бременност
    private_medical_supplies: 0.25,   // +25% за частно здравно - медицински средства
    private_dental: 0.15,             // +15% за частно здравно - дентално
    high_risk: 1.00                   // до +100% за лица с повишен риск
  },
  // Отстъпки за брой пакети
  package_discounts: {
    3: 0.03,  // -3% при 3 пакета
    4: 0.05,  // -5% при 4 пакета
    5: 0.08   // -8% при 5+ пакета
  },
  // Отстъпки за групови застраховки
  group_discounts: {
    20: 0.05,   // до -5% при 20-50 лица
    50: 0.10,   // до -10% при 50-100 лица
    100: 0.15,  // до -15% при 100-200 лица
    200: null   // запитване до Техническа дирекция
  },
  // Отстъпки при подновяване (ако ползван лимит < 50% от премия)
  renewal_discounts: {
    1: 0.05,  // до -5% след 1-ва година
    2: 0.08,  // до -8% след 2-ра година
    3: 0.12   // до -12% след 3-та+ година
  }
};

// ============================================================
// UNIQA ПЛАНИНСКА ЗАСТРАХОВКА (рядко се използва)
// Премии в BGN за 1000 лв. покритие (+ 2% данък)
// НЕ се включва автоматично в плановете - само по заявка
// ============================================================

export const UNIQA_MOUNTAIN_INSURANCE_RATES = {
  // Пакет "Стандарт" - премия за 1000 лв. покритие
  standard: {
    '3_days': 4.00,
    '5_days': 6.00,
    '7_days': 7.00,
    '10_days': 10.00,
    '14_days': 12.00,
    '1_month': 14.00,
    '3_months': 16.00,
    '5_months': 20.00,
    '1_year': 30.00
  },
  // Пакет "Екстремен спорт или хоби" - добавя се към Стандарт
  extreme: {
    '3_days': 4.00,
    '5_days': 6.00,
    '7_days': 7.00,
    '10_days': 10.00,
    '14_days': 12.00,
    '1_month': 14.00,
    '3_months': 16.00,
    '5_months': 20.00,
    '1_year': 30.00
  },
  rules: {
    min_coverage: 1000,      // Минимален лимит 1000 лв.
    max_coverage: 10000,     // Максимален лимит 10000 лв.
    coverage_multiplier: 1000, // Лимитът трябва да е кратен на 1000
    family_group_discount: 0.25, // -25% за семейни и групови полици
    tax_percent: 0.02        // +2% данък върху премията
  }
};

// Legacy compatibility - стари тарифи по възраст
export const HEALTH_INSURANCE_RATES = {
  // UNIQA Здраве и Ценност - месечна премия по възраст
  uniqa_premium: {
    0: 35, 5: 32, 10: 30, 15: 28, 20: 26, 25: 28, 30: 32, 
    35: 38, 40: 48, 45: 62, 50: 82, 55: 110, 60: 150, 65: 200
  },
  // Generali Health Line (monthly approximation)
  generali_basic: {
    0: 25, 10: 22, 20: 20, 30: 24, 40: 35, 50: 55, 60: 90
  },
  generali_plus: {
    0: 45, 10: 40, 20: 38, 30: 45, 40: 65, 50: 100, 60: 160
  }
};

// ============================================================
// METLIFE CARE - Здравна застраховка с лимити по план
// ============================================================

// Лимити по планове (в EUR)
export const METLIFE_CARE_PLAN_LIMITS = {
  bronze: {
    name: 'Бронзов',
    hospital: 10000,
    surgery: 10000,
    gp: 10000,
    diagnostics: 10000,
    dental: 5000
  },
  silver: {
    name: 'Сребърен',
    hospital: 25000,
    surgery: 25000,
    gp: 25000,
    diagnostics: 25000,
    dental: 12500
  },
  gold: {
    name: 'Златен',
    hospital: 50000,
    surgery: 50000,
    gp: 50000,
    diagnostics: 50000,
    dental: 25000
  },
  platinum: {
    name: 'Платинен',
    hospital: 100000,
    surgery: 100000,
    gp: 100000,
    diagnostics: 100000,
    dental: 50000
  }
};

// Тарифи по възраст за различни покрития (rate per 1000 EUR)
export const METLIFE_CARE_AGE_RATES = {
  18: { disability: 2.82, ci40: 4.43, cancer: 3.84, inSitu: 4.55 },
  19: { disability: 2.94, ci40: 4.57, cancer: 3.97, inSitu: 4.61 },
  20: { disability: 2.94, ci40: 4.71, cancer: 4.09, inSitu: 4.70 },
  21: { disability: 3.06, ci40: 4.85, cancer: 4.21, inSitu: 4.77 },
  22: { disability: 3.06, ci40: 4.99, cancer: 4.33, inSitu: 4.87 },
  23: { disability: 3.18, ci40: 5.14, cancer: 4.46, inSitu: 4.98 },
  24: { disability: 3.18, ci40: 5.30, cancer: 4.60, inSitu: 5.09 },
  25: { disability: 3.30, ci40: 5.47, cancer: 4.74, inSitu: 5.21 },
  26: { disability: 3.30, ci40: 5.64, cancer: 4.90, inSitu: 5.34 },
  27: { disability: 3.43, ci40: 5.84, cancer: 5.06, inSitu: 5.47 },
  28: { disability: 3.55, ci40: 6.03, cancer: 5.23, inSitu: 5.63 },
  29: { disability: 3.67, ci40: 6.24, cancer: 5.40, inSitu: 5.79 },
  30: { disability: 3.79, ci40: 6.46, cancer: 5.59, inSitu: 5.95 },
  31: { disability: 3.92, ci40: 6.70, cancer: 5.79, inSitu: 6.12 },
  32: { disability: 4.04, ci40: 6.95, cancer: 6.01, inSitu: 6.30 },
  33: { disability: 4.16, ci40: 7.22, cancer: 6.24, inSitu: 6.50 },
  34: { disability: 4.41, ci40: 7.50, cancer: 6.49, inSitu: 6.72 },
  35: { disability: 4.53, ci40: 7.81, cancer: 6.74, inSitu: 6.95 },
  36: { disability: 4.77, ci40: 8.14, cancer: 7.04, inSitu: 7.18 },
  37: { disability: 5.02, ci40: 8.51, cancer: 7.34, inSitu: 7.45 },
  38: { disability: 5.26, ci40: 8.89, cancer: 7.67, inSitu: 7.74 },
  39: { disability: 5.51, ci40: 9.30, cancer: 8.03, inSitu: 8.04 },
  40: { disability: 5.75, ci40: 9.74, cancer: 8.41, inSitu: 8.35 },
  41: { disability: 6.00, ci40: 10.21, cancer: 8.81, inSitu: 8.65 },
  42: { disability: 6.24, ci40: 10.71, cancer: 9.23, inSitu: 8.96 },
  43: { disability: 6.61, ci40: 11.24, cancer: 9.68, inSitu: 9.25 },
  44: { disability: 6.98, ci40: 11.80, cancer: 10.17, inSitu: 9.55 },
  45: { disability: 7.34, ci40: 12.39, cancer: 10.67, inSitu: 9.87 },
  46: { disability: 7.71, ci40: 13.01, cancer: 11.20, inSitu: 10.24 },
  47: { disability: 8.20, ci40: 13.66, cancer: 11.76, inSitu: 10.66 },
  48: { disability: 8.57, ci40: 14.35, cancer: 12.34, inSitu: 11.11 },
  49: { disability: 9.18, ci40: 15.07, cancer: 12.96, inSitu: 11.60 },
  50: { disability: 9.67, ci40: 15.85, cancer: 13.62, inSitu: 12.15 },
  51: { disability: 10.28, ci40: 16.65, cancer: 14.31, inSitu: 12.78 },
  52: { disability: 10.89, ci40: 17.52, cancer: 15.06, inSitu: 13.44 },
  53: { disability: 11.51, ci40: 18.45, cancer: 15.85, inSitu: 14.15 },
  54: { disability: 12.12, ci40: 19.50, cancer: 16.73, inSitu: 14.90 },
  55: { disability: 12.85, ci40: 20.69, cancer: 17.74, inSitu: 15.84 },
  56: { disability: 13.71, ci40: 21.59, cancer: 18.53, inSitu: 16.71 },
  57: { disability: 14.57, ci40: 22.77, cancer: 19.54, inSitu: 17.80 },
  58: { disability: 15.67, ci40: 24.05, cancer: 20.59, inSitu: 19.01 },
  59: { disability: 16.65, ci40: 25.57, cancer: 21.89, inSitu: 20.51 },
  60: { disability: 18.12, ci40: 27.37, cancer: 23.43, inSitu: 22.31 },
  61: { disability: 18.60, ci40: 27.72, cancer: 23.72, inSitu: 22.90 },
  62: { disability: 19.34, ci40: 28.09, cancer: 24.03, inSitu: 23.48 },
  63: { disability: 20.20, ci40: 28.62, cancer: 24.53, inSitu: 24.21 },
  64: { disability: 21.42, ci40: 30.06, cancer: 25.70, inSitu: 25.52 },
  65: { disability: 23.75, ci40: 32.08, cancer: 27.42, inSitu: 27.53 }
};

// Рискови класове за смърт от злополука (rate per 1000 EUR)
export const METLIFE_CARE_RISK_CLASSES = {
  1: { name: 'I рисков клас', accidentalDeathRate: 1.5 },
  2: { name: 'II рисков клас', accidentalDeathRate: 2.5 },
  3: { name: 'III рисков клас', accidentalDeathRate: 4.0 }
};

// Помощна функция за изчисляване на MetLife Care премия
export const calculateMetLifeCarePremium = (age, plan, coverages = {}) => {
  const ageRates = METLIFE_CARE_AGE_RATES[age] || METLIFE_CARE_AGE_RATES[65];
  const planLimits = METLIFE_CARE_PLAN_LIMITS[plan] || METLIFE_CARE_PLAN_LIMITS.silver;
  
  let annualPremium = 0;
  
  // Изчисляване на премия по избрани покрития
  if (coverages.disability) {
    annualPremium += (coverages.disabilityAmount || 10000) / 1000 * ageRates.disability;
  }
  if (coverages.ci40) {
    annualPremium += (coverages.ci40Amount || 10000) / 1000 * ageRates.ci40;
  }
  if (coverages.cancer) {
    annualPremium += (coverages.cancerAmount || 10000) / 1000 * ageRates.cancer;
  }
  if (coverages.inSitu) {
    annualPremium += (coverages.inSituAmount || 10000) / 1000 * ageRates.inSitu;
  }
  
  return {
    annual: Math.round(annualPremium * 100) / 100,
    monthly: Math.round(annualPremium / 12 * 100) / 100,
    planLimits
  };
};

// ============================================================
// METLIFE INDIVIDUAL PERSONAL ACCIDENT (PA) RATES
// Тарифи за индивидуална злополука - критични за Term Life
// ============================================================

// Рискови класове - тарифи на 1000 EUR покритие (освен Hospital Cash - per 1 day)
export const METLIFE_PA_RISK_CLASSES = {
  1: {
    name: 'I рисков клас',
    accidentalDeath: 1.5,       // 1. ACCIDENTAL DEATH Rate per 1000
    pi: 1.5,                    // PI (=PTD+PPD) Rate per 1000
    hospitalCash: 1.2,          // 5a. HOSPITAL CASH Rate per 1 day
    surgical: 3.5,              // 6a. SURGICAL Rate per 100
    fracturesAndBurns: 16       // 7a. FRACTURES AND BURNS Rate per 1000
  },
  2: {
    name: 'II рисков клас',
    accidentalDeath: 2.5,
    pi: 2.5,
    hospitalCash: 1.5,
    surgical: 4.0,
    fracturesAndBurns: 20
  },
  3: {
    name: 'III рисков клас',
    accidentalDeath: 4.0,
    pi: 4.0,
    hospitalCash: 1.8,
    surgical: 5.0,
    fracturesAndBurns: 27
  }
};

// Daily Cash Benefit тарифи по възраст
export const METLIFE_PA_DAILY_CASH_RATES = {
  '18-40': { dailyCashRate: 3.2, surgicalBenefitRate: 7, commonRateProposed: 4.25, surgicalCommonRate: 8.32 },
  '41-50': { dailyCashRate: 5.8, surgicalBenefitRate: 14.5 },
  '51-60': { dailyCashRate: 7.2, surgicalBenefitRate: 21.5 },
  '61-65': { dailyCashRate: 7.2, surgicalBenefitRate: 21.5 }
};

// Помощна функция за Daily Cash Rate по възраст
export const getDailyCashRateByAge = (age) => {
  if (age <= 40) return METLIFE_PA_DAILY_CASH_RATES['18-40'];
  if (age <= 50) return METLIFE_PA_DAILY_CASH_RATES['41-50'];
  if (age <= 60) return METLIFE_PA_DAILY_CASH_RATES['51-60'];
  return METLIFE_PA_DAILY_CASH_RATES['61-65'];
};

// Critical Illness covering 32 diseases - тарифи по възрастова група и срок
// Rate per 1000 EUR покритие
export const METLIFE_PA_CRITICAL_ILLNESS_32_RATES = {
  18: { yr5: 1.4, yr10: 1.85 },
  19: { yr5: 1.4, yr10: 1.85 },
  20: { yr5: 1.4, yr10: 1.85 },
  21: { yr5: 1.4, yr10: 1.85 },
  22: { yr5: 1.4, yr10: 1.85 },
  23: { yr5: 1.4, yr10: 1.85 },
  24: { yr5: 1.4, yr10: 1.85 },
  25: { yr5: 1.4, yr10: 1.85 },
  26: { yr5: 2.35, yr10: 3.19 },
  27: { yr5: 2.35, yr10: 3.19 },
  28: { yr5: 2.35, yr10: 3.19 },
  29: { yr5: 2.35, yr10: 3.19 },
  30: { yr5: 2.35, yr10: 3.19 },
  31: { yr5: 4.63, yr10: 6.23 },
  32: { yr5: 4.63, yr10: 6.23 },
  33: { yr5: 4.63, yr10: 6.23 },
  34: { yr5: 4.63, yr10: 6.23 },
  35: { yr5: 4.63, yr10: 6.23 },
  36: { yr5: 7.24, yr10: 9.57 },
  37: { yr5: 7.24, yr10: 9.57 },
  38: { yr5: 7.24, yr10: 9.57 },
  39: { yr5: 7.24, yr10: 9.57 },
  40: { yr5: 7.24, yr10: 9.57 },
  41: { yr5: 12.31, yr10: 16 },
  42: { yr5: 12.31, yr10: 16 },
  43: { yr5: 12.31, yr10: 16 },
  44: { yr5: 12.31, yr10: 16 },
  45: { yr5: 12.31, yr10: 16 },
  46: { yr5: 20.45, yr10: 25.47 },
  47: { yr5: 20.45, yr10: 25.47 },
  48: { yr5: 20.45, yr10: 25.47 },
  49: { yr5: 20.45, yr10: 25.47 },
  50: { yr5: 20.45, yr10: 25.47 },
  51: { yr5: 31.79, yr10: 38.07 },
  52: { yr5: 31.79, yr10: 38.07 },
  53: { yr5: 31.79, yr10: 38.07 },
  54: { yr5: 31.79, yr10: 38.07 },
  55: { yr5: 31.79, yr10: 38.07 },
  56: { yr5: 46.34, yr10: null },
  57: { yr5: 46.34, yr10: null },
  58: { yr5: 46.34, yr10: null },
  59: { yr5: 46.34, yr10: null },
  60: { yr5: 46.34, yr10: null }
};

// Child Coverages - детски покрития
export const METLIFE_PA_CHILD_COVERAGES = {
  permanentInvalidityAccident: { per: 1000, rate: 1.5 },
  hospitalizationAccidentSickness: { per: 1, rate: 4.25 },  // daily benefit
  hospitalizationAccidentOnly: { per: 1, rate: 1.2 },       // daily benefit
  surgicalAccidentSickness: { per: 100, rate: 8.32 },
  surgicalAccidentOnly: { per: 100, rate: 3.5 },
  brokenBonesAndBurns: { per: 1000, rate: 33 }
};

// Откaз от премия - коефициенти по рисков клас
export const METLIFE_PA_PREMIUM_WAIVER = {
  1: { name: 'I рисков клас', coefficient: 0.043799, formula: '=B48/D48', factor: 0.35 },
  2: { name: 'II рисков клас', coefficient: 0.0525, formula: '=B49/D49', factor: 0.35 },
  3: { name: 'III рисков клас', coefficient: 0.07, formula: '=B50/D50', factor: 0.35 }
};

// CPA (Critical Period Addition) - добавка по възраст
export const METLIFE_PA_CPA_RATES = {
  18: 0.04, 19: 0.04, 20: 0.04, 21: 0.04, 22: 0.04, 23: 0.04, 24: 0.04, 25: 0.04,
  26: 0.04, 27: 0.04, 28: 0.04, 29: 0.04, 30: 0.04,
  31: 0.08, 32: 0.08, 33: 0.08, 34: 0.08, 35: 0.08,
  36: 0.08, 37: 0.08, 38: 0.08, 39: 0.08, 40: 0.08,
  41: 0.08, 42: 0.08, 43: 0.08, 44: 0.08, 45: 0.08,
  46: 0.19, 47: 0.19, 48: 0.19, 49: 0.19, 50: 0.19,
  51: 0.19, 52: 0.19, 53: 0.19, 54: 0.19, 55: 0.19,
  56: 0.19, 57: 0.19, 58: 0.19, 59: 0.19
};

// Сигурност+ коефициенти по възраст (от колони Q и R)
// Формула: Коефициент за изчисляване на очаквана стойност
export const METLIFE_PA_SECURITY_PLUS_COEFFICIENTS = {
  18: 225.733634311512, 19: 218.818380743982,
  20: 212.314225053079, 21: 206.185567010309, 22: 200.400801603206, 23: 194.552529182879,
  24: 188.679245283019, 25: 182.815356489945, 26: 177.304964539007, 27: 171.232876712329,
  28: 165.837479270315, 29: 160.25641025641,
  30: 154.798761609907, 31: 149.253731343284, 32: 143.884892086331, 33: 138.504155124654,
  34: 133.333333333333, 35: 128.040973111396, 36: 122.850122850123, 37: 117.508813160987,
  38: 112.485939257593, 39: 107.52688172043,
  40: 102.669404517454, 41: 97.9431929480901, 42: 93.3706816059757, 43: 88.9679715302491,
  44: 84.7457627118644, 45: 80.7102502017756, 46: 76.8639508070715, 47: 73.2064421669107,
  48: 69.6864111498258, 49: 66.35700066357,
  50: 63.0914826498423, 51: 60.0600600600601, 52: 57.0776255707763, 53: 54.2005420054201,
  54: 51.2820512820513, 55: 48.3325277912035, 56: 46.3177396943029, 57: 43.917435221783,
  58: 41.5800415800416, 59: 39.1083300743058,
  60: 36.5363536719035, 61: 36.0750360750361, 62: 35.5998576005696, 63: 34.9406009783368,
  64: 33.2667997338656, 65: 31.1720698254364
};

// Помощна функция за изчисляване на MetLife PA премия
export const calculateMetLifePAPremium = (age, coverageAmount, termYears, riskClass = 1, options = {}) => {
  const ciRates = METLIFE_PA_CRITICAL_ILLNESS_32_RATES[age] || METLIFE_PA_CRITICAL_ILLNESS_32_RATES[60];
  const riskClassData = METLIFE_PA_RISK_CLASSES[riskClass] || METLIFE_PA_RISK_CLASSES[1];
  const cpaRate = METLIFE_PA_CPA_RATES[age] || METLIFE_PA_CPA_RATES[59];
  const dailyCashData = getDailyCashRateByAge(age);
  
  // Избор на тарифа според срока
  let baseRate;
  if (termYears <= 5) {
    baseRate = ciRates.yr5;
  } else if (termYears <= 10 && ciRates.yr10) {
    baseRate = ciRates.yr10;
  } else {
    baseRate = ciRates.yr5;
  }
  
  // Базова премия за Critical Illness
  const ciPremium = (coverageAmount / 1000) * baseRate;
  
  // Добавка за рисков клас (смърт от злополука)
  const accidentalDeathPremium = (coverageAmount / 1000) * riskClassData.accidentalDeath;
  
  // PI (PTD+PPD) премия
  const piPremium = options.includePI ? (coverageAmount / 1000) * riskClassData.pi : 0;
  
  // Hospital Cash премия
  const hospitalCashPremium = options.hospitalCashDays ? 
    options.hospitalCashDays * dailyCashData.dailyCashRate : 0;
  
  // Surgical премия
  const surgicalPremium = options.surgicalAmount ? 
    (options.surgicalAmount / 100) * dailyCashData.surgicalBenefitRate : 0;
  
  // Fractures and Burns премия
  const fracturesPremium = options.fracturesAmount ? 
    (options.fracturesAmount / 1000) * riskClassData.fracturesAndBurns : 0;
  
  const annualPremium = ciPremium + accidentalDeathPremium + piPremium + 
                        hospitalCashPremium + surgicalPremium + fracturesPremium;
  
  return {
    annual: Math.round(annualPremium * 100) / 100,
    monthly: Math.round(annualPremium / 12 * 100) / 100,
    baseRate,
    riskClass: riskClassData.name,
    cpaRate,
    breakdown: {
      criticalIllness: Math.round(ciPremium * 100) / 100,
      accidentalDeath: Math.round(accidentalDeathPremium * 100) / 100,
      pi: Math.round(piPremium * 100) / 100,
      hospitalCash: Math.round(hospitalCashPremium * 100) / 100,
      surgical: Math.round(surgicalPremium * 100) / 100,
      fractures: Math.round(fracturesPremium * 100) / 100
    }
  };
};

// ============================================================
// МОДЕЛ КОЕФИЦИЕНТИ (CZ4, CZ13 от Excel)
// ============================================================

export const MODEL_COEFFICIENTS = {
  CZ4: 1.0,    // Корекционен коефициент за вноски
  CZ13: 1.0,   // Корекционен коефициент за доп. вноски
  
  // Коефициенти за трудов капитал
  INCOME_GROWTH_RATE: 0.03,  // 3% годишен ръст на дохода
  
  // Коефициент за нужда от защита
  PROTECTION_MONTHS: 60,     // 60 месеца = 5 години заместване на дохода
  
  // Коефициент за резерв
  RESERVE_MONTHS_DEFAULT: 6  // 6 месечни разхода
};

// ============================================================
// ПОМОЩНИ ФУНКЦИИ
// ============================================================

/**
 * Конвертира BGN в EUR
 */
export const bgnToEur = (bgn) => bgn / EUR_BGN_RATE;

/**
 * Конвертира EUR в BGN
 */
export const eurToBgn = (eur) => eur * EUR_BGN_RATE;

/**
 * Изчислява възраст от дата на раждане
 */
export const calculateAge = (birthDate, referenceDate = new Date()) => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const ref = new Date(referenceDate);
  return (ref - birth) / (DAYS_PER_YEAR * 24 * 60 * 60 * 1000);
};

/**
 * Изчислява години до пенсия
 */
export const calculateYearsToRetirement = (currentAge, retirementAge = 65) => {
  return Math.max(0, retirementAge - currentAge);
};

/**
 * Изчислява години до образование на дете
 */
export const calculateYearsToEducation = (childBirthDate, educationAge = 18) => {
  const childAge = calculateAge(childBirthDate);
  return Math.max(0, educationAge - childAge);
};

/**
 * VLOOKUP емулация - търси в таблица
 */
export const vlookup = (searchValue, table, exactMatch = false) => {
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  
  if (exactMatch) {
    return table[searchValue] ?? null;
  }
  
  // Намираме най-близката по-малка или равна стойност
  let result = null;
  for (const key of keys) {
    if (key <= searchValue) {
      result = table[key];
    } else {
      break;
    }
  }
  return result;
};

/**
 * Изчислява тарифа за срочна застраховка
 */
export const getTermLifeRate = (age, term, gender, isSmoker) => {
  const tableKey = `${gender}_${isSmoker ? 'smoker' : 'nonsmoker'}`;
  const ageTable = TERM_LIFE_RATES[tableKey];
  
  if (!ageTable) return 0;
  
  // Намираме най-близката възраст
  const ages = Object.keys(ageTable).map(Number).sort((a, b) => a - b);
  let selectedAge = ages[0];
  for (const a of ages) {
    if (a <= age) selectedAge = a;
    else break;
  }
  
  const termTable = ageTable[selectedAge];
  if (!termTable) return 0;
  
  // Намираме най-близкия срок
  const terms = Object.keys(termTable).map(Number).sort((a, b) => a - b);
  let selectedTerm = terms[0];
  for (const t of terms) {
    if (t <= term) selectedTerm = t;
    else break;
  }
  
  return termTable[selectedTerm] || 0;
};

/**
 * Изчислява бъдеща стойност на редовни вноски (FV)
 */
export const calculateFutureValue = (monthlyPayment, years, annualReturn) => {
  const monthlyRate = annualReturn / 12;
  const months = years * 12;
  
  if (monthlyRate === 0) {
    return monthlyPayment * months;
  }
  
  return monthlyPayment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
};

/**
 * Изчислява необходима месечна вноска за достигане на цел (PMT)
 */
export const calculateMonthlyPayment = (targetValue, years, annualReturn) => {
  const monthlyRate = annualReturn / 12;
  const months = years * 12;
  
  if (monthlyRate === 0) {
    return targetValue / months;
  }
  
  return targetValue * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
};

/**
 * Изчислява трудов капитал (Labor Capital)
 */
export const calculateLaborCapital = (monthlyIncome, yearsToRetirement, growthRate = 0.03) => {
  // Сума от бъдещи доходи с ръст
  let total = 0;
  let currentIncome = monthlyIncome * 12; // годишен доход
  
  for (let year = 0; year < yearsToRetirement; year++) {
    total += currentIncome;
    currentIncome *= (1 + growthRate);
  }
  
  return total;
};

/**
 * Изчислява нужда от защита на дохода
 */
export const calculateProtectionNeed = (monthlyIncome, monthlyExpenses, liabilities, yearsToRetirement) => {
  // Базова нужда = месечен доход * 60 месеца (5 години)
  const baseNeed = monthlyIncome * MODEL_COEFFICIENTS.PROTECTION_MONTHS;
  
  // Добавяме задължения
  const totalLiabilities = liabilities || 0;
  
  // Коефициент за години до пенсия (повече години = повече нужда)
  const yearsFactor = Math.min(yearsToRetirement / 30, 1.5);
  
  return (baseNeed + totalLiabilities) * yearsFactor;
};

/**
 * Изчислява нужда от резерв
 */
export const calculateReserveNeed = (monthlyExpenses, desiredMonths = 6) => {
  return monthlyExpenses * desiredMonths;
};

/**
 * Изчислява пенсионен дефицит
 */
export const calculatePensionGap = (desiredPension, expectedStatePension, yearsInRetirement = 20) => {
  const monthlyGap = Math.max(0, desiredPension - expectedStatePension);
  return monthlyGap * 12 * yearsInRetirement;
};

/**
 * Изчислява премия за срочна застраховка
 */
export const calculateTermLifePremium = (coverageAmount, age, termYears, gender, isSmoker) => {
  const rate = getTermLifeRate(Math.floor(age), termYears, gender, isSmoker);
  
  // Премия = (покритие / 1000) * тарифа
  const annualPremium = (coverageAmount / 1000) * rate;
  
  return {
    monthly: annualPremium / 12,
    annual: annualPremium,
    total: annualPremium * termYears,
    rate: rate
  };
};

/**
 * Изчислява UL инвестиция с такси (според Excel формули)
 */
export const calculateULInvestment = (monthlyPremium, years, strategy, oneTimeDeposit = 0) => {
  const annualReturn = STRATEGY_RETURNS[strategy] || STRATEGY_RETURNS.balanced;
  const entryFee = UL_FEES.entry_fee_percent / 100;
  const managementFee = UL_FEES.management_fee_percent / 100;
  
  // Нетна вноска след входна такса (3%)
  const netMonthly = monthlyPremium * (1 - entryFee);
  const netOneTime = oneTimeDeposit * (1 - entryFee);
  
  // Ефективна годишна доходност след такса за управление (1.5%)
  const effectiveReturn = annualReturn - managementFee;
  const monthlyRate = effectiveReturn / 12;
  
  // FV формула от Excel: -FV(rate, nper, pmt, pv, 0)
  const months = years * 12;
  let fvMonthly = 0;
  
  if (monthlyRate === 0) {
    fvMonthly = netMonthly * months;
  } else {
    // Excel FV формула за редовни вноски
    fvMonthly = netMonthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  }
  
  // Еднократен депозит
  const fvOneTime = netOneTime * Math.pow(1 + monthlyRate, months);
  
  const totalInvested = (monthlyPremium * 12 * years) + oneTimeDeposit;
  const expectedValue = fvMonthly + fvOneTime;
  const totalReturn = expectedValue - totalInvested;
  
  return {
    totalInvested,
    expectedValue: Math.round(expectedValue),
    totalReturn: Math.round(totalReturn),
    returnPercent: totalInvested > 0 ? ((expectedValue / totalInvested) - 1) * 100 : 0,
    effectiveReturn: effectiveReturn * 100,
    monthlyRate: monthlyRate * 100
  };
};

/**
 * Изчислява данъчно облекчение за пенсионни вноски
 */
export const calculateTaxBenefit = (annualPremium, annualIncome) => {
  const maxDeductible = Math.min(
    annualPremium,
    annualIncome * PENSION_PLAN_RATES.tax_benefit_percent,
    PENSION_PLAN_RATES.tax_benefit_max_bgn
  );
  
  // Данъчна ставка 10%
  const taxSaved = maxDeductible * 0.10;
  
  return {
    deductibleAmount: maxDeductible,
    taxSaved: taxSaved,
    effectiveRate: (taxSaved / annualPremium) * 100
  };
};
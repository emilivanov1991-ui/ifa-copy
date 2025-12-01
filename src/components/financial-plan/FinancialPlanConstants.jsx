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

// Очаквана доходност по стратегии (годишна)
export const STRATEGY_RETURNS = {
  conservative: 0.03,   // 3%
  balanced: 0.06,       // 6%
  dynamic: 0.08,        // 8%
  aggressive: 0.10      // 10%
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
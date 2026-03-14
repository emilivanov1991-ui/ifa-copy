// Plate prefix → DZI region mapping
const PLATE_TO_REGION = {
  'СВ': 'region1', 'СА': 'region1', 'С': 'region1',
  'В': 'region2',
  'РВ': 'region3', 'РА': 'region3',
  'А': 'region4',
  'ТХ': 'region5', 'Е': 'region5', 'РК': 'region5', 'КН': 'region5',
  'Р': 'region5', 'ОВ': 'region5', 'ВТ': 'region5', 'ЕВ': 'region5',
  'РР': 'region6', 'СТ': 'region6', 'У': 'region6', 'Н': 'region6',
  'СН': 'region6', 'СС': 'region6', 'Х': 'region6',
  'ВР': 'region7', 'ЕН': 'region7', 'СО': 'region7', 'СМ': 'region7',
  'М': 'region7', 'Т': 'region7', 'К': 'region7', 'ВН': 'region7',
};

export const REGION_NAMES = {
  region1: 'Регион 1 — София',
  region2: 'Регион 2 — Варна',
  region3: 'Регион 3 — Пловдив',
  region4: 'Регион 4 — Бургас',
  region5: 'Регион 5 — Добрич, Благоевград, Перник, Кюстендил, Русе, Ловеч, В.Търново, Габрово',
  region6: 'Регион 6 — Разград, Ст.Загора, Ямбол, Силистра, Шумен, Сливен, Хасково + области',
  region7: 'Регион 7 — Враца, Плевен, София-обл., Смолян, Монтана, Търговище, Кърджали, Видин + области',
};

export const ENGINE_SIZE_OPTIONS = [
  { value: 'up_to_1400', label: 'До 1400 куб.см' },
  { value: 'up_to_1600', label: '1401–1600 куб.см' },
  { value: 'up_to_1800', label: '1601–1800 куб.см' },
  { value: 'up_to_2000', label: '1801–2000 куб.см' },
  { value: 'up_to_2500', label: '2001–2500 куб.см' },
  { value: 'over_2500', label: 'Над 2500 куб.см' },
];

export function getRegionFromPlate(plate) {
  if (!plate) return null;
  const cleaned = plate.toUpperCase().replace(/\s/g, '').replace(/[^А-ЯA-Z]/g, '');
  const twoLetter = cleaned.substring(0, 2);
  const oneLetter = cleaned.substring(0, 1);
  return PLATE_TO_REGION[twoLetter] || PLATE_TO_REGION[oneLetter] || null;
}
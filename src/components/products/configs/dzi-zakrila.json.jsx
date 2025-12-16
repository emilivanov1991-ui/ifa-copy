{
  "productName": "ДЗИ Закрила",
  "provider": "ДЗИ - Общо застраховане ЕАД",
  "productType": "personal_accident",
  "description": "Индивидуална застраховка злополука с покритие при смърт, инвалидност, фрактури и изгаряния",
  
  "ageRestrictions": {
    "minAge": 16,
    "maxAge": 69,
    "coverageEndsAt": 70
  },
  
  "territorialCoverage": "България и чужбина",
  
  "packages": {
    "silver": {
      "name": "Сребърен пакет",
      "coverages": {
        "deathAccident": 20000,
        "deathRTA": 30000,
        "disabilityAccident": 20000,
        "disabilityRTA": 30000,
        "temporaryDisability": 2000,
        "fracturesAndBurns": 8000,
        "surgicalTreatment": 1000,
        "hospitalDaily": 10
      },
      "premiums": {
        "monthly": 10,
        "quarterly": 30,
        "semiAnnual": 60,
        "annual": 120
      },
      "maxPolicies": 3
    },
    "gold": {
      "name": "Златен пакет",
      "coverages": {
        "deathAccident": 30000,
        "deathRTA": 50000,
        "disabilityAccident": 30000,
        "disabilityRTA": 50000,
        "temporaryDisability": 5000,
        "fracturesAndBurns": 10000,
        "surgicalTreatment": 3000,
        "hospitalDaily": 30
      },
      "premiums": {
        "monthly": 15,
        "quarterly": 45,
        "semiAnnual": 90,
        "annual": 180
      },
      "maxPolicies": 2
    },
    "platinum": {
      "name": "Платинен пакет",
      "coverages": {
        "deathAccident": 50000,
        "deathRTA": 75000,
        "disabilityAccident": 50000,
        "disabilityRTA": 75000,
        "temporaryDisability": 10000,
        "fracturesAndBurns": 20000,
        "surgicalTreatment": 10000,
        "hospitalDaily": 100
      },
      "premiums": {
        "monthly": 30,
        "quarterly": 90,
        "semiAnnual": 180,
        "annual": 360
      },
      "maxPolicies": 1
    }
  },
  
  "coverageDetails": {
    "deathAccident": {
      "name": "Смърт вследствие на злополука",
      "description": "Трудова или битова злополука"
    },
    "deathRTA": {
      "name": "Смърт вследствие на ПТП",
      "description": "Пътно-транспортно произшествие"
    },
    "disabilityAccident": {
      "name": "Инвалидност над 50% вследствие на злополука",
      "description": "Процент от застрахователната сума според ЦЗМК на ДЗИ",
      "note": "Не се акумулира с покритието за ПТП"
    },
    "disabilityRTA": {
      "name": "Инвалидност над 50% вследствие на ПТП",
      "description": "Процент от застрахователната сума според ЦЗМК на ДЗИ",
      "note": "Не се акумулира с покритието за злополука"
    },
    "temporaryDisability": {
      "name": "Временна неработоспособност вследствие на злополука",
      "description": "Процентно обезщетение според продължителност",
      "percentages": {
        "20-40days": 5,
        "40-60days": 8,
        "60-90days": 10,
        "over90days": 15
      }
    },
    "fracturesAndBurns": {
      "name": "Счупени кости и изгаряния",
      "description": "Според схемата на обезщетенията",
      "maxEvents": 2,
      "note": "Максимум 2 събития в застрахователната година"
    },
    "surgicalTreatment": {
      "name": "Суми за оперативно лечение",
      "description": "Според хирургическата таблица на ДЗИ"
    },
    "hospitalDaily": {
      "name": "Дневни пари за болничен престой",
      "maxDaysPerStay": 20,
      "maxDaysPerYear": 30,
      "description": "До 20 дни еднократен престой, не повече от 30 дни годишно"
    }
  },
  
  "exclusions": [
    "Самоубийство или опит за самоубийство",
    "Умишлено извършване или опит за извършване на престъпление",
    "Употреба на алкохол, наркотици, опиати, стимулатори, допинг",
    "Температурни влияния (измръзване, слънчеви изгаряния, топлинен удар)",
    "Умишлено самонараняване или излагане на опасност",
    "Остеопороза или патологична фрактура при диагностицирана преди застраховката остеопороза"
  ],
  
  "taxIncluded": true,
  "taxRate": 0.02,
  "currency": "BGN",
  
  "fractureSchedule": {
    "pelvis_hip_multiple_complex": 100,
    "pelvis_hip_complex": 50,
    "pelvis_hip_multiple": 30,
    "pelvis_hip_simple": 15,
    "femur_multiple_complex": 50,
    "femur_complex": 40,
    "femur_multiple": 30,
    "femur_simple": 15,
    "foot_ankle_elbow_forearm_multiple_complex": 40,
    "foot_ankle_elbow_forearm_complex": 30,
    "foot_ankle_elbow_forearm_multiple": 20,
    "foot_ankle_elbow_forearm_simple": 10,
    "mandible_multiple_complex": 30,
    "mandible_complex": 20,
    "mandible_multiple": 16,
    "mandible_simple": 8,
    "radius_scapula_sternum_metacarpal_metatarsal_complex": 20,
    "radius_scapula_sternum_metacarpal_metatarsal_simple": 10,
    "colles_smith_barton_complex": 20,
    "colles_smith_barton_simple": 10,
    "vertebrae_compression_each": 20,
    "vertebrae_transverse_process_each": 10,
    "vertebrae_simple_each": 20,
    "ribs_zygomatic_coccyx_nose_multiple_complex": 16,
    "ribs_zygomatic_coccyx_nose_complex": 12,
    "ribs_zygomatic_coccyx_nose_multiple": 8,
    "ribs_zygomatic_coccyx_nose_simple": 4,
    "clavicle_patella_heel_complex": 30,
    "clavicle_patella_heel_multiple": 20,
    "clavicle_patella_heel_simple": 10,
    "skull_facial_multiple_complex": 100,
    "skull_facial_complex": 50
  },
  
  "burnsSchedule": {
    "degree_2_3_4_over_27_percent": 100,
    "degree_2_3_4_18_to_27_percent": 60,
    "degree_2_3_4_9_to_18_percent": 35,
    "degree_2_3_4_4_5_to_9_percent": 20,
    "degree_1_over_90_percent": 80,
    "degree_1_80_to_90_percent": 60,
    "degree_1_70_to_80_percent": 40,
    "degree_1_60_to_70_percent": 30,
    "degree_1_50_to_60_percent": 25,
    "degree_1_40_to_50_percent": 20,
    "degree_1_30_to_40_percent": 10,
    "degree_1_20_to_30_percent": 7,
    "degree_1_10_to_20_percent": 5,
    "degree_1_5_to_10_percent": 3,
    "degree_1_0_5_to_5_percent": 1,
    "respiratory_tract": 30,
    "head_neck_up_to_5_percent": 5,
    "head_neck_over_5_percent": 10,
    "perineum": 10,
    "burn_shock": 20
  }
}
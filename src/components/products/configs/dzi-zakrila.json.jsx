{
  "product_id": "dzi-zakrila",
  "provider": "ДЗИ",
  "product_name": "Закрила",
  "product_type": "term_life",
  "category": "protection",
  "description": "Животозастраховка с покритие при смърт и инвалидност",
  
  "calculation_method": "tariff_table",
  
  "rules": {
    "min_age": 18,
    "max_age": 65,
    "min_sum": 5000,
    "max_sum": 500000,
    "min_term": 5,
    "max_term": 30,
    "currency": "EUR",
    "smoker_multiplier": 1.5,
    "medical_exam_threshold": 100000
  },
  
  "tariff_data": {
    "age_brackets": [
      {
        "age_from": 18,
        "age_to": 25,
        "gender": "male",
        "rate_per_1000": 1.20,
        "term_multipliers": {
          "5-10": 1.0,
          "11-20": 1.1,
          "21-30": 1.2
        }
      },
      {
        "age_from": 18,
        "age_to": 25,
        "gender": "female",
        "rate_per_1000": 0.95,
        "term_multipliers": {
          "5-10": 1.0,
          "11-20": 1.1,
          "21-30": 1.2
        }
      },
      {
        "age_from": 26,
        "age_to": 35,
        "gender": "male",
        "rate_per_1000": 1.80,
        "term_multipliers": {
          "5-10": 1.0,
          "11-20": 1.15,
          "21-30": 1.25
        }
      },
      {
        "age_from": 26,
        "age_to": 35,
        "gender": "female",
        "rate_per_1000": 1.45,
        "term_multipliers": {
          "5-10": 1.0,
          "11-20": 1.15,
          "21-30": 1.25
        }
      },
      {
        "age_from": 36,
        "age_to": 45,
        "gender": "male",
        "rate_per_1000": 3.20,
        "term_multipliers": {
          "5-10": 1.0,
          "11-20": 1.2,
          "21-30": 1.3
        }
      },
      {
        "age_from": 36,
        "age_to": 45,
        "gender": "female",
        "rate_per_1000": 2.60,
        "term_multipliers": {
          "5-10": 1.0,
          "11-20": 1.2,
          "21-30": 1.3
        }
      },
      {
        "age_from": 46,
        "age_to": 55,
        "gender": "male",
        "rate_per_1000": 5.80,
        "term_multipliers": {
          "5-10": 1.0,
          "11-20": 1.25,
          "21-30": 1.4
        }
      },
      {
        "age_from": 46,
        "age_to": 55,
        "gender": "female",
        "rate_per_1000": 4.60,
        "term_multipliers": {
          "5-10": 1.0,
          "11-20": 1.25,
          "21-30": 1.4
        }
      },
      {
        "age_from": 56,
        "age_to": 65,
        "gender": "male",
        "rate_per_1000": 10.50,
        "term_multipliers": {
          "5-10": 1.0,
          "11-15": 1.2
        }
      },
      {
        "age_from": 56,
        "age_to": 65,
        "gender": "female",
        "rate_per_1000": 8.20,
        "term_multipliers": {
          "5-10": 1.0,
          "11-15": 1.2
        }
      }
    ]
  },
  
  "optional_coverages": [
    {
      "code": "disability",
      "name": "Трайна инвалидност",
      "rate_multiplier": 0.3,
      "description": "Покритие при трайна пълна инвалидност"
    },
    {
      "code": "critical_illness",
      "name": "Тежко заболяване",
      "rate_multiplier": 0.5,
      "description": "Покритие при диагностициране на тежко заболяване"
    },
    {
      "code": "hospital_benefit",
      "name": "Болнични",
      "flat_rate": 50,
      "description": "Дневни обезщетения при болничен престой"
    }
  ],
  
  "features": [
    "Покритие при смърт от всякаква причина",
    "Възможност за добавяне на инвалидност",
    "Покритие за тежки заболявания (опция)",
    "Фиксирана премия за целия срок",
    "Без медицински преглед до 100,000 EUR"
  ],
  
  "exclusions": [
    "Самоубийство в първите 2 години",
    "Участие в престъпна дейност",
    "Военни действия",
    "Екстремни спортове (без допълнително покритие)"
  ],
  
  "documents_required": [
    "Лична карта",
    "Медицинска анкета",
    "Медицински преглед (над 100,000 EUR)"
  ]
}
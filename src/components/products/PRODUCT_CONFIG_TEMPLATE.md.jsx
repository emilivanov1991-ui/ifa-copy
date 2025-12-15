# Product Configuration Template

## За какво е този template?
Този документ дефинира **точния формат** на JSON конфигурацията, която ми трябва за всеки нов продукт.

---

## Формат на JSON конфигурацията

```json
{
  "product_id": "provider-product-name",
  "provider": "Име на доставчика",
  "product_name": "Име на продукта",
  "product_type": "term_life | ul_investment | health_insurance | home_insurance | car_insurance | mortgage_loan | consumer_loan | pension_plan",
  "category": "protection | investment | health | property | loans | pension",
  "description": "Кратко описание",
  
  "calculation_method": "tariff_table | formula | rate_per_1000",
  
  "rules": {
    "min_age": 18,
    "max_age": 65,
    "min_sum": 5000,
    "max_sum": 500000,
    "min_term": 5,
    "max_term": 30,
    "currency": "EUR | BGN | USD",
    "smoker_multiplier": 1.5,
    "medical_exam_threshold": 100000
  },
  
  "tariff_data": {
    // Виж специфични формати по-долу
  },
  
  "optional_coverages": [
    {
      "code": "unique_code",
      "name": "Име на покритието",
      "rate_multiplier": 0.3,
      "flat_rate": 50,
      "description": "Описание"
    }
  ],
  
  "features": [
    "Характеристика 1",
    "Характеристика 2"
  ],
  
  "exclusions": [
    "Изключение 1",
    "Изключение 2"
  ]
}
```

---

## Calculation Methods

### 1. **tariff_table** (за животозастраховки, здравни)

Използва се когато тарифата е по **възрастови групи**.

```json
"calculation_method": "tariff_table",
"tariff_data": {
  "age_brackets": [
    {
      "age_from": 18,
      "age_to": 25,
      "gender": "male | female | any",
      "rate_per_1000": 1.20,
      "term_multipliers": {
        "5-10": 1.0,
        "11-20": 1.1,
        "21-30": 1.2
      }
    }
  ]
}
```

**Изчисление:** `(sum / 1000) * rate_per_1000 * term_multiplier * smoker_multiplier`

---

### 2. **rate_per_1000** (за по-прости продукти)

Използва се за фиксирана тарифа на 1000 единици.

```json
"calculation_method": "rate_per_1000",
"tariff_data": {
  "base_rate": 2.5,
  "adjustments": {
    "term": {
      "5": 1.0,
      "10": 1.1,
      "15": 1.2,
      "default": 1.0
    }
  }
}
```

**Изчисление:** `(sum / 1000) * base_rate * adjustment`

---

### 3. **formula** (за кредити, инвестиции)

Използва се за математически формули.

```json
"calculation_method": "formula",
"tariff_data": {
  "formula": "sum * interest_rate / 12 * (1 + term) / term",
  "variables": {
    "interest_rate": 0.05
  }
}
```

**Изчисление:** Директно от формулата

---

## Примери за различни типове продукти

### Животозастраховка (Term Life)
```json
{
  "product_id": "dzi-zakrila",
  "provider": "ДЗИ",
  "product_name": "Закрила",
  "product_type": "term_life",
  "calculation_method": "tariff_table",
  "rules": {
    "min_age": 18,
    "max_age": 65,
    "min_sum": 5000,
    "max_sum": 500000,
    "min_term": 5,
    "max_term": 30,
    "currency": "EUR",
    "smoker_multiplier": 1.5
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
      }
    ]
  }
}
```

### Здравна застраховка
```json
{
  "product_id": "uniqa-health-value",
  "provider": "Уника",
  "product_name": "Здраве и Ценност",
  "product_type": "health_insurance",
  "calculation_method": "tariff_table",
  "rules": {
    "min_age": 0,
    "max_age": 70,
    "currency": "EUR"
  },
  "tariff_data": {
    "age_brackets": [
      {
        "age_from": 0,
        "age_to": 18,
        "rate_per_1000": 0,
        "flat_premium": 150
      },
      {
        "age_from": 19,
        "age_to": 30,
        "rate_per_1000": 0,
        "flat_premium": 200
      }
    ]
  }
}
```

### Имуществена застраховка
```json
{
  "product_id": "dzi-home",
  "provider": "ДЗИ",
  "product_name": "Комфорт за дома",
  "product_type": "home_insurance",
  "calculation_method": "rate_per_1000",
  "rules": {
    "min_sum": 10000,
    "max_sum": 1000000,
    "currency": "BGN"
  },
  "tariff_data": {
    "base_rate": 1.5,
    "adjustments": {
      "zone": {
        "urban": 1.0,
        "suburban": 1.2,
        "rural": 1.4
      },
      "property_type": {
        "apartment": 1.0,
        "house": 1.3
      }
    }
  }
}
```

### Ипотечен кредит
```json
{
  "product_id": "obb-mortgage",
  "provider": "ОББ",
  "product_name": "Ипотечен кредит",
  "product_type": "mortgage_loan",
  "calculation_method": "formula",
  "rules": {
    "min_sum": 10000,
    "max_sum": 500000,
    "min_term": 5,
    "max_term": 30,
    "currency": "BGN",
    "max_ltv": 80,
    "max_dti": 40
  },
  "tariff_data": {
    "formula": "sum * ((interest_rate / 12) * Math.pow(1 + interest_rate / 12, term * 12)) / (Math.pow(1 + interest_rate / 12, term * 12) - 1)",
    "variables": {
      "interest_rate": 0.06
    },
    "fees": {
      "processing": 0.005,
      "appraisal": 200,
      "notary": 0.002
    }
  }
}
```

### Инвестиционен план
```json
{
  "product_id": "partners-regular-dynamic",
  "provider": "Партнърс Инвестмънтс",
  "product_name": "Регуларна инвестиция - Динамична стратегия",
  "product_type": "ul_investment",
  "calculation_method": "formula",
  "rules": {
    "min_monthly": 30,
    "max_monthly": 10000,
    "min_term": 10,
    "max_term": 40,
    "currency": "EUR"
  },
  "tariff_data": {
    "formula": "monthly * term * 12 * (1 + expected_return - entry_fee - management_fee)",
    "variables": {
      "entry_fee": 0.05,
      "management_fee": 0.012,
      "expected_return": 0.08
    }
  }
}
```

---

## Какво ми трябва от теб?

За всеки продукт, който искаш да добавя, ми предостави:

### 1. **Основна информация:**
- Име на доставчика
- Име на продукта
- Тип продукт
- Кратко описание

### 2. **Правила (rules):**
- Възрастови ограничения (min_age, max_age)
- Лимити на суми (min_sum, max_sum)
- Срокове (min_term, max_term)
- Валута
- Специфични множители/прагове

### 3. **Тарифи (tariff_data):**
- **За животозастраховки:** Таблица по възраст, пол, term multipliers
- **За имуществени:** Base rate + adjustments по зони/тип имот
- **За кредити:** Лихвен процент, такси
- **За инвестиции:** Такси (entry, management), очаквана доходност

### 4. **Допълнителни покрития (optional):**
- Име, код, тарифа/множител

### 5. **Особености:**
- Какво е включено по подразбиране
- Какви са изключенията
- Изисквания за документи

---

## Следващи стъпки

1. **Избери 2-3 продукта** които искаш да добавим първи
2. **Изпрати ми тарифите** по горния формат (може и като снимки/PDF - аз ще ги форматирам)
3. **Аз създавам JSON конфигурацията** за 5 минути
4. **Продуктът е готов** за използване във финансовия план

**Готов съм да започнем!** 🚀
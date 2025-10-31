# Helpers

Вспомогательные функции вынесены из `functions.php` для улучшения архитектуры.

## Файлы

### date-formatter.php
Функции для форматирования дат:
- `atlas_format_date_russian()` - форматирует дату на русском (Пн, 5 янв)
- `atlas_format_time()` - форматирует время (HH:mm)
- `atlas_format_datetime_russian()` - полный формат даты и времени
- `atlas_get_russian_months()` - массив названий месяцев
- `atlas_get_russian_days()` - массив названий дней недели

### validators.php
Функции валидации:
- `atlas_validate_tour_dates()` - валидация дат туров в ACF
- `atlas_validate_phone()` - валидация телефона
- `atlas_validate_email()` - валидация email
- `atlas_sanitize_phone()` - очистка номера телефона

### admin-scripts.php
JavaScript для админки WordPress:
- `atlas_tour_dates_validation_script()` - скрипт валидации дат в админке
- `atlas_flight_duration_calculator()` - автоматический расчет времени полета

## Использование

Все файлы подключаются автоматически в `functions.php`:

```php
require_once get_template_directory() . '/inc/helpers/date-formatter.php';
require_once get_template_directory() . '/inc/helpers/validators.php';
require_once get_template_directory() . '/inc/helpers/admin-scripts.php';
```

## Результат

**Было:** 4437 строк в functions.php  
**Стало:** 4159 строк в functions.php  
**Удалено:** 278 строк дублированного кода


# GYMKiDs Dashboard

**Данные предоставлены для демонстрации и не отражают реальные показатели центров.**

Интерфейс показателей центра: лиды, источники обращений, конверсия и путь до пробного занятия.

## Запуск

Требуются Node.js 22.23.1 и pnpm 10.33.2.

```bash
corepack enable
corepack pnpm install --frozen-lockfile --ignore-scripts
corepack pnpm build:icons
corepack pnpm dev
```

Откройте `/bento-preview` по адресу, который выведет Vite.

## Команды

```bash
corepack pnpm lint:strict
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
corepack pnpm preview
```

## Структура

- `src/pages/bento-preview.vue` — основной экран.
- `src/components/bento/` — содержимое карточек.
- `src/composables/` — выбор центра и периода, загрузка данных, состояния интерфейса.
- `src/data/` — типы, преобразование данных, расчёты и форматирование.
- `src/lib/` — вспомогательная логика и переходы карточек.
- `src/styles/` — оформление и адаптивная сетка.
- `tests/` — автоматические проверки.

## Данные

Источник задаётся переменными из `.env.example`. Формат включает указатель `current.json`, манифест выпуска и JSON-файлы центров. Ключи доступа и настройки рабочих серверов не входят в репозиторий.

## Разработка

Основной стек: Vue 3, TypeScript, Vite, Pinia и Vuetify. Проверки GitHub Actions собирают приложение и запускают тесты; публикация сайта не настроена.

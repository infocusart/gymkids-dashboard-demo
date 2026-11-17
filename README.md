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
corepack pnpm test:coverage
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

## Покрытие и аудит

FACT: `test:coverage` запускает все node:test-тесты через c8, создаёт `coverage/lcov.info`, HTML в `coverage/lcov-report/` и JSON-сводку. Включены также незагруженные JS/TS-модули и CLI-скрипты; декларации `.d.ts` исключены. Счётчики LCOV не изменяются при нормализации путей для Windows/Linux.

FACT: Vue SFC проверяются сборкой и браузерными сценариями; их исполнение пока не инструментируется этой node:test-командой. SonarQube продолжает учитывать непокрытые SFC в общем показателе. Прочитанный как текст Vue-файл не считается исполненным тестами.

MET: CI сохраняет отчёт как артефакт `test-coverage`. Функциональные проверки и security job выполняются независимо, чтобы видеть оба результата; ошибка security сохраняет красный статус workflow. Ручной Sonar workflow сначала генерирует LCOV и затем импортирует его через `sonar.javascript.lcov.reportPaths`.

MET: Не исключать непокрытые модули и не снижать Quality Gate ради зелёного результата. Классификация замечаний приведена в [разборе SonarQube](docs/sonarqube-audit.md).

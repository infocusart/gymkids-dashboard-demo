# Security

Do not commit credentials or personal data. Report sensitive issues privately to the repository owner. Third-party dependencies retain their respective licenses and copyright notices.

## Проверки перед слиянием

MET: Основной CI блокирует функциональные проверки до успешного `pnpm security:check`. Команда отдельно проверяет production, затем полный граф зависимостей из lockfile, начиная с low. Ошибки реестра не игнорируются. Оба прохода обязательны: при финальной сверке 17 ноября production endpoint npm уже сообщил новую picomatch advisory, хотя полный endpoint ещё вернул ноль.

MET: Дополнительный workflow `security-scanners` проверяет проект четырьмя независимыми инструментами:

- OSV-Scanner 2.7.1 — зависимости по базе OSV.
- Semgrep CE 1.185.0 — исходники, наборы `p/security-audit`, `p/javascript`, `p/typescript`; телеметрия выключена, findings и ошибки разбора блокируют проверку.
- Gitleaks 8.30.1 — полная история Git; секреты скрываются в выводе, inline allow-комментарии не отключают проверку.
- zizmor 1.32.0 — безопасность конфигурации GitHub Actions, включая ошибки схемы.

MET: Версии сканеров закреплены. Для скачиваемых OSV/Gitleaks проверяются SHA256 официальных release assets. Правила Semgrep и базы advisory обновляются при сканировании; версия сканера не замораживает базу уязвимостей.

```sh
pnpm security:check
pnpm security:prod
osv-scanner scan source --lockfile=pnpm-lock.yaml
semgrep scan --config p/security-audit --config p/javascript --config p/typescript --metrics=off --strict --error .
gitleaks git --redact --ignore-gitleaks-allow --log-opts=--all .
zizmor --offline --strict-collection .github/workflows
```

MET: Для локальной проверки использовать Node 22.23.1 и pnpm 10.33.2. Прохождение тестов/сборки не заменяет сканирование; чистый результат одного сканера не отменяет находку другого. Не использовать `continue-on-error`, `--ignore-registry-errors`, `--ignore-unfixable` или общее отключение правил для получения зелёного результата.

MET: CI устанавливает зависимости с `--frozen-lockfile --ignore-scripts`. Генерация иконок запускается отдельной явной командой `pnpm build:icons`; install hooks сторонних пакетов и автоматический `postinstall` не выполняются.

## Открытая зависимость — 17 ноября 2026

FACT: OSV отмечает `GHSA-fc5q-39xc-vjpf` / `CVE-2026-112366` в `picomatch` до 4.0.7 включительно. Последняя опубликованная версия на проверке — 4.0.7; исправленный релиз в advisory не указан. Источник: [GitHub Advisory Database](https://github.com/github/advisory-database/blob/main/advisories/github-reviewed/2026/10/GHSA-fc5q-39xc-vjpf/GHSA-fc5q-39xc-vjpf.json).

FACT: В этом lockfile picomatch приходит через инструменты сборки, включая development-зависимости и peer-цепочку Vuetify → vite-plugin-vuetify → Vite → Sass → watcher. Последняя цепочка обозначена dependency-графом как production; называть всю находку исключительно devDependency было бы неверно. Доступного посетителю пути передачи glob-паттерна в picomatch не установлено. Это ограничение наблюдаемой достижимости, не исправление библиотеки и не принятие риска.

MET: OSV-проверка остаётся блокирующей до исправленного релиза либо отдельно проверенного исправления. Исключение/подавление этой advisory не добавлено. При появлении исправления обновить принудительные версии picomatch в overrides/resolutions и повторить оба dependency-сканера и функциональные проверки.

FACT: Локальный Semgrep CE 1.185.0 на Windows завершил анализ 774 файлов / 97 применимых правил без findings, но с двумя ошибками частичного разбора существующих TypeScript-модулей (`gymkidsSnapshotTypes.ts`, `types/changelog.ts`), exit 3. Поэтому этот запуск не считается чистой проверкой. Нормализация LF не устранила ошибки. Linux workflow с `--strict` подготовлен, но ещё не запускался в GitHub; до реального прогона нельзя утверждать, что SAST gate пройден. Проблемные модули и правила не исключены из проверки.

## Ссылки журнала

MET: `src/lib/changelogLinks.js` — общий валидатор для записи события и браузерного показа. Маршруты разрешены только от корня сайта; запрещены network-relative пути, управляющие символы, обратные слеши и их закодированные варианты. Внешние ссылки разрешены только по HTTPS на перечисленные в модуле origin, без credentials. Новые origin добавлять после проверки владельца источника. Заголовок ссылки не устанавливает доверие к URL.

## Граница демоверсии

FACT: Здесь нет серверной авторизации настоящих данных центров. Подключение реальных выгрузок требует отдельной проверки доступа к current/manifest/payload/details/history и старым выпускам под каждой ролью. Форма входа и скрытый в интерфейсе центр не заменяют серверную проверку.

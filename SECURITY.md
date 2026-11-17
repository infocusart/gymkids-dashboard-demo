# Security

Do not commit credentials or personal data. Report sensitive issues privately to the repository owner. Third-party dependencies retain their respective licenses and copyright notices.

## Проверки перед слиянием

MET: Основной CI содержит отдельный failing job `pnpm security:check`. Функциональный job запускается независимо, чтобы собирать результаты тестов и покрытие даже при открытой advisory; общий workflow при ошибке security остаётся красным. Команда отдельно проверяет production, затем полный граф зависимостей из lockfile, начиная с low. Ошибки реестра не игнорируются. Оба прохода обязательны: при сверке 17 ноября production endpoint npm сообщил новую picomatch advisory, хотя полный endpoint ещё вернул ноль.

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

FACT: Добавлены pnpm-патчи для обеих версий — 2.3.2 и 4.0.7. Повторяемые extglob с неэкранированным wildcard `*` в теле обрабатываются как литералы через существующий защитный механизм библиотеки. Это намеренное ограничение опасных шаблонов, включая `+(*a)`; обычные `**/*.vue`, альтернативы, экранированные и заключённые в кавычки/классы символов звёздочки сохраняются. Поведение безопасных шаблонов сравнено с исходными версиями на всех путях проекта, а зависание до патча воспроизведено в ограниченных дочерних процессах. Регрессионный тест проверяет обе версии в активном установленном графе.

MET: Версии пакетов и исходная advisory сохранены. Патчи — локальная защитная правка, не официальный исправленный релиз и не полное доказательство безопасности всех glob-паттернов. Подавлений advisory нет; сырой dependency gate остаётся блокирующим. После официального исправления заменить патчи релизом и повторить оба dependency-сканера и функциональные проверки.

FACT: Две ошибки частичного разбора Semgrep устранены явными разделителями членов интерфейсов в `gymkidsSnapshotTypes.ts` и `types/changelog.ts`. Для этих двух файлов ESLint требует такой же стиль; это не отключение SAST-правил или исключение исходников. Локальный строгий Semgrep прошёл без findings и ошибок разбора. Hosted Linux CI ещё не запускался.

## CodeQL и SonarQube

MET: Workflow CodeQL запускает `security-extended` для JavaScript/TypeScript без сборки и зависимостей. Анализ публикует SARIF в Code Scanning, а отдельный fail-closed шаг `scripts/security-sarif.mjs` возвращает ошибку при findings, неполных данных или отсутствии SARIF. Права `security-events: write` ограничены этим job. Правила защиты ветки отдельно не настраивались.

MET: `sonar-project.properties` охватывает `src`, `scripts`, `public` и тесты. Локальная проверка использует SonarQube Community Build 26.11.0.134175 и SonarScanner 8.3.1.16491; исходники передаются только собственному loopback-серверу с выключенной телеметрией. Анализ Community Build не равен коммерческому taint-анализу.

MET: Workflow SonarQube запускается вручную и требует заранее настроенных владельцем HTTPS-переменной `SONAR_HOST_URL` и секрета `SONAR_TOKEN`. Пустая конфигурация завершает job ошибкой. Соединение и hosted job ещё не настраивались/не запускались. Quality Gate проверяется штатным action; его ошибки не игнорируются. Нулевое покрытие в отчёте без импортированного coverage-отчёта не означает отсутствие существующих тестов.

MET: Changelog запускает Git по абсолютному пути: `/usr/bin/git` либо `C:/Program Files/Git/cmd/git.exe`. Для нестандартной установки оператор задаёт доверенный абсолютный `GYMKIDS_GIT_EXECUTABLE`; файл внутри checkout запрещён. Поиск по PATH не используется. `check --append-only` завершается ошибкой при недоступном Git или metadata.

## Ссылки журнала

MET: `src/lib/changelogUrls.js` — общий валидатор для записи события и браузерного показа. Маршруты разрешены только от корня сайта; запрещены network-relative пути, управляющие символы, обратные слеши и их закодированные варианты. Внешние ссылки поддерживают HTTPS без credentials согласно принятому upstream PR #1; origin-allowlist MCP preview сохраняется отдельно в gymkidsMcpPreview.ts. Заголовок ссылки не устанавливает доверие к URL.

## Граница демоверсии

FACT: Здесь нет серверной авторизации настоящих данных центров. Подключение реальных выгрузок требует отдельной проверки доступа к current/manifest/payload/details/history и старым выпускам под каждой ролью. Форма входа и скрытый в интерфейсе центр не заменяют серверную проверку.

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

## Открытая зависимость picomatch

FACT: OSV отмечает `GHSA-fc5q-39xc-vjpf` / `CVE-2026-112366` в `picomatch` до 4.0.7 включительно. Последняя опубликованная версия на проверке — 4.0.7; исправленный релиз в advisory не указан. Источник: [GitHub Advisory Database](https://github.com/github/advisory-database/blob/main/advisories/github-reviewed/2026/10/GHSA-fc5q-39xc-vjpf/GHSA-fc5q-39xc-vjpf.json).

FACT: В этом lockfile picomatch приходит через инструменты сборки, включая development-зависимости и peer-цепочку Vuetify → vite-plugin-vuetify → Vite → Sass → watcher. Последняя цепочка обозначена dependency-графом как production; называть всю находку исключительно devDependency было бы неверно. Доступного посетителю пути передачи glob-паттерна в picomatch не установлено. Это ограничение наблюдаемой достижимости, не исправление библиотеки и не принятие риска.

FACT: Для picomatch 2.3.2 и 4.0.7 перенесено исправление из предложенных upstream PR. Патч сворачивает повторение простого сегмента с одной звёздочкой до одного или необязательного вхождения. Для остальных повторяемых выражений с wildcard сохраняется обработка как литерала. Проверка выполняется до обработки параметра `maxExtglobRecursion`, включая значение `false`. [Предложение для 2.x, e2e3342](https://github.com/micromatch/picomatch/pull/268) · [Предложение для 4.x, d9a3f12](https://github.com/micromatch/picomatch/pull/267)

FACT: Отдельный патч pnpm для Rollup 4.64.2 вносит ту же правку в шесть встроенных парсеров. В ESM-файлах `dist/es/shared/node-entry.js` и `watch.js` находятся одна и две копии, в CommonJS-файлах `dist/shared/rollup.js` и `index.js` — одна и две. Тест проверяет поведение обеих установленных версий picomatch и SHA-256 четырёх исполняемых файлов Rollup. При обновлении Rollup следует заново проверить его встроенные парсеры до замены контрольных сумм.

MET: Версии пакетов и исходная advisory сохранены. Патчи — локальная защитная правка, не официальный исправленный релиз и не полное доказательство безопасности всех glob-паттернов. Подавлений advisory нет; сырой dependency gate остаётся блокирующим. После официального исправления заменить патчи релизом и повторить оба dependency-сканера и функциональные проверки.

FACT: Две ошибки частичного разбора Semgrep устранены явными разделителями членов интерфейсов в `gymkidsSnapshotTypes.ts` и `types/changelog.d.ts`. Для этих двух файлов ESLint требует такой же стиль; это не отключение SAST-правил или исключение исходников. Локальный строгий Semgrep прошёл без findings и ошибок разбора. Hosted Linux CI ещё не запускался.

FACT: На 18 ноября 2026 года GitHub указывает уязвимый диапазон до 4.0.7 включительно и не указывает исправленный релиз. Сборка Vite проверяет граф модулей клиентского приложения и завершается ошибкой, если находит пакет picomatch, в том числе в динамическом импорте. Проверка охватывает модули, которые видит Rollup. Скопированный внутрь другого пакета исходный код и процессы сборки находятся за её пределами. [Карточка advisory](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)

MET: В инструменты сборки передавать только glob-выражения из проверенной конфигурации проекта. Для закрытия замечания обновить обе ветки зависимости до исправленных релизов либо устранить все ведущие к ним цепочки. Проверить чистую установку из lockfile, тесты совместимости, клиентскую сборку, оба прохода pnpm audit и OSV.

## Лицензии компонентов прокрутки

FACT: Для `vue3-perfect-scrollbar@2.0.0` владелец проекта подтвердил MIT. Все четыре файла `src/` из установленного npm-пакета побайтно совпадают с тегом v2.0.0 и коммитом, в котором проект принял MIT LICENSE. В опубликованном package.json поле license отсутствует. [Ответ владельца о версии 2.0](https://github.com/mercs600/vue3-perfect-scrollbar/issues/30#issuecomment-2071666994) · [Файл лицензии в проверенном коммите](https://github.com/mercs600/vue3-perfect-scrollbar/blob/b6eb0d50d211136d1bc0d5d2a0784b0e1ace8258/LICENSE)

FACT: Каталог `public/licenses/` поставляет полный текст MIT с указанием правообладателей обёртки и её зависимости `perfect-scrollbar@1.5.6`. При обновлении пакетов нужно сверить версии и тексты уведомлений.

## CodeQL и SonarQube

MET: Workflow CodeQL запускает `security-extended` для JavaScript/TypeScript без сборки и зависимостей. Анализ публикует SARIF в Code Scanning, а отдельный fail-closed шаг `scripts/security-sarif.mjs` возвращает ошибку при findings, неполных данных или отсутствии SARIF. Права `security-events: write` ограничены этим job. Правила защиты ветки отдельно не настраивались.

MET: `sonar-project.properties` охватывает `src`, `scripts`, `public` и тесты. Локальная проверка использует SonarQube Community Build 26.11.0.134175 и SonarScanner 8.3.1.16491; исходники передаются только собственному loopback-серверу с выключенной телеметрией. Анализ Community Build не равен коммерческому taint-анализу.

MET: Workflow SonarQube запускается вручную и требует заранее настроенных владельцем HTTPS-переменной `SONAR_HOST_URL` и секрета `SONAR_TOKEN`. Пустая конфигурация завершает job ошибкой. Соединение и hosted job ещё не настраивались/не запускались. Quality Gate проверяется штатным action; его ошибки не игнорируются. Нулевое покрытие в отчёте без импортированного coverage-отчёта не означает отсутствие существующих тестов.

MET: Changelog запускает Git по абсолютному пути: `/usr/bin/git` либо `C:/Program Files/Git/cmd/git.exe`. Для нестандартной установки оператор задаёт доверенный абсолютный `GYMKIDS_GIT_EXECUTABLE`; файл внутри checkout запрещён. Поиск по PATH не используется. `check --append-only` завершается ошибкой при недоступном Git или metadata.

## Ссылки журнала

MET: `src/lib/changelogUrls.js` — общий валидатор для записи события и браузерного показа. Маршруты разрешены только от корня сайта; запрещены network-relative пути, управляющие символы, обратные слеши и их закодированные варианты. Внешние ссылки поддерживают HTTPS без credentials согласно принятому upstream PR #1; origin-allowlist MCP preview сохраняется отдельно в gymkidsMcpPreview.ts. Заголовок ссылки не устанавливает доверие к URL.

## Граница демоверсии

FACT: Покрытие c8 использует `test-exclude → glob`. Для этой ветки зависимостей задан glob 14.0.2 вместо уязвимого 13.x; это исправляет [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4). После установки без lifecycle-скриптов повторно проходят 101 тест и генерация LCOV. Старый glob 7.x других инструментов этим override не меняется. Переопределение следует пересмотреть после штатного обновления зависимости в test-exclude.

FACT: Здесь нет серверной авторизации настоящих данных центров. Подключение реальных выгрузок требует отдельной проверки доступа к current/manifest/payload/details/history и старым выпускам под каждой ролью. Форма входа и скрытый в интерфейсе центр не заменяют серверную проверку.

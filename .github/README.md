# WMS ESP — GitHub

## CI

Workflow: [`.github/workflows/ci.yml`](workflows/ci.yml)

Se ejecuta en push y pull request a `main`:

| Job | Comando |
|-----|---------|
| Backend tests | `pytest tests/` |
| Import linter | `lint-imports` (contratos en `.importlinter`) |
| Frontend build | `cd frontend && npm run build` |

## Contribuir

Ver [docs/CONTRIBUTING.md](../docs/CONTRIBUTING.md).

## Documentación

Índice maestro: [docs/INDEX.md](../docs/INDEX.md)

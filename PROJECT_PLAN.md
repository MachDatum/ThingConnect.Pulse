# ThingConnect Pulse – Working Model

This file defines the operating rhythm, workflow principles, and initial GitHub issues for ThingConnect Pulse.

## Operating Rhythm
- Source of truth is this `PROJECT_PLAN.md` and the schema/specs committed in `/docs/`.
- Task entry point is GitHub Issues (atomic, reviewable, 1–4h ideally).
- Project board tracks: Backlog → Ready → In Progress → PR Review → Done.
- Specs first, code next: Every issue links to the relevant spec (YAML Schema, OpenAPI, EF Core entities, rollup SQL).
- Definition of Done baked into every issue: code merged + unit tests + CI green + docs updated.
- Confidence index: each issue carries a confidence score (0.3–1.0). Below 0.7 = validate first.
- Continuous reminders: when a milestone is delivered, loop back for next layer.

## Workflow Principles
- Parallel lanes: Backend DB/entities, Frontend UI skeleton, Installer scaffolding can all start now.
- Interface contracts (OpenAPI + JSON Schema) are frozen at v1.0. Extend, don’t break.
- Feature flags: risky features (CIDR expansion, rollup pruning) start behind toggles.

## Initial Epics & Issues
See `/docs/` folder for specs:
- `openapi.yaml` – API Contract
- `config.schema.json` – YAML Config Schema
- `data-model.cs` – EF Core Entities
- `rollup-spec.md` – Rollup/Outage Algorithms

Developers create GitHub Issues linked to these artifacts. Milestones: 
1. DB & API stubs running
2. Frontend shells with mock data
3. Installer proves service runs
4. Outage + rollup jobs validated
5. Add monitoring loop

---

# Contributing

Thanks for helping improve the Ecommerce Demo Store test suite! 🎭

This is a public repo, so anyone can read and clone it — but **pushing directly
requires write access**. If you're not a maintainer, use the **fork & pull request**
flow below.

## Workflow

1. **Fork** this repository and clone your fork.
2. **Branch** off `main` — e.g. `git checkout -b feat/my-change`.
3. **Set up** — `npm install && npm run install:browsers`, then `cp .env.example .env` and fill it in.
4. **Make your change**, following the conventions in [`AGENTS.md`](./AGENTS.md)
   (Page Object Model, `.js` import extensions, `test.step` grouping, `data-testid` selectors).
5. **Verify** — `npm test` passes locally.
6. **Commit** with a clear message and **push to your fork**.
7. **Open a Pull Request** against `main` describing what changed and why.

## Guidelines

- Keep page logic in `pages/`; keep specs in `tests/`.
- Never commit secrets — only `.env.example` belongs in git.
- One logical change per PR keeps reviews fast.

Maintainers with write access may push small fixes directly; everyone else, please open a PR.

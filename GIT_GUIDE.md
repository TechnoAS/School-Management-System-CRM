**Git Guide — What, Why, and How**

This document explains why we use Git, the recommended workflows, and what the main files and directories in this repository are for.

## Why Git

- Track changes and history: keep a safe, time-travelable record of work.
- Collaborate: branches + pull requests enable parallel work and reviews.
- Reproducibility: pins dependencies and build files in source control.

## Quick Start

Clone (if remote exists):

```bash
git clone <remote-url> repo-name
cd repo-name
```

Common local workflow:

```bash
# create feature branch
git checkout -b feat/short-description

# work, stage, and commit
git add .
git commit -m "feat: add short summary"

# push branch and open PR
git push -u origin HEAD
```

## Branching & Naming

- `main` — stable production-ready code.
- `develop` (optional) — integration branch for the next release.
- Feature branches: `feat/<short-desc>`
- Fix branches: `fix/<short-desc>`
- Hotfix branches: `hotfix/<short-desc>`

Keep branch names short and descriptive.

## Commit Messages

Use Conventional Commit style for clear history:

```
type(scope?): subject

body (optional)

footer (optional)
```

Examples:

- `feat(courses): add course form modal`
- `fix(auth): handle token refresh error`

## Pull Requests

- Target `main` (or `develop` if used).
- Add a short description, testing steps, and link related issues.
- Request at least one reviewer.

## Remotes & Pushing

Add `origin` (example):

```bash
git remote add origin git@github.com:owner/repo.git
git push -u origin main
```

If you need me to add the remote and push, provide the remote URL.

## .gitignore

This repository already contains a `.gitignore` tuned for Node/Vite and the backend. Keep generated build outputs and secrets out of Git (`.env`, `node_modules`, `dist`, etc.).

## Important Files & Directories

- **Project Root:** See [README.md](README.md) for project overview.
- **Package manifest:** [package.json](package.json) — defines scripts and dependencies.
- **Frontend entry:** [src/main.tsx](src/main.tsx) — application bootstrap.
- **App code:** `src/app/` — main React app and router.
- **Components:** `src/app/components/` and `src/components/` — UI components and shared pieces.
- **Backend (optional):** [backend/README.md](backend/README.md) — server-side notes and `backend/` folder.
- **Docs:** `docs/` — API and database docs; see [docs/API.md](docs/API.md).

## Handling Large Files & Assets

- Avoid committing large binaries. Use Git LFS if you must track large assets.
- Keep screenshots and generated build artifacts out of the repo when possible.

## Reverting & Recovery

- Undo last commit (but keep changes staged): `git reset --soft HEAD~1`
- Discard local changes to a file: `git checkout -- path/to/file`
- Revert a committed change: `git revert <commit>`

## Tips

- Run `git status` often.
- Keep PRs small and focused.
- Rebase interactively to squash related commits before merging (if your team prefers a linear history).

---

If you want, I can:

- add this file and commit it (I will do that now),
- add a suggested `CONTRIBUTING.md` template,
- or create a GitHub repo and push the code (provide remote or token).

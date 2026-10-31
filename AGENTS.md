# AGENTS.md

This repo is the source for ivonliu.com: a plain static site (HTML, CSS and JS, with no build
step) on Namecheap shared hosting, updated over FTP.

## Layout

- `public_html/` is the site. It mirrors the server's web root exactly. Everything in it
  goes live, and nothing outside it does.
  - `index.html`: the homepage (Materialize 0.97 from `css/` and `js/`, jQuery 2.1.1 from a
    CDN).
  - `css/`, `js/`, `font/`, `images/`: homepage assets.
  - `misc/<name>/`: standalone side projects, each with its own `index.html` and assets.
    Put new standalone pages here unless Ivon says otherwise, and use relative links.
  - `secret/mesnotes/`: an old Angular + Parse app. The folder name is historical; the page
    is public. It renders blank because Parse shut down in 2017.
- Everything else at the top level stays in the repo only: this file, `CLAUDE.md`,
  `.claude/`, `.env` and so on.
- The server also holds `cgi-bin/` and `.ftpquota`. The host manages them, they aren't in
  the repo, and deploys leave them alone.

To preview locally, run `python3 -m http.server 8000 -d public_html`. The live site is
served over `http://ivonliu.com`; HTTPS currently presents the host's `*.web-hosting.com`
certificate.

## FTP credentials

The credentials are in `.env` at the top level of the main checkout
(`/Users/ivon/Develop/personal-website/.env`). It's gitignored, so never commit it; the
template is `.env.example`. Source it in the shell command that uses it, and never print it.
If it's missing or empty, ask Ivon to fill it in rather than asking for the password in chat.

## Deploying

Follow `.claude/skills/ftp-deploy/SKILL.md`. In short: mirror `public_html/` to the server
with lftp, including deletions, after a dry run. Never delete a server file unless a local
commit deleted it.

## Git

- Push straight to `master`; this is a single-author site, so no PRs unless Ivon asks.
- Commit messages are short and imperative, matching the history ("Add voltorb solver").
- For "add a page" / "put this up": make the change, preview it, commit, push and deploy.
  If Ivon only says "deploy", deploy the working tree as it is, then offer to commit
  anything uncommitted.

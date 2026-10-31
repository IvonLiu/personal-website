# AGENTS.md

This repo is the source for ivonliu.com: a plain static site (HTML, CSS and JS, with no build
step) on Namecheap shared hosting, updated over FTP.

## Layout

- `public_html/` is the site. It mirrors the server's web root exactly. Everything in it
  goes live, and nothing outside it does.
  - `index.html`: the homepage (Materialize 0.97 from `css/` and `js/`, jQuery 2.1.1 from a
    CDN).
  - `css/`, `js/`, `font/`, `images/`: homepage assets.
  - `.htaccess`: redirects HTTP to HTTPS.
  - New standalone pages go in `misc/<name>/`, each with its own `index.html` and assets,
    unless Ivon says otherwise. Use relative links.
  - The old side projects that used to live in `misc/` and `secret/` were taken down
    because they no longer worked. They're still in git history; see the commit "Take down
    old misc and secret projects".
- Everything else at the top level stays in the repo only: this file, `CLAUDE.md`,
  `.claude/`, `.env` and so on.
- The server also holds `cgi-bin/` and `.ftpquota`. The host manages them, they aren't in
  the repo, and deploys leave them alone.

To preview locally, run `python3 -m http.server 8000 -d public_html` (it ignores
`.htaccess`). The live site is `https://ivonliu.com`. Its Let's Encrypt certificate covers
`ivonliu.com` and `www.ivonliu.com`, and acme.sh issues and renews it from a cron job on the
server, outside the web root and outside this repo. cPanel's Force HTTPS Redirect is
disabled on this host, which is why the redirect lives in `.htaccess`.

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

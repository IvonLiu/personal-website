---
name: ftp-deploy
description: Make the ivonliu.com FTP server match the repo's public_html/ folder exactly (uploads plus deletions). Use when Ivon says "deploy", "deploy to FTP", "upload to FTP", "push it live" or "put it up", or asks whether the server is in sync.
---

# Deploy public_html/ to FTP

The goal: the server's web root ends up exactly like local `public_html/`. New and changed
files get uploaded, and files that are gone locally get deleted from the server. Keep it
quick: do a dry run, and if it looks reasonable, deploy without asking again.

## The command

Run it from the root of the checkout you're working in. Credentials are in the main
checkout's `.env`; never print them.

```bash
set -a && source /Users/ivon/Develop/personal-website/.env && set +a &&
LFTP_PASSWORD="$FTP_PASSWORD" lftp -c "
set ftp:ssl-force yes; set ftp:ssl-protect-data yes
open --env-password -u '$FTP_USER' ftp://$FTP_HOST
mirror --reverse --delete --dry-run --no-perms --parallel=8 \
  -X .DS_Store -X cgi-bin/ -X .ftpquota public_html '$FTP_REMOTE_DIR'"
```

`cgi-bin/` and `.ftpquota` are managed by the host and live only on the server, so they're
excluded to survive `--delete`.

If `lftp` is missing, install it with `brew install lftp`. If `.env` is missing or empty,
ask Ivon to fill it in from `.env.example`.

## 1. Dry run

Run the command with `--dry-run`. In lftp's dry-run notation, an upload looks like
`get -e -O ftp://<host>/<dir> file:<local path>`, and a deletion looks like
`rm -r ftp://<host>/<path>`.

It looks reasonable when:

- The uploads are the files you or Ivon changed. From a fresh checkout or a worktree, every
  file looks changed, because lftp compares sizes and timestamps; that's harmless.
- Each deletion is something removed in git. A quick
  `git log -1 --format='%h %s' -- "public_html/<path>" "<path>"` on each `rm` path is
  enough; don't list the server's contents recursively, because it's slow. (The second
  pathspec covers history from before the site moved into `public_html/`.)
- Nothing odd is going up. lftp uploads the folder, not git, so glance at
  `git status --short --ignored public_html` for untracked or gitignored files.

Stop and ask Ivon only when something doesn't fit: a deletion with no git history (probably
put on the server by hand), an uncommitted deletion, or uploads you can't explain. To keep
a server-only file, add an exclude so `--delete` skips it: `-X <name>` matches that name at
any depth, and `-x '<regex>'` matches the path.

## 2. Deploy

Run the same command without `--dry-run`. Then:

- Spot-check a changed page with `curl -sI https://ivonliu.com/<path>`.
- Tell Ivon in a line or two what went up and what came down.
- Uploading uncommitted edits and new files is fine. If `git status` isn't clean, say so
  and offer to commit and push to `master`.

## Is the server in sync?

Only when Ivon asks: the dry run compares sizes and timestamps, so for a real content check,
download the web root and diff it:

```bash
set -a && source /Users/ivon/Develop/personal-website/.env && set +a &&
DIR="$(mktemp -d)" && LFTP_PASSWORD="$FTP_PASSWORD" lftp -c "
set ftp:ssl-force yes; set ftp:ssl-protect-data yes
open --env-password -u '$FTP_USER' ftp://$FTP_HOST
mirror --parallel=8 '$FTP_REMOTE_DIR' '$DIR'" &&
diff -rq -x .DS_Store -x cgi-bin -x .ftpquota "$DIR" public_html; echo "$DIR"
```

Ivon sometimes edits the server by hand, so show them the differences and ask which side
is right before changing anything.

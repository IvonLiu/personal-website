---
name: ftp-deploy
description: Make the ivonliu.com FTP server match the repo's public_html/ folder exactly (uploads plus deletions). Use when Ivon says "deploy", "deploy to FTP", "upload to FTP", "push it live" or "put it up", or asks whether the server is in sync.
---

# Deploy public_html/ to FTP

The goal: the server's web root ends up exactly like local `public_html/`. New and changed
files get uploaded, and files that are gone locally get deleted from the server. Treat this
as a quick conversation with Ivon, not a script. Look at what's about to happen, describe it
in plain words, and ask when something looks off.

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

Run the command with `--dry-run` and summarize for Ivon what would be uploaded and what would
be deleted. In lftp's dry-run notation, an upload looks like
`get -e -O ftp://<host>/<dir> file:<local path>`, and a deletion looks like
`rm -r ftp://<host>/<path>`.

lftp compares file sizes and timestamps. From a fresh checkout or a worktree, every file
looks changed and gets re-uploaded (~40 MB). That's harmless, so just mention it rather
than listing every file.

Also glance at `git status --short --ignored public_html`. lftp uploads the folder, not git,
so untracked and gitignored files inside `public_html/` (`*.psd`, `secret/` and so on)
would go up too. Point out anything that doesn't look like it belongs on the site.

## 2. Check each deletion

Only delete a server file if a local commit deleted it. For a deletion candidate `<path>`
(relative to `public_html/`):

```bash
git log -1 --format='%h %ad %s' --date=short -- "public_html/<path>" "<path>"
git cat-file -e "HEAD:public_html/<path>" && echo "still in HEAD"
```

The second pathspec in `git log` covers history from before the site moved into
`public_html/`. Check a whole directory at once where that makes sense. Empty directories
can't exist in git, so deleting an empty server directory is fine.

- **Deleted in a commit** (`git log` finds it and it's not in HEAD): fine to delete.
- **Still in HEAD, missing locally**: an uncommitted deletion. Ask whether to commit it or
  `git restore` it.
- **Never in git**: someone put it on the server by hand, or the host manages it. Don't
  delete it. Ask Ivon whether to pull it into `public_html/` and commit it, keep it on the
  server, or delete it. To keep it, add an exclude so `--delete` skips it: `-X <name>`
  matches that name at any depth, and `-x '<regex>'` matches the path. If it's something
  that should always stay, add the exclude to the command in this file.

## 3. Upload

Run the command again without `--dry-run`, with any extra excludes you agreed on. Then:

- Spot-check a changed page with `curl -sI https://ivonliu.com/<path>`.
- Tell Ivon what went up and what came down.
- Uploading uncommitted edits and new files is fine. If `git status` isn't clean, say so
  and offer to commit and push to `master`.

## Is the server in sync?

The dry run only compares sizes and timestamps. For a real content check, download the web
root and diff it (~40 MB):

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

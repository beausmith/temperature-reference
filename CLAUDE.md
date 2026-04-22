# Claude Instructions

## Git Workflow

Merge completed work to `master` only. Do **not** push to `production` unless the user explicitly requests it.

```bash
git checkout master
git merge --ff-only <branch>
git push origin master
```

After merging to `master`, share the master branch preview URL so the user can verify the changes before promoting to production:

https://master--celsius-life.netlify.app/

### Promoting to production (only when explicitly requested)

```bash
git checkout production
git reset --hard origin/master
git push origin production
git checkout master
```

# Claude Instructions

## Git Workflow

Always merge completed work to `master` first, then update `production` to match `master`.

```bash
git checkout master
git merge --ff-only <branch>
git push origin master
git checkout production
git reset --hard origin/master
git push origin production
git checkout master
```

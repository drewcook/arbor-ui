
## Syncing this repository with `arbor-protocol/ui`

If you are wanting to contribute to the open soure repository but would rather create a fork, you will need to ensure that you are keeping your fork up to date with the latest changes so that pull requests are accurate to review and don't include changes that are already included into `main`. Due to this scenario, it is important that your repository is kept up to date with the active changes happening on the `arbor-protocol/ui` public repo. To get _your forked repo_ up to date with _those public changes_, follow these steps:

1. Add a local upstream remote if you haven't already, and point it to the `arbor-protcol/ui` repo. You'll only need to do this once, initially.

   `git remote add upstream https://github.com/arbor-protocol/ui.git`

2. Doublecheck your local remotes with `git remote -v`. This should yield the following:

   ```sh
   origin      https://github.com/your-account/your-fork.git (fetch)
   origin      https://github.com/your-account/your-fork.git (push)
   upstream    https://github.com/arbor-protocol/ui.git (fetch)
   upstream    https://github.com/arbor-protocol/ui.git (push)
   ```

3.) Download all remote commits to your local repositories by running `git fetch --all`

4. Checkout `main` and ensure there are no pending changes and that your working tree is clean. Doublecheck with `git status`. It should yield the following:

   ```txt
   git checkout main
   git status

   On branch main
   Your branch is up to date with 'origin/main'.
   nothing to commit, working tree clean
   ```

5. Pull the latest version of the upstream interface repo into the `main` branch by setting the `HEAD` to that of the upstream remote.

   `git reset --hard upstream/main`

6. Now that your local `main` branch mirrors the latest from `arbor-protocol/ui`, checkout the `chore/sync` branch (or create one if you don't have it already). This is so we can prep the changes into a new PR.

   `git checkout chore/sync`

7. Merge in your local `main` into this branch. If there are conflicts, fix them locally and `add` then to the merge commit.

   `git merge main`

8. You should now have a pending commit to push up. Push it up to your fork.

   `git push origin chore/sync`

9. Next, open up a new PR in your forked repository to merge `chore/sync` into `main`, or you can just do this locally if you prefer, which would likely be simpler. Manage any conflicts and complete the merge.

10. At this point! Your forked repository `main` branch should be up to date with the latest changes from `arbor-protocol/ui/main` branch. Lastly, ensure the `chore/sync` branch is not deleted so you can continue to use it in step 6 for future syncs without issue. Then get latest on your local `main` branch again, which should ideally pull one new commit but not have any changes since you already pulled them in step 5.

    `git checkout main && git pull`

# Contributing Guidelines 🛠️

## Step 1: Find an Issue

Browse the [open issues](../../issues) in the main repository and pick one to work on.  
You can also create a new issue if you've found a bug or have a feature request.

## Step 2: Fork the Repository 🍴

Click the **"Fork"** button on the top-right corner of the repository page to create a copy in your GitHub account.

## Step 3: Clone the Repository 🌿

Use HTTPS or SSH to clone the repository locally:

```bash
git clone https://github.com/your-username/your-fork.git
cd your-fork
```

## Step 4: Set Up the Environment

Checkout the development branch:

```bash
git checkout develop
```

Install dependencies:

```bash
npm ci
```

Create a new branch:

```bash
git checkout -b your-branch-name
```

> 💡 Use meaningful branch names like `fix/header-alignment` or `feature/add-auth`.

Set up your environment variables in a `.env` file.

## Step 5: Work on the Task 👨‍💻👩‍💻

Make the necessary changes to the codebase or documentation.

## Step 6: Test Your Changes

Ensure everything works correctly in your local environment before proceeding.

## Step 7: Commit Your Changes ✅

Stage and commit your changes:

```bash
git add .
git commit -m "feat: meaningful commit message"
```

> ✏️ Use [conventional commits](https://www.conventionalcommits.org/) when possible.

If you have multiple commits, squash them into one before opening a pull request.

## Step 8: Push to Your Fork 🌍

```bash
git push -u origin your-branch-name
```

## Step 9: Open a Pull Request ➡️

- Go to your fork on GitHub and click **"New Pull Request"**
- Target the `develop` branch of the main repository
- Double-check the changes and submit the PR

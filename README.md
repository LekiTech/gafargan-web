## Contributing Guide

Thank you for your interest in contributing to our project! To maintain an organized workflow, please follow the steps below when submitting your code.

### How to Submit Code

1. Fork the Repository (if you haven't already)

   Click the Fork button at the top-right corner of the repository page to create a copy under your GitHub account.

2. Clone Your Fork

   Clone the repository to your local machine:

   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

3. Set Upstream to Original Repository

   This allows you to keep your fork up-to-date with the original repository.

   ```bash
   git remote add upstream https://github.com/LekiTech/gafargan-web.git
   ```

4. Create a New Branch from develop

   First, ensure you have the latest develop branch:

   ```bash
   git checkout develop
   git pull upstream develop
   ```

   Then, create a new branch for your work:

   ```bash
   # For a new feature
   git checkout -b feature/your-feature-name

   # For a bug fix
   git checkout -b bugfix/your-bugfix-name
   ```

5. Work on Your Branch

   Make your code changes on your new branch.

6. Regularly Merge Updates from develop

   Keep your branch updated to avoid merge conflicts:

   ```bash
   git checkout develop
   git pull upstream develop
   git checkout feature/your-feature-name
   git merge develop
   ```

   Resolve any conflicts if they arise.

7. Commit and Push Your Changes

   ```bash
   git add .
   git commit -m "Brief description of your changes"
   git push origin feature/your-feature-name
   ```

8. Open a Pull Request

   - Navigate to your fork on GitHub.
   - Click on Compare & pull request.
   - Ensure the base fork is the original repository and the base branch is develop.
   - Provide a clear and descriptive title and description for your pull request.

9. Add admin as a Reviewer

   In the pull request, add admin to the Reviewers section to notify them of your submission.

10. Additional Guidelines
    - Ensure your code follows the project's coding standards.
    - Write clear and descriptive commit messages.
    - Update or add documentation as necessary.
    - Test your changes.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

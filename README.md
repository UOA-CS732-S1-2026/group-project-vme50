# CS732 project - Team Vme50
check
Welcome to the CS732 project. We look forward to seeing the amazing things you create this semester! This is your team's repository.

Your team members are:
- Madhuja Chenthilraj _(mche257@aucklanduni.ac.nz)_
- Xiaoping Liu _(xilu128@aucklanduni.ac.nz)_
- Zhaofei Xu _(zxu783@aucklanduni.ac.nz)_
- Haowei Zheng _(hzhe889@aucklanduni.ac.nz)_
- Chenggong Ma _(cma736@aucklanduni.ac.nz)_
- Reign Naig _(enai775@aucklanduni.ac.nz)_

You have complete control over how you run this repo. All your members will have admin access. The only thing setup by default is branch protections on `main`, requiring a PR with at least one code reviewer to modify `main` rather than direct pushes.

Please use good version control practices, such as feature branching, both to make it easier for markers to see your group's history and to lower the chances of you tripping over each other during development

![](./Vme50.png)

# ⚙️ CI/CD Guide

We use GitHub Actions to automatically run checks on every push and pull request to the main branch.

These checks ensure code quality, consistency, and stability across the project.

🚨 What CI runs when you push code, CI runs the equivalent of this in the **project root**:

```bash
npm run ci
```

This typically includes:  
    • Running tests  
    • Checking for lint errors  
    • Checking for formatting issues  
  
Your CI will fail if:  
    • Any test fails  
    • There are linting errors or warnings  
    • Code formatting does not match project rules  
  
If CI fails, your push or merge will be blocked until all issues are fixed.  

🚀 Local Terminal Command (IMPORTANT)  
  
Run this in the **project root** before pushing (format + lint):  
  
```bash
npm run fix
```

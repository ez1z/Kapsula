# Contributing to Kapsula

Thank you for your interest in contributing to Kapsula! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and welcoming environment for everyone.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/kapsula.git
   cd kapsula
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-org/kapsula.git
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

Follow the [Getting Started](getting-started.md) guide to set up your local environment.

## Workflow

### 1. Pick an Issue

- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to let others know you're working on it
- If none exist, create one first to discuss your idea

### 2. Make Changes

- Write code following the existing conventions
- Keep changes focused and atomic
- Reference issue numbers in commits when applicable

### 3. Commit Messages

Use clear, descriptive commit messages:

```
feat: add customer appointment reminder
fix: resolve slot locking timeout issue
docs: update API documentation
refactor: extract booking validation logic
test: add tests for slot generation
```

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Link to the related issue
- Screenshots for UI changes

## Types of Contributions

### Bug Fixes

- Include a clear description of the bug
- Explain what caused it (if known)
- Provide steps to reproduce
- Add tests to prevent regression

### Features

- Discuss major features in an issue first
- Keep features focused and minimal
- Consider backwards compatibility
- Update documentation for new features

### Documentation

- Fix typos and clarify confusing sections
- Add examples where helpful
- Keep docs in sync with code changes

### Code Quality

- Follow existing code style
- Add comments only when necessary
- Refactor only when it improves clarity

## Technology Stack

When contributing, keep these technologies in mind:

### Frontend
- Vue.js 3 (Composition API)
- Vue Router 4
- Pinia for state
- Vue I18n for translations

### Backend
- Node.js with Fastify
- PostgreSQL for data
- Redis for caching/locks

## Testing

Before submitting, verify:

- [ ] Code runs without errors
- [ ] No console errors in browser
- [ ] API endpoints work as documented
- [ ] Database migrations run cleanly

## Pull Request Checklist

- [ ] Branch is up to date with main
- [ ] Code follows project conventions
- [ ] Commit messages are clear
- [ ] Documentation updated (if needed)
- [ ] Tests added/updated (if applicable)

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Be patient - maintainers will respond as soon as possible

## License

By contributing, you agree that your contributions will be licensed under the project's license.
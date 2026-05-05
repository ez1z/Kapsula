# Commit Message Convention

Kapsula uses [Conventional Commits](https://www.conventionalcommits.org/) for clear and consistent commit messages.

## Format

```
<type>: <short description>

[optional body]
```

## Types

| Type | Description |
|------|-------------|
| `feat` | New feature for the user |
| `fix` | Bug fix for the user |
| `docs` | Documentation only changes |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or correcting tests |
| `chore` | Maintenance tasks (dependencies, configs, etc.) |

## Rules

1. **Subject line**: Max 72 characters, no period at end
2. **Use imperative mood**: "add feature" not "added feature"
3. **Reference issues**: Include issue numbers in body if applicable
4. **Be specific**: Focus on the "why" not the "what"

## Examples

### feat
```
feat: add customer booking history view

Allow customers to view their past and upcoming bookings from the dashboard.
```

### fix
```
fix: prevent double-booking when slot lock expires

Add atomic booking transaction to prevent race conditions when multiple
customers attempt to book the same slot simultaneously.
```

### docs
```
docs: update API reference for booking endpoints

Clarify slot locking mechanism and booking status workflow.
```

### refactor
```
refactor: extract slot validation logic into service

Move slot availability checks from route handler to slot-locker service
for better testability.
```

### test
```
test: add unit tests for slot-locker service

Test lock acquisition, expiration, and release flows.
```

### chore
```
chore: update Redis connection timeout

Increase connection timeout to handle slow VM environments.
```

## Bad Examples

```
# Too vague
fix: bug fix

# Using past tense
feat: added new login page

# Too long
feat: added functionality to allow business owners to be able to view all of their customer's bookings in a nice UI

# Includes what instead of why
refactor: changed database queries to use prepared statements
```

## Good Examples

```
feat: add slot locking for booking flow
fix: resolve race condition in slot generation
docs: update API documentation for booking endpoints
refactor: extract slot validation logic into service
test: add unit tests for slot-locker service
chore: update Docker compose port mapping
```

## Combining Types

When a commit contains multiple types:
- Keep it simple, pick the dominant type
- Split into separate commits if truly mixed

## Squashing

When squashing multiple commits before merging:
- Use the final commit message for the squash
- Ensure it reflects the overall change
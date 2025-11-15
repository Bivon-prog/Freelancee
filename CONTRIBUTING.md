# Contributing to Orbix

Thank you for your interest in contributing to Orbix! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/marketplace.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Follow the setup instructions in [SETUP.md](SETUP.md)

## Development Workflow

### Before You Start

- Read [DEVELOPMENT.md](DEVELOPMENT.md) for development guidelines
- Check [FEATURES_CHECKLIST.md](FEATURES_CHECKLIST.md) to see what needs implementation
- Look at existing issues or create a new one to discuss your changes

### Making Changes

1. **Write Clean Code**
   - Follow TypeScript best practices
   - Use meaningful variable and function names
   - Add comments for complex logic
   - Keep functions small and focused

2. **Follow the Project Structure**
   - Frontend code goes in `frontend/src/`
   - Backend code goes in `backend/src/`
   - AI service code goes in `ai-service/`
   - Shared types go in `shared/types/`

3. **Test Your Changes**
   - Test locally before committing
   - Ensure all services start without errors
   - Check that your changes don't break existing functionality

### Commit Guidelines

Use clear, descriptive commit messages:

```
feat: Add invoice PDF generation
fix: Resolve authentication token expiry issue
docs: Update setup instructions
style: Format code with Prettier
refactor: Simplify time tracking logic
test: Add unit tests for invoice service
```

Commit message format:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no functional changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Pull Request Process

1. **Update Documentation**
   - Update relevant documentation if needed
   - Add comments to your code
   - Update FEATURES_CHECKLIST.md if you completed a feature

2. **Create Pull Request**
   - Push your branch: `git push origin feature/your-feature-name`
   - Go to GitHub and create a Pull Request
   - Fill in the PR template with details about your changes

3. **PR Description Should Include**
   - What changes you made
   - Why you made them
   - How to test the changes
   - Screenshots (if UI changes)
   - Related issue numbers

4. **Wait for Review**
   - Address any feedback from reviewers
   - Make requested changes
   - Keep the PR updated with main branch

## Code Style

### TypeScript/JavaScript

```typescript
// Use TypeScript types
interface User {
  id: string;
  email: string;
  name: string;
}

// Use async/await instead of promises
async function getUser(id: string): Promise<User> {
  const user = await api.get(`/users/${id}`);
  return user.data;
}

// Use meaningful names
const isUserAuthenticated = checkAuth(); // Good
const x = checkAuth(); // Bad
```

### React Components

```typescript
// Use functional components with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### Python (AI Service)

```python
# Follow PEP 8 style guide
# Use type hints
def generate_content(prompt: str, tone: str = "professional") -> str:
    """Generate content based on prompt and tone."""
    # Implementation
    return generated_content

# Use descriptive variable names
user_input = request.text  # Good
x = request.text  # Bad
```

## What to Contribute

### High Priority

- [ ] Authentication implementation
- [ ] Invoice CRUD operations
- [ ] PDF generation
- [ ] OpenAI integration
- [ ] Time tracking functionality

### Medium Priority

- [ ] Contract templates
- [ ] Resume builder features
- [ ] File upload handling
- [ ] Email notifications

### Always Welcome

- [ ] Bug fixes
- [ ] Documentation improvements
- [ ] Test coverage
- [ ] Performance optimizations
- [ ] UI/UX enhancements

## Reporting Bugs

When reporting bugs, include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: How to reproduce the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node version, browser, etc.
6. **Screenshots**: If applicable

## Feature Requests

When requesting features:

1. **Use Case**: Explain why this feature is needed
2. **Description**: Detailed description of the feature
3. **Mockups**: UI mockups if applicable
4. **Alternatives**: Any alternative solutions you've considered

## Questions?

- Check the [documentation files](START_HERE.md)
- Open an issue for discussion
- Review existing issues and PRs

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Orbix! 🚀

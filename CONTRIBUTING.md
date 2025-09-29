# Contributing to AviFlux

We welcome contributions to AviFlux! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+ with pip
- Git for version control
- Basic knowledge of React, TypeScript, and Python

### Development Setup

1. **Fork the repository**
   ```bash
   git fork https://github.com/Bhatia06/aviflux
   cd aviflux
   ```

2. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Set up the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python http_server.py
   ```

## 📝 Development Guidelines

### Code Style

**Frontend (TypeScript/React)**
- Use TypeScript for all new code
- Follow React functional components with hooks
- Use TailwindCSS for styling
- Maintain consistent component structure
- Include proper error handling and loading states

**Backend (Python)**
- Follow PEP 8 style guidelines
- Use type hints for function parameters and returns
- Include docstrings for all functions and classes
- Implement proper error handling with HTTP status codes

### Commit Messages
Use conventional commit format:
```
type(scope): description

feat(frontend): add live flight tracking component
fix(backend): resolve CORS issue for API endpoints  
docs(readme): update installation instructions
style(ui): improve dark mode styling consistency
```

### Branch Naming
- `feature/description` for new features
- `fix/description` for bug fixes
- `docs/description` for documentation updates
- `refactor/description` for code improvements

## 🐛 Bug Reports

When reporting bugs, please include:
- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to recreate the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, browser version, Node.js version
- **Screenshots**: If applicable

## ✨ Feature Requests

For feature requests, please provide:
- **Problem Statement**: What problem does this solve?
- **Proposed Solution**: How should it work?
- **Alternatives Considered**: Other approaches you've thought about
- **Aviation Context**: How does this help pilots/aviation professionals?

## 🔄 Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the code style guidelines
3. **Test thoroughly** - ensure all existing functionality works
4. **Update documentation** if needed
5. **Submit a pull request** with:
   - Clear title and description
   - Reference any related issues
   - Screenshots for UI changes
   - Testing instructions

### PR Review Criteria
- Code follows established patterns and style guidelines
- All tests pass and new functionality is tested
- Documentation is updated appropriately
- Changes don't break existing functionality
- Aviation-specific features are accurate and safe

## 🧪 Testing

### Frontend Testing
- Test components with different screen sizes
- Verify dark/light theme compatibility
- Test with various flight route inputs
- Ensure proper error handling for API failures

### Backend Testing
- Test all API endpoints with various inputs
- Verify CORS headers for frontend integration
- Test error scenarios and edge cases
- Validate weather data calculations

## 📚 Areas for Contribution

### High Priority
- **NOTAM Integration**: Add Notice to Airmen data
- **Enhanced Weather Models**: Improve ML prediction accuracy
- **Mobile Responsiveness**: Optimize for mobile devices
- **Performance Optimization**: Reduce bundle size and load times

### Medium Priority
- **Additional Airport Data**: Runway information, frequencies
- **Weather Radar Integration**: Live precipitation data
- **Flight Plan Export**: Generate standardized flight plans
- **User Preferences**: Save favorite routes and settings

### Documentation
- API documentation improvements
- Component documentation
- Aviation terminology explanations
- Deployment guides for different platforms

## 🛡️ Security

If you discover security vulnerabilities, please:
- **Do not** create a public issue
- Email security concerns to [security@aviflux.app]
- Include detailed information about the vulnerability
- Allow time for the issue to be resolved before disclosure

## 📄 Code of Conduct

### Our Standards
- **Be respectful** and inclusive of all contributors
- **Focus on aviation safety** - accuracy is paramount
- **Collaborate constructively** with helpful feedback
- **Respect different experience levels** in aviation and programming

### Unacceptable Behavior
- Harassment or discriminatory language
- Publishing others' private information
- Deliberately providing incorrect aviation information
- Any conduct inappropriate for a professional environment

## 🤝 Recognition

Contributors will be recognized in:
- Project README contributors section
- Release notes for significant contributions
- Special thanks for aviation subject matter expertise

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Documentation**: Check existing docs first
- **Code Review**: Don't hesitate to ask for feedback

Thank you for contributing to AviFlux and helping make aviation safer through better weather intelligence! ✈️
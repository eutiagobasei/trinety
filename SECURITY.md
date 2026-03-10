# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within Trinety, please send an email to security@trinety.com. All security vulnerabilities will be promptly addressed.

Please do not open a public issue for security vulnerabilities.

### What to include in your report

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggestions for fixing

### Response Timeline

- **Initial Response**: Within 24 hours
- **Assessment**: Within 72 hours
- **Fix Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: Next release cycle

## Security Measures

### Authentication

- JWT-based authentication with short-lived access tokens (15 minutes)
- Refresh tokens with longer validity (7 days)
- Tokens stored in httpOnly cookies (not localStorage)
- Password hashing using bcrypt with cost factor 12
- Password strength requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### Rate Limiting

- Global rate limiting: 100 requests per minute
- Authentication endpoints: 5-10 requests per 15 minutes
- Prevents brute force attacks

### Security Headers

- Content Security Policy (CSP)
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (in production)

### Data Protection

- All sensitive data encrypted in transit (HTTPS)
- Database credentials not stored in code
- Environment variables for all secrets
- No secrets committed to version control

### Input Validation

- All user input validated on both frontend and backend
- SQL injection prevention via parameterized queries (TypeORM)
- XSS prevention via input sanitization

## Best Practices for Contributors

1. **Never commit secrets** - Use environment variables
2. **Keep dependencies updated** - Run `npm audit` regularly
3. **Validate all input** - Never trust user input
4. **Use parameterized queries** - Prevent SQL injection
5. **Implement proper error handling** - Don't leak sensitive information
6. **Follow the principle of least privilege** - Minimal permissions

## Security Checklist for Releases

- [ ] All dependencies audited (`npm audit`)
- [ ] No secrets in code or config files
- [ ] All new endpoints have proper authentication
- [ ] Rate limiting configured appropriately
- [ ] Input validation on all new endpoints
- [ ] Error messages don't leak sensitive data
- [ ] CORS configured correctly
- [ ] Security headers properly set

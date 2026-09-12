---
name: Enterprise Review
description: Use for any enterprise code review. Checks auditability, PII risk, security risk, missing tests, and unclear ownership. Works across all projects.
---
 
# Enterprise Review Skill
 
Review the current change or requested design using this checklist:
 
1. Security: secrets, credentials, unsafe shell commands, or public exposure.
2. PII: customer names, emails, phone numbers, account IDs, or payment identifiers.
3. Reliability: missing error handling, no retry, no timeout, ambiguous failure mode.
4. Auditability: unclear decision trail, no change ticket, missing owner, missing log.
5. Tests: no unit test, no boundary test, no negative test.
 
Current git status:
!`git status --short`
 
Current diff summary:
!`git diff --stat`
 
Return:
- Risk summary
- Must-fix items
- Should-fix items
- Suggested test additions

Live URL:

Project Name: DevPulse Backend Server

Project Overview:
DevPulse is a backend REST API system designed for tracking bugs and feature requests inside a software development team. It allows contributors to report issues and maintainers to manage, update, and resolve them efficiently.

Project Features:
User authentication (Signup & Login)
JWT-based authorization
Role-based access control (Contributor & Maintainer)
Create bug reports and feature requests
View all issues with filtering & sorting
Get single issue details
Update issue (role-based rules applied)
Delete issue (maintainer only)
Secure password hashing using bcrypt
Clean and structured API responses

Project Tech:
Node.js – Backend runtime
TypeScript – Type safety
Express.js – REST API framework
PostgreSQL – NeonDB Database
bcrypt – Password security
jsonwebtoken – Token system

Setup Steps:

API endpoint list:
POST /api/auth/signup
POST /api/auth/login
POST /api/issues
GET /api/issues?sort=newest&type=bug&status=open
GET /api/issues/:id
PATCH /api/issues/:id
DELETE /api/issues/:id

Database schema summary:
Users:=>[(id, name, email, password, role (contributor | maintainer), created_at, updated_at)]
Issues:=> [(it, title, description, type (bug | feature_request), status (open | in_progress | resolved), reporter_id, created_at, updated_at)]

Keep it clear and professional:

# ITI JS Project

## Demo

A live demo of the deployed application will be linked here once you provide the deployment URL.

Deployment link: <ADD_DEPLOYMENT_LINK_HERE>

## Overview

ITI JS Project is a web-based exam platform built with a clear Model–View–Controller (MVC) approach. The project focuses on clean separation of concerns, simple service-based features, and collaborative development.

This repository contains the frontend views (HTML/CSS/JS) and client-side services that demonstrate the project's architecture and main features.

## Architecture (MVC)

- Models: client-side data structures and models live under `src/` and are used to represent users, exams, and results.
- Views: static HTML files under the repository root provide the user interface (examples: `index.html`, `login.html`, `register.html`, `student-profile.html`, `teacher-dashboard.html`, `exam-taking.html`, `exam-result.html`, `analytics.html`).
- Controllers / Services: JavaScript files in `src/` implement application logic such as authentication, exam handling, and theme service.

This separation helps maintain a modular, testable, and scalable codebase.

## Features

- User registration and login
- Authentication and theme services
- Student profile and exam-taking flow
- Exam results and reporting
- Teacher dashboard and analytics
- AI-generated UI and animations

## Repository Structure (high level)

- `index.html` — Landing / dashboard entry
- `login.html` — Login view
- `register.html` — Registration view
- `student-profile.html` — Student profile view
- `teacher-dashboard.html` — Teacher dashboard and management
- `exam-taking.html` — Exam interface for students
- `exam-result.html` — Exam result view
- `analytics.html` — Analytics and reporting
- `src/` — JavaScript source code (models, services, controllers)
- `styles/` — CSS styles and animation rules
- `images/`, `audio/` — Media assets used by the UI

## Getting Started (run locally)

1. Clone the repository:

   git clone https://github.com/samer12332/ITI-JS-Project.git

2. Open `index.html` in your browser for a quick preview, or serve the project with a static file server for correct relative routing. Examples:

   - Using Python 3 built-in server:
     python3 -m http.server 8000
     Then open http://localhost:8000

   - Using a Node static server (if you have npm):
     npm install -g serve
     serve .

Note: If the project requires a backend for full functionality (authentication/exam persistence), run or configure the backend as appropriate. This repository contains the client-side/frontend pieces.

## Initial Users

- student1 / password: password123
- teacher1 / password: password123

## UI & Animations

UI and animations were generated with AI-assisted design and refined manually. Animations use CSS keyframes and transitions to improve user experience where appropriate.

## Team Contributions

Team Member 1:
- Registration, Login, Authentication Service, Theme Service, Student Profile, Exam Taking, Exam Results

Team Member 2:
- Exam Service, Teacher Dashboard, Analytics & Reporting

All models and service contracts were agreed upon jointly to ensure consistency across the app.

## Contact

- sameryousry99@gmail.com
- eng.ali.essam@gmail.com

## Contributing

Contributions are welcome. Please open issues or submit PRs with clear descriptions of changes.

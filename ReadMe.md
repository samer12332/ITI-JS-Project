# ITI JS Project

## Demo
A live demo of the deployed application will be linked here once you provide the deployment URL.

Deployment link: https://effulgent-tulumba-57a4fe.netlify.app/



---

## Overview
ITI JS Project is a web-based exam platform built with a clear Model–View–Controller (MVC) approach. The repository holds the frontend (HTML/CSS/JS), client-side services, and assets used to demonstrate user flows such as registration, exam taking, result reporting, and basic analytics.

Focus:
- Clear separation of concerns (MVC)
- Modular client-side services
- Rapid prototyping and easy local preview

---

## Architecture (MVC)
- Models
  - Client-side models and data-handling logic are located in `src/`. These represent users, exams, questions, answers, and results.
- Views
  - Static HTML pages in the repository root act as the Views. Main pages:
    - `index.html` — Landing / dashboard
    - `login.html` — Login form
    - `register.html` — Registration form
    - `student-profile.html` — Student profile UI
    - `teacher-dashboard.html` — Instructor dashboard
    - `exam-taking.html` — Exam interface for students
    - `exam-result.html` — Exam results view
    - `analytics.html` — Analytics and reporting
- Controllers / Services
  - JavaScript modules under `src/` implement application logic: authentication flows, theme service, exam lifecycle, result calculation, and interactions with any (future) backend.

This MVC organization keeps views, data structures, and behavior separated so each area can be extended or replaced with minimal impact on others.

---

## Key Features
- User registration and login (client-side / demo flows)
- Theme service and UI preferences
- Student profile and exam-taking workflow
- Exam scoring and result presentation
- Teacher dashboard and basic analytics/reporting
- AI-assisted UI design and CSS animations

---

## Repository Structure (high level)
- `index.html`
- `login.html`
- `register.html`
- `student-profile.html`
- `teacher-dashboard.html`
- `exam-taking.html`
- `exam-result.html`
- `analytics.html`
- `src/` — JavaScript source (models, services, controllers)
- `styles/` — CSS styles and animations
- `images/`, `Hierrachy 1.jpeg`, `Hierrachy 2.jpeg` — design diagrams and assets
- `audio/` — optional audio assets
- `package-lock.json` — npm lockfile (if any packages used)

---

## Getting Started (Local Preview)
Quick preview (no server required):
1. Clone the repo:
   git clone https://github.com/samer12332/ITI-JS-Project.git
2. Open `index.html` in your browser.


Notes:
- The current repo primarily contains client-side code. For persistent users, secure authentication, and saved exams you will need to attach or implement a backend API. If/when a backend is added, include setup and endpoint details here.

---

## Initial Users (demo/testing)
- Username: `student1` — Password: `password123`  
- Username: `teacher1` — Password: `password123`  

(These are example/demo credentials — do not use them in production.)

---

## UI & Animations
- UI was AI-assisted and refined manually.
- Animations use CSS keyframes and transitions for smoother UX.
- Styles and animation rules are stored in `styles/`.

---

## Contributing
Contributions are welcome:
1. Open an issue describing the change or feature.
2. Fork the repository and create a branch for your change.
3. Submit a pull request with a clear description and any setup steps.

Keep changes modular (separate services/controllers from views).

---

## Contact
- sameryousry99@gmail.com  
- eng.ali.essam@gmail.com


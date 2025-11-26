# Rural Education Empowerment System (REES)

**Author:** Heroine Mutumwinka
**University:** African Leadership University
**Date:** November 2025

---

## Project Overview

The **Rural Education Empowerment System (REES)** is a web-based platform designed to provide accessible educational resources, training modules, and skill-building programs for students, teachers, and administrators in rural Rwanda. It aims to reduce educational inequality by enabling learning at a distance and supporting teachers with effective content delivery tools.

### Key Features

* User authentication (Students, Teachers, Admins)
* Course management (upload, edit, delete lessons)
* Student progress tracking
* Assignment submission and grading
* Notifications for updates and assignments
* Reports for performance and activity

---

## Repository Structure

```
h-mutumwinka/
│
├── backend/           for Django backend code (models, views, urls)
├── frontend/          for Frontend code (HTML, CSS, JS)
├── education/         for Education-related modules or apps
├── db.sqlite3         for SQLite database (development)
├── manage.py          for Django management script
├── README.md          for Project documentation
```

---

## Prerequisites

* Python 3.8+
* Django 4.x
* SQLite3 (default for development)
* Git

---

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/your-username/h-mutumwinka.git
cd h-mutumwinka
```

2. **Create and activate a virtual environment**

```bash
python -m venv venv
source venv/bin/activate       # Linux/Mac
venv\Scripts\activate          # Windows
```

3. **Install dependencies**

```bash
pip install -r backend/requirements.txt
```

*(Ensure a `requirements.txt` exists in `backend/`)*

4. **Apply migrations**

```bash
python manage.py migrate
```

5. **Create a superuser (admin account)**

```bash
python manage.py createsuperuser
```

6. **Run the development server**

```bash
python manage.py runserver
```

7. **Access the application**

Open your browser and navigate to:
http://127.0.0.1:8000/

## Usage

* **Students:** Sign up, login, access courses, submit assignments.
* **Teachers:** Upload lessons, manage courses, grade assignments.
* **Admin:** Manage users, approve content, view reports.

## Deployment

* The app can be deployed to Heroku,PythonAnywhere, or any cloud service that supports Django.
* Ensure environment variables are set for `SECRET_KEY` and database if using production DB.
* Use `DEBUG=False` in production.

## Contributing

* Fork the repository
* Create a new branch (`git checkout -b feature-branch`)
* Make your changes and commit (`git commit -m "Description"`)
* Push to your branch (`git push origin feature-branch`)
* Open a Pull Request
## License

This project is for academic purposes and may not be used commercially without permission.

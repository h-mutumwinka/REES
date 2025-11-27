# REES

REES (Resourceful Educational Engagement System) is a comprehensive educational management system that provides a platform for students, teachers, and administrators to manage courses, enrollments, learning materials, and assessments.

## Features

### For Students

- **Course Discovery**: Browse and enroll in available courses
- **Question & Answer System**: Answer course questions (multiple choice, short answer, essay)
- **Progress Tracking**: View enrolled courses and track learning progress
- **Dashboard**: Access personalized student dashboard with enrolled courses

### For Teachers

- **Course Management**: Create and manage courses with subjects and grade levels
- **Question Creation**: Create questions with multiple types:
  - Multiple choice questions with options
  - Short answer questions
  - Essay questions
- **Course Deletion**: Delete courses and all associated data
- **Student Management**: View course enrollments and student progress

### For Administrators

- **User Management**: View all system users (students, teachers, admins)
- **Statistics Dashboard**: Monitor system-wide statistics:
  - Total users, students, teachers
  - Total courses
- **System Overview**: Comprehensive view of the entire educational platform

## Tech Stack

- **Framework**: Next.js 16.0.3 (React 19.2.0)
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3)
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI, shadcn/ui
- **Authentication**: Custom authentication with password hashing
- **Deployment**: Netlify compatible

## Project Structure

```
REES/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── student/      # Student endpoints
│   │   ├── teacher/      # Teacher endpoints
│   │   └── admin/        # Admin endpoints
│   ├── student/          # Student pages
│   ├── teacher/          # Teacher pages
│   └── admin/           # Admin pages
├── components/           # React components
│   ├── auth/           # Authentication forms
│   └── ui/             # UI components
├── lib/                 # Utility libraries
│   ├── db.ts           # Database connection
│   ├── auth.ts         # Authentication utilities
│   └── utils.ts        # General utilities
├── scripts/            # Utility scripts
│   └── init-admin.ts   # Admin initialization
└── public/             # Static assets
```

## Database Schema

The system uses SQLite with the following main tables:

- **users**: Student, teacher, and admin accounts
- **courses**: Course information
- **questions**: Course questions and assessments
- **question_answers**: Student answers to questions
- **enrollments**: Student course enrollments
- **course_materials**: Learning materials
- **progress**: Student progress tracking
- **submissions**: Assignment submissions

## Getting Started

**git clone:** `https://github.com/h-mutumwinka/REES`

**Installation:** `cd REES`

**Install dependencies:** `npm install`

**Start the development server:** `npm run dev`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run init-admin` - Initialize admin user

## Usage

### Initial Setup

1. Clone the repository
2. Install dependencies
3. Run the development server
4. Create an admin account using `npm run init-admin` (if needed)
5. Access the application at `http://localhost:3000`

### User Roles

- **Student**: Sign up as a student to browse and enroll in courses, answer questions
- **Teacher**: Sign up as a teacher to create courses and manage questions
- **Admin**: Sign up as an admin to view system statistics and manage users

### Creating a Course (Teacher)

1. Log in as a teacher
2. Navigate to "Create Course" tab
3. Fill in course details (title, subject, grade level, description)
4. Click "Create Course"
5. Click "Manage Course" to add questions

### Enrolling in a Course (Student)

1. Log in as a student
2. Go to "Available Courses" tab
3. Browse available courses
4. Click "Enroll Now" on desired course
5. Access course questions from "My Courses" tab

## Deployment

The project is configured for Netlify deployment with:

- `netlify.toml` configuration file
- Next.js plugin support
- Serverless function compatibility

**Note**: For production deployment, consider migrating from SQLite to a cloud database (Supabase, PlanetScale, Turso) as SQLite has limitations in serverless environments.

## Development Notes

- Database file (`rees.db`) is created automatically on first run
- Passwords are hashed using SHA-256 (consider upgrading to bcrypt for production)
- The system uses localStorage for session management
- All API routes are protected with role-based access control

## License

This project is private and proprietary.

## Contributing

This is a private project. For issues or suggestions, please contact the repository owner.

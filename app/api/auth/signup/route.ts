import { type NextRequest, NextResponse } from "next/server"
import Database from "better-sqlite3"
import crypto from "crypto"
import path from "path"

let db: Database.Database

function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), "rees.db")
    db = new Database(dbPath)
    // Initialize schema
    const schema = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'admin')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        subject TEXT NOT NULL,
        grade_level TEXT NOT NULL,
        teacher_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS course_materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        material_type TEXT NOT NULL CHECK(material_type IN ('lesson', 'video', 'assignment', 'resource')),
        file_url TEXT,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id)
      );
      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id),
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      );
      CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        material_id INTEGER NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, material_id),
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (material_id) REFERENCES course_materials(id)
      );
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        material_id INTEGER NOT NULL,
        submission_text TEXT,
        submission_file_url TEXT,
        grade INTEGER,
        feedback TEXT,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        graded_at DATETIME,
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (material_id) REFERENCES course_materials(id)
      );
    `
    db.exec(schema)
  }
  return db
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const database = getDb()

    // Check if email already exists
    const existingUser = database.prepare("SELECT id FROM users WHERE email = ?").get(email)
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Create new user
    const insert = database.prepare(`
      INSERT INTO users (name, email, password, phone, role)
      VALUES (?, ?, ?, ?, ?)
    `)

    const result = insert.run(name, email, hashPassword(password), phone || null, role)

    return NextResponse.json({
      userId: result.lastInsertRowid,
      role,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

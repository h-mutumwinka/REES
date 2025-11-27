import Database from "better-sqlite3"
import path from "path"
import { existsSync, mkdirSync } from "fs"

let db: Database.Database | null = null

/**
 * Get the database path based on the environment
 * On Netlify, use /tmp directory (writable)
 * Otherwise, use project root
 */
function getDbPath(): string {
  // Check if we're on Netlify (serverless environment)
  const isNetlify = process.env.NETLIFY === "true" || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL
  
  if (isNetlify) {
    // On Netlify/serverless, use /tmp directory (writable)
    const tmpPath = "/tmp/rees.db"
    return tmpPath
  }
  
  // Local development - use project root
  return path.join(process.cwd(), "rees.db")
}

/**
 * Initialize database schema
 */
function initializeSchema(database: Database.Database) {
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
  database.exec(schema)
}

/**
 * Get database instance (singleton)
 * Handles Netlify/serverless environment properly
 */
export function getDb(): Database.Database {
  if (!db) {
    try {
      // Check if better-sqlite3 is available
      let Database: typeof import("better-sqlite3").default
      try {
        Database = require("better-sqlite3")
      } catch (requireError) {
        console.error("Failed to require better-sqlite3:", requireError)
        throw new Error(
          `better-sqlite3 module not available. This may be due to native module compilation issues on Netlify. ` +
          `Error: ${requireError instanceof Error ? requireError.message : String(requireError)}`
        )
      }

      const dbPath = getDbPath()
      console.log(`Attempting to initialize database at: ${dbPath}`)
      console.log(`Environment: NETLIFY=${process.env.NETLIFY}, NODE_ENV=${process.env.NODE_ENV}`)
      
      // Ensure directory exists (for /tmp on Netlify)
      const dbDir = path.dirname(dbPath)
      if (!existsSync(dbDir)) {
        console.log(`Creating directory: ${dbDir}`)
        mkdirSync(dbDir, { recursive: true })
      }
      
      console.log(`Creating database connection...`)
      db = new Database(dbPath)
      console.log(`Database connection created successfully`)
      
      // Initialize schema
      console.log(`Initializing schema...`)
      initializeSchema(db)
      console.log(`Schema initialized`)
      
      // Enable foreign keys
      db.pragma("foreign_keys = ON")
      
      console.log(`Database initialized successfully at: ${dbPath}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      console.error("Database initialization error:", {
        message: errorMessage,
        stack: errorStack,
        error: error,
      })
      throw new Error(
        `Failed to initialize database: ${errorMessage}. ` +
        `This is likely because better-sqlite3 (a native module) cannot run on Netlify serverless functions. ` +
        `Consider using a cloud database like Supabase, PlanetScale, or Turso instead.`
      )
    }
  }
  return db
}

/**
 * Close database connection (useful for cleanup)
 */
export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}


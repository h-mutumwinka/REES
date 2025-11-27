import Database from "better-sqlite3"
import crypto from "crypto"
import path from "path"

const dbPath = path.join(process.cwd(), "rees.db")
const db = new Database(dbPath)

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

// Initialize schema if needed
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
`
db.exec(schema)

// Admin credentials
const adminEmail = "Hero@gmail.com"
const adminPassword = "admin1"
const adminName = "Admin User"

// Check if admin already exists
const existingAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail) as any

if (existingAdmin) {
  console.log(`Admin user with email ${adminEmail} already exists.`)
  console.log("Updating password...")
  
  const update = db.prepare("UPDATE users SET password = ?, role = 'admin' WHERE email = ?")
  update.run(hashPassword(adminPassword), adminEmail)
  console.log("Admin password updated successfully!")
} else {
  console.log("Creating admin user...")
  
  const insert = db.prepare(`
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
  `)
  
  insert.run(adminName, adminEmail, hashPassword(adminPassword), "admin")
  console.log("Admin user created successfully!")
}

console.log("\nAdmin Credentials:")
console.log(`Email: ${adminEmail}`)
console.log(`Password: ${adminPassword}`)
console.log(`Role: admin`)

db.close()


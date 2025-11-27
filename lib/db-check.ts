/**
 * Diagnostic utility to check if better-sqlite3 is available
 * This helps identify if the native module is the issue
 */
export function checkDatabaseAvailability(): {
  available: boolean
  error?: string
  details?: any
} {
  try {
    // Try to require better-sqlite3
    const Database = require("better-sqlite3")
    
    // Try to create a test database in memory
    const testDb = new Database(":memory:")
    testDb.close()
    
    return { available: true }
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : String(error),
      details: {
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      },
    }
  }
}


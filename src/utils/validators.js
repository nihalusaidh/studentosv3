export function isValidUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username)
}

export function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

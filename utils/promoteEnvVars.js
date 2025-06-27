export function promoteEnvVars(prefixes = []) {
  for (const [key, value] of Object.entries(process.env)) {
    if (prefixes.some((p) => key.startsWith(p))) {
      globalThis[key] = value
    }
  }
}

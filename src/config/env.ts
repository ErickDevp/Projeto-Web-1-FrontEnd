const toBool = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value == null) return defaultValue
  return value.toLowerCase() === 'true'
}

const toNumber = (value: string | undefined, defaultValue: number): number => {
  if (value == null) return defaultValue
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : defaultValue
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  apiWithCredentials: toBool(import.meta.env.VITE_API_WITH_CREDENTIALS, false),
  apiTimeoutMs: toNumber(import.meta.env.VITE_API_TIMEOUT_MS, 15000),
}

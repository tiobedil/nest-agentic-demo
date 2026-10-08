export type UnifiedFlow = "extension" | "inspection"

export function detectUnifiedFlow(prompt: string): UnifiedFlow | null {
  const match = /extension|inspection/i.exec(prompt)
  return match ? match[0].toLowerCase() as UnifiedFlow : null
}

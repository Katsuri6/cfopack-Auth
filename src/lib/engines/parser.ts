type RawRow = Record<string, string | number | null>

export function parseCSV(text: string): RawRow[] {
  const lines = text.trim().split("\n").filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(/[,\t]/).map(h => h.trim().replace(/^"|"$/g, "").replace(/\r/, ""))
  return lines.slice(1).map(line => {
    const vals = line.split(/[,\t]/).map(v => v.trim().replace(/^"|"$/g, "").replace(/\r/, "").replace(/[$,]/g, ""))
    const row: RawRow = {}
    headers.forEach((h, i) => {
      const v = vals[i] || ""
      row[h] = v === "" ? null : isNaN(Number(v)) ? v : Number(v)
    })
    return row
  }).filter(r => Object.values(r).some(v => v !== null && v !== ""))
}

export async function readFileAsText(file: File): Promise<RawRow[]> {
  const text = await file.text()
  return parseCSV(text)
}

export function detectType(rows: RawRow[]): "fpa" | "financial" {
  if (!rows.length) return "financial"
  const keys = Object.keys(rows[0]).map(k => k.toLowerCase())
  if (keys.some(k => k.includes("budget")) && keys.some(k => k.includes("actual"))) return "fpa"
  return "financial"
}

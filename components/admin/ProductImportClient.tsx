"use client"

import { useState, useCallback } from "react"
import { Upload, Download, CheckCircle, AlertCircle, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"

const TEMPLATE_CSV = `name,category,type,price_5day,price_10day,price_season,description
Mens Ski Package,Packages,package,135,160,550,
Womens Ski Package,Packages,package,135,160,550,
Kids Ski Package,Packages,package,70,85,300,
Mens Snowboard Package,Packages,package,130,160,550,
Womens Snowboard Package,Packages,package,130,160,550,
Kids Snowboard Package,Packages,package,75,90,275,
Mens Outerwear Package,Packages,package,80,95,300,
Womens Outerwear Package,Packages,package,80,95,300,
Kids Outerwear Package,Packages,package,45,60,200,
Adult Skis,Skis,item,50,80,250,
Kids Skis,Skis,item,40,65,200,
Mens Snowboards,Snowboards,item,55,85,250,
Womens Snowboards,Snowboards,item,55,85,250,
Kids Snowboards,Snowboards,item,45,70,220,
Mens Ski Boots,Boots,item,30,45,150,
Womens Ski Boots,Boots,item,30,45,150,
Kids Ski Boots,Boots,item,25,40,120,
Mens Snowboard Boots,Boots,item,30,45,150,
Womens Snowboard Boots,Boots,item,30,45,150,
Kids Snowboard Boots,Boots,item,25,40,120,
Mens Jacket,Outerwear,item,35,50,150,
Womens Jackets,Outerwear,item,35,50,150,
Kids Jackets,Outerwear,item,25,40,120,
Mens Pants,Outerwear,item,35,50,150,
Womens Pants,Outerwear,item,35,50,150,
Kids Pants,Outerwear,item,25,40,120,
Kids 1 Piece,Outerwear,item,45,65,200,
Ski Poles,Accessories,item,10,15,40,
Helmet,Accessories,item,15,25,80,
Snowboard Bindings,Accessories,item,20,30,100,
Luggage Bag,Accessories,item,10,15,50,`

type ParsedRow = Record<string, string>
type ImportResult = { row: number; name: string; status: string; message?: string }

function parseCSV(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = text.trim().split("\n").filter((l) => l.trim())
  if (lines.length < 2) return { headers: [], rows: [] }
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"))
  const rows = lines.slice(1).map((line) => {
    const vals = line.split(",")
    const row: ParsedRow = {}
    headers.forEach((h, i) => { row[h] = (vals[i] ?? "").trim() })
    return row
  }).filter((r) => Object.values(r).some((v) => v !== ""))
  return { headers, rows }
}

export default function ProductImportClient() {
  const [csv, setCsv] = useState("")
  const [mode, setMode] = useState<"merge" | "replace">("merge")
  const [preview, setPreview] = useState<ParsedRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [step, setStep] = useState<"input" | "preview" | "done">("input")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])
  const [counts, setCounts] = useState<{ created: number; updated: number; errors: number } | null>(null)
  const [showAll, setShowAll] = useState(false)

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "products_template.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  function handleParse() {
    const { headers, rows } = parseCSV(csv)
    if (rows.length === 0) return alert("No rows found. Check your CSV format.")
    setHeaders(headers)
    setPreview(rows)
    setStep("preview")
  }

  async function handleImport() {
    setLoading(true)
    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: preview, mode }),
      })
      const data = await res.json()
      setResults(data.results ?? [])
      setCounts(data.counts ?? null)
      setStep("done")
    } catch {
      alert("Network error — import failed")
    } finally {
      setLoading(false)
    }
  }

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCsv(String(ev.target?.result ?? ""))
    reader.readAsText(file)
  }, [])

  function reset() { setCsv(""); setPreview([]); setHeaders([]); setResults([]); setCounts(null); setStep("input") }

  const REQUIRED_COLS = ["name", "category", "type", "price_5day", "price_10day"]
  const missingCols = REQUIRED_COLS.filter((c) => !headers.includes(c))

  return (
    <div className="space-y-5">
      {/* Step: input */}
      {step === "input" && (
        <>
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">CSV Format</p>
                <p className="text-xs text-[#B4B4B4] mt-0.5">Required columns: name, category, type (package/item), price_5day, price_10day · Optional: price_season, description</p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-3 py-2 bg-[#121212] border border-[#2e2e2e] text-[#B4B4B4] hover:text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download Template
              </button>
            </div>

            {/* File upload */}
            <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-[#333] rounded-xl cursor-pointer hover:border-[#C4A04A]/50 transition-colors">
              <Upload className="h-4 w-4 text-[#B4B4B4]" />
              <span className="text-sm text-[#B4B4B4]">Upload .csv file</span>
              <input type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
            </label>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#2e2e2e]" />
              <span className="text-xs text-[#555]">or paste CSV below</span>
              <div className="flex-1 h-px bg-[#2e2e2e]" />
            </div>

            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              placeholder={"name,category,type,price_5day,price_10day\nMens Ski Package,Packages,package,135,160\nAdult Skis,Skis,item,50,80"}
              className="w-full h-48 px-4 py-3 bg-[#121212] border border-[#333] rounded-xl text-xs font-mono text-[#E6E6E6] placeholder-[#444] focus:outline-none focus:border-[#C4A04A] resize-y"
            />
          </div>

          {/* Import mode */}
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-5">
            <p className="text-sm font-semibold text-white mb-3">Import Mode</p>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${mode === "merge" ? "border-[#C4A04A]/50 bg-[#C4A04A]/5" : "border-[#2e2e2e] hover:border-[#333]"}`}>
                <input type="radio" name="mode" value="merge" checked={mode === "merge"} onChange={() => setMode("merge")} className="mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Add / Update</p>
                  <p className="text-xs text-[#B4B4B4] mt-0.5">Creates new products, updates existing ones by slug. Existing products not in the CSV are untouched.</p>
                </div>
              </label>
              <label className={`flex-1 flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${mode === "replace" ? "border-red-500/50 bg-red-500/5" : "border-[#2e2e2e] hover:border-[#333]"}`}>
                <input type="radio" name="mode" value="replace" checked={mode === "replace"} onChange={() => setMode("replace")} className="mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Replace All</p>
                  <p className="text-xs text-[#B4B4B4] mt-0.5">Marks all existing products inactive, then imports the CSV as your new catalog. Booking history is preserved.</p>
                </div>
              </label>
            </div>
          </div>

          <button
            onClick={handleParse}
            disabled={!csv.trim()}
            className="w-full py-3 bg-[#C4A04A] text-[#121212] rounded-xl text-sm font-bold hover:bg-[#d4b565] disabled:opacity-40 transition-colors"
          >
            Preview Import →
          </button>
        </>
      )}

      {/* Step: preview */}
      {step === "preview" && (
        <>
          {missingCols.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Missing required columns: {missingCols.join(", ")}
            </div>
          )}
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#2e2e2e]">
              <p className="text-sm font-semibold text-white">{preview.length} products to import <span className="text-[#B4B4B4] font-normal">· Mode: {mode === "replace" ? "Replace All" : "Add/Update"}</span></p>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[#1a1a1a] border-b border-[#2e2e2e]">
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className="text-left px-4 py-2 font-medium text-[#B4B4B4] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252525]">
                  {preview.map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      {headers.map((h) => (
                        <td key={h} className={`px-4 py-2 whitespace-nowrap ${h === "name" ? "text-white font-medium" : "text-[#B4B4B4]"}`}>
                          {row[h] || <span className="text-[#444]">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={reset} className="px-5 py-2.5 border border-[#2e2e2e] text-[#B4B4B4] hover:text-white rounded-xl text-sm font-medium transition-colors">
              ← Back
            </button>
            <button
              onClick={handleImport}
              disabled={loading || missingCols.length > 0}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-40 ${mode === "replace" ? "bg-red-500 hover:bg-red-400 text-white" : "bg-[#C4A04A] hover:bg-[#d4b565] text-[#121212]"}`}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Importing..." : mode === "replace" ? `Replace All & Import ${preview.length} Products` : `Import ${preview.length} Products`}
            </button>
          </div>
        </>
      )}

      {/* Step: done */}
      {step === "done" && counts && (
        <>
          <div className={`rounded-xl p-5 border ${counts.errors === 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
            <div className="flex items-center gap-3">
              {counts.errors === 0
                ? <CheckCircle className="h-5 w-5 text-emerald-400" />
                : <AlertCircle className="h-5 w-5 text-red-400" />}
              <div>
                <p className={`font-semibold ${counts.errors === 0 ? "text-emerald-300" : "text-red-300"}`}>
                  {counts.errors === 0 ? "Import complete" : "Import finished with errors"}
                </p>
                <p className="text-xs text-[#B4B4B4] mt-0.5">
                  {counts.created} created · {counts.updated} updated · {counts.errors} errors
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-[#B4B4B4] hover:text-white hover:bg-white/[0.02] transition-colors"
            >
              <span>View row results ({results.length})</span>
              {showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showAll && (
              <div className="divide-y divide-[#252525] max-h-80 overflow-y-auto">
                {results.map((r) => (
                  <div key={r.row} className="flex items-center gap-3 px-5 py-2.5">
                    <span className="text-xs text-[#555] w-8 shrink-0">#{r.row}</span>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                      r.status === "created" ? "bg-emerald-500/15 text-emerald-400" :
                      r.status === "updated" ? "bg-blue-500/15 text-blue-400" :
                      r.status === "error" ? "bg-red-500/15 text-red-400" : "bg-zinc-500/15 text-zinc-400"
                    }`}>{r.status}</span>
                    <span className="text-sm text-white">{r.name}</span>
                    {r.message && <span className="text-xs text-red-400 ml-auto">{r.message}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 border border-[#2e2e2e] text-[#B4B4B4] hover:text-white rounded-xl text-sm font-medium transition-colors">
              <RefreshCw className="h-4 w-4" />
              Import Another
            </button>
            <a href="/admin/products" className="flex-1 flex items-center justify-center py-2.5 bg-[#C4A04A] text-[#121212] rounded-xl text-sm font-bold hover:bg-[#d4b565] transition-colors">
              View Products →
            </a>
          </div>
        </>
      )}
    </div>
  )
}

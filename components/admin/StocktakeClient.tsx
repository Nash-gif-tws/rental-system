"use client"

import { useState, useCallback } from "react"
import { Upload, Download, CheckCircle, AlertCircle, Loader2, RefreshCw, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"

const TEMPLATE_CSV = `product,size,quantity,condition,notes
Mens Ski Package,,10,GOOD,
Womens Ski Package,,10,GOOD,
Kids Ski Package,,8,GOOD,
Mens Snowboard Package,,8,GOOD,
Womens Snowboard Package,,8,GOOD,
Kids Snowboard Package,,6,GOOD,
Mens Outerwear Package,,10,GOOD,
Womens Outerwear Package,,10,GOOD,
Kids Outerwear Package,,8,GOOD,
Adult Skis,Short,5,GOOD,
Adult Skis,Medium,10,GOOD,
Adult Skis,Long,8,GOOD,
Kids Skis,Small,6,GOOD,
Kids Skis,Medium,6,GOOD,
Mens Snowboards,Small,4,GOOD,
Mens Snowboards,Medium,6,GOOD,
Mens Snowboards,Large,4,GOOD,
Womens Snowboards,Small,4,GOOD,
Womens Snowboards,Medium,6,GOOD,
Kids Snowboards,Small,4,GOOD,
Kids Snowboards,Medium,4,GOOD,
Mens Ski Boots,7,4,GOOD,
Mens Ski Boots,8,6,GOOD,
Mens Ski Boots,9,8,GOOD,
Mens Ski Boots,10,8,GOOD,
Mens Ski Boots,11,6,GOOD,
Mens Ski Boots,12,4,GOOD,
Womens Ski Boots,5,4,GOOD,
Womens Ski Boots,6,6,GOOD,
Womens Ski Boots,7,8,GOOD,
Womens Ski Boots,8,6,GOOD,
Womens Ski Boots,9,4,GOOD,
Kids Ski Boots,1,3,GOOD,
Kids Ski Boots,2,4,GOOD,
Kids Ski Boots,3,4,GOOD,
Kids Ski Boots,4,4,GOOD,
Kids Ski Boots,5,3,GOOD,
Mens Snowboard Boots,7,4,GOOD,
Mens Snowboard Boots,8,6,GOOD,
Mens Snowboard Boots,9,6,GOOD,
Mens Snowboard Boots,10,6,GOOD,
Mens Snowboard Boots,11,4,GOOD,
Womens Snowboard Boots,6,4,GOOD,
Womens Snowboard Boots,7,6,GOOD,
Womens Snowboard Boots,8,4,GOOD,
Kids Snowboard Boots,3,3,GOOD,
Kids Snowboard Boots,4,4,GOOD,
Kids Snowboard Boots,5,3,GOOD,
Mens Jacket,S,4,GOOD,
Mens Jacket,M,8,GOOD,
Mens Jacket,L,8,GOOD,
Mens Jacket,XL,6,GOOD,
Womens Jackets,XS,3,GOOD,
Womens Jackets,S,6,GOOD,
Womens Jackets,M,6,GOOD,
Womens Jackets,L,4,GOOD,
Kids Jackets,S,4,GOOD,
Kids Jackets,M,4,GOOD,
Kids Jackets,L,3,GOOD,
Mens Pants,S,4,GOOD,
Mens Pants,M,8,GOOD,
Mens Pants,L,8,GOOD,
Mens Pants,XL,6,GOOD,
Womens Pants,XS,3,GOOD,
Womens Pants,S,6,GOOD,
Womens Pants,M,6,GOOD,
Womens Pants,L,4,GOOD,
Kids Pants,S,4,GOOD,
Kids Pants,M,4,GOOD,
Kids Pants,L,3,GOOD,
Kids 1 Piece,S,3,GOOD,
Kids 1 Piece,M,4,GOOD,
Kids 1 Piece,L,3,GOOD,
Ski Poles,Short,10,GOOD,
Ski Poles,Medium,12,GOOD,
Ski Poles,Long,10,GOOD,
Helmet,S,8,GOOD,
Helmet,M,10,GOOD,
Helmet,L,8,GOOD,
Snowboard Bindings,S,6,GOOD,
Snowboard Bindings,M,8,GOOD,
Snowboard Bindings,L,6,GOOD,
Luggage Bag,,15,GOOD,`

type StocktakeRow = { product: string; size: string; quantity: string; condition: string; notes: string }
type RowResult = { row: number; product: string; status: "ok" | "error"; created?: number; message?: string }

const CONDITIONS = ["EXCELLENT", "GOOD", "FAIR", "NEEDS_SERVICE"]

function parseCSV(text: string): StocktakeRow[] {
  const lines = text.trim().split("\n").filter((l) => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  return lines.slice(1).map((line) => {
    const vals = line.split(",")
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = (vals[i] ?? "").trim() })
    return {
      product: row.product ?? "",
      size: row.size ?? "",
      quantity: row.quantity ?? "0",
      condition: row.condition ?? "GOOD",
      notes: row.notes ?? "",
    }
  }).filter((r) => r.product)
}

const EMPTY_ROW: StocktakeRow = { product: "", size: "", quantity: "1", condition: "GOOD", notes: "" }

export default function StocktakeClient() {
  const [mode, setMode] = useState<"spreadsheet" | "csv">("spreadsheet")
  const [rows, setRows] = useState<StocktakeRow[]>([{ ...EMPTY_ROW }])
  const [csv, setCsv] = useState("")
  const [clearFirst, setClearFirst] = useState(false)
  const [step, setStep] = useState<"input" | "preview" | "done">("input")
  const [previewRows, setPreviewRows] = useState<StocktakeRow[]>([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<RowResult[]>([])
  const [totalCreated, setTotalCreated] = useState(0)
  const [error, setError] = useState("")
  const [showAll, setShowAll] = useState(false)

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "stocktake_template.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = String(ev.target?.result ?? "")
      setCsv(text)
      if (mode === "spreadsheet") {
        const parsed = parseCSV(text)
        if (parsed.length > 0) setRows(parsed)
      }
    }
    reader.readAsText(file)
  }, [mode])

  function updateRow(i: number, field: keyof StocktakeRow, value: string) {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }

  function addRow() {
    setRows((prev) => [...prev, { ...EMPTY_ROW }])
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handlePreview() {
    const finalRows = mode === "csv" ? parseCSV(csv) : rows.filter((r) => r.product.trim())
    if (finalRows.length === 0) return setError("No rows to import. Add products above or paste CSV.")
    setError("")
    setPreviewRows(finalRows)
    setStep("preview")
  }

  async function handleImport() {
    setLoading(true)
    setError("")
    try {
      const payload = previewRows.map((r) => ({
        product: r.product,
        size: r.size || undefined,
        quantity: parseInt(r.quantity) || 0,
        condition: r.condition || "GOOD",
        notes: r.notes || undefined,
      }))
      const res = await fetch("/api/inventory/stocktake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: payload, clearFirst }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Import failed")
        if (data.results) setResults(data.results)
        return
      }
      setResults(data.results ?? [])
      setTotalCreated(data.totalCreated ?? 0)
      setStep("done")
    } catch {
      setError("Network error — import failed")
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setRows([{ ...EMPTY_ROW }])
    setCsv("")
    setPreviewRows([])
    setResults([])
    setTotalCreated(0)
    setError("")
    setStep("input")
  }

  const totalUnits = previewRows.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0)

  return (
    <div className="space-y-5">
      {step === "input" && (
        <>
          {/* Mode selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("spreadsheet")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "spreadsheet" ? "bg-[#C4A04A] text-[#121212]" : "bg-[#1e1e1e] border border-[#2e2e2e] text-[#B4B4B4] hover:text-white"}`}
            >
              Spreadsheet
            </button>
            <button
              onClick={() => setMode("csv")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "csv" ? "bg-[#C4A04A] text-[#121212]" : "bg-[#1e1e1e] border border-[#2e2e2e] text-[#B4B4B4] hover:text-white"}`}
            >
              CSV Paste / Upload
            </button>
            <div className="flex-1" />
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] border border-[#2e2e2e] text-[#B4B4B4] hover:text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Template CSV
            </button>
          </div>

          {mode === "spreadsheet" ? (
            <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#2e2e2e]">
                <p className="text-sm font-semibold text-white">Enter stock counts</p>
                <label className="flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[#2e2e2e] text-[#B4B4B4] hover:text-white rounded-lg text-xs font-medium cursor-pointer transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  Upload CSV
                  <input type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
                </label>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#181818] border-b border-[#2e2e2e]">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#B4B4B4] w-[280px]">Product name / slug</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#B4B4B4] w-24">Size</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#B4B4B4] w-24">Qty</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#B4B4B4] w-40">Condition</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#B4B4B4]">Notes</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252525]">
                    {rows.map((row, i) => (
                      <tr key={i} className="group">
                        <td className="px-2 py-1.5">
                          <input
                            value={row.product}
                            onChange={(e) => updateRow(i, "product", e.target.value)}
                            placeholder="Mens Ski Boots"
                            className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-[#333] focus:border-[#C4A04A] rounded-lg text-white text-xs outline-none placeholder-[#444] transition-colors"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            value={row.size}
                            onChange={(e) => updateRow(i, "size", e.target.value)}
                            placeholder="9"
                            className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-[#333] focus:border-[#C4A04A] rounded-lg text-white text-xs outline-none placeholder-[#444] transition-colors"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            min="0"
                            max="2000"
                            value={row.quantity}
                            onChange={(e) => updateRow(i, "quantity", e.target.value)}
                            className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-[#333] focus:border-[#C4A04A] rounded-lg text-white text-xs outline-none transition-colors"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <select
                            value={row.condition}
                            onChange={(e) => updateRow(i, "condition", e.target.value)}
                            className="w-full px-2 py-1.5 bg-[#121212] border border-transparent hover:border-[#333] focus:border-[#C4A04A] rounded-lg text-white text-xs outline-none transition-colors"
                          >
                            {CONDITIONS.map((c) => (
                              <option key={c} value={c}>{c.replace("_", " ")}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            value={row.notes}
                            onChange={(e) => updateRow(i, "notes", e.target.value)}
                            placeholder="Optional notes"
                            className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-[#333] focus:border-[#C4A04A] rounded-lg text-white text-xs outline-none placeholder-[#444] transition-colors"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <button
                            onClick={() => removeRow(i)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-[#555] hover:text-red-400 rounded transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-[#2e2e2e]">
                <button
                  onClick={addRow}
                  className="flex items-center gap-2 text-xs text-[#B4B4B4] hover:text-white transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add row
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-xs text-[#B4B4B4]">Columns: <span className="text-white font-mono">product, size, quantity, condition, notes</span></p>
              </div>
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
                placeholder={"product,size,quantity,condition,notes\nMens Ski Boots,9,8,GOOD,\nAdult Skis,Medium,10,EXCELLENT,"}
                className="w-full h-48 px-4 py-3 bg-[#121212] border border-[#333] rounded-xl text-xs font-mono text-[#E6E6E6] placeholder-[#444] focus:outline-none focus:border-[#C4A04A] resize-y"
              />
            </div>
          )}

          {/* Clear first option */}
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={clearFirst}
                onChange={(e) => setClearFirst(e.target.checked)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-white">Clear existing units first</p>
                <p className="text-xs text-[#B4B4B4] mt-0.5">
                  Deletes all existing units for the products in this import before adding new ones.
                  Units currently assigned to active bookings are never deleted.
                  Use this for a full stocktake reset.
                </p>
              </div>
            </label>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handlePreview}
            disabled={mode === "spreadsheet" ? rows.filter((r) => r.product.trim()).length === 0 : !csv.trim()}
            className="w-full py-3 bg-[#C4A04A] text-[#121212] rounded-xl text-sm font-bold hover:bg-[#d4b565] disabled:opacity-40 transition-colors"
          >
            Preview Stocktake →
          </button>
        </>
      )}

      {step === "preview" && (
        <>
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#2e2e2e]">
              <p className="text-sm font-semibold text-white">
                {previewRows.length} product lines · <span className="text-[#C4A04A]">{totalUnits} total units</span>
                {clearFirst && <span className="ml-2 text-xs text-amber-400 font-normal">· existing units will be cleared first</span>}
              </p>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[#1a1a1a] border-b border-[#2e2e2e]">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-[#B4B4B4] uppercase tracking-wider">Product</th>
                    <th className="text-left px-4 py-2 font-medium text-[#B4B4B4] uppercase tracking-wider">Size</th>
                    <th className="text-left px-4 py-2 font-medium text-[#B4B4B4] uppercase tracking-wider">Qty</th>
                    <th className="text-left px-4 py-2 font-medium text-[#B4B4B4] uppercase tracking-wider">Condition</th>
                    <th className="text-left px-4 py-2 font-medium text-[#B4B4B4] uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252525]">
                  {previewRows.map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-2 text-white font-medium">{row.product}</td>
                      <td className="px-4 py-2 text-[#B4B4B4]">{row.size || <span className="text-[#444]">—</span>}</td>
                      <td className="px-4 py-2 text-[#C4A04A] font-bold">{row.quantity}</td>
                      <td className="px-4 py-2 text-[#B4B4B4]">{row.condition}</td>
                      <td className="px-4 py-2 text-[#B4B4B4]">{row.notes || <span className="text-[#444]">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => { setStep("input"); setError("") }} className="px-5 py-2.5 border border-[#2e2e2e] text-[#B4B4B4] hover:text-white rounded-xl text-sm font-medium transition-colors">
              ← Back
            </button>
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#C4A04A] hover:bg-[#d4b565] text-[#121212] rounded-xl text-sm font-bold transition-colors disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Importing..." : `Create ${totalUnits} Units`}
            </button>
          </div>
        </>
      )}

      {step === "done" && (
        <>
          <div className={`rounded-xl p-5 border ${results.some((r) => r.status === "error") ? "bg-red-500/10 border-red-500/30" : "bg-emerald-500/10 border-emerald-500/30"}`}>
            <div className="flex items-center gap-3">
              {results.some((r) => r.status === "error")
                ? <AlertCircle className="h-5 w-5 text-red-400" />
                : <CheckCircle className="h-5 w-5 text-emerald-400" />}
              <div>
                <p className={`font-semibold ${results.some((r) => r.status === "error") ? "text-red-300" : "text-emerald-300"}`}>
                  {results.some((r) => r.status === "error") ? "Stocktake finished with errors" : "Stocktake complete"}
                </p>
                <p className="text-xs text-[#B4B4B4] mt-0.5">
                  {totalCreated} units created across {results.filter((r) => r.status === "ok").length} product lines
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-[#B4B4B4] hover:text-white hover:bg-white/[0.02] transition-colors"
            >
              <span>Row results ({results.length})</span>
              {showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showAll && (
              <div className="divide-y divide-[#252525] max-h-80 overflow-y-auto">
                {results.map((r) => (
                  <div key={r.row} className="flex items-center gap-3 px-5 py-2.5">
                    <span className="text-xs text-[#555] w-8 shrink-0">#{r.row}</span>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${r.status === "ok" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                      {r.status === "ok" ? `+${r.created}` : "error"}
                    </span>
                    <span className="text-sm text-white">{r.product}</span>
                    {r.message && <span className="text-xs text-red-400 ml-auto">{r.message}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 border border-[#2e2e2e] text-[#B4B4B4] hover:text-white rounded-xl text-sm font-medium transition-colors">
              <RefreshCw className="h-4 w-4" />
              Another Stocktake
            </button>
            <a href="/admin/inventory" className="flex-1 flex items-center justify-center py-2.5 bg-[#C4A04A] text-[#121212] rounded-xl text-sm font-bold hover:bg-[#d4b565] transition-colors">
              View Inventory →
            </a>
          </div>
        </>
      )}
    </div>
  )
}

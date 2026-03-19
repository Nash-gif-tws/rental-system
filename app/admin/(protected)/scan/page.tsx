import ScannerClient from "@/components/admin/ScannerClient"

export default function ScanPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">Barcode Scanner</h1>
        <p className="text-sm text-[#B4B4B4] mt-1">Scan a booking barcode or equipment serial number to log check-out or return.</p>
      </div>
      <ScannerClient />
    </div>
  )
}

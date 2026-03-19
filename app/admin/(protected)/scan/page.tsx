import ScannerClient from "@/components/admin/ScannerClient"

export default function ScanPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Barcode Scanner</h1>
        <p className="text-sm text-gray-500 mt-1">Scan a booking barcode or equipment serial number to log check-out or return.</p>
      </div>
      <ScannerClient />
    </div>
  )
}
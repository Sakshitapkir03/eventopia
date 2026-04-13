'use client'

import { QRCodeSVG } from 'qrcode.react'

export default function QRTicket({ value }: { value: string }) {
  return (
    <div className="p-3 bg-white rounded-2xl border-2 border-primary-200 shadow-sm">
      <QRCodeSVG
        value={value}
        size={180}
        bgColor="#ffffff"
        fgColor="#1f2937"
        level="H"
        includeMargin={false}
      />
    </div>
  )
}

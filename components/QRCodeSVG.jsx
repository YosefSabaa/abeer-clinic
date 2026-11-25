'use client'

import { useMemo } from 'react'
import { generateQRMatrix } from '@/lib/qrcode'

export default function QRCodeSVG({ value, size = 160, className = '' }) {
  const matrix = useMemo(() => generateQRMatrix(value || ''), [value])
  const count = matrix.length
  const quiet = 2
  const viewSize = count + quiet * 2

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      className={`bg-white rounded-xl p-1.5 ${className}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR Code"
    >
      <rect x="0" y="0" width={viewSize} height={viewSize} fill="#ffffff" />
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect key={`${r}-${c}`} x={c + quiet} y={r + quiet} width="1" height="1" fill="#111111" />
          ) : null
        )
      )}
    </svg>
  )
}

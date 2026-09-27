'use client'

import { useState } from 'react'

export function CopyMessageButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // clipboard API can fail on old Safari — select fallback
      const area = document.createElement('textarea')
      area.value = text
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-slate-500"
    >
      {copied ? '✓ Copied!' : 'Copy message for client'}
    </button>
  )
}

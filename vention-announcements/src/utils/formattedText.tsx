import React from 'react'

/**
 * Renders text with simple formatting: **bold**, *italic*, and bullet lists (- item).
 * No rich editor in Settings per spec; this parses plain text for display.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function parseInline(text: string): string {
  let out = escapeHtml(text)
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>')
  return out
}

export function FormattedText({
  text,
  className,
  as: Tag = 'div',
  inlineOnly = false,
}: {
  text: string
  className?: string
  as?: 'div' | 'p' | 'span'
  /** Only **bold** and *italic*, single element (no lists/headings/newlines). */
  inlineOnly?: boolean
}) {
  if (!text.trim()) return null

  if (inlineOnly) {
    return (
      <Tag
        className={className}
        dangerouslySetInnerHTML={{ __html: parseInline(text.trim()) }}
      />
    )
  }

  const lines = text.split(/\r?\n/)
  const nodes: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trimStart()
    if (trimmed.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].trimStart().startsWith('- ')) {
        items.push(lines[i].trimStart().slice(2).trim())
        i++
      }
      nodes.push(
        <ul key={nodes.length} className={`${className ?? ''} ${className ? '__list' : ''}`.trim()}>
          {items.map((item, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
          ))}
        </ul>
      )
      continue
    }
    if (trimmed) {
      if (trimmed.startsWith('### ')) {
        nodes.push(
          <h3
            key={nodes.length}
            className={className}
            dangerouslySetInnerHTML={{ __html: parseInline(trimmed.slice(4)) }}
          />
        )
      } else if (trimmed.startsWith('## ')) {
        nodes.push(
          <h2
            key={nodes.length}
            className={className}
            dangerouslySetInnerHTML={{ __html: parseInline(trimmed.slice(3)) }}
          />
        )
      } else {
        nodes.push(
          <Tag
            key={nodes.length}
            className={className}
            dangerouslySetInnerHTML={{ __html: parseInline(trimmed) }}
          />
        )
      }
    }
    i++
  }

  if (nodes.length === 0) return null
  if (nodes.length === 1) return <>{nodes[0]}</>
  return <>{nodes}</>
}

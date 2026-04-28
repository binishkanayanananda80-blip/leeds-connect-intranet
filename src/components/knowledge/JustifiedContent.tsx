'use client'

/**
 * JustifiedContent
 * Renders article content with:
 * - Justified text alignment
 * - Paragraph structure preserved exactly as submitted
 * - Handles Windows (\r\n), Unix (\n), and Mac (\r) line endings
 */

interface Props {
  content: string
  className?: string
  lineClamp?: number
}

export function JustifiedContent({ content, className = '', lineClamp }: Props) {
  // 1. Normalize all line endings to \n (handles \r\n and \r)
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // 2. Split into paragraphs on one or more blank lines
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)

  // 3. If no double-newlines found, try single newlines as paragraph separators
  const finalParagraphs = paragraphs.length > 1
    ? paragraphs
    : normalized.split(/\n/).map(p => p.trim()).filter(Boolean)

  return (
    <div className={`space-y-4 ${className}`}>
      {finalParagraphs.map((para, i) => (
        <p key={i} className="text-justify leading-relaxed">
          {para}
        </p>
      ))}
    </div>
  )
}


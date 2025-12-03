/*
 * HYBRID DOM LOCATOR
 * A combination of:
 *   1. CSS Path (structural position)
 *   2. Text Range Snapshot (anchor text around the selection)
 */

export function generateCssPath(el: Element | null): string {
  if (!el || !(el instanceof Element)) return ''
  const path: string[] = []

  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase()

    if (el.id) {
      selector += `#${el.id}`
      path.unshift(selector)
      break
    } else {
      // Count siblings of the same type
      const parent = el.parentElement
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (child) => child.nodeName === el?.nodeName
        )
        if (siblings.length > 1) {
          const index = siblings.indexOf(el) + 1
          selector += `:nth-of-type(${index})`
        }
      }
    }

    path.unshift(selector)
    el = el.parentElement!
  }

  return path.join(' > ')
}

export function generateHybridLocator(range: Range): HybridLocator {
  const node =
    range.startContainer.nodeType === 3
      ? range.startContainer.parentElement
      : (range.startContainer as Element)

  const cssPath = generateCssPath(node)

  const fullText = range.startContainer.textContent || ''
  const start = range.startOffset
  const end = range.endOffset

  return {
    cssPath,
    textSnippet: {
      before: fullText.slice(Math.max(0, start - 30), start),
      selected: fullText.slice(start, end),
      after: fullText.slice(end, end + 30),
    },
  }
}

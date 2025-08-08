/**
 * Completely strips all HTML tags and returns plain text
 * This is a simple, reliable approach that works in all environments
 */
export function stripAllHTML(htmlContent: string): string {
  if (!htmlContent) return 'No review text available.'

  // Remove all HTML tags and decode entities
  const stripped = htmlContent
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '...')
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()

  return stripped || 'No review text available.'
}

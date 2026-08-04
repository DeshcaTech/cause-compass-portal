/** HMAC signing for private RSVP report links sent to event contacts. */

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function sign(eventId: string) {
  const secret = process.env['REPORT_LINK_SECRET']
  if (!secret) throw new Error('REPORT_LINK_SECRET is not configured')
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(eventId))
  return toHex(sig).slice(0, 40)
}

export async function signEventReport(eventId: string) {
  return sign(eventId)
}

export async function verifyEventReport(eventId: string, signature: string) {
  const expected = await sign(eventId)
  if (expected.length !== signature.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return diff === 0
}
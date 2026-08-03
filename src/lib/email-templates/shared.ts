export const brand = {
  green: '#2f6146',
  gold: '#d6a13c',
  terracotta: '#c26a3d',
  text: '#25302b',
  muted: '#6b7772',
  border: '#e4e7e4',
}

export const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Helvetica, Arial, sans-serif',
  color: brand.text,
}

export const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '32px 28px',
}

export const heading = {
  fontSize: '24px',
  lineHeight: '1.25',
  margin: '0 0 12px',
  color: brand.green,
}

export const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 14px',
}

export const mutedText = {
  ...paragraph,
  fontSize: '13px',
  color: brand.muted,
}

export const panel = {
  border: `1px solid ${brand.border}`,
  borderRadius: '14px',
  padding: '20px',
  textAlign: 'center' as const,
  margin: '20px 0',
}

export const eyebrow = {
  fontSize: '11px',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  color: brand.terracotta,
  margin: '0 0 8px',
}
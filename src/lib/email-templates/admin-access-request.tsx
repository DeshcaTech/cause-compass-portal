import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { brand, container, eyebrow, heading, main, mutedText, paragraph } from './shared'

interface Props {
  requesterName?: string | null
  requesterEmail?: string
  currentLevel?: string
  section?: string
  requirement?: string
  reason?: string
  submittedAt?: string
}

const box = {
  backgroundColor: '#f5f7f5',
  border: `1px solid ${brand.border}`,
  borderRadius: '8px',
  padding: '14px 16px',
  margin: '0 0 16px',
}

const Email = ({
  requesterName,
  requesterEmail,
  currentLevel,
  section,
  requirement,
  reason,
  submittedAt,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Admin access request${section ? ` — ${section}` : ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>CCGMs Administration</Text>
        <Heading style={heading}>Admin access request</Heading>
        <Text style={paragraph}>
          {requesterName || requesterEmail || 'An administrator'} asked for access to a blocked
          section of the admin dashboard.
        </Text>
        <Container style={box}>
          <Text style={paragraph}>
            <strong>Requested by:</strong> {requesterName ? `${requesterName} — ` : ''}
            {requesterEmail}
          </Text>
          <Text style={paragraph}>
            <strong>Section:</strong> {section || 'Admin dashboard'}
          </Text>
          <Text style={paragraph}>
            <strong>Current access:</strong> {currentLevel || 'No admin role'}
          </Text>
          <Text style={paragraph}>
            <strong>Access required:</strong> {requirement || 'A higher admin level'}
          </Text>
          {reason ? (
            <Text style={{ ...paragraph, margin: 0 }}>
              <strong>Reason given:</strong> {reason}
            </Text>
          ) : null}
        </Container>
        <Text style={paragraph}>
          You can grant this in Admin → Admin accounts. The change is recorded in the activity log.
        </Text>
        {submittedAt ? (
          <Text style={mutedText}>
            Submitted {new Date(submittedAt).toLocaleString('en-GB')}.
          </Text>
        ) : null}
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Admin access request${data['section'] ? ` — ${data['section']}` : ''}`,
  displayName: 'Admin access request',
  previewData: {
    requesterName: 'Marie Nkeng',
    requesterEmail: 'marie@example.org',
    currentLevel: 'content administrator (level 3)',
    section: 'Membership',
    requirement: 'Admin level 1 or 2',
    reason: 'I need to check a family membership payment.',
    submittedAt: new Date().toISOString(),
  },
} satisfies TemplateEntry

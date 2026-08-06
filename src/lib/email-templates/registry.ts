import type { ComponentType } from 'react'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
import { template as membershipConfirmation } from './membership-confirmation'
import { template as volunteerConfirmation } from './volunteer-confirmation'
import { template as volunteerAdminNotification } from './volunteer-admin-notification'
import { template as newsAnnouncement } from './news-announcement'
import { template as newsSubscribed } from './news-subscribed'
import { template as newsUnsubscribed } from './news-unsubscribed'
import { template as rsvpConfirmation } from './rsvp-confirmation'
import { template as rsvpDigest } from './rsvp-digest'
import { template as jobApplication } from './job-application'
import { template as adminInvite } from './admin-invite'
import { template as adminAccessRequest } from './admin-access-request'
import { template as campaignStatus } from './campaign-status'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'membership-confirmation': membershipConfirmation,
  'volunteer-confirmation': volunteerConfirmation,
  'volunteer-admin-notification': volunteerAdminNotification,
  'news-announcement': newsAnnouncement,
  'news-subscribed': newsSubscribed,
  'news-unsubscribed': newsUnsubscribed,
  'rsvp-confirmation': rsvpConfirmation,
  'rsvp-digest': rsvpDigest,
  'job-application': jobApplication,
  'admin-invite': adminInvite,
  'admin-access-request': adminAccessRequest,
  'campaign-status': campaignStatus,
}

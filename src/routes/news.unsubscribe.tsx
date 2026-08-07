import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { resubscribeByToken, unsubscribeByToken } from '@/lib/news.functions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useT } from '@/lib/i18n'

export const Route = createFileRoute('/news/unsubscribe')({
  validateSearch: z.object({ token: z.string().optional(), action: z.string().optional() }),
  head: () => ({
    meta: [
      { title: 'Unsubscribe from CCGMs news updates' },
      {
        name: 'description',
        content: 'Stop receiving CCGMs community news and announcement emails in one click.',
      },
      { property: 'og:title', content: 'Unsubscribe from CCGMs news updates' },
      {
        property: 'og:description',
        content: 'Stop receiving CCGMs community news and announcement emails in one click.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: UnsubscribePage,
})

function UnsubscribePage() {
  const { token, action } = Route.useSearch()
  const t = useT()
  const [state, setState] = useState<'working' | 'done' | 'invalid' | 'resubscribed'>('working')
  const [email, setEmail] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!token) {
      setState('invalid')
      return
    }
    const run =
      action === 'resubscribe'
        ? resubscribeByToken({ data: { token } })
        : unsubscribeByToken({ data: { token } })
    run
      .then((res) => {
        if (cancelled) return
        if (res.ok) {
          setEmail(res.email)
          setState(action === 'resubscribe' ? 'resubscribed' : 'done')
        } else {
          setState('invalid')
        }
      })
      .catch(() => !cancelled && setState('invalid'))
    return () => {
      cancelled = true
    }
  }, [token, action])

  async function onResubscribe() {
    if (!token) return
    setBusy(true)
    try {
      const res = await resubscribeByToken({ data: { token } })
      if (res.ok) {
        setEmail(res.email)
        setState('resubscribed')
        toast.success('News notifications re-enabled.')
      } else {
        setState('invalid')
      }
    } catch {
      toast.error('Could not re-enable notifications, please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="container-page py-20">
      <div className="mx-auto max-w-xl rounded-3xl border border-border/70 bg-card p-8 text-center">
        <p className="eyebrow text-terracotta">{t('CCGMs news')}</p>
        {state === 'working' && (
          <h1 className="mt-3 text-h3 text-balance">{t('Updating your preferences…')}</h1>
        )}
        {state === 'done' && (
          <>
            <h1 className="mt-3 text-h3 text-balance">{t('You have been unsubscribed')}</h1>
            <p className="mt-4 text-muted-foreground">
              {email ? `${email} — ` : ''}
              {t(
                'You will no longer receive CCGMs news and announcement emails. You can re-subscribe any time from the news page.',
              )}
            </p>
            <div className="mt-6">
              <Button onClick={onResubscribe} disabled={busy}>
                {busy ? t('Re-enabling…') : t('Changed your mind? Re-enable news emails')}
              </Button>
            </div>
          </>
        )}
        {state === 'resubscribed' && (
          <>
            <h1 className="mt-3 text-h3 text-balance">{t("You're subscribed again")}</h1>
            <p className="mt-4 text-muted-foreground">
              {email ? `${email} — ` : ''}
              {t(
                'You will receive CCGMs news and announcements again. A confirmation email is on its way.',
              )}
            </p>
          </>
        )}
        {state === 'invalid' && (
          <>
            <h1 className="mt-3 text-h3 text-balance">{t('This link is not valid')}</h1>
            <p className="mt-4 text-muted-foreground">
              {t(
                'The unsubscribe link is missing or has already been used. If you still receive emails, please contact us and we will remove you.',
              )}
            </p>
          </>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="soft">
            <Link to="/news">{t('Back to news')}</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/contact">{t('Contact us')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
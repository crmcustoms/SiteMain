'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function AutomationProjectLeadDialog({ revision, className }: { revision: number; className: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const body = new URLSearchParams()
    fields.forEach((value, key) => { if (typeof value === 'string') body.append(key, value) })
    setSending(true)
    setError('')
    try {
      const response = await fetch('/api/automation-project', {
        method: 'POST', credentials: 'same-origin', body,
      })
      if (!response.ok) {
        const result = await response.json()
        setError(result.error || 'Не вдалося надіслати заявку. Спробуйте пізніше.')
        return
      }
      setOpen(false)
      router.refresh()
    } catch {
      setError('Не вдалося підтвердити надсилання. Перевірте стан заявки на сторінці проєкту перед повторною спробою.')
      router.refresh()
    } finally { setSending(false) }
  }
  return <Dialog open={open} onOpenChange={value => { if (!sending) setOpen(value) }}>
    <DialogTrigger asChild><button type="button" className={className}>Обговорити впровадження</button></DialogTrigger>
    <DialogContent className="w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-sm sm:rounded-sm">
      <DialogHeader><DialogTitle>Заявка на впровадження</DialogTitle><DialogDescription>Надішлемо обрані рішення, налаштування й попередній бюджет вашого проєкту до CRMCUSTOMS.</DialogDescription></DialogHeader>
      <form method="post" action="/api/automation-project" onSubmit={submit} className="space-y-4">
        <input type="hidden" name="action" value="submit" /><input type="hidden" name="revision" value={revision} />
        <div><Label htmlFor="project-lead-name">Ім’я</Label><Input id="project-lead-name" name="name" minLength={2} maxLength={120} autoComplete="name" required /></div>
        <div><Label htmlFor="project-lead-email">Електронна пошта</Label><Input id="project-lead-email" name="email" type="email" maxLength={254} autoComplete="email" /></div>
        <div><Label htmlFor="project-lead-phone">Телефон</Label><Input id="project-lead-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" /><p className="text-sm">Вкажіть телефон або електронну пошту.</p></div>
        <div><Label htmlFor="project-lead-message">Коментар</Label><Textarea id="project-lead-message" name="message" maxLength={3000} /></div>
        <label className="flex gap-2 items-start"><input type="checkbox" name="consent" value="yes" required /><span>Дозволяю CRMCUSTOMS зв’язатися зі мною щодо цього проєкту.</span></label>
        {error && <p role="alert">{error}</p>}
        <Button type="submit" disabled={sending}>{sending ? 'Надсилаємо…' : 'Надіслати заявку'}</Button>
      </form>
    </DialogContent>
  </Dialog>
}

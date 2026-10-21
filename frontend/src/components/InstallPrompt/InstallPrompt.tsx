import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Download, Share2 } from 'lucide-react'
import { Button, IconButton } from '../ui/button'
import './InstallPrompt.css'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'pwa-install-dismissed'
const DISMISS_TTL_MS = 48 * 60 * 60 * 1000

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function wasDismissedRecently() {
  const ts = localStorage.getItem(DISMISSED_KEY)
  return ts ? Date.now() - Number(ts) < DISMISS_TTL_MS : false
}

export default function InstallPrompt() {
  const { t } = useTranslation()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [iosMode, setIosMode] = useState(false)

  useEffect(() => {
    if (isStandalone() || wasDismissedRecently()) return

    if (isIOS()) {
      setIosMode(true)
      setVisible(true)
      return
    }

    const handler = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
  }

  if (!visible) return null

  return (
    <div className="install-prompt">
      <div className="install-prompt__card">
        <div className="install-prompt__bar" />

        <div className="install-prompt__body">
          <div className="install-prompt__header">
            <div className="install-prompt__icon-wrap">
              <img src="/icons/icon-192.svg" alt="Salvida" className="install-prompt__icon" />
            </div>

            <div className="install-prompt__text">
              <p className="install-prompt__title">{t('installPrompt.title')}</p>
              <p className="install-prompt__desc">{t('installPrompt.description')}</p>
            </div>

            <IconButton
              className="install-prompt__close"
              label={t('installPrompt.dismiss')}
              icon={<X size={14} />}
              onClick={handleDismiss}
            />
          </div>

          <div className="install-prompt__actions">
            {iosMode ? (
              <p className="install-prompt__ios">
                <span>{t('installPrompt.iosTap')}</span>
                <Share2 size={13} className="install-prompt__ios-icon" />
                <strong>{t('installPrompt.iosShare')}</strong>
                <span>{t('installPrompt.iosThen')}</span>
              </p>
            ) : (
              <Button size="sm" fullWidth icon={<Download size={14} />} onClick={handleInstall}>
                {t('installPrompt.installBtn')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

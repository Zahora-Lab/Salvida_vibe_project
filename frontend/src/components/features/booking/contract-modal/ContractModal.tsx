import { useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { SignatureCanvas } from '@/components/ui/signature-canvas';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useSignBooking } from '@/hooks/useBookings';
import type { Booking } from '@/types';
import './ContractModal.css';

interface ContractModalProps {
  booking: Booking;
  onClose: () => void;
  onSigned: () => void;
}

export default function ContractModal({ booking, onClose, onSigned }: ContractModalProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const signBooking = useSignBooking();

  const handleSubmit = useCallback(async () => {
    if (isEmpty) {
      toast.error(t('contract.emptySignatureError'));
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Extract base64 PNG without the data-URI prefix
    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1] ?? '';

    try {
      await signBooking.mutateAsync({ id: booking.id, signatureImage: base64 });
      toast.success(t('contract.successMessage'));
      onSigned();
    } catch {
      // error toast handled by hook
    }
  }, [isEmpty, booking.id, signBooking, t, onSigned]);

  return (
    <Modal
      open
      onCancel={onClose}
      title={t('contract.modalTitle')}
      size="lg"
      styles={{
        header: { paddingBottom: '1rem', borderBottom: '1px solid var(--color-slate-100)' },
        footer: { paddingTop: '1rem', borderTop: '1px solid var(--color-slate-100)' },
      }}
      footer={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={signBooking.isPending}
          >
            {t('booking.cancel')}
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isEmpty}
            loading={signBooking.isPending}
          >
            {signBooking.isPending ? t('contract.submitting') : t('contract.submitSignature')}
          </Button>
        </>
      }
    >
      <div className="contract-modal__body">
        <h3 className="contract-modal__contract-title">{t('contract.title')}</h3>
        <p className="contract-modal__text">{t('contract.body1')}</p>
        <p className="contract-modal__text">{t('contract.body2')}</p>

        <div className="contract-modal__sig-section">
          <p className="contract-modal__sig-label">{t('contract.signatureLabel')}</p>
          <SignatureCanvas canvasRef={canvasRef} onEmpty={setIsEmpty} />
        </div>
      </div>
    </Modal>
  );
}

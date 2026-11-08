import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '../button';
import './Modal.css';

export type ModalSize = 'sm' | 'md' | 'lg';

/** Same slot names as antd's `Modal` `styles` prop, so swapping libraries is a prop-for-prop change. */
export interface ModalStyles {
  /** Full-screen layer behind the panel. */
  mask?: CSSProperties;
  /** The panel itself. */
  content?: CSSProperties;
  header?: CSSProperties;
  body?: CSSProperties;
  footer?: CSSProperties;
}

export interface ModalProps {
  /** Controlled. The content is unmounted while closed, so form state resets between openings. */
  open: boolean;
  onCancel: () => void;
  /** Heading. Also names the dialog for assistive technology. */
  title?: ReactNode;
  /** Replaces the heading in the header, e.g. a logo. Use `aria-label` to name the dialog then. */
  header?: ReactNode;
  footer?: ReactNode;
  /** Panel width: sm 26rem, md 30rem, lg 35rem. */
  size?: ModalSize;
  /** Shows the close button in the header. */
  closable?: boolean;
  /** Click on the mask closes the modal. */
  maskClosable?: boolean;
  /** Escape closes the modal. */
  keyboard?: boolean;
  /** `alertdialog` for confirmations that interrupt the user. */
  role?: 'dialog' | 'alertdialog';
  'aria-label'?: string;
  styles?: ModalStyles;
  /** Class for the panel. */
  className?: string;
  /** Class for the mask (also where theme tokens are defined). */
  rootClassName?: string;
  children?: ReactNode;
}

/**
 * Modal built on the native <dialog>: focus trap, Escape and the top layer come from the browser.
 * The <dialog> is stretched over the viewport and acts as the mask, so it can be themed with
 * `--modal-*` tokens instead of relying on ::backdrop.
 */
export default function Modal({
  open,
  onCancel,
  title,
  header,
  footer,
  size = 'md',
  closable = true,
  maskClosable = true,
  keyboard = true,
  role = 'dialog',
  'aria-label': ariaLabel,
  styles,
  className,
  rootClassName,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;

    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, [open]);

  if (!open) return null;

  const hasHeader = Boolean(title || header || closable);

  return (
    <dialog
      ref={dialogRef}
      role={role === 'alertdialog' ? 'alertdialog' : undefined}
      className={['modal', rootClassName].filter(Boolean).join(' ')}
      style={styles?.mask}
      aria-labelledby={title ? titleId : undefined}
      aria-label={ariaLabel}
      // Escape fires `cancel`: we own the open state, so never let the browser close it by itself.
      onCancel={(event) => {
        event.preventDefault();
        if (keyboard) onCancel();
      }}
      // mousedown (not click) so dragging a text selection out of the panel does not close it.
      onMouseDown={(event) => {
        if (maskClosable && event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        className={['modal__panel', `modal__panel--${size}`, className].filter(Boolean).join(' ')}
        style={styles?.content}
      >
        {hasHeader && (
          <div className="modal__header" style={styles?.header}>
            {header ?? (
              <h2 id={titleId} className="modal__title">
                {title}
              </h2>
            )}
            {closable && (
              <IconButton
                className="modal__close"
                label="Cerrar"
                icon={<X size={18} />}
                onClick={onCancel}
              />
            )}
          </div>
        )}
        <div className="modal__body" style={styles?.body}>
          {children}
        </div>
        {footer && (
          <div className="modal__footer" style={styles?.footer}>
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}

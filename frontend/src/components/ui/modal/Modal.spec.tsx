import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Modal } from './index';

function open(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
  const onCancel = vi.fn();
  const utils = render(
    <Modal open onCancel={onCancel} title="Nuevo usuario" {...props}>
      <p>contenido</p>
    </Modal>,
  );
  return { onCancel, ...utils };
}

describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(<Modal open={false} onCancel={() => {}} title="x">contenido</Modal>);
    expect(screen.queryByText('contenido')).not.toBeInTheDocument();
    expect(document.querySelector('dialog')).toBeNull();
  });

  it('opens a native modal dialog named by its title', () => {
    open();
    const dialog = screen.getByRole('dialog', { name: 'Nuevo usuario' });
    expect(dialog.tagName).toBe('DIALOG');
    expect(dialog).toHaveAttribute('open');
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('supports role="alertdialog"', () => {
    open({ role: 'alertdialog' });
    expect(screen.getByRole('alertdialog', { name: 'Nuevo usuario' })).toBeInTheDocument();
  });

  it('can be named with aria-label when there is no title', () => {
    open({ title: undefined, header: <span>logo</span>, 'aria-label': 'Registro' });
    expect(screen.getByRole('dialog', { name: 'Registro' })).toBeInTheDocument();
    expect(screen.getByText('logo')).toBeInTheDocument();
  });

  it('renders the footer', () => {
    open({ footer: <button>Guardar</button> });
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it.each(['sm', 'md', 'lg'] as const)('applies size="%s"', (size) => {
    open({ size });
    expect(document.querySelector('.modal__panel')).toHaveClass(`modal__panel--${size}`);
  });

  describe('closing', () => {
    it('Escape (the dialog cancel event) calls onCancel and is prevented', () => {
      const { onCancel } = open();
      const event = new Event('cancel', { cancelable: true });
      screen.getByRole('dialog').dispatchEvent(event);
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
    });

    it('keyboard={false} ignores Escape but still prevents the native close', () => {
      const { onCancel } = open({ keyboard: false });
      const event = new Event('cancel', { cancelable: true });
      screen.getByRole('dialog').dispatchEvent(event);
      expect(onCancel).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });

    it('pressing the mask calls onCancel', () => {
      const { onCancel } = open();
      fireEvent.mouseDown(screen.getByRole('dialog'));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('pressing inside the panel does not close it', () => {
      const { onCancel } = open();
      fireEvent.mouseDown(screen.getByText('contenido'));
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('maskClosable={false} keeps it open when the mask is pressed', () => {
      const { onCancel } = open({ maskClosable: false });
      fireEvent.mouseDown(screen.getByRole('dialog'));
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('the close button calls onCancel and has an accessible name', () => {
      const { onCancel } = open();
      fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('closable={false} hides the close button', () => {
      open({ closable: false });
      expect(screen.queryByRole('button', { name: 'Cerrar' })).not.toBeInTheDocument();
    });
  });

  describe('styles slots (same keys as antd)', () => {
    it('applies mask, content, header, body and footer styles', () => {
      open({
        footer: <span>pie</span>,
        styles: {
          mask: { zIndex: 7 },
          content: { borderRadius: 3 },
          header: { paddingTop: 4 },
          body: { paddingTop: 5 },
          footer: { paddingTop: 6 },
        },
      });
      expect(screen.getByRole('dialog')).toHaveStyle({ zIndex: '7' });
      expect(document.querySelector('.modal__panel')).toHaveStyle({ borderRadius: '3px' });
      expect(document.querySelector('.modal__header')).toHaveStyle({ paddingTop: '4px' });
      expect(document.querySelector('.modal__body')).toHaveStyle({ paddingTop: '5px' });
      expect(document.querySelector('.modal__footer')).toHaveStyle({ paddingTop: '6px' });
    });

    it('className goes to the panel and rootClassName to the mask', () => {
      open({ className: 'mine', rootClassName: 'theme' });
      expect(document.querySelector('.modal__panel')).toHaveClass('mine');
      expect(screen.getByRole('dialog')).toHaveClass('modal', 'theme');
    });
  });

  describe('page behavior while open', () => {
    it('locks the page scroll and restores it on close', () => {
      document.body.style.overflow = 'auto';
      const { rerender } = open();
      expect(document.body.style.overflow).toBe('hidden');
      rerender(<Modal open={false} onCancel={() => {}} title="x">contenido</Modal>);
      expect(document.body.style.overflow).toBe('auto');
      document.body.style.overflow = '';
    });

    it('returns the focus to the element that opened it', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      trigger.focus();
      const { rerender } = open();
      rerender(<Modal open={false} onCancel={() => {}} title="x">contenido</Modal>);
      expect(document.activeElement).toBe(trigger);
      trigger.remove();
    });
  });
});

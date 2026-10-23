import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './index';

describe('Alert', () => {
  it('is a danger alert announced right away by default', () => {
    render(<Alert>Algo falló</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('alert', 'alert--danger');
    expect(screen.getByRole('alert')).toHaveTextContent('Algo falló');
  });

  it('announces success politely', () => {
    render(<Alert tone="success">Listo</Alert>);
    expect(screen.getByRole('status')).toHaveClass('alert--success');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('merges className and lets the caller override the role', () => {
    render(<Alert className="mine" role="note">x</Alert>);
    expect(screen.getByRole('note')).toHaveClass('alert', 'mine');
  });
});

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import AccessibilityChoice from './AccessibilityChoice';

// Render the translation keys as text so the test does not depend on the language files.
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const PENDING = 'addresses.access.pendingShort';
const YES = 'addresses.access.yesShort';
const NO = 'addresses.access.noShort';

describe('AccessibilityChoice', () => {
  it('shows the three options under a title', () => {
    render(<AccessibilityChoice value={null} onChange={() => {}} />);
    expect(screen.getByText('addresses.columns.accessibility')).toBeInTheDocument();
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([PENDING, YES, NO]);
  });

  it.each([
    [null, PENDING, 'btn--tone-neutral'],
    [true, YES, 'btn--tone-success'],
    [false, NO, 'btn--tone-danger'],
  ] as const)('value=%s marks only its option, tinted with the matching tone', (value, label, toneClass) => {
    render(<AccessibilityChoice value={value} onChange={() => {}} />);
    const active = screen.getByRole('button', { name: label });
    expect(active).toHaveAttribute('aria-pressed', 'true');
    expect(active).toHaveClass('btn--soft', toneClass);
    const others = screen.getAllByRole('button').filter((b) => b !== active);
    for (const other of others) {
      expect(other).toHaveAttribute('aria-pressed', 'false');
      expect(other).toHaveClass('btn--outline');
    }
  });

  it('treats undefined as pending', () => {
    render(<AccessibilityChoice value={undefined as unknown as null} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: PENDING })).toHaveAttribute('aria-pressed', 'true');
  });

  it.each([
    [PENDING, null],
    [YES, true],
    [NO, false],
  ] as const)('clicking "%s" reports %s', (label, expected) => {
    const onChange = vi.fn();
    render(<AccessibilityChoice value={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(onChange).toHaveBeenCalledWith(expected);
  });

  it('never submits a surrounding form', () => {
    render(<AccessibilityChoice value={null} onChange={() => {}} />);
    for (const b of screen.getAllByRole('button')) expect(b).toHaveAttribute('type', 'button');
  });
});

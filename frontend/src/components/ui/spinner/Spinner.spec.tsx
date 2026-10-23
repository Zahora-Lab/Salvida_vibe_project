import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Spinner } from './index';

const spinner = (ui: React.ReactElement) => render(ui).container.firstElementChild as HTMLElement;

describe('Spinner', () => {
  it('is decorative and uses the primary tone by default', () => {
    const el = spinner(<Spinner />);
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveClass('spinner', 'spinner--primary');
  });

  it.each(['primary', 'current'] as const)('applies tone="%s"', (tone) => {
    expect(spinner(<Spinner tone={tone} />)).toHaveClass(`spinner--${tone}`);
  });

  it('sets the size through its token, reading a number as px', () => {
    expect(spinner(<Spinner size={16} />).style.getPropertyValue('--spinner-size')).toBe('16px');
    expect(spinner(<Spinner size="1em" />).style.getPropertyValue('--spinner-size')).toBe('1em');
  });

  it('leaves the size token alone by default', () => {
    expect(spinner(<Spinner />).style.getPropertyValue('--spinner-size')).toBe('');
  });
});

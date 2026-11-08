import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from './index';

const renderSkeleton = (props = {}) => render(<Skeleton {...props} />).container.firstElementChild as HTMLElement;

describe('Skeleton', () => {
  it('is hidden from assistive tech', () => {
    expect(renderSkeleton()).toHaveAttribute('aria-hidden', 'true');
  });

  it('reads a number as px and a string as written', () => {
    const el = renderSkeleton({ width: 180, height: '10rem' });
    expect(el.style.width).toBe('180px');
    expect(el.style.height).toBe('10rem');
  });

  it('sets the radius through its token', () => {
    const el = renderSkeleton({ radius: '1rem' });
    expect(el.style.getPropertyValue('--skeleton-radius')).toBe('1rem');
  });

  it('does not set a radius token by default', () => {
    expect(renderSkeleton().style.getPropertyValue('--skeleton-radius')).toBe('');
  });

  it('merges className and style', () => {
    const el = renderSkeleton({ className: 'mine', style: { margin: '0 auto' }, width: 40 });
    expect(el).toHaveClass('skeleton', 'mine');
    expect(el).toHaveStyle({ margin: '0 auto', width: '40px' });
  });
});

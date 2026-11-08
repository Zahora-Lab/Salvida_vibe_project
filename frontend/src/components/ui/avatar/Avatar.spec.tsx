import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from './index';

describe('Avatar', () => {
  it('shows the children when there is no image', () => {
    render(<Avatar>AB</Avatar>);
    expect(screen.getByText('AB')).toHaveClass('avatar', 'avatar--primary');
  });

  it('shows the image instead of the children', () => {
    render(<Avatar src="/me.png" alt="Ana">AB</Avatar>);
    expect(screen.getByRole('img', { name: 'Ana' })).toHaveAttribute('src', '/me.png');
    expect(screen.queryByText('AB')).not.toBeInTheDocument();
  });

  it.each(['primary', 'solid'] as const)('applies tone="%s"', (tone) => {
    render(<Avatar tone={tone}>x</Avatar>);
    expect(screen.getByText('x')).toHaveClass(`avatar--${tone}`);
  });

  it('sets the size through its token, reading a number as px', () => {
    const { rerender } = render(<Avatar size={48}>x</Avatar>);
    expect(screen.getByText('x').style.getPropertyValue('--avatar-size')).toBe('48px');
    rerender(<Avatar size="3.5rem">x</Avatar>);
    expect(screen.getByText('x').style.getPropertyValue('--avatar-size')).toBe('3.5rem');
  });

  it('leaves the size token alone by default so a class can set it', () => {
    render(<Avatar>x</Avatar>);
    expect(screen.getByText('x').style.getPropertyValue('--avatar-size')).toBe('');
  });

  it('merges className', () => {
    render(<Avatar className="mine">x</Avatar>);
    expect(screen.getByText('x')).toHaveClass('avatar', 'mine');
  });
});

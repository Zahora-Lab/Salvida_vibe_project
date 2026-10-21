import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'dashed' | 'danger';
export type ButtonSize = 'lg' | 'md' | 'sm' | 'xs';

interface ButtonCommonProps {
  variant?: ButtonVariant;
  /** Same scale as `Input`, so a field and its button line up. */
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Icon rendered before the label. */
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

type NativeButtonProps = ButtonCommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonCommonProps> & {
    /** Disables the button and sets `aria-busy` while an action is running. */
    loading?: boolean;
    to?: undefined;
  };

type LinkButtonProps = ButtonCommonProps & {
  /** Renders a router `Link` that looks like a button. */
  to: string;
  state?: unknown;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  'aria-label'?: string;
  title?: string;
};

export type ButtonProps = NativeButtonProps | LinkButtonProps;

/** Action button. `type` defaults to "button" so it never submits a form by accident. */
export default function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', fullWidth = false, icon, className, children } = props;
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const content = (
    <>
      {icon}
      {children}
    </>
  );

  if (props.to !== undefined) {
    return (
      <Link
        to={props.to}
        state={props.state}
        onClick={props.onClick}
        aria-label={props['aria-label']}
        title={props.title}
        className={classes}
      >
        {content}
      </Link>
    );
  }

  const {
    loading,
    type = 'button',
    disabled,
    variant: _variant,
    size: _size,
    fullWidth: _fullWidth,
    icon: _icon,
    className: _className,
    children: _children,
    to: _to,
    ...rest
  } = props;

  return (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {content}
    </button>
  );
}

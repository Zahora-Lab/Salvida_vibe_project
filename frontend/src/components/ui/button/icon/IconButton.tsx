import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode, Ref } from 'react';
import { Link } from 'react-router-dom';
import './IconButton.css';

/** What the button turns into on hover. */
export type IconButtonTone = 'neutral' | 'primary' | 'danger';
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface IconButtonCommonProps {
  /** Accessible name and tooltip. Required because the button has no visible text. */
  label: string;
  icon: ReactNode;
  tone?: IconButtonTone;
  /** Padding around the icon, so the box grows with the icon you pass. */
  size?: IconButtonSize;
  className?: string;
}

type NativeIconButtonProps = IconButtonCommonProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    keyof IconButtonCommonProps | 'children' | 'aria-label' | 'title'
  > & {
    /** React 19 passes `ref` as a regular prop. */
    ref?: Ref<HTMLButtonElement>;
    to?: undefined;
  };

type LinkIconButtonProps = IconButtonCommonProps & {
  /** Renders a router `Link` that looks like an icon button. */
  to: string;
  state?: unknown;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export type IconButtonProps = NativeIconButtonProps | LinkIconButtonProps;

/** Borderless, icon-only action. `type` defaults to "button" so it never submits a form. */
export default function IconButton(props: IconButtonProps) {
  const { label, icon, tone = 'neutral', size = 'sm', className } = props;
  const classes = ['icon-btn', `icon-btn--${tone}`, `icon-btn--${size}`, className]
    .filter(Boolean)
    .join(' ');

  if (props.to !== undefined) {
    return (
      <Link
        to={props.to}
        state={props.state}
        onClick={props.onClick}
        aria-label={label}
        title={label}
        className={classes}
      >
        {icon}
      </Link>
    );
  }

  const {
    type = 'button',
    label: _label,
    icon: _icon,
    tone: _tone,
    size: _size,
    className: _className,
    to: _to,
    ...rest
  } = props;

  return (
    <button {...rest} type={type} aria-label={label} title={label} className={classes}>
      {icon}
    </button>
  );
}

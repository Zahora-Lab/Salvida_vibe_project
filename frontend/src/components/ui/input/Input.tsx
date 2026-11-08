import { forwardRef } from 'react';
import BaseInput, { type BaseInputProps } from './base/BaseInput';
import PasswordInput, { type PasswordInputProps } from './types/password/PasswordInput';

/**
 * Types that need no dedicated behavior: they render the bare input.
 * Deliberately excluded: `file` (hidden input driven by a button, nothing to style),
 * `date`/`time` (use DateInput/TimeInput) and `checkbox`/`radio` (different control).
 */
export type PlainInputType = 'text' | 'email' | 'tel' | 'url' | 'number' | 'search';

type PasswordProps = PasswordInputProps & { type: 'password' };
type PlainProps = Omit<BaseInputProps, 'type'> & { type?: PlainInputType };

export type InputProps = PasswordProps | PlainProps;

/**
 * Single entry point for text-like fields. Picks the right implementation from
 * `type`; types with their own behavior live under `./types/<type>/`.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  if (props.type === 'password') {
    const { type, ...passwordProps } = props;
    void type;
    return <PasswordInput ref={ref} {...passwordProps} />;
  }
  return <BaseInput ref={ref} {...props} />;
});

export default Input;

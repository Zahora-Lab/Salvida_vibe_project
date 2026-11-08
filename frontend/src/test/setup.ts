import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom does not implement the modal part of <dialog>; this mirrors what the browser does
// for the pieces our code relies on (the `open` attribute and the `close` event).
if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

afterEach(() => {
  cleanup();
});

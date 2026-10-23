import { describe, expect, it } from 'vitest';
import { STATUS_TONE } from './statusTone';

describe('STATUS_TONE', () => {
  it('gives every booking status a tone', () => {
    expect(STATUS_TONE).toEqual({
      Approved: 'success',
      Pending: 'warning',
      Completed: 'neutral',
      Cancelled: 'danger',
      SignPending: 'info',
    });
  });
});

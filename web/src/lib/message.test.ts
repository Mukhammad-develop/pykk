import { describe, expect, it } from 'vitest'
import { buildClientMessage } from './message'
import { SETTING_DEFAULTS } from './settings'

describe('buildClientMessage', () => {
  it('fills every placeholder of the default template', () => {
    const message = buildClientMessage(SETTING_DEFAULTS.client_message_template, {
      ownerName: 'Jane',
      businessName: 'Fade & Co.',
      reference: 'JK891P',
      amountPence: 499,
      dueDate: '2026-10-02',
      payUrl: 'https://admin.pykk.uk/pay/JK891P?t=tok123',
    })
    expect(message).toBe(
      'Hi Jane, your PYKK payment #JK891P for Fade & Co. (£4.99) is due on 2nd October 2026. You can pay securely here: https://admin.pykk.uk/pay/JK891P?t=tok123. Thank you!',
    )
  })

  it('greets politely when the owner name is missing', () => {
    const message = buildClientMessage('Hi {owner_name}!', {
      ownerName: null,
      businessName: 'X',
      reference: 'R',
      amountPence: 0,
      dueDate: '2026-01-01',
      payUrl: 'u',
    })
    expect(message).toBe('Hi there!')
  })
})

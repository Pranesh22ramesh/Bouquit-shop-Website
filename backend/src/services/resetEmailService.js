const { env } = require('../config/env');
const { ApiError } = require('../utils/apiError');
const assertResetDelivery = () => {
  if (env.nodeEnv === 'test') return;
  if (!process.env.RESEND_API_KEY || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(process.env.MAIL_FROM || '')) {
    throw new ApiError(503, 'Password reset is temporarily unavailable. Please contact the shop.');
  }
};
const sendResetEmail = async (email, token) => {
  if (env.nodeEnv === 'test') return;
  const link = `${env.frontendUrl.replace(/\/$/, '')}/reset-password/${token}`;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.MAIL_FROM, to: [email], subject: 'Reset your Midhunyas Petals password', text: `Use this link within 30 minutes to reset your password:\n\n${link}\n\nIf you did not request this change, ignore this email.` }),
    });
    if (!response.ok) { console.error('[EMAIL] Reset delivery rejected', { status: response.status }); throw new Error('Reset delivery failed'); }
  } catch (error) {
    // Provider response bodies and reset URLs can contain secrets, so do not log them.
    console.error('[EMAIL] Reset delivery failed', { name: error.name, stack: error.stack });
    throw new ApiError(503, 'Password reset is temporarily unavailable. Please try again later.');
  }
};
module.exports = { assertResetDelivery, sendResetEmail };

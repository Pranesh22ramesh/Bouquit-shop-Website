const crypto = require('crypto');
const { addClient, removeClient, assertCapacity } = require('../services/realtimeRelayService');

const stream = (req, res) => {
  const clientId = crypto.randomUUID();
  const userId = req.user.id;
  assertCapacity(userId);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  addClient(userId, clientId, res);
  const expiry = setTimeout(() => res.end(), Math.max(1, req.tokenExpiresAt - Date.now()));

  res.write(`event: connected\ndata: ${JSON.stringify({ userId, connectedAt: new Date().toISOString() })}\n\n`);

  const heartbeat = setInterval(() => {
    try {
      res.write(`event: heartbeat\ndata: ${JSON.stringify({ at: Date.now() })}\n\n`);
    } catch (error) {
      clearInterval(heartbeat);
    }
  }, 25000);

  res.on('close', () => {
    clearTimeout(expiry);
    clearInterval(heartbeat);
    removeClient(userId, clientId);
    res.end();
  });
};

module.exports = {
  stream,
};

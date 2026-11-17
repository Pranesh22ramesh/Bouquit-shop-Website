const clientsByUserId = new Map();
const { env } = require('../config/env');
const { ApiError } = require('../utils/apiError');
const assertCapacity = (userId) => {
  const total = [...clientsByUserId.values()].reduce((sum, clients) => sum + clients.size, 0);
  if ((clientsByUserId.get(userId)?.size || 0) >= env.streamMaxPerUser || total >= env.streamMaxTotal) throw new ApiError(429, 'Too many open connections');
};
const disconnectUser = (userId) => {
  clientsByUserId.get(userId)?.forEach((res) => res.end());
  clientsByUserId.delete(userId);
};

const formatEvent = (event, payload = {}) => `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;

const addClient = (userId, clientId, res) => {
  const clients = clientsByUserId.get(userId) || new Map();
  clients.set(clientId, res);
  clientsByUserId.set(userId, clients);
};

const removeClient = (userId, clientId) => {
  const clients = clientsByUserId.get(userId);
  if (!clients) return;

  clients.delete(clientId);
  if (clients.size === 0) {
    clientsByUserId.delete(userId);
  }
};

const pushEventToUser = (userId, event, payload = {}) => {
  const clients = clientsByUserId.get(userId);
  if (!clients?.size) return;

  const message = formatEvent(event, payload);

  clients.forEach((res, clientId) => {
    try {
      res.write(message);
    } catch (error) {
      removeClient(userId, clientId);
    }
  });
};

module.exports = {
  assertCapacity,
  disconnectUser,
  addClient,
  removeClient,
  pushEventToUser,
};

import { getAccessToken } from "./authStorage";

const getApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_BASE_URL;
  return configured || `${window.location.origin}/api`;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseSseChunk = (chunk) => {
  const payload = { event: "message", data: null };
  const lines = chunk.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line || line.startsWith(":")) continue;

    if (line.startsWith("event:")) {
      payload.event = line.slice(6).trim();
    }

    if (line.startsWith("data:")) {
      const nextValue = line.slice(5).trim();
      try {
        payload.data = JSON.parse(nextValue);
      } catch (error) {
        payload.data = nextValue;
      }
    }
  }

  return payload;
};

export const startPrivateRealtime = ({ onEvent, onAuthExpired, onError }) => {
  let stopped = false;
  let controller = null;

  const connect = async () => {
    while (!stopped) {
      const token = getAccessToken();

      if (!token) {
        await delay(1500);
        continue;
      }

      controller = new AbortController();

      try {
        const response = await fetch(`${getApiBaseUrl()}/events/stream`, {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
          const recovered = await onAuthExpired?.();
          if (recovered) continue;
          throw new Error("Private realtime authorization failed");
        }

        if (!response.ok || !response.body) {
          throw new Error(`Private realtime connection failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!stopped) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() || "";

          for (const chunk of chunks) {
            const parsed = parseSseChunk(chunk);
            onEvent?.(parsed);
          }
        }
      } catch (error) {
        if (stopped || error.name === "AbortError") return;
        onError?.(error);
      }

      if (!stopped) {
        await delay(2000);
      }
    }
  };

  connect();

  return () => {
    stopped = true;
    controller?.abort();
  };
};

// Logger service: attempts to POST logs to metrics backend
// If backend is unreachable, queue logs in localStorage and retry later.

const LOG_QUEUE_KEY = "error_log_queue";
const METRICS_BASE = "https://metrics.sportifyinsider.com";
const LOG_ENDPOINT = `${METRICS_BASE}/logs`;

const buildPayload = (err, context = {}) => ({
  message: err?.message || String(err) || "Unknown error",
  stack: err?.stack || null,
  context: context || {},
  time: new Date().toISOString(),
  url: typeof window !== "undefined" ? window.location.href : null,
  userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
});

export const enqueueLog = (payload) => {
  try {
    const q = JSON.parse(localStorage.getItem(LOG_QUEUE_KEY) || "[]");
    q.push(payload);
    localStorage.setItem(LOG_QUEUE_KEY, JSON.stringify(q));
  } catch (e) {
    console.error("Failed to enqueue log:", e);
  }
};

export const flushQueuedLogs = async () => {
  try {
    const q = JSON.parse(localStorage.getItem(LOG_QUEUE_KEY) || "[]");
    if (!Array.isArray(q) || q.length === 0) return;

    // send logs one by one to avoid large payloads and allow partial success
    const remaining = [];
    for (const item of q) {
      try {
        await fetch(LOG_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
          credentials: "include",
        });
      } catch (e) {
        // keep for later
        remaining.push(item);
      }
    }

    localStorage.setItem(LOG_QUEUE_KEY, JSON.stringify(remaining));
  } catch (e) {
    console.error("Failed to flush queued logs:", e);
  }
};

export const logError = async (err, context = {}) => {
  const payload = buildPayload(err, context);

  // Always print to console for immediate visibility
  console.error("[Logger]", payload);

  try {
    await fetch(LOG_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
  } catch (e) {
    // On failure, enqueue for later delivery
    enqueueLog(payload);
  }
};

const logger = { logError, flushQueuedLogs, enqueueLog };

export default logger;

// Logger service: prevents CPU freeze by disabling remote /logs calls for now.
// Remote logs can be re-enabled later when the /logs endpoint is ready.

const ENABLE_REMOTE_LOGS = false; // 🚨 turn ON later when backend /logs exists
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
  // 🔥 disable sending queued logs to backend (prevents infinite retries)
  if (!ENABLE_REMOTE_LOGS) return;

  try {
    const q = JSON.parse(localStorage.getItem(LOG_QUEUE_KEY) || "[]");
    if (!Array.isArray(q) || q.length === 0) return;

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

  // Always show error instantly in console for debugging
  console.error("[Logger]", payload);

  // 🔥 block POST requests to /logs completely
  if (!ENABLE_REMOTE_LOGS) return;

  try {
    await fetch(LOG_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
  } catch (e) {
    enqueueLog(payload);
  }
};

const logger = { logError, flushQueuedLogs, enqueueLog };
export default logger;

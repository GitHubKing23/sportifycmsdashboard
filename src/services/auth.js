import { authApi } from "./api";
import { logError } from "./logger";

// NOTE: These endpoints are assumed to exist on your backend.
// - POST /auth/nonce { address } -> { nonce }
// - POST /auth/verify { address, signature } -> { token, user }
// If your backend uses different routes/payloads, update these functions accordingly.

export const requestNonce = async (address) => {
  try {
  const res = await authApi.post("/auth/nonce", { address });
    return res.data;
  } catch (err) {
    // Log rich axios error info to help diagnose Network / CORS issues
    try {
      const info = {
        message: err.message,
        code: err.code,
        isAxiosError: err.isAxiosError,
        config: err.config && { url: err.config.url, method: err.config.method, baseURL: err.config.baseURL },
        request: Boolean(err.request),
        response: err.response && { status: err.response.status, data: err.response.data },
      };
      console.error("❌ requestNonce failed (detailed):", info);
      await logError(err, { op: "requestNonce", address, debug: info });
    } catch (logErr) {
      console.error("Failed writing detailed auth error to logger:", logErr);
    }
    throw err;
  }
};

export const verifySignature = async (address, signature) => {
  try {
  const res = await authApi.post("/auth/verify", { address, signature });
    return res.data;
  } catch (err) {
    try {
      const info = {
        message: err.message,
        code: err.code,
        isAxiosError: err.isAxiosError,
        config: err.config && { url: err.config.url, method: err.config.method, baseURL: err.config.baseURL },
        request: Boolean(err.request),
        response: err.response && { status: err.response.status, data: err.response.data },
      };
      console.error("❌ verifySignature failed (detailed):", info);
      await logError(err, { op: "verifySignature", address, debug: info });
    } catch (logErr) {
      console.error("Failed writing detailed auth error to logger:", logErr);
    }
    throw err;
  }
};

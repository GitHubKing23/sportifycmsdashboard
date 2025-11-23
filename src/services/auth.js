
import { authApi } from "./api";
import { logError } from "./logger";

const logAxiosFailure = async (err, context) => {
  try {
    const info = {
      message: err.message,
      code: err.code,
      isAxiosError: err.isAxiosError,
      config:
        err.config && {
          url: err.config.url,
          method: err.config.method,
          baseURL: err.config.baseURL,
        },
      request: Boolean(err.request),
      response:
        err.response && {
          status: err.response.status,
          data: err.response.data,
        },
    };
    console.error(`❌ ${context.op} failed (detailed):`, info);
    await logError(err, { ...context, debug: info });
  } catch (logErr) {
    console.error("Failed writing detailed auth error to logger:", logErr);
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const res = await authApi.post("/login", { email, password });
    return res.data;
  } catch (err) {
    await logAxiosFailure(err, { op: "loginWithEmail", email });
    throw err;
  }
};

export const refreshSession = async (refreshToken) => {
  try {
    // 🔥 FIXED: AUTH BACKEND USES /refresh, NOT /api/auth/refresh
    const res = await authApi.post("/api/auth/refresh", { refreshToken });
    return res.data;
  } catch (err) {
    console.warn("⚠ refresh failed — continuing without refresh instead of forcing logout");
    await logAxiosFailure(err, { op: "refreshSession" });

    // ⛔ Do NOT throw — prevents login redirect loop
    return null;
  }
};

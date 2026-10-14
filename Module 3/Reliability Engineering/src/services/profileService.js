const DEFAULT_AVATAR = {
  url: 'https://cdn.aurora-profiles.dev/avatars/default.png',
  initials: '?',
  source: 'fallback',
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryable(error) {
  const status = error?.status ?? error?.response?.status;

  // AbortError = timeout
  if (error?.name === 'AbortError') {
    return true;
  }

  // Network error = no HTTP status
  if (status === undefined || status === null) {
    return true;
  }

  // 429 = Too Many Requests
  if (status === 429) {
    return true;
  }

  // 5xx = server errors
  if (status >= 500 && status <= 599) {
    return true;
  }

  // Other 4xx errors are NOT retryable
  return false;
}

async function withTimeout(operation, timeoutMs) {
  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await operation(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry(operation, options = {}) {
  const maxAttempts = options.maxAttempts || 3;
  const baseDelayMs = options.baseDelayMs || 25;

  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Do not retry non-retryable errors
      if (!isRetryable(error)) {
        throw error;
      }

      // No more attempts left
      if (attempt === maxAttempts - 1) {
        throw error;
      }

      // Exponential backoff
      const delay = baseDelayMs * 2 ** attempt;

      await sleep(delay);
    }
  }

  throw lastError;
}

async function getProfileWithAvatar(authorId, avatarClient, options = {}) {
  const timeoutMs = options.timeoutMs || 200;
  const maxAttempts = options.maxAttempts || 3;
  const baseDelayMs = options.baseDelayMs || 25;

  try {
    const avatar = await withRetry(
      () =>
        withTimeout(
          signal =>
            avatarClient.getAvatar(authorId, {
              signal,
            }),
          timeoutMs
        ),
      {
        maxAttempts,
        baseDelayMs,
      }
    );

    return {
      authorId,
      avatar,
      degraded: false,
    };
  } catch (error) {
    return {
      authorId,
      avatar: DEFAULT_AVATAR,
      degraded: true,
    };
  }
}

module.exports = {
  DEFAULT_AVATAR,
  sleep,
  isRetryable,
  withTimeout,
  withRetry,
  getProfileWithAvatar,
};
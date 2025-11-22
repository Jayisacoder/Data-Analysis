const API_URL = 'https://api.openai.com/v1/chat/completions';

export async function openaiChat(payload, options = {}) {
  const apiKey = options.apiKey || getApiKey();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Add it to .env.local or your hosting provider.');
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  if (!res.ok) {
    const detail = safeDetail(text) || res.statusText;
    throw new Error(`OpenAI request failed: ${detail}`);
  }

  try {
    return JSON.parse(text);
  } catch (_) {
    return { raw: text };
  }
}

function getApiKey() {
  if (typeof process !== 'undefined') {
    return (
      process.env.OPENAI_API_KEY ||
      process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
      process.env.VITE_OPENAI_API_KEY ||
      process.env.NEXT_PUBLIC_VITE_OPENAI_API_KEY
    );
  }
  return undefined;
}

function safeDetail(raw) {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    return parsed?.error?.message || parsed?.detail || raw;
  } catch (_) {
    return raw;
  }
}

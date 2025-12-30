
export function assert(condition, message) {
  if (!condition) {
    console.error("❌ Test failed:", message);
    process.exit(1);
  }
}

export async function request(path, options = {}) {
  const res = await fetch(`http://localhost:3001${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return { status: res.status, body };
}

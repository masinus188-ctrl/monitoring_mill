export class ApiError extends Error { constructor(m, status) { super(m); this.status = status } }

// a = nama aksi di api.php, params = query string, body = JSON (POST), csrf = token untuk aksi tulis
export async function api(a, params = {}, body = null, csrf = '') {
  const r = await fetch('api.php?' + new URLSearchParams({ a, ...params }), {
    method: body ? 'POST' : 'GET', credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json', 'X-CSRF': csrf } : {},
    body: body ? JSON.stringify(body) : undefined })
  const j = await r.json().catch(() => ({ error: 'Respons server tidak valid' }))
  if (!r.ok) throw new ApiError(j.error || 'HTTP ' + r.status, r.status)
  return j
}

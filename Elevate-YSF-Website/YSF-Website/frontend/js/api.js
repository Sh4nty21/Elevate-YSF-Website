// ============================================================
// API WRAPPER
// ------------------------------------------------------------
// Every backend call goes through here so there is exactly one
// place to change the API base URL when you deploy.
//
// LOCAL DEV (XAMPP/Laragon): leave as '/backend'  if the frontend
// and backend folders sit side by side under the same web root.
//
// SEPARATE HOSTING (frontend on Netlify/Vercel/GitHub Pages,
// backend on a PHP host): set this to the full backend URL, e.g.
//   'https://api.yourchurchdomain.com/backend'
// ============================================================
export const API_BASE =
  window.YSF_API_BASE || '/Elevate-YSF-Website/YSF-Website/backend';

let csrfToken = null;

async function request(path, { method = 'GET', body = null, auth = false } = {}) {
  const headers = {};
  let payload = body;

  if (body instanceof FormData) {
    // let the browser set the multipart boundary
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

  let res;
  try {
    res = await fetch(`${API_BASE}/${path}`, {
      method,
      headers,
      body: method === 'GET' ? undefined : payload,
      credentials: 'include', // send the PHP session cookie
    });
  } catch (networkErr) {
    return {
      success: false,
      message:
        "Can't reach the server right now. Check your internet connection, or the site admin needs to verify the backend is deployed.",
    };
  }

  let data;
  try {
    data = await res.json();
  } catch {
    return {
      success: false,
      message: `Unexpected server response (HTTP ${res.status}). The backend may not be configured yet.`,
    };
  }

  if (data.csrf_token) csrfToken = data.csrf_token;

  if (res.status === 401 && auth) {
    window.dispatchEvent(new CustomEvent('ysf:unauthorized'));
  }

  return data;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body, ...opts }),
  async fetchCsrf() {
    const data = await request('csrf.php');
    return data.csrf_token || null;
  },
};

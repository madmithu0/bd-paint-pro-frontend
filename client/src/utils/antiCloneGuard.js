// Anti-Clone Domain Lock & DevTools/Copy Protection (v3.8.1)

const ALLOWED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '.onrender.com', // Your Render staging/live domain
  'yourdomain.com', // Replace with your official domain
  '://yourdomain.com',
];

const OFFICIAL_REDIRECT_URL = 'https://yourdomain.com';

export function initAntiCloneProtection() {
  if (typeof window === 'undefined') return;

  const currentHost = window.location.hostname.toLowerCase();

  // 1. Domain Lock Verification
  const isAuthorizedDomain = ALLOWED_DOMAINS.some((domain) => {
    if (domain.startsWith('.')) {
      return currentHost.endsWith(domain);
    }
    return currentHost === domain;
  });

  if (!isAuthorizedDomain) {
    // Wipe cloned DOM and redirect to official domain
    document.body.innerHTML = '';
    window.location.replace(OFFICIAL_REDIRECT_URL);
    return;
  }

  // 2. Production-only Copy & DevTools Shortcut Guard
  if (import.meta.env.PROD) {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    document.addEventListener('keydown', (e) => {
      const key = e.key.toUpperCase();
      // Block F12, Ctrl+Shift+I/J/C, Ctrl+U (View Source), Ctrl+S (Save Page)
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(key)) ||
        (e.ctrlKey && ['U', 'S'].includes(key))
      ) {
        e.preventDefault();
      }
    });
  }
}

export function getServerUrl() {
  const base_url = new URL(window.location.origin);
  base_url.port = 3001;
  return base_url;
}

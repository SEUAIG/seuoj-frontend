export function loginDestination(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || /[\\\x00-\x20]/.test(next)) {
    return "/home";
  }
  const url = new URL(next, "https://seuoj.best");
  if (url.origin !== "https://seuoj.best" || /^\/(login|signup|forget)(\/|$)/.test(url.pathname)) {
    return "/home";
  }
  return url.pathname + url.search + url.hash;
}

export function loginPath(path: string): string {
  return `/login?${new URLSearchParams({ next: loginDestination(path) })}`;
}

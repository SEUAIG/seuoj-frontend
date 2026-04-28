import { resetAuth } from "@/features/auth/authSlice";

let store: any;
let purge: (() => Promise<void>) | null = null;
let handlingUnauthorized = false;

export const injectAuthStore = (_store: any, _purge?: () => Promise<void>) => {
  store = _store;
  if (_purge) purge = _purge;
};

export const getAuthToken = (): string | undefined => {
  return store?.getState?.()?.auth?.jwt;
};

export const handleUnauthorized = () => {
  if (!store || handlingUnauthorized) return;
  handlingUnauthorized = true;
  try {
    store.dispatch(resetAuth());
    if (purge) {
      void purge();
    }
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      const from = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const next = encodeURIComponent(from || "/");
      window.location.replace(`/login?next=${next}`);
    }
  } finally {
    setTimeout(() => {
      handlingUnauthorized = false;
    }, 500);
  }
};

export const handleUnauthorizedByStatus = (status?: number) => {
  if (status === 401) handleUnauthorized();
};

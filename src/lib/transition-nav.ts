type VT = { finished: Promise<void>; skipTransition: () => void };

export function isReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true
  );
}

export function supportsViewTransition(): boolean {
  return (
    typeof document !== "undefined" &&
    "startViewTransition" in document &&
    !isReducedMotion()
  );
}

export async function navigateWithTransition(
  navigate: () => Promise<unknown> | void
): Promise<void> {
  if (!supportsViewTransition()) {
    await navigate();
    return;
  }
  const doc = document as Document & {
    startViewTransition: (cb: () => Promise<unknown>) => VT;
  };
  const vt = doc.startViewTransition(() => {
    try {
      return Promise.resolve().then(navigate);
    } catch {
      return Promise.resolve();
    }
  });
  try {
    await vt.finished;
  } catch {
    // Đã bị huỷ (điều hướng nhanh liên tiếp) — bỏ qua.
  }
}
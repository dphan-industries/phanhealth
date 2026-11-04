/** Register only in production; verify every required resource rather than trusting registration. */
export function monitorOffline(
  onReady: (ready: boolean) => void,
  onError: (message: string) => void,
) {
  if (process.env.NODE_ENV !== "production") return () => {};
  let disposed = false;
  let registration: ServiceWorkerRegistration | undefined;
  const channels = new Set<MessageChannel>();
  const timeout = window.setTimeout(() => {
    if (!disposed)
      onError(
        "Offline preload could not be verified. Keep a connection, then reload to retry.",
      );
  }, 20000);
  async function verify() {
    if (disposed || !registration?.active) return;
    const channel = new MessageChannel();
    channels.add(channel);
    channel.port1.onmessage = (event) => {
      if (!disposed) {
        window.clearTimeout(timeout);
        onReady(event.data.ready === true);
        onError(
          event.data.ready
            ? ""
            : "Offline resources are incomplete. Guides may be unavailable after reload. Reconnect and reload to retry.",
        );
      }
      channel.port1.close();
      channels.delete(channel);
    };
    registration.active.postMessage({ type: "VERIFY" }, [channel.port2]);
  }
  async function register() {
    try {
      if (!("serviceWorker" in navigator))
        throw new Error("Service workers unsupported");
      await navigator.serviceWorker.register("/sw.js");
      registration = await navigator.serviceWorker.ready;
      await verify();
    } catch {
      window.clearTimeout(timeout);
      if (!disposed)
        onError(
          "Offline cache unavailable. This session requires a connection.",
        );
    }
  }
  const resume = () => {
    if (document.visibilityState === "visible") void verify();
  };
  document.addEventListener("visibilitychange", resume);
  navigator.serviceWorker?.addEventListener("controllerchange", verify);
  void register();
  return () => {
    disposed = true;
    window.clearTimeout(timeout);
    document.removeEventListener("visibilitychange", resume);
    navigator.serviceWorker?.removeEventListener("controllerchange", verify);
    for (const channel of channels) channel.port1.close();
  };
}

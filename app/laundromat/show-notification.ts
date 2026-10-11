/** Show a system notification that focuses this tab when clicked, doing nothing where the page cannot construct one. */
export function showNotification(options: {
  title: string;
  body: string;
  tag: string;
}) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }
  // Android Chrome only allows notifications from a service worker and throws here.
  try {
    const notification = new Notification(options.title, {
      body: options.body,
      tag: options.tag,
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {
    return;
  }
}

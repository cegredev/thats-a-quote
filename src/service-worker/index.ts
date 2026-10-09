import { self } from "$app/service-worker";

self.addEventListener("push", (event) => {
	const payload = event.data?.text() ?? "no payload";
	event.waitUntil(
		self.registration.showNotification("ServiceWorker Cookbook", {
			body: payload,
			icon: "/icon-192x192.png",
		}),
	);
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const url = event.notification.data?.url ?? "/";

	event.waitUntil(
		self.clients
			.matchAll({ type: "window", includeUncontrolled: true })
			.then((windows) => {
				for (const w of windows) {
					if (new URL(w.url).pathname === url && "focus" in w)
						return w.focus();
				}
				return self.clients.openWindow(url);
			}),
	);
});

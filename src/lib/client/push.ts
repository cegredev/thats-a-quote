async function getPublicKey(): Promise<string> {
	const res = await fetch("/api/push/key");
	if (!res.ok) throw new Error("Could not load push key");
	return (await res.json()).publicKey;
}

function urlBase64ToUint8Array(base64: string) {
	const padding = "=".repeat((4 - (base64.length % 4)) % 4);
	const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
	const raw = atob(b64);
	return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export async function subscribeToPush() {
	// ...support checks and permission request as before...
	const registration = await navigator.serviceWorker.ready;
	const publicKey = await getPublicKey();
	const applicationServerKey = urlBase64ToUint8Array(publicKey);

	let subscription = await registration.pushManager.getSubscription();

	// If the server's key ever changed (reset DB, new install), the old
	// subscription is useless. Detect that and resubscribe.
	if (
		subscription &&
		!keysMatch(
			subscription.options.applicationServerKey,
			applicationServerKey,
		)
	) {
		await subscription.unsubscribe();
		subscription = null;
	}

	if (!subscription) {
		subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey,
		});
	}

	await fetch("/api/push/subscribe", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(subscription.toJSON()),
	});

	return subscription;
}

function keysMatch(a: ArrayBuffer | null, b: Uint8Array) {
	if (!a) return false;
	const x = new Uint8Array(a);
	return x.length === b.length && x.every((v, i) => v === b[i]);
}

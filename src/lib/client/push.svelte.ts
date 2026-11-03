let _publicKey: string | undefined = $state(undefined);

async function getPublicKey(): Promise<string> {
	let publicKey: string;
	if (!_publicKey) {
		const res = await fetch("/api/push/key");
		if (!res.ok) throw new Error("Could not load push key");
		publicKey = (await res.json()).publicKey;
		_publicKey = publicKey;
	} else {
		publicKey = _publicKey;
	}
	return publicKey;
}

function urlBase64ToUint8Array(base64: string) {
	const padding = "=".repeat((4 - (base64.length % 4)) % 4);
	const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
	const raw = atob(b64);
	return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function isIOSDevice() {
	return (
		/iPad|iPhone|iPod/.test(navigator.userAgent) ||
		(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
	);
}

function isStandaloneApp() {
	const navigatorWithStandalone = navigator as Navigator & {
		standalone?: boolean;
	};
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		navigatorWithStandalone.standalone === true
	);
}

async function _getActivePushSubscription(publicKey?: string) {
	if (isIOSDevice() && !isStandaloneApp()) {
		return "install-pwa-first" as const;
	}

	// When debugging with adb, the service worker is not registered at first
	if (!navigator.serviceWorker) return "install-pwa-first" as const;

	const registration = await navigator.serviceWorker.ready;
	publicKey ??= await getPublicKey();
	const applicationServerKey = urlBase64ToUint8Array(publicKey).buffer;

	let subscription = await registration.pushManager.getSubscription();

	// Some browsers (including Firefox for Android) don't expose this key on
	// existing subscriptions, so only replace one when a reported key differs.
	if (
		subscription &&
		subscription.options.applicationServerKey &&
		!keysMatch(
			subscription.options.applicationServerKey,
			applicationServerKey,
		)
	) {
		await subscription.unsubscribe();
		subscription = null;
	}

	return { subscription, registration, applicationServerKey };
}

export async function getActivePushSubscription(publicKey?: string) {
	const result = await _getActivePushSubscription(publicKey);
	if (result === "install-pwa-first") return result;

	return result.subscription;
}

async function _makePushApiRequest(
	subscribe: boolean,
	subscription: PushSubscription,
) {
	await fetch("/api/push/subscribe", {
		method: subscribe ? "POST" : "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(subscription.toJSON()),
	});
}

export async function subscribeToPush() {
	const result = await _getActivePushSubscription();
	if (result === "install-pwa-first") throw new Error("install as PWA first");

	let { subscription, registration, applicationServerKey } = result;

	if (!subscription) {
		subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey,
		});
	}

	_makePushApiRequest(true, subscription);

	return subscription;
}

export async function unsubscribeFromPush() {
	const result = await _getActivePushSubscription();
	if (result === "install-pwa-first") throw new Error("install as PWA first");

	const { subscription } = result;
	if (!subscription) return;

	await subscription.unsubscribe();

	_makePushApiRequest(false, subscription);
}

function keysMatch(a: ArrayBuffer | null, b: ArrayBuffer) {
	if (!a) return false;
	const x = new Uint8Array(a);
	const y = new Uint8Array(b);
	return x.length === y.length && x.every((v, i) => v === y[i]);
}

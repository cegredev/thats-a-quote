<script lang="ts">
	import { subscribeToPush, unsubscribeFromPush } from "#lib/client/push.ts";
	import GeneralSwitch from "#lib/components/switch/GeneralSwitch.svelte";
	import type { PageProps } from "./$types";

	let data: PageProps = $props();

	$inspect("pushPermission", data.data.pushPermission);
</script>

<div class="flex flex-col items-center">
	<div class="card bg-base-200 flex flex-col justify-center h-20 w-full px-8">
		<GeneralSwitch
			labelText="Notifications"
			checked={data.data.pushPermission}
			onchange={async (evt) => {
				const checked = Boolean(evt.currentTarget.value);
				console.log("checked:", checked, evt.currentTarget.value);

				if (checked) {
					const notificationResult =
						await Notification.requestPermission();

					console.log("result:", notificationResult);

					await subscribeToPush();
				} else {
					await unsubscribeFromPush();
				}
			}}
		/>
	</div>
</div>

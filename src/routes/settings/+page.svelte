<script lang="ts">
	import { subscribeToPush, unsubscribeFromPush } from "#lib/client/push.ts";
	import GeneralSwitch from "#lib/components/switch/GeneralSwitch.svelte";
	import type { PageProps } from "./$types";
	import * as Card from "#lib/components_shadcn/ui/card/index.js";

	let data: PageProps = $props();

	$inspect("pushPermission", data.data.pushPermission);
</script>

<div class="flex flex-col items-center">
	<Card.Root class="flex h-20 w-full flex-col justify-center px-8">
		<GeneralSwitch
			labelText="Notifications"
			checked={data.data.pushPermission}
			onCheckedChange={async (checked) => {
				if (checked) {
					await Notification.requestPermission();
					await subscribeToPush();
				} else {
					await unsubscribeFromPush();
				}
			}}
		/>
	</Card.Root>
</div>

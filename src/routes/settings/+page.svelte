<script lang="ts">
	import { subscribeToPush, unsubscribeFromPush } from "#lib/client/push.ts";
	import type { PageProps } from "./$types";
	import * as Item from "#lib/components_shadcn/ui/item/index.js";
	import { Switch } from "#lib/components_shadcn/ui/switch/index.js";
	import LocaleSwitcher from "#lib/components/meta/LocaleSwitcher.svelte";

	let data: PageProps = $props();

	async function onChange(checked: boolean) {
		if (checked) {
			await Notification.requestPermission();
			await subscribeToPush();
		} else {
			await unsubscribeFromPush();
		}
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex w-full flex-col gap-6">
		<Item.Root variant="outline">
			<Item.Content>
				<Item.Title>Notifications</Item.Title>
				<Item.Description>
					Whether or not you will receive notifications for new
					quotes, comments, etc.
				</Item.Description>
			</Item.Content>
			<Item.Actions>
				<Switch
					aria-label={"notifications"}
					onCheckedChange={onChange}
					checked={data.data.pushPermission}
				/>
			</Item.Actions>
		</Item.Root>
	</div>

	<div class="flex w-full flex-col gap-6">
		<Item.Root variant="outline">
			<Item.Content>
				<Item.Title>Language</Item.Title>
				<Item.Description>
					Choose the language you want this app to be displayed in.
				</Item.Description>
			</Item.Content>
			<Item.Actions>
				<LocaleSwitcher />
			</Item.Actions>
		</Item.Root>
	</div>
</div>

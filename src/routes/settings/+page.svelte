<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import {
		subscribeToPush,
		unsubscribeFromPush,
	} from "#lib/client/push.svelte.ts";
	import type { PageProps } from "./$types";
	import * as Item from "#lib/components_shadcn/ui/item/index.js";
	import { Switch } from "#lib/components_shadcn/ui/switch/index.js";
	import LocaleSwitcher from "#lib/components/meta/LocaleSelect.svelte";
	import { Badge } from "#lib/components_shadcn/ui/badge/index.js";

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
				<Item.Title>{m.settings_notifications()}</Item.Title>
				<Item.Description>
					{m.settings_notificationsDescription()}
				</Item.Description>
				{#if !data.data.isLoggedIn}
					<Item.Footer>
						<Badge variant="destructive">
							{m.settings_logInToChange()}
						</Badge>
					</Item.Footer>
				{/if}
			</Item.Content>
			<Item.Actions>
				<Switch
					aria-label={m.settings_notificationsAriaLabel()}
					onCheckedChange={onChange}
					checked={data.data.pushPermission}
					disabled={!data.data.isLoggedIn}
				/>
			</Item.Actions>
		</Item.Root>
	</div>

	<div class="flex w-full flex-col gap-6">
		<Item.Root variant="outline">
			<Item.Content>
				<Item.Title>{m.settings_language()}</Item.Title>
				<Item.Description>
					{m.settings_languageDescription()}
				</Item.Description>
			</Item.Content>
			<Item.Actions>
				<LocaleSwitcher />
			</Item.Actions>
		</Item.Root>
	</div>
</div>

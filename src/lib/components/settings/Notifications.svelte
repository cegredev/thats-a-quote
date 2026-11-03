<script lang="ts">
	import {
		subscribeToPush,
		unsubscribeFromPush,
	} from "#lib/client/push.svelte.ts";
	import { Badge } from "#lib/shadcn/components/ui/badge/index.js";
	import RequireLoginShield from "#lib/components/meta/RequireLoginShield.svelte";
	import { Switch } from "#lib/shadcn/components/ui/switch/index.js";
	import * as Item from "#lib/shadcn/components/ui/item/index.js";
	import { toast } from "svelte-sonner";
	import { m } from "#lib/paraglide/messages.js";
	import { untrack } from "svelte";

	let {
		pushServiceEnabled,
		pushPermission,
	}: {
		pushServiceEnabled: boolean;
		pushPermission: boolean | "install-pwa-first";
	} = $props();

	let checked: boolean = $state(
		untrack(() =>
			pushPermission === "install-pwa-first" ? false : pushPermission,
		),
	);
</script>

<Item.Root variant="outline">
	<Item.Content>
		<Item.Title>{m.settings_notifications()}</Item.Title>
		<Item.Description class="line-clamp-none">
			{m.settings_notificationsDescription()}
		</Item.Description>
		{#if !pushServiceEnabled}
			<Item.Footer>
				<Badge variant="destructive">
					{m.settings_admin_needs_to_enable()}
				</Badge>
			</Item.Footer>
		{:else if pushPermission === "install-pwa-first"}
			<Item.Footer>
				<Badge variant="destructive">
					{m.push_install_as_pwa_first()}
				</Badge>
			</Item.Footer>
		{/if}
	</Item.Content>
	<Item.Actions>
		<RequireLoginShield>
			<Switch
				aria-label={m.settings_notificationsAriaLabel()}
				bind:checked
				onCheckedChange={async (_checked) => {
					if (_checked) {
						try {
							await Notification.requestPermission();
							await subscribeToPush();

							toast.success(m.settings_notificationsEnabled());
						} catch (e) {
							setTimeout(() => {
								checked = false;
								toast.error(m.settings_notificationsEnableFailed());
							}, 350);
						}
					} else {
						await unsubscribeFromPush();

						toast.success(m.settings_notificationsDisabled());
					}
				}}
				disabled={!pushServiceEnabled ||
					pushPermission === "install-pwa-first"}
			/>
		</RequireLoginShield>
	</Item.Actions>
</Item.Root>

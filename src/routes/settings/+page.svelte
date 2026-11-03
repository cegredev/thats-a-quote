<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import type { PageProps } from "./$types";
	import * as Item from "#lib/shadcn/components/ui/item/index.js";
	import LocaleSwitcher from "#lib/components/meta/LocaleSelect.svelte";
	import Button from "#lib/shadcn/components/ui/button/button.svelte";
	import { dontShowAgainStore } from "#lib/client/storage.svelte.ts";
	import { toast } from "svelte-sonner";
	import Notifications from "#lib/components/settings/Notifications.svelte";

	let data: PageProps = $props();
</script>

<div class="flex flex-col gap-4">
	<div class="flex w-full flex-col gap-6">
		<Notifications
			pushServiceEnabled={data.data.pushServiceEnabled}
			pushPermission={data.data.pushPermission}
		/>
	</div>

	<div class="flex w-full flex-col gap-6">
		<Item.Root variant="outline">
			<Item.Content>
				<Item.Title>{m.settings_language()}</Item.Title>
				<Item.Description class="line-clamp-none">
					{m.settings_languageDescription()}
				</Item.Description>
			</Item.Content>
			<Item.Actions>
				<LocaleSwitcher />
			</Item.Actions>
		</Item.Root>
	</div>

	<div class="flex w-full flex-col gap-6">
		<Item.Root variant="outline">
			<Item.Content>
				<Item.Title>{m.settings_resetDontShowAgain()}</Item.Title>
				<Item.Description class="line-clamp-none">
					{m.settings_resetDontShowAgainDescription()}
				</Item.Description>
			</Item.Content>
			<Item.Actions>
				<Button
					variant="destructive"
					onclick={() => {
						dontShowAgainStore.clear();

						toast.success("Reset don't show again");
					}}
				>
					{m.common_reset()}
				</Button>
			</Item.Actions>
		</Item.Root>
	</div>
</div>

<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { m } from "#lib/paraglide/messages.js";
	import { groupIDsStore } from "#lib/client/storage.svelte.js";
	import CopyButton from "#lib/components/util/CopyButton.svelte";
	import FormButton from "#lib/components/forms/FormButton.svelte";
	import GenericDialog from "#lib/components/dialogs/GenericDialog.svelte";
	import type { Group } from "#lib/zod-schemas.ts";

	let { group, totalQuotes }: { group: Group; totalQuotes: number } =
		$props();

	const groupId = page.params.id ?? "";

	let leaveDialogOpen: boolean = $state(false);
</script>

<div class="mb-6 flex items-start justify-between gap-4">
	<div>
		<h1 class="font-display text-2xl font-semibold">
			{group.name}
		</h1>

		<p class="text-sm text-muted-foreground">
			{m.group_quoteCount({
				count: totalQuotes,
				s:
					totalQuotes === 1
						? m.group_quoteSuffixOne()
						: m.group_quoteSuffix(),
			})}
		</p>
	</div>

	<div class="flex shrink-0 gap-2">
		<CopyButton
			content={window.location.href}
			copyText={m.group_copyLink()}
		/>

		{#if groupIDsStore.has(groupId) || leaveDialogOpen}
			<GenericDialog
				text={{
					trigger: m.group_leave(),
					title: m.group_leaveTitle(),
					description: m.group_leaveConfirm({
						name: group.name,
					}),
				}}
				bind:open={leaveDialogOpen}
			>
				{#snippet buttons()}
					<FormButton
						action="?/leaveGroup"
						serverRequiresUser
						text={m.group_leave()}
						variant="destructive"
						size="sm"
						onSuccess={async () => {
							groupIDsStore.remove(groupId);

							await goto("..");
						}}
						classes=""
					/>
				{/snippet}
			</GenericDialog>
		{:else}
			<FormButton
				text={m.group_join()}
				action="?/joinGroup"
				serverRequiresUser
				variant="ghost"
				size="sm"
				classes="text-green-700 hover:text-green-800"
				onSuccess={() => groupIDsStore.add(groupId)}
			/>
		{/if}
	</div>
</div>

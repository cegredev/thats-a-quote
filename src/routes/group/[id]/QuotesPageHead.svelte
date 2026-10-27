<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { m } from "#lib/paraglide/messages.js";
	import { groupIDsStore } from "#lib/client/storage.svelte.js";
	import CopyButton from "#lib/components/util/CopyButton.svelte";
	import FormButton from "#lib/components/forms/FormButton.svelte";
	import GenericDialog from "#lib/components/dialogs/GenericDialog.svelte";
	import type { Group } from "#lib/zod-schemas.ts";
	import { Link, Pencil } from "@lucide/svelte";
	import Button from "#lib/shadcn/components/ui/button/button.svelte";
	import { drawerHref } from "#lib/client/drawers.svelte.ts";

	let { group, totalQuotes }: { group: Group; totalQuotes: number } =
		$props();

	const groupId = page.params.id ?? "";

	let leaveDialogOpen: boolean = $state(false);
</script>

<div class="flex flex-col gap-2 w-full">
	<div class="w-full grid grid-cols-[1fr_auto]">
		<h1 class="font-display text-2xl font-semibold">
			{group.name}
		</h1>

		<Button
			href={drawerHref("edit-group", {
				id: groupId,
			})}
			variant="ghost"
			size="icon-sm"
			aria-label={m.group_edit()}
			title={m.group_edit()}
		>
			<Pencil />
		</Button>
	</div>

	<div class="mb-6 flex items-start justify-between gap-4">
		<div>
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
			<CopyButton content={window.location.href}>
				{#snippet copySnippet()}
					<Link />
				{/snippet}
			</CopyButton>

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
</div>

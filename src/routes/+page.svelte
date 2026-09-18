<script lang="ts">
	import { goto } from "$app/navigation";
	import { addStoredGroupID } from "$lib/storage";
	import { _ } from "$lib/i18n";
	import { superForm } from "sveltekit-superforms";
	import { untrack } from "svelte";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	const {
		form: groupCreationForm,
		errors: groupCreationErrors,
		constraints: groupCreationConstraints,
		enhance: groupCreationEnhance,
		submitting: groupCreationSubmitting,
	} = superForm(
		untrack(() => data.groupCreationForm),
		{
			delayMs: 300,
			onResult: ({ result }) => {
				if (result.type === "success") {
					const id = result.data?.id;
					if (!id) return;

					addStoredGroupID(id);
				}
			},
		},
	);

	let mode: "create" | "join" = $state("create");

	let joinId = $state("");
	let joinBusy = $state(false);
	let joinErr = $state("");

	async function joinGroup(e: SubmitEvent) {
		e.preventDefault();
		joinErr = "";
		const id = extractId(joinId.trim());
		if (!id) {
			joinErr = $_("home.linkRequired");
			return;
		}
		joinBusy = true;
		try {
			const params = new URLSearchParams();
			const res = await fetch(`/api/groups/${id}?${params}`);
			const data = await res.json();
			if (res.status === 404) throw new Error($_("home.notFound"));
			if (!res.ok) throw new Error(data.message || $_("home.joinFailed"));
			addStoredGroupID(data.id);
			goto(`/group/${id}`);
		} catch (err) {
			joinErr =
				err instanceof Error ? err.message : $_("home.joinFailed");
		} finally {
			joinBusy = false;
		}
	}

	function extractId(input: string): string {
		if (!input) return "";
		try {
			const url = new URL(input);
			const parts = url.pathname.split("/").filter(Boolean);
			return parts[parts.length - 1] || "";
		} catch {
			return input;
		}
	}
</script>

<svelte:head>
	<title>{$_("brand")}</title>
</svelte:head>

<section class="mb-10">
	<h1 class="font-display text-3xl leading-tight font-semibold text-balance">
		{$_("home.title")}
	</h1>
	<p class="mt-3 max-w-lg text-base-content/70">
		{$_("home.intro")}
	</p>
</section>

<section class="mb-12">
	<h2 class="mb-3 font-display text-lg font-semibold">
		{$_("home.yourGroups")}
	</h2>

	{#if data.groups.length === 0}
		<div
			class="rounded-box border border-dashed border-base-300 px-5 py-8 text-center"
		>
			<p class="text-base-content/70">
				{$_("home.empty")}
			</p>
		</div>
	{:else}
		<ul class="flex flex-col gap-2">
			{#each data.groups as group (group.id)}
				<li>
					<a
						href={`/group/${group.id}`}
						class="flex items-center justify-between rounded-box border border-base-300 bg-base-100 px-4 py-3 transition hover:border-primary/50 hover:bg-base-200"
					>
						<span class="font-medium">{group.name}</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<section class="rounded-box border border-base-300 bg-base-100 p-5">
	<div class="tabs tabs-box mb-5 w-fit">
		<button
			type="button"
			class="tab {mode === 'create' ? 'tab-active' : ''}"
			onclick={() => (mode = "create")}
		>
			{$_("home.createTab")}
		</button>
		<button
			type="button"
			class="tab {mode === 'join' ? 'tab-active' : ''}"
			onclick={() => (mode = "join")}
		>
			{$_("home.joinTab")}
		</button>
	</div>

	{#if mode === "create"}
		<form
			class="flex flex-col gap-3"
			method="POST"
			use:groupCreationEnhance
		>
			<label class="fieldset-label" for="name"
				>{$_("home.groupName")}</label
			>
			<input
				type="text"
				name="name"
				class="input w-full"
				aria-invalid={$groupCreationErrors.name ? "true" : undefined}
				bind:value={$groupCreationForm.name}
				{...$groupCreationConstraints.name}
			/>
			{#if $groupCreationErrors.name}
				<span class="invalid">{$groupCreationErrors.name}</span>
			{/if}

			<label class="fieldset-label" for="id"
				>{$_("home.customId")}
				<span class="text-base-content/50">({$_("home.optional")})</span
				></label
			>
			<input
				type="text"
				name="id"
				class="input w-full"
				aria-invalid={$groupCreationErrors.id ? "true" : undefined}
				bind:value={$groupCreationForm.id}
				{...$groupCreationConstraints.id}
			/>
			{#if $groupCreationErrors.id}
				<span class="invalid">{$groupCreationErrors.id}</span>
			{/if}

			<button
				class="btn btn-primary mt-1 self-start"
				disabled={$groupCreationSubmitting}
			>
				{$groupCreationSubmitting
					? $_("home.createBusy")
					: $_("home.create")}
			</button>
		</form>
	{:else}
		<form class="flex flex-col gap-3" onsubmit={joinGroup}>
			<label class="fieldset-label" for="join-id"
				>{$_("home.groupLinkOrId")}</label
			>
			<input
				id="join-id"
				class="input w-full"
				placeholder={$_("home.linkPlaceholder")}
				bind:value={joinId}
			/>
			{#if joinErr}
				<p class="text-sm text-error">{joinErr}</p>
			{/if}
			<button class="btn btn-primary mt-1 self-start" disabled={joinBusy}>
				{joinBusy ? $_("home.joinBusy") : $_("home.join")}
			</button>
		</form>
	{/if}
</section>

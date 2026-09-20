<script lang="ts">
	import { goto } from "$app/navigation";
	import { addStoredGroupID } from "$lib/client/storage";
	import { superForm } from "sveltekit-superforms";
	import { untrack } from "svelte";
	import type { PageProps } from "./$types";
	import { m } from "$lib/paraglide/messages";

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
			onResult: async ({ result }) => {
				if (result.type === "success") {
					const id = result.data?.id;
					if (!id) return;

					addStoredGroupID(id);
					await goto(`/group/${id}`);
				}
			},
		},
	);
</script>

<svelte:head>
	<title>{m["brand"]()}</title>
</svelte:head>

<section class="mb-10">
	<h1 class="font-display text-3xl leading-tight font-semibold text-balance">
		{m["home.title"]()}
	</h1>
	<p class="mt-3 max-w-lg text-base-content/70">
		{m["home.intro"]()}
	</p>
</section>

<section class="mb-12">
	<h2 class="mb-3 font-display text-lg font-semibold">
		{m["home.yourGroups"]()}
	</h2>

	{#if data.groups.length === 0}
		<div
			class="rounded-box border border-dashed border-base-300 px-5 py-8 text-center"
		>
			<p class="text-base-content/70">
				{m["home.empty"]()}
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
	<form
		class="flex flex-col gap-3"
		method="POST"
		action="?/createGroup"
		use:groupCreationEnhance
	>
		<label class="fieldset-label" for="name">{m["home.groupName"]()}</label>
		<input
			type="text"
			name="name"
			class="input w-full validator"
			aria-invalid={$groupCreationErrors.name ? "true" : undefined}
			bind:value={$groupCreationForm.name}
			{...$groupCreationConstraints.name}
		/>
		{#if $groupCreationErrors.name}
			<span class="validator-hint hidden"
				>{$groupCreationErrors.name}</span
			>
		{/if}

		<label class="fieldset-label" for="id"
			>{m["home.customId"]()}
			<span class="text-base-content/50">({m["home.optional"]()})</span
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
				? m["home.createBusy"]()
				: m["home.create"]()}
		</button>
	</form>
</section>

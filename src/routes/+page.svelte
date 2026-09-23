<script lang="ts">
	import type { PageProps } from "./$types";
	import { m } from "$lib/paraglide/messages";
	import GroupCreationForm from "$lib/components/forms/GroupCreationForm.svelte";

	let { data }: PageProps = $props();
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
	<GroupCreationForm form={data.groupCreationForm} />
</section>

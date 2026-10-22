<script lang="ts">
	import type { PageProps } from "./$types";
	import { m } from "#lib/paraglide/messages.js";
	import GroupsList from "#lib/components/groups/GroupsList.svelte";
	import Title from "#lib/components/util/Title.svelte";
	import Button from "#lib/components_shadcn/ui/button/button.svelte";
	import { page } from "$app/state";
	import { PlusIcon } from "@lucide/svelte";

	let { data }: PageProps = $props();
</script>

<Title text={m.brand()} />

<section class="mb-10">
	<h1 class="font-display text-3xl leading-tight font-semibold text-balance">
		{m.home_title()}
	</h1>

	<p class="mt-3 max-w-lg text-muted-foreground">
		{m.home_intro()}
	</p>
</section>

<section class="mb-12">
	<h2 class="mb-3 font-display text-lg font-semibold">
		{m.home_yourGroups()}
	</h2>

	<GroupsList groups={data.groups} />
</section>

<div
	class="pointer-events-none fixed inset-x-0 z-40 mx-auto flex max-w-3xl justify-end px-5"
	style="bottom: calc(var(--nav-height, 0px) + 1rem)"
>
	<Button
		href={page.url.pathname + "new"}
		variant="default"
		size="icon-lg"
		class="pointer-events-auto size-14 rounded-full shadow-lg [&_svg]:size-6"
		aria-label={m.home_create()}
		title={m.home_create()}
	>
		<PlusIcon />
	</Button>
</div>

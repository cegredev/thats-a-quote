<script lang="ts">
	import type { PageProps } from "./$types";
	import { m } from "$lib/paraglide/messages";
	import GroupCreationForm from "$lib/components/forms/GroupCreationForm.svelte";
	import GroupsList from "$lib/components/groups/GroupsList.svelte";
	import Title from "$lib/components/util/Title.svelte";

	let { data }: PageProps = $props();
</script>

<Title text={m["brand"]()} />

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

	<GroupsList groups={data.groups} />
</section>

<section class="rounded-box border border-base-300 bg-base-100 p-5">
	<GroupCreationForm form={data.groupCreationForm} />
</section>

<script lang="ts">
	import type { PageProps } from "./$types";
	import { m } from "#lib/paraglide/messages.js";
	import GroupsList from "#lib/components/groups/GroupsList.svelte";
	import Title from "#lib/components/util/Title.svelte";
	import Button from "#lib/shadcn/components/ui/button/button.svelte";
	import { page } from "$app/state";
	import { PlusIcon } from "@lucide/svelte";
	import ResponsiveDrawer from "#lib/components/drawer/ResponsiveDrawer.svelte";
	import GroupCreationForm from "#lib/components/forms/GroupCreationForm.svelte";
	import { addQueryParamToHref } from "#lib/client/component-utils.svelte.ts";

	let { data }: PageProps = $props();

	const DRAWER_QUERY_PARAM = "drawer";
	const CREATE_GROUP_DRAWER = "create-group";

	let addGroupDialogOpen: boolean = $derived(
		page.url.searchParams.get("drawer") === CREATE_GROUP_DRAWER,
	);
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
		href={addQueryParamToHref(
			page.url.href,
			DRAWER_QUERY_PARAM,
			CREATE_GROUP_DRAWER,
		)}
		variant="default"
		size="icon-lg"
		class="pointer-events-auto size-14 rounded-full shadow-lg [&_svg]:size-6"
		aria-label={m.home_create()}
		title={m.home_create()}
	>
		<PlusIcon />
	</Button>
</div>

<ResponsiveDrawer
	text={{
		title: m.group_create_head(),
	}}
	bind:open={addGroupDialogOpen}
	onOpenChange={(open) => {
		if (
			!open &&
			page.url.searchParams.get(DRAWER_QUERY_PARAM) ===
				CREATE_GROUP_DRAWER
		) {
			window.history.back();
		}
	}}
>
	<GroupCreationForm
		form={data.groupCreationForm}
		mode="create"
		onSuccess={() => {
			addGroupDialogOpen = false;
		}}
	/>
</ResponsiveDrawer>

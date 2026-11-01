<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import type { PageProps } from "./$types";
	import UserCard from "./UserCard.svelte";
	import Title from "#lib/components/util/Title.svelte";

	let { data }: PageProps = $props();
</script>

<Title text={`${m.login_link()} · ${m.brand()}`} />

<div class="pb-8">
	<h1 class="mt-2 font-display text-3xl font-semibold tracking-tight">
		{m.account_title()}
	</h1>
	<p class="mt-2 max-w-xl text-muted-foreground">
		{m.account_intro()}
	</p>
	<UserCard user={data.user} updateUserForm={data.updateUserForm} />
</div>

<script lang="ts">
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import type { PageProps } from "./$types";
	import { goto } from "$app/navigation";

	let { data }: PageProps = $props();

	// go back to group
	onMount(async () => {
		await goto(`/group/${data.quote.groupId}#${data.quote.id}`);
	});
</script>

<svelte:head>
	<title>That's a quote!</title>
	<meta name="description" content="Collect quotes" />

	<meta property="og:site_name" content="that's a quote!" />
	<meta property="og:url" content={page.url.origin + page.url.pathname} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={"A title"} />
	<meta property="og:description" content={"A description"} />
	<meta property="og:image" content={data.preview.url} />
	<meta property="og:image:alt" content={"image_alt"} />
	<meta property="og:image:width" content={String(data.preview.width)} />
	<meta property="og:image:height" content={String(data.preview.height)} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="that's a quote!" />
	<meta name="twitter:description" content="Collect quotes" />
	<meta name="twitter:image" content={data.preview.url} />
</svelte:head>

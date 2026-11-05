<script lang="ts">
	import { onMount } from "svelte";
	import type { PageProps } from "./$types";
	import { goto } from "$app/navigation";

	let { data }: PageProps = $props();

	// go back to group
	onMount(async () => {
		await goto(`/group/${data.quote.groupId}#${data.quote.id}`);
	});

	let title = $derived(`Quote by ${data.quote.person}`);
	let description = $derived(data.quote.text);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />

	<meta property="og:site_name" content="that's a quote!" />
	<!-- <meta property="og:url" content={page.url.origin + page.url.pathname} /> -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={data.preview.url} />
	<meta
		property="og:image:alt"
		content={`"${data.quote.text}" by ${data.quote.person}`}
	/>
	<meta property="og:image:width" content={String(data.preview.width)} />
	<meta property="og:image:height" content={String(data.preview.height)} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={data.preview.url} />
</svelte:head>

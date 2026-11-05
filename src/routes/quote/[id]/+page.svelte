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
	let image = $derived(
		data.preview
			? {
					url: data.preview.url,
					width: String(data.preview.width),
					height: String(data.preview.height),
					alt: `"${data.quote.text}" by ${data.quote.person}`,
				}
			: undefined,
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />

	<meta property="og:site_name" content="that's a quote!" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />

	{#if image}
		<meta property="og:image" content={image.url} />
		<meta property="og:image:alt" content={image.alt} />
		<meta property="og:image:width" content={image.width} />
		<meta property="og:image:height" content={image.height} />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{#if image}
		<meta name="twitter:image" content={image.url} />
	{/if}
</svelte:head>

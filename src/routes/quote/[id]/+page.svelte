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
	let image = $derived(data.preview.url);
	let imageWidth = $derived(String(data.preview.width));
	let imageHeight = $derived(String(data.preview.height));
	let imageAlt = $derived(`"${data.quote.text}" by ${data.quote.person}`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />

	<meta property="og:site_name" content="that's a quote!" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
	<meta property="og:image:alt" content={imageAlt} />
	<meta property="og:image:width" content={imageWidth} />
	<meta property="og:image:height" content={imageHeight} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={data.preview.url} />
</svelte:head>

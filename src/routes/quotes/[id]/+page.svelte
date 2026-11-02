<script lang="ts">
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<!-- <meta property="og:site_name" content="Svelte’s Homepage" /> -->
	<!-- <meta property="og:locale" content="en" /> -->
	<!-- <meta property="og:url" content={url} /> -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={"A title"} />
	<meta property="og:description" content={"A description"} />
	<meta property="og:image" content={data.preview.url} />
	<meta property="og:image:alt" content={"image_alt"} />
	<meta property="og:image:width" content={String(data.preview.width)} />
	<meta property="og:image:height" content={String(data.preview.height)} />
</svelte:head>

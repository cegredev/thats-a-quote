<script lang="ts">
	import { page } from "$app/state";
	import {
		setPaginationPage,
		setPaginationPerPage,
		shiftPaginationPage,
	} from "#lib/client/component-utils.svelte.js";
	import { m } from "#lib/paraglide/messages.js";
	import { ChevronLeft, ChevronRight } from "@lucide/svelte";
	import * as Button from "#lib/shadcn/components/ui/button/index.js";
	import GeneralSelect from "../util/GeneralSelect.svelte";
	import { untrack } from "svelte";

	type Props = {
		count: number;
		perPage: number;
		page: number;
		scrollTo?: HTMLElement;
		perPageOptions?: number[];
	};

	let props: Props = $props();

	let perPage = $derived(String(props.perPage));

	let previousPerPage: { previous: string | undefined; current: string } =
		$state({
			previous: undefined,
			current: untrack(() => perPage),
		});
	$effect(() => {
		const previous = untrack(() => previousPerPage.current);

		if (previous === perPage) return;

		previousPerPage = {
			previous,
			current: perPage,
		};

		setPaginationPerPage(
			parseInt(perPage),
			parseInt(previous),
			new URLSearchParams(page.url.searchParams.toString()),
		);
	});

	const totalPages = $derived(Math.ceil(props.count / props.perPage));
	const pageItems = $derived.by(() => {
		if (totalPages <= 7) {
			return Array.from({ length: totalPages }, (_, index) => index + 1);
		}

		const firstPage = Math.max(2, props.page - 1);
		const lastPage = Math.min(totalPages - 1, props.page + 1);
		const items: (number | "ellipsis")[] = [1];

		if (firstPage > 2) items.push("ellipsis");
		for (let pageNumber = firstPage; pageNumber <= lastPage; pageNumber++) {
			items.push(pageNumber);
		}
		if (lastPage < totalPages - 1) items.push("ellipsis");
		items.push(totalPages);

		return items;
	});

	function shiftPage(amount: number) {
		shiftPaginationPage(new URL(page.url.href), amount);
		props.scrollTo?.scrollIntoView({ behavior: "instant" });
	}

	function setPage(pageNumber: number) {
		setPaginationPage(
			pageNumber,
			new URLSearchParams(page.url.searchParams.toString()),
		);
		props.scrollTo?.scrollIntoView({ behavior: "instant" });
	}
</script>

<div class="my-8 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
	<div></div>

	<nav class="flex items-center gap-1" aria-label={m.pagination_navigation()}>
		<Button.Root
			variant="ghost"
			size="icon-sm"
			aria-label={m.pagination_previousPage()}
			disabled={props.page <= 1}
			onclick={() => shiftPage(-1)}
		>
			<ChevronLeft class="size-4" />
		</Button.Root>

		{#each pageItems as item, index (`${item}-${index}`)}
			{#if item === "ellipsis"}
				<span class="px-2 text-muted-foreground" aria-hidden="true"
					>...</span
				>
			{:else}
				<Button.Root
					variant={item === props.page ? "default" : "ghost"}
					size="icon-sm"
					aria-label={m.pagination_page({ page: item })}
					aria-current={item === props.page ? "page" : undefined}
					onclick={() => setPage(item)}
				>
					{item}
				</Button.Root>
			{/if}
		{/each}

		<Button.Root
			variant="ghost"
			size="icon-sm"
			aria-label={m.pagination_nextPage()}
			disabled={props.page >= totalPages}
			onclick={() => shiftPage(1)}
		>
			<ChevronRight class="size-4" />
		</Button.Root>
	</nav>

	{#if props.perPageOptions}
		<div class="flex items-center justify-end gap-2">
			<GeneralSelect
				bind:value={perPage}
				items={props.perPageOptions.map((value) => ({
					value: String(value),
					label: String(value),
				}))}
			/>
			<div class="text-sm text-muted-foreground">
				{m.pagination_perPage()}
			</div>
		</div>
	{:else}
		<div></div>
	{/if}
</div>

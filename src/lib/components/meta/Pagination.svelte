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
	import * as Pagination from "#lib/shadcn/components/ui/pagination/index.js";

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
	const pageItems: (number | "ellipsis")[] = $derived.by(() => {
		if (totalPages <= 6)
			return Array(totalPages)
				.fill(null)
				.map((_, i) => i + 1);

		const items: (number | "ellipsis")[] = [1, 0, 0, 0, 0, 0, totalPages];

		items[1] = props.page > 4 ? "ellipsis" : 2;
		if (props.page <= 4) {
			items[2] = 3;
			items[3] = 4;
			items[4] = 5;
		} else if (props.page >= totalPages - 3) {
			items[2] = totalPages - 4;
			items[3] = totalPages - 3;
			items[4] = totalPages - 2;
		} else {
			items[2] = props.page - 1;
			items[3] = props.page;
			items[4] = props.page + 1;
		}

		items[5] = props.page < totalPages - 3 ? "ellipsis" : totalPages - 1;

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

<div class="my-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
	<div></div>

	<Pagination.Root count={props.count}>
		{#snippet children()}
			<Pagination.Content>
				<Pagination.Item>
					<Button.Root
						variant="ghost"
						class="p-0"
						onclick={() => shiftPage(-1)}
						disabled={props.page <= 1}
					>
						<ChevronLeft />
					</Button.Root>
				</Pagination.Item>
				{#each pageItems as page}
					{#if page === "ellipsis"}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item>
							<Button.Root
								variant={page === props.page
									? "default"
									: "ghost"}
								size="icon-sm"
								aria-label={m.pagination_page({ page: page })}
								aria-current={page === props.page
									? "page"
									: undefined}
								onclick={() => setPage(page)}
							>
								{page}
							</Button.Root>
						</Pagination.Item>
					{/if}
				{/each}
				<Pagination.Item>
					<Button.Root
						variant="ghost"
						class="p-0"
						onclick={() => shiftPage(1)}
						disabled={props.page >= totalPages}
					>
						<ChevronRight />
					</Button.Root>
				</Pagination.Item>
			</Pagination.Content>
		{/snippet}
	</Pagination.Root>

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

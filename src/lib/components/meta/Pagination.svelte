<script lang="ts">
	import { page } from "$app/state";
	import {
		setPaginationPage,
		setPaginationPerPage,
		shiftPaginationPage,
	} from "$lib/client/component-utils.svelte";
	import { ChevronLeft, ChevronRight } from "@lucide/svelte";
	import { Pagination } from "bits-ui";
	import GeneralSelect from "../util/GeneralSelect.svelte";
	import { untrack } from "svelte";

	let props: Pagination.RootProps & {
		/** Cannot change dynamically (is untracked) */
		persistPerPageKey?: string;
		hidePerPageSelect?: boolean;
		scrollTo?: HTMLElement;
	} = $props();

	function parsePerPageFromParams() {
		const parsed = parseInt(page.url.searchParams.get("perPage") ?? "");
		return isNaN(parsed) ? undefined : String(parsed);
	}

	let perPage = $state(parsePerPageFromParams() ?? "20");

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
			page.url.searchParams,
		);
	});

	let shiftPage = $derived((amount: number) => {
		shiftPaginationPage(page.url, amount);

		props.scrollTo?.scrollIntoView({
			behavior: "instant",
		});
	});

	let setPage = $derived((p: number) => {
		setPaginationPage(p, page.url.searchParams);

		props.scrollTo?.scrollIntoView({
			behavior: "instant",
		});
	});
</script>

<Pagination.Root {...props}>
	{#snippet children({ pages, range })}
		<div class="my-8 grid grid-cols-[1fr_auto_1fr]">
			<div><!-- For spacing --></div>

			<div class="flex items-center">
				<Pagination.PrevButton
					class="btn btn-ghost disabled:cursor-not-allowed"
					onclick={() => shiftPage(-1)}
				>
					<ChevronLeft class="size-6" />
				</Pagination.PrevButton>

				<div class="flex items-center join">
					{#each pages as p (p.key)}
						<!-- {@debug page} -->
						{#if p.type === "ellipsis"}
							<div
								class="join-item btn btn-disabled border-base-content"
							>
								...
							</div>
						{:else}
							<Pagination.Page
								page={p}
								class={[
									"join-item",
									"btn",
									p.value === props.page
										? "btn-active border-base-content"
										: "",
								]}
								onclick={() => setPage(p.value)}
							>
								{p.value}
							</Pagination.Page>
						{/if}
					{/each}
				</div>

				<Pagination.NextButton
					class="btn btn-ghost disabled:cursor-not-allowed"
					onclick={() => shiftPage(1)}
				>
					<ChevronRight class="size-6" />
				</Pagination.NextButton>
			</div>

			{#if !props.hidePerPageSelect}
				<div class="flex items-center justify-end gap-2">
					<GeneralSelect
						bind:value={perPage}
						type="single"
						items={[5, 10, 20, 50, 100].map((v) => ({
							value: String(v),
							label: String(v),
						}))}
					/>
					<div>Per Page</div>
				</div>
			{:else}
				<div>
					<!-- For spacing -->
				</div>
			{/if}
		</div>

		<!-- <p class="text-muted-foreground text-center text-[13px]">
				Showing {range.start} - {range.end}
			</p> -->
	{/snippet}
</Pagination.Root>

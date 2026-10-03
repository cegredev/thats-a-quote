<script lang="ts">
	import { page } from "$app/state";
	import {
		setPaginationPage,
		setPaginationPerPage,
		shiftPaginationPage,
	} from "$lib/client/component-utils";
	import { ChevronLeft, ChevronRight } from "@lucide/svelte";
	import { Pagination } from "bits-ui";
	import GeneralSelect from "../util/GeneralSelect.svelte";

	let props: Pagination.RootProps = $props();
</script>

<Pagination.Root {...props}>
	{#snippet children({ pages, range })}
		<div class="my-8 flex justify-center">
			<div class="flex">
				<Pagination.PrevButton
					class="btn btn-ghost disabled:cursor-not-allowed"
					onclick={() => shiftPaginationPage(page.url, -1)}
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
								onclick={() =>
									setPaginationPage(
										p.value,
										page.url.searchParams,
									)}
							>
								{p.value}
							</Pagination.Page>
						{/if}
					{/each}
				</div>
				<Pagination.NextButton
					class="btn btn-ghost disabled:cursor-not-allowed"
					onclick={() => shiftPaginationPage(page.url, 1)}
				>
					<ChevronRight class="size-6" />
				</Pagination.NextButton>
			</div>

			<GeneralSelect
				value={"20"}
				type="single"
				items={[5, 10, 20, 50, 100].map((v) => ({
					value: String(v),
					label: String(v),
				}))}
				onValueChange={(v) =>
					setPaginationPerPage(parseInt(v), page.url.searchParams)}
			/>
		</div>

		<!-- <p class="text-muted-foreground text-center text-[13px]">
				Showing {range.start} - {range.end}
			</p> -->
	{/snippet}
</Pagination.Root>

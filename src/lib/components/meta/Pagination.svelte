<script lang="ts">
	import { ChevronLeft, ChevronRight } from "@lucide/svelte";
	import { Pagination } from "bits-ui";

	let props: Pagination.RootProps = $props();
</script>

<Pagination.Root {...props}>
	{#snippet children({ pages, range })}
		<div class="my-8 flex justify-center">
			<Pagination.PrevButton
				class="btn btn-ghost disabled:cursor-not-allowed"
			>
				<ChevronLeft class="size-6" />
			</Pagination.PrevButton>

			<div class="flex items-center join">
				{#each pages as page (page.key)}
					<!-- {@debug page} -->

					{#if page.type === "ellipsis"}
						<div
							class="join-item btn btn-disabled border-base-content"
						>
							...
						</div>
					{:else}
						<Pagination.Page
							{page}
							class={[
								"join-item",
								"btn",
								page.value === props.page
									? "btn-active border-base-content"
									: "",
							]}
						>
							{page.value}
						</Pagination.Page>
					{/if}
				{/each}
			</div>

			<Pagination.NextButton
				class="btn btn-ghost disabled:cursor-not-allowed"
			>
				<ChevronRight class="size-6" />
			</Pagination.NextButton>
		</div>

		<!-- <p class="text-muted-foreground text-center text-[13px]">
				Showing {range.start} - {range.end}
			</p> -->
	{/snippet}
</Pagination.Root>

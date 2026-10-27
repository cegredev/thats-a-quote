<script lang="ts">
	import { MediaQuery } from "svelte/reactivity";
	import type { Snippet } from "svelte";
	import * as Dialog from "#lib/shadcn/components/ui/dialog/index.js";
	import * as Drawer from "#lib/shadcn/components/ui/drawer/index.js";
	import { cn } from "#lib/shadcn/utils.js";
	import {
		buttonVariants,
		type ButtonSize,
		type ButtonVariant,
	} from "#lib/shadcn/components/ui/button/index.js";
	import {
		drawerIsActive,
		removeDrawerNavigationHistory,
	} from "#lib/client/drawers.svelte.ts";
	import type { DrawerKey } from "#lib/drawers-shared.ts";

	type Props = {
		text: {
			title: string;
			description?: string;
			trigger?: string;
		};
		children: Snippet;
		trigger?: Snippet;
		open?: boolean;
		triggerVariant?: ButtonVariant;
		triggerSize?: ButtonSize;
		triggerClass?: string;
		contentClass?: string;
		widthClass?: string;
		onOpenChange?: (open: boolean) => void;
		navigationControl?: DrawerKey;
	};

	let {
		text,
		children,
		trigger,
		open = $bindable(false),
		triggerVariant = "outline",
		triggerSize = "default",
		triggerClass = "",
		contentClass = "",
		widthClass = "",
		onOpenChange,
		navigationControl,
	}: Props = $props();

	const isDesktop = new MediaQuery("(min-width: 768px)");
	let previousOpen = $state(open);

	$effect(() => {
		if (previousOpen !== open) {
			previousOpen = open;
			onOpenChange?.(open);

			if (navigationControl && !open)
				removeDrawerNavigationHistory(navigationControl);
		}
	});

	$effect(() => {
		if (navigationControl) open = drawerIsActive(navigationControl);
	});
</script>

{#if isDesktop.current}
	<Dialog.Root bind:open>
		{#if trigger || text.trigger}
			<Dialog.Trigger
				class={cn(
					buttonVariants({
						variant: triggerVariant,
						size: triggerSize,
					}),
					triggerClass,
				)}
			>
				{#if trigger}
					{@render trigger()}
				{:else}
					{text.trigger}
				{/if}
			</Dialog.Trigger>
		{/if}
		<Dialog.Content class={cn("p-4", contentClass, widthClass)}>
			<Dialog.Header>
				<Dialog.Title>{text.title}</Dialog.Title>
				{#if text.description}
					<Dialog.Description>{text.description}</Dialog.Description>
				{/if}
			</Dialog.Header>
			{@render children()}
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Drawer.Root bind:open>
		{#if trigger || text.trigger}
			<Drawer.Trigger
				class={cn(
					buttonVariants({
						variant: triggerVariant,
						size: triggerSize,
					}),
					triggerClass,
				)}
			>
				{#if trigger}
					{@render trigger()}
				{:else}
					{text.trigger}
				{/if}
			</Drawer.Trigger>
		{/if}
		<Drawer.Content class={cn("px-6", contentClass)}>
			<Drawer.Header class="text-start">
				<Drawer.Title>{text.title}</Drawer.Title>
				{#if text.description}
					<Drawer.Description>{text.description}</Drawer.Description>
				{/if}
			</Drawer.Header>
			<div class="overflow-y-scroll">
				{@render children()}
			</div>
		</Drawer.Content>
	</Drawer.Root>
{/if}

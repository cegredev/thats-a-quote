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
	import { m } from "#lib/paraglide/messages.js";
	import { dontShowAgainStore } from "#lib/client/storage.svelte.ts";
	import * as Field from "#lib/shadcn/components/ui/field/index.js";
	import { Checkbox } from "#lib/shadcn/components/ui/checkbox/index.js";
	import { Label } from "#lib/shadcn/components/ui/label/index.js";
	type Props = {
		text: {
			title: string;
			description?: string;
			trigger?: string;
			close?: string;
		};
		children?: Snippet;
		buttons?: Snippet<[{ close: Snippet }]>;
		trigger?: Snippet;
		open?: boolean;
		triggerVariant?: ButtonVariant;
		triggerSize?: ButtonSize;
		triggerClass?: string;
		contentClass?: string;
		widthClass?: string;
		onOpenChange?: (open: boolean) => void;
		navigationControl?: DrawerKey;
		allowDontShowAgain?: boolean;
	};

	let {
		text,
		children,
		buttons,
		trigger,
		open = $bindable(false),
		triggerVariant = "outline",
		triggerSize = "default",
		triggerClass = "",
		contentClass = "",
		widthClass = "",
		onOpenChange,
		navigationControl,
		allowDontShowAgain,
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

{#snippet dialogClose()}
	<Dialog.Close class={buttonVariants({ variant: "outline" })}>
		{text.close ?? m.common_cancel()}
	</Dialog.Close>
{/snippet}

{#snippet drawerClose()}
	<Drawer.Close class={buttonVariants({ variant: "outline" })}>
		{text.close ?? m.common_cancel()}
	</Drawer.Close>
{/snippet}

{#snippet dontShowAgain()}
	{#if allowDontShowAgain}
		<Field.Field orientation="horizontal">
			<Checkbox
				id="dont-show-again"
				checked={navigationControl
					? dontShowAgainStore.has(navigationControl)
					: undefined}
				onCheckedChange={(checked) => {
					if (!navigationControl) return;

					if (checked) {
						dontShowAgainStore.add(navigationControl);
					} else {
						dontShowAgainStore.remove(navigationControl);
					}
				}}
			/>
			<Label
				for="dont-show-again"
				class={cn(!isDesktop.current ? "w-full" : "")}
			>
				{m.dont_show_again_text()}
			</Label>
		</Field.Field>
	{/if}
{/snippet}

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

			{@render children?.()}

			{#if buttons && allowDontShowAgain}
				<Dialog.Footer>
					<div class="flex flex-col w-full gap-4">
						{@render dontShowAgain()}

						<div class="flex items-center justify-end gap-1">
							{@render buttons?.({ close: dialogClose })}
						</div>
					</div>
				</Dialog.Footer>
			{/if}
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
				{@render children?.()}
			</div>

			{#if buttons && allowDontShowAgain}
				<Drawer.Footer>
					<div class="flex flex-col w-full gap-4">
						{@render dontShowAgain()}

						<div
							class="w-full gap-1 grid grid-cols-[repeat(auto-fit,minmax(0,1fr))]"
						>
							{@render buttons?.({ close: drawerClose })}
						</div>
					</div>
				</Drawer.Footer>
			{/if}
		</Drawer.Content>
	</Drawer.Root>
{/if}

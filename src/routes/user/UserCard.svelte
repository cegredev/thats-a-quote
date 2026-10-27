<script lang="ts">
	import { authClient } from "#lib/client/frontend-auth.js";
	import { m } from "#lib/paraglide/messages.js";
	import type { User } from "better-auth";
	import { Pencil, UserRound } from "@lucide/svelte";
	import * as Button from "#lib/shadcn/components/ui/button/index.js";
	import * as Card from "#lib/shadcn/components/ui/card/index.js";
	import ResponsiveDrawer from "#lib/components/drawer/ResponsiveDrawer.svelte";
	import {
		gotoDrawer,
		removeDrawerNavigationHistory,
	} from "#lib/client/drawers.svelte.ts";
	import type { SuperValidated } from "sveltekit-superforms";
	import type z from "zod";
	import type zodSchemas from "#lib/zod-schemas.js";
	import { isBlankEmail } from "#lib/utils.ts";
	import UserForm from "#lib/components/forms/UserForm.svelte";

	let {
		user,
		updateUserForm,
	}: {
		user: User & { username?: string | null };
		updateUserForm: SuperValidated<
			z.infer<typeof zodSchemas.users.updateUser>
		>;
	} = $props();

	async function signOut() {
		await authClient.signOut();
	}

	const hasEmail = $derived(!isBlankEmail(user.email));
</script>

<div class="mt-8 grid gap-5">
	<Card.Root>
		<Card.Header class="flex grid-cols-[auto_1fr_auto] items-center gap-4">
			<div
				class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
				aria-hidden="true"
			>
				<UserRound class="size-6" />
			</div>
			<div class="min-w-0">
				<Card.Title class="font-display text-xl">{user.name}</Card.Title
				>
			</div>
		</Card.Header>
		<Card.Content
			class="grid gap-5 border-t px-(--card-spacing) pt-5 sm:grid-cols-2"
		>
			<div>
				<p
					class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
				>
					{m.account_username()}
				</p>
				<p class="mt-1 truncate font-medium">
					{user.username ?? user.name}
				</p>
			</div>
			<div class="min-w-0">
				<div class="flex items-center justify-between gap-3">
					<p
						class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
					>
						{m.account_email()}
					</p>
					<Button.Root
						variant="ghost"
						size="sm"
						class="shrink-0"
						onclick={() => gotoDrawer("edit-user")}
					>
						<Pencil aria-hidden="true" />
						{hasEmail
							? m.account_emailEdit()
							: m.account_emailAdd()}
					</Button.Root>
				</div>
				<p class="mt-1 truncate font-medium">
					{hasEmail ? user.email : m.account_emailMissing()}
				</p>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root
		class="sm:flex-row sm:items-center sm:justify-between sm:px-(--card-spacing)"
	>
		<Card.Content class="pt-(--card-spacing) sm:py-(--card-spacing)">
			<p class="font-medium">{m.account_signOutTitle()}</p>
			<p class="mt-1 text-sm text-muted-foreground">
				{m.account_signOutDescription()}
			</p>
		</Card.Content>
		<Card.Footer class="pt-0 sm:pt-(--card-spacing)">
			<Button.Root variant="outline" onclick={signOut}>
				{m.account_forget()}
			</Button.Root>
		</Card.Footer>
	</Card.Root>
</div>

<ResponsiveDrawer
	text={{
		title: hasEmail ? m.account_emailEditTitle() : m.account_emailTitle(),
		description: m.account_emailDescription(),
	}}
	navigationControl="edit-user"
>
	<UserForm
		form={updateUserForm}
		onSuccess={() => removeDrawerNavigationHistory("edit-user")}
	/>
</ResponsiveDrawer>

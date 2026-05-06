<script lang="ts">
	import { currentUserStore } from '$lib/state/currentUser.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { formatDate, parseError } from '$lib/api_utils';
	import { Toaster } from '$lib/components/ui/sonner';

	import {
		RiMailLine,
		RiCalendarLine,
		RiEditLine,
		RiSaveLine,
		RiCloseLine,
		RiUser3Line,
		RiPhoneLine,
		RiGoogleFill,
		RiInformationLine,
		RiGenderlessLine
	} from 'remixicon-svelte';
	import { toast } from 'svelte-sonner';
	import type { ApiResponse } from '$lib/types/api';
	import type { User } from '$lib/types/user';
	import { themeData } from '$lib/state/theme.svelte';

	let isEditing = $state(false);

	interface UserDataUpdate {
		full_name: string;
		phone_number: string | null;
		gender: string;
	}

	// State untuk form
	let formData = $state<UserDataUpdate>({
		full_name: '',
		phone_number: '',
		gender: ''
	});

	// Sinkronisasi data saat masuk mode edit
	function enterEditMode() {
		if (currentUserStore.data) {
			formData.full_name = currentUserStore.data.full_name;
			formData.phone_number = currentUserStore.data.phone_number;
			formData.gender = currentUserStore.data.gender;
		}
		isEditing = true;
	}

	async function handleSave() {
		const savePromise = fetch('/api/user/my-profile', {
			method: 'PATCH',
			credentials: 'include',
			body: JSON.stringify({
				full_name: formData.full_name,
				phone_number: formData.phone_number,
				gender: formData.gender
			})
		}).then(async (res) => {
			const result: ApiResponse<User> = await res.json();

			if (!result.success) {
				throw new Error(parseError(result.error));
			}

			// Update store kalau berhasil
			if (currentUserStore.data) {
				currentUserStore.data.full_name = formData.full_name;
				currentUserStore.data.phone_number = formData.phone_number;
				currentUserStore.data.gender = formData.gender;
			}

			return result; // ini yang di-pass ke success message
		});

		toast.promise(savePromise, {
			loading: 'trying to update user data...',
			success: (result) => result.message,
			error: (err) => {
				if (err instanceof Error) return err.message;
				return 'Something went wrong';
			},
			duration: 2000
		});

		// finally tetap jalan karena promise settled
		savePromise.finally(() => {
			isEditing = false;
		});
	}
</script>

<div class="min-h-screen bg-background text-foreground selection:bg-primary/30">
	<main class="relative mx-auto max-w-5xl px-6">
		<!-- BREADCRUMB & ACTION -->
		<Toaster richColors theme={themeData.value} position="top-right" />
		<div class="mb-8 flex items-center justify-end">
			<div class="flex items-center gap-2">
				{#if !isEditing}
					<Button
						variant="outline"
						size="sm"
						onclick={enterEditMode}
						class="h-9 gap-2 border-border/50 bg-card px-4 shadow-2xs hover:bg-muted"
					>
						<RiEditLine class="size-4" />
						<span class="hidden sm:inline">Edit Profile</span>
					</Button>
				{:else}
					<Button
						variant="ghost"
						size="sm"
						onclick={() => (isEditing = false)}
						class="h-9 gap-2 text-muted-foreground"
					>
						<RiCloseLine class="size-4" />
						Cancel
					</Button>
					<Button size="sm" onclick={handleSave} class="h-9 gap-2 px-5 shadow-md shadow-primary/20">
						<RiSaveLine class="size-4" />
						Save Changes
					</Button>
				{/if}
			</div>
		</div>

		<div class="grid gap-8 lg:grid-cols-[1fr_320px]">
			<!-- MAIN CONTENT AREA -->
			<div class="space-y-8">
				<!-- PROFILE CARD -->
				<section
					class="relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all"
				>
					<!-- Profile Banner Minimalist -->
					<div class="h-32 bg-linear-to-r from-primary/20 via-primary/5 to-transparent"></div>

					<div class="relative px-8 pb-8">
						<div class="-mt-12 flex flex-col gap-6 md:flex-row md:items-end">
							<Avatar.Root class="h-28 w-28 border-4 border-card bg-background shadow-xl">
								<Avatar.Image
									src={currentUserStore.data?.profile_picture}
									alt={currentUserStore.data?.full_name}
								/>
								<Avatar.Fallback class="bg-secondary text-2xl font-black text-secondary-foreground">
									{currentUserStore.data?.full_name?.charAt(0)}
								</Avatar.Fallback>
							</Avatar.Root>

							<div class="flex-1 space-y-1 pb-1">
								<div class="flex items-center gap-3">
									<h2 class="text-2xl font-bold tracking-tight">
										{currentUserStore.data?.full_name}
									</h2>
									<Badge variant="default">
										{currentUserStore.data?.global_role}
									</Badge>
								</div>
								<div
									class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground"
								>
									<div class="flex items-center gap-1.5">
										<RiMailLine class="size-3.5 opacity-70" />
										{currentUserStore.data?.email}
									</div>
									<div class="flex items-center gap-1.5">
										<RiGoogleFill class="size-3.5 text-[#4285F4]" />
										<span class="text-[11px] font-medium tracking-wider uppercase">Connected</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<!-- FORM SECTION -->
				<Card.Root class="border-border/60 bg-card/50 shadow-2xs backdrop-blur-xs">
					<Card.Header class="pb-4">
						<Card.Title class="text-base font-bold">Personal Information</Card.Title>
						<Card.Description
							>Manage your display name and contact details used across the platform.</Card.Description
						>
					</Card.Header>
					<Card.Content class="space-y-6">
						<div class="grid gap-6 sm:grid-cols-2">
							<!-- FULL NAME -->
							<div class="space-y-2">
								<Label
									for="fn"
									class="text-[11px] font-bold tracking-widest text-muted-foreground uppercase"
									>Full Name</Label
								>
								{#if isEditing}
									<Input
										id="fn"
										bind:value={formData.full_name}
										class="bg-background focus-visible:ring-primary"
									/>
								{:else}
									<div
										class="group flex h-10 items-center gap-3 rounded-lg border border-transparent bg-muted/20 px-3 py-2 text-sm transition-colors hover:border-border/50"
									>
										<RiUser3Line class="size-4 text-muted-foreground/60" />
										<span class="font-medium">{currentUserStore.data?.full_name}</span>
									</div>
								{/if}
							</div>

							<!-- PHONE NUMBER -->
							<div class="space-y-2">
								<Label
									for="ph"
									class="text-[11px] font-bold tracking-widest text-muted-foreground uppercase"
									>Phone Number</Label
								>
								{#if isEditing}
									<Input
										id="ph"
										bind:value={formData.phone_number}
										class="bg-background focus-visible:ring-primary"
									/>
								{:else}
									<div
										class="group flex h-10 items-center gap-3 rounded-lg border border-transparent bg-muted/20 px-3 py-2 text-sm transition-colors hover:border-border/50"
									>
										<RiPhoneLine class="size-4 text-muted-foreground/60" />
										<span class="font-mono font-medium"
											>{currentUserStore.data?.phone_number || 'Not provided'}</span
										>
									</div>
								{/if}
							</div>
						</div>

						<!-- GENDER -->
						<div class="space-y-2">
							<Label class="text-[11px] font-bold tracking-widest text-muted-foreground uppercase"
								>Gender Identity</Label
							>
							{#if isEditing}
								<Select.Root type="single" bind:value={formData.gender}>
									<Select.Trigger class="w-full bg-background md:max-w-[240px]">
										{formData.gender
											? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)
											: 'Select gender'}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="male">Male</Select.Item>
										<Select.Item value="female">Female</Select.Item>
									</Select.Content>
								</Select.Root>
							{:else}
								<Badge
									variant="secondary"
									class="flex w-fit items-center gap-1.5 px-2.5 py-1 capitalize"
								>
									<RiGenderlessLine class="size-3" />
									{currentUserStore.data?.gender || 'other'}
								</Badge>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- SIDEBAR AREA -->
			<aside class="space-y-6">
				<Card.Root class="border-border/60 bg-card/30">
					<Card.Header class="pb-3">
						<Card.Title
							class="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase"
							>Metadata</Card.Title
						>
					</Card.Header>
					<Card.Content class="space-y-5">
						<div class="flex flex-col gap-1">
							<div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
								<RiCalendarLine class="size-3.5" />
								Member Since
							</div>
							<p class="text-sm font-bold tracking-tight">
								{formatDate(currentUserStore.data?.created_at)}
							</p>
						</div>

						<Separator class="bg-border/50" />

						<div class="flex flex-col gap-1">
							<div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
								<RiInformationLine class="size-3.5" />
								Last Updated
							</div>
							<p class="text-sm font-bold tracking-tight">
								{formatDate(currentUserStore.data?.updated_at)}
							</p>
						</div>
					</Card.Content>
				</Card.Root>

				<div class="px-2">
					<p class="text-[10px] leading-relaxed text-muted-foreground/60 italic">
						* Information synced from your OAuth provider cannot be modified directly within this
						interface.
					</p>
				</div>
			</aside>
		</div>
	</main>
</div>

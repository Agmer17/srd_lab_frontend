<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
</script>

<div class="flex flex-col gap-6 p-6">
	<!-- Header Skeleton -->
	<div class="flex items-start justify-between">
		<div class="space-y-2">
			<Skeleton class="h-7 w-48" />
			<Skeleton class="h-4 w-64" />
		</div>
	</div>

	<!-- Toolbar Skeleton -->
	<div class="flex items-center justify-between gap-3">
		<Skeleton class="h-9 w-72" />
		<!-- Search Bar -->
		<Skeleton class="h-4 w-20" />
		<!-- Result count -->
	</div>

	<!-- Table Skeleton -->
	<div class="overflow-hidden rounded-lg border border-border bg-card">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead class="w-[280px] pl-4"><Skeleton class="h-3 w-12" /></TableHead>
					<TableHead><Skeleton class="h-3 w-12" /></TableHead>
					<TableHead><Skeleton class="h-3 w-12" /></TableHead>
					<TableHead><Skeleton class="h-3 w-12" /></TableHead>
					<TableHead><Skeleton class="h-3 w-12" /></TableHead>
					<TableHead class="w-10 pr-4"></TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{#each Array(5) as _}
					<TableRow>
						<TableCell class="py-3 pl-4">
							<div class="flex items-center gap-3">
								<Skeleton class="size-8 rounded-md" />
								<!-- Avatar -->
								<div class="space-y-2">
									<Skeleton class="h-3 w-24" />
									<!-- Name -->
									<Skeleton class="h-3 w-32" />
									<!-- Email -->
								</div>
							</div>
						</TableCell>
						<TableCell>
							<Skeleton class="h-5 w-16 rounded-md" />
							<!-- Role Badge -->
						</TableCell>
						<TableCell>
							<Skeleton class="h-3 w-24" />
							<!-- Phone -->
						</TableCell>
						<TableCell>
							<Skeleton class="h-5 w-14 rounded-md" />
							<!-- Provider Badge -->
						</TableCell>
						<TableCell>
							<Skeleton class="h-3 w-20" />
							<!-- Date -->
						</TableCell>
						<TableCell class="pr-4 text-right">
							<Skeleton class="ml-auto size-7 rounded-md" />
							<!-- Action Button -->
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>

	<Skeleton class="h-3 w-64" />
	<!-- Bottom hint text -->
</div>

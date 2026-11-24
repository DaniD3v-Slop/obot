<script lang="ts">
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import ProviderDeconfigureConfirm from '$lib/components/admin/ProviderDeconfigureConfirm.svelte';
	import { m } from '$lib/i18n';
	import { reloadPage } from '$lib/navigation';
	import { AdminService, type AuthProvider } from '$lib/services';
	import { version, darkMode } from '$lib/stores';
	import { adminConfigStore } from '$lib/stores/adminConfig.svelte';
	import { slide } from 'svelte/transition';

	let licenseViolationDialog = $state<ReturnType<typeof ResponsiveDialog>>();
	let confirmDowngradeDialog = $state<ReturnType<typeof ProviderDeconfigureConfirm>>();
	let providersToDeconfigure = $state<AuthProvider[]>([]);

	let downgrading = $state(false);
	let error = $state('');

	export function open() {
		licenseViolationDialog?.open();
	}
	export function close() {
		licenseViolationDialog?.close();
	}

	async function handleDowngrade() {
		if (!version.current.licenseEntitlementViolations) {
			console.error('No license entitlement violations found');
			return;
		}

		downgrading = true;
		try {
			// Model providers are served by the LLM gateway and can't be deconfigured here, so only
			// auth providers are downgraded.
			const authProviderViolations = version.current.licenseEntitlementViolations.filter(
				(violation) => violation.type === 'authProvider'
			);
			for (const { name } of authProviderViolations) {
				if (name) {
					await AdminService.deconfigureAuthProvider(name);
				}
			}

			reloadPage();
		} catch (err) {
			error = err instanceof Error ? err.message : m.platform_license_unknown_error();
		} finally {
			confirmDowngradeDialog?.close();
			downgrading = false;
		}
	}
</script>

<ResponsiveDialog
	bind:this={licenseViolationDialog}
	title={m.platform_license_notice_missing_or_invalid()}
	class="md:max-w-md"
>
	<div class="md:p-0 p-4">
		<div class="flex flex-col gap-4">
			{#each (version.current.licenseEntitlementViolations ?? []).filter((v) => v.type === 'authProvider') as violation (violation.name)}
				{@const provider = $adminConfigStore.authProviders.find((p) => p.id === violation.name)}
				{#if provider}
					<div class="flex justify-between gap-4">
						<div class="dark:bg-base-400 p-1 rounded-md shrink-0">
							{#if darkMode.isDark}
								{@const url = provider.iconDark || provider.icon}
								<img src={url} alt={provider.name} class="size-10 rounded-md p-1" />
							{:else}
								<img
									src={provider.icon}
									alt={provider.name}
									class="size-10 rounded-md p-1 dark:bg-base-400"
								/>
							{/if}
						</div>
						<div class="flex grow flex-col gap-0.5">
							<p class="font-semibold">
								{m.platform_license_notice_deconfigure_named({ name: provider.name })}
							</p>
							<p class="text-xs text-muted-content">
								{m.platform_license_notice_deconfigure_auth_note({ name: provider.name })}
							</p>
						</div>
					</div>
				{/if}
			{/each}
			{#if error}
				<div
					role="alert"
					class="alert alert-error alert-soft"
					in:slide={{ duration: 150, axis: 'y' }}
				>
					{error}
				</div>
			{/if}
			<button
				class="btn btn-error btn-soft mt-2"
				onclick={() => {
					licenseViolationDialog?.close();
					providersToDeconfigure = (version.current.licenseEntitlementViolations || [])
						.filter((violation) => violation.type === 'authProvider')
						.map((violation) =>
							$adminConfigStore.authProviders.find((p) => p.id === violation.name)
						)
						.filter((p): p is AuthProvider => p !== undefined);
					confirmDowngradeDialog?.open();
				}}
			>
				{m.platform_license_notice_downgrade()}
			</button>
		</div>
	</div>
</ResponsiveDialog>

<ProviderDeconfigureConfirm
	bind:this={confirmDowngradeDialog}
	onConfirm={handleDowngrade}
	onCancel={() => {
		confirmDowngradeDialog?.close();
		licenseViolationDialog?.open();
	}}
	loading={downgrading}
	providers={providersToDeconfigure}
	title={m.platform_license_notice_confirm_downgrade()}
	confirmButtonText={m.platform_license_notice_downgrade()}
/>

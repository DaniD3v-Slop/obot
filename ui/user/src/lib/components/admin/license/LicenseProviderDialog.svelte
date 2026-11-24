<script lang="ts">
	import { m } from '$lib/i18n';
	import type { BaseProvider } from '$lib/services';
	import { darkMode } from '$lib/stores';
	import { clearUrlParams } from '$lib/url';
	import Confirm from '../../Confirm.svelte';
	import { CircleAlert, TriangleAlert } from '@lucide/svelte';
	import { twMerge } from 'tailwind-merge';

	interface Props {
		provider?: BaseProvider;
		licenseKey?: string;
	}

	let { provider = $bindable(), licenseKey }: Props = $props();
</script>

<Confirm
	hideCancelButton
	show={!!provider}
	oncancel={() => {
		provider = undefined;
		clearUrlParams(['provider']);
	}}
	cancelText={m.core_close()}
	note=""
>
	{#snippet titleContent()}
		{#if provider}
			<div class="flex items-center gap-2">
				{#if darkMode.isDark}
					{@const url = provider.iconDark ?? provider.icon}
					<img
						src={url}
						alt={provider.name}
						class={twMerge('size-6 shrink-0 rounded-md p-1', !provider.iconDark && 'bg-base-400')}
					/>
				{:else}
					<img src={provider.icon} alt={provider.name} class="size-6 shrink-0 rounded-md p-1" />
				{/if}
				<h3 class="text-lg font-semibold">{provider.name}</h3>
			</div>
		{/if}
	{/snippet}
	{#snippet msgContent()}
		<div class="flex items-center gap-2">
			{#if provider?.configured}
				<TriangleAlert class="size-4 text-warning" />
				<h4 class="font-semibold text-base">
					{licenseKey ? m.platform_license_notice_invalid() : m.platform_license_notice_missing()}
				</h4>
			{:else}
				<CircleAlert class="size-4 text-muted-content" />
				<h4 class="font-semibold text-base">{m.platform_license_notice_required()}</h4>
			{/if}
		</div>
	{/snippet}
</Confirm>

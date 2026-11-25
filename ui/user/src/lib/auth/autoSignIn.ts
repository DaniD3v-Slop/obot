import { CommonAuthProviderIds } from '$lib/constants';
import type { AuthProvider } from '$lib/services';

// SIGNED_OUT_PARAM marks a page reached through sign-out, which shows the login picker instead of signing in again.
export const SIGNED_OUT_PARAM = 'signed-out';

// singleProviderStartURL returns the sign-in URL when exactly one usable non-local provider is configured.
export function singleProviderStartURL(providers: AuthProvider[], rd: string): string | null {
	if (providers.length !== 1) {
		return null;
	}

	const [provider] = providers;
	if (
		provider.id === CommonAuthProviderIds.LOCAL ||
		provider.requiresActivation ||
		provider.staged
	) {
		return null;
	}

	return `/oauth2/start?rd=${encodeURIComponent(rd)}&obot-auth-provider=${provider.namespace}/${provider.id}`;
}

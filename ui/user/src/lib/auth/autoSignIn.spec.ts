import { CommonAuthProviderIds } from '$lib/constants';
import type { AuthProvider } from '$lib/services';
import { singleProviderStartURL } from './autoSignIn';
import { expect, test } from 'vitest';

function provider(id: string, fields: Partial<AuthProvider> = {}): AuthProvider {
	return { id, namespace: 'default', configured: true, ...fields } as AuthProvider;
}

test('starts sign-in through the only configured provider', () => {
	expect(singleProviderStartURL([provider('oidc-auth-provider')], '/dashboard?tab=a')).toBe(
		'/oauth2/start?rd=%2Fdashboard%3Ftab%3Da&obot-auth-provider=default/oidc-auth-provider'
	);
});

test('keeps the picker for the local provider, several providers and unusable providers', () => {
	expect(singleProviderStartURL([provider(CommonAuthProviderIds.LOCAL)], '/')).toBeNull();
	expect(
		singleProviderStartURL([provider('oidc-auth-provider'), provider('github-auth-provider')], '/')
	).toBeNull();
	expect(
		singleProviderStartURL([provider('oidc-auth-provider', { requiresActivation: true })], '/')
	).toBeNull();
	expect(
		singleProviderStartURL([provider('oidc-auth-provider', { staged: true })], '/')
	).toBeNull();
	expect(singleProviderStartURL([], '/')).toBeNull();
});

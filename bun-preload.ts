// Workaround: Bun exposes `self` on globalThis (a Web API standard),
// which makes @salesforce/core's isWeb() check in lib/fs/fs.js return true.
// This causes it to use memfs (in-memory filesystem) instead of real node:fs,
// breaking credential/keychain access (e.g. MissingCredentialProgramError).
delete (globalThis as Record<string, unknown>).self;

// This is needed just so the ts linter does not scream at me :)
// It serves no funcional purpose
declare namespace JSX {
	interface IntrinsicElements {
		// biome-ignore lint/suspicious/noExplicitAny: We do not care for this types
		[elemName: string]: any;
	}
}

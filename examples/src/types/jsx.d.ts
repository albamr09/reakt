// This is needed just so the ts linter does not scream at me :)
// It serves no funcional purpose
declare namespace JSX {
	interface IntrinsicElements {
		[elemName: string]: any;
	}
}

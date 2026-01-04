import Reakt from "reakt";

const HelloElement = (value?: string) => {
	if (value === "delete") {
		return null;
	}

	const buttonProps = {
		type: "button",
		...(value !== "destroy" && {
			onClick:
				value === "secret"
					? () => {
							alert("You found the secret value!");
						}
					: () => {
							console.log("You clicked!");
						},
		}),
	};

	return (
		<div>
			<h2>Current value: {value}</h2>
			<button {...buttonProps}>
				Click to see a message, nothing appears if you do not crack the code :@
			</button>
		</div>
	);
};

const rerender = (root: HTMLElement, value?: string) => {
	const updateValue = (event: Event, root: HTMLElement) => {
		const inputElement = event.target as HTMLInputElement;
		const inputValue = inputElement.value;
		rerender(root, inputValue);
	};

	const element = (
		<div>
			<input
				name="input"
				oninput={(e: Event) => updateValue(e, root)}
				placeholder="Write delete ^_^"
			/>
			{HelloElement(value)}
			<div>
				<p>Hello</p>
			</div>
		</div>
	);

	Reakt.render(root, element);
};

const root = document.getElementById("root");

// biome-ignore lint/style/noNonNullAssertion: root element is always non-null
rerender(root!);

#!/usr/bin/env node
import { spawn } from "child_process";
import { readdir } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const examplesDir = resolve(__dirname, "..", "src");

// Parse arguments: check if first arg is a command (build/preview) or example name
let command = "dev";
let exampleInput = process.argv[2];

if (exampleInput === "build" || exampleInput === "preview") {
	command = exampleInput;
	exampleInput = process.argv[3];
}

if (!exampleInput) {
	console.error("Error: Please specify an example name");
	console.error(`Usage: pnpm ${command} <example_name>`);
	console.error("Example: pnpm dev 00_hello_js or pnpm dev 00");
	process.exit(1);
}

// Find example directories that match the input (exact match or prefix)
async function findExample(input) {
	try {
		const entries = await readdir(examplesDir, { withFileTypes: true });
		const exampleDirs = entries
			.filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
			.map((entry) => entry.name)
			.filter((name) => name !== "types"); // Exclude types directory

		// Try exact match first
		if (exampleDirs.includes(input)) {
			return input;
		}

		// Try prefix match
		const matches = exampleDirs.filter((dir) => dir.startsWith(input));

		if (matches.length === 0) {
			console.error(`Error: No example found matching "${input}"`);
			console.error("Available examples:", exampleDirs.join(", "));
			process.exit(1);
		}

		if (matches.length > 1) {
			console.error(
				`Error: Multiple examples match "${input}": ${matches.join(", ")}`,
			);
			console.error("Please be more specific.");
			process.exit(1);
		}

		return matches[0];
	} catch (error) {
		console.error("Error reading examples directory:", error.message);
		process.exit(1);
	}
}

const exampleName = await findExample(exampleInput);
process.env.EXAMPLE = exampleName;

const viteArgs = command === "dev" ? [] : [command];

const vite = spawn("vite", viteArgs, {
	stdio: "inherit",
	shell: true,
});

vite.on("error", (error) => {
	console.error("Error running vite:", error);
	process.exit(1);
});

vite.on("exit", (code) => {
	process.exit(code || 0);
});

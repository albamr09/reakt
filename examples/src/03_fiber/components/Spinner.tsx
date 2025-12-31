// biome-ignore lint/correctness/noUnusedImports: Very much important so we can call Reakt.whatever (e.g. createElement) when this is bundled
import * as Reakt from "reakt";

const Spinner = (
	<div className="spinner">
		<style>{`
			.spinner {
				width: 20px;
				height: 20px;
				border: 3px solid #f3f3f3;
				border-top: 3px solid #007bff;
				border-radius: 50%;
				animation: spin 1s linear infinite;
			}
			@keyframes spin {
				0% { transform: rotate(0deg); }
				100% { transform: rotate(360deg); }
			}
		`}</style>
	</div>
);

export default Spinner;

<div class="lds-dual-ring" />

<style>
	.lds-dual-ring {
		display: inline-block;
		width: 20px;
		height: 20px;
		padding: 2px 3px;
	}
	.lds-dual-ring:after {
		content: ' ';
		display: block;
		width: 16px;
		height: 16px;
		/* margin: 4px; */
		border-radius: 50%;
		border: 2px solid #1d1d1d;
		border-color: #1d1d1d transparent #1d1d1d transparent;
		animation: lds-dual-ring 1.2s linear infinite;
	}
	@keyframes lds-dual-ring {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>

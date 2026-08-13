<!--
	The button and green strip from the original edition of this site, ported as-is.

	One thing has to be restated rather than inherited: the old build declared
	Tailwind but shipped no PostCSS config, so `@tailwind base` was dropped and no
	reset ever applied. The button was therefore laid out content-box — 190px of
	face plus the 20px rim — and its paragraphs kept their default margins. This
	build does reset box-sizing globally, so the button opts back out; without that
	the face is 150px and "TENDER BUTTONS" breaks across two lines.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<div id="body">
	<nav id="nav">
		<div>
			<a href={resolve('/')}>
				<div class="button">
					<div>
						<p>By</p>
						<p>Gertrude Stein</p>
						<p style="font-weight: 900; letter-spacing: 0.12rem">TENDER BUTTONS</p>
						<p>Objects&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Food</p>
						<p>Rooms</p>
					</div>
				</div>
			</a>
		</div>
	</nav>
	<span id="bg-strip"></span>
</div>

<style>
	#body {
		display: flex;
		width: 100%;
	}

	#bg-strip {
		background-color: #182d1a;
		height: 10vh;
		width: 100vw;
		position: absolute;
		top: 0;
		left: 0;
		z-index: -1;
	}

	#nav {
		display: flex;
		justify-content: space-between;
		width: 100%;
		color: hsl(49 26.8% 92% / 1);
		margin: 0 3rem;
	}

	.button {
		box-sizing: content-box;
		display: flex;
		flex-direction: column;
		background-color: hsl(61.88, 21.62%, 43%);
		border: #182d1a 20px solid;
		width: 190px;
		height: 190px;
		border-radius: 100%;
		justify-content: center;
		align-items: center;
		text-align: center;
		color: #182d1a;
		font-weight: 700;
		font-size: 16px;
		letter-spacing: 0.15rem;
		line-height: 0.9;
	}
</style>

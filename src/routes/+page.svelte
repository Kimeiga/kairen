<script>
	// @ts-nocheck
	// import syllableMap from '$lib/transformed_syllables.json';

	let sentence = '';
	// let syllables = [];
	// let transliteration = [];
	let kairen = [];

	// function getSyllables() {
	// 	syllables = sentence.split(' ').flatMap((word) => syllableMap[word.toUpperCase()] || []);
	// }

	//   [
	//     [
	//       "HH",
	//       "AH"
	//     ],
	//     [
	//       "L",
	//       "OW"
	//     ]
	//   ]

	async function getSyllables() {
		const response = await fetch('/api/convert', {
			method: 'POST',
			body: JSON.stringify({ sentence }),
			headers: {
				'content-type': 'application/json'
			}
		});

		const data = await response.json();
		console.log(data);
		kairen = data;
		// syllables = data.syllables;
		// kairen = data.kairen;
		// transliteration = data.transliteration;
		// console.log(syllables);
		// console.log(kairen);
		// console.log(transliteration);
	}
</script>

<main>
	<h1>Kairen</h1>
	<p>Haki's secret language where you reverse every syllable of each English word.</p>
	<div class="input">
		<input
			type="text"
			bind:value={sentence}
			on:keydown={(e) => e.key === 'Enter' && getSyllables()}
			placeholder="Enter an English sentence/word"
			style="flex-grow: 1;"
		/>
		<button on:click={getSyllables}>Convert</button>
	</div>
	<br />
	{#if kairen.length > 0}
		<div class="row">
			<div class="words">
				{#each kairen as word}
					<span>{word.word}</span>
				{/each}
			</div>
			<span class="row-label">Original</span>
		</div>
		<div class="row">
			<div class="words">
				{#each kairen as word}
					<span>{word.transliteration}</span>
				{/each}
			</div>
			<span class="row-label">Transliterated</span>
		</div>
		<div class="row">
			<div class="words">
				{#each kairen as word}
					<span>{word.reversed}</span>
				{/each}
			</div>
			<span class="row-label">Reversed</span>
		</div>
		<div class="row">
			<div class="words">
				{#each kairen as word}
					<span>{word.final}</span>
				{/each}
			</div>
			<span class="row-label">Rules Applied</span>
		</div>
		<div class="row">
			<div class="words">
				{#each kairen as word}
					<span>{word.final}</span>
				{/each}
			</div>
			<span class="row-label">Kairen</span>
		</div>
	{/if}
	<br />

	<!-- <p>Added Rules:</p> -->

	<fieldset>
		<legend>Added Rules</legend>
		<ul>
			<li>-'h' -> -'hu'</li>
			<li>plural -s stays final (kids -> diks not zdik)</li>
			<li>-s from singular verbs removed (runs -> nar not znar)</li>
		</ul>
	</fieldset>

	<fieldset>
		<legend>Set Words</legend>
		<ul>
			<li>I -> ki</li>
			<li>eye -> ao</li>
		</ul>
		<!-- <p>I -> ki</p> -->
		<!-- <p>Eye -> ao</p> -->
	</fieldset>
	<!-- <p>Set Words:</p> -->
</main>

<style>
	:root {
		--font-size: clamp(1rem, 4vw, 1.5rem);
	}

	input,
	button,
	:global(body) {
		font-size: var(--font-size);
	}

	.input {
		display: flex;
	}

	:global(body) {
		margin: 0;
		font-family: sans-serif;
	}
	/* input {
		font-size: clamp(1rem, 4vw, 3rem);
	} */

	main {
		display: flex;
		flex-direction: column;
		max-width: 1000px;
		padding: 1rem;
		margin: auto;
		height: 100vh;
		justify-content: center;
		/* align-items: center; */
	}
	.row {
		display: flex;
	}

	.words {
		flex-grow: 1;
	}

	.row-label {
		font-style: italic;
		opacity: 0.5;
	}
</style>

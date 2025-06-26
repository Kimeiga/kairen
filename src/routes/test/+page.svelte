<script>
	import { onMount } from 'svelte';
	import { runTests, validateAsciiOutput } from '$lib/test-ipa-converter.js';

	let testResults = null;
	let validationResults = null;
	let apiTestResults = [];
	let isRunning = false;

	// Test words that cover a wide range of IPA symbols
	const testWords = [
		'hello', 'beautiful', 'establish', 'through', 'serendipity',
		'think', 'this', 'ship', 'measure', 'church', 'judge',
		'sing', 'about', 'bird', 'day', 'my', 'boy', 'now', 'go',
		'bit', 'bet', 'bat', 'but', 'bought', 'put', 'beat', 'boot',
		'cat', 'dog', 'fish', 'water', 'fire', 'earth', 'wind',
		'strength', 'length', 'width', 'depth', 'height',
		'psychology', 'philosophy', 'technology', 'biology',
		'extraordinary', 'pronunciation', 'refrigerator',
		'onomatopoeia', 'chrysanthemum', 'phenomenon'
	];

	async function runIpaTests() {
		console.log('Running IPA converter tests...');
		testResults = runTests();
		validationResults = validateAsciiOutput();
	}

	async function testApiWithWords() {
		isRunning = true;
		apiTestResults = [];
		
		console.log('Testing API with various words...');
		
		for (const word of testWords) {
			try {
				const response = await fetch('/api/convert', {
					method: 'POST',
					body: JSON.stringify({ sentence: word }),
					headers: {
						'content-type': 'application/json'
					}
				});

				const data = await response.json();
				
				// Extract relevant information
				const wordData = data[0]; // First (and only) word
				const result = {
					word: word,
					ipa: wordData?.ipa || 'Not found',
					asciiPhonemes: wordData?.asciiPhonemes || [],
					transliteration: wordData?.transliteration || '',
					swapped: wordData?.swapped || '',
					final: wordData?.final || '',
					success: !!wordData?.ipa
				};
				
				apiTestResults.push(result);
				apiTestResults = [...apiTestResults]; // Trigger reactivity
				
				console.log(`${word}: ${result.ipa} → [${result.asciiPhonemes.join(', ')}] → ${result.final}`);
				
				// Small delay to avoid overwhelming the API
				await new Promise(resolve => setTimeout(resolve, 100));
				
			} catch (error) {
				console.error(`Error testing word "${word}":`, error);
				apiTestResults.push({
					word: word,
					ipa: 'Error',
					asciiPhonemes: [],
					transliteration: '',
					swapped: '',
					final: '',
					success: false,
					error: error.message
				});
				apiTestResults = [...apiTestResults];
			}
		}
		
		isRunning = false;
		console.log('API testing complete!');
	}

	function analyzeResults() {
		if (apiTestResults.length === 0) return null;
		
		const successful = apiTestResults.filter(r => r.success).length;
		const failed = apiTestResults.filter(r => !r.success).length;
		
		// Collect all unique IPA symbols found
		const ipaSymbols = new Set();
		const asciiPhonemes = new Set();
		
		apiTestResults.forEach(result => {
			if (result.ipa && result.ipa !== 'Not found' && result.ipa !== 'Error') {
				// Extract individual IPA symbols
				const cleanIpa = result.ipa.replace(/[\/]/g, '');
				for (const char of cleanIpa) {
					if (char !== ' ') {
						ipaSymbols.add(char);
					}
				}
			}
			
			result.asciiPhonemes.forEach(phoneme => {
				asciiPhonemes.add(phoneme);
			});
		});
		
		return {
			total: apiTestResults.length,
			successful,
			failed,
			successRate: (successful / apiTestResults.length * 100).toFixed(1),
			uniqueIpaSymbols: Array.from(ipaSymbols).sort(),
			uniqueAsciiPhonemes: Array.from(asciiPhonemes).sort()
		};
	}

	$: analysis = analyzeResults();

	onMount(() => {
		runIpaTests();
	});
</script>

<main>
	<h1>IPA to ASCII Converter Test Suite</h1>
	
	<section>
		<h2>Unit Tests</h2>
		<button on:click={runIpaTests}>Run IPA Converter Tests</button>
		
		{#if testResults}
			<div class="results">
				<h3>Test Results</h3>
				<p><strong>Passed:</strong> {testResults.passed}</p>
				<p><strong>Failed:</strong> {testResults.failed}</p>
				<p><strong>Success Rate:</strong> {((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%</p>
			</div>
		{/if}
		
		{#if validationResults !== null}
			<div class="results">
				<h3>ASCII Validation</h3>
				<p>{validationResults ? '✅ All output uses only ASCII letters' : '❌ Some output contains non-ASCII characters'}</p>
			</div>
		{/if}
	</section>

	<section>
		<h2>API Integration Tests</h2>
		<button on:click={testApiWithWords} disabled={isRunning}>
			{isRunning ? 'Testing...' : 'Test API with Sample Words'}
		</button>
		
		{#if analysis}
			<div class="results">
				<h3>API Test Analysis</h3>
				<p><strong>Total Words:</strong> {analysis.total}</p>
				<p><strong>Successful:</strong> {analysis.successful}</p>
				<p><strong>Failed:</strong> {analysis.failed}</p>
				<p><strong>Success Rate:</strong> {analysis.successRate}%</p>
				
				<details>
					<summary>Unique IPA Symbols Found ({analysis.uniqueIpaSymbols.length})</summary>
					<div class="symbol-grid">
						{#each analysis.uniqueIpaSymbols as symbol}
							<span class="symbol">{symbol}</span>
						{/each}
					</div>
				</details>
				
				<details>
					<summary>Unique ASCII Phonemes Generated ({analysis.uniqueAsciiPhonemes.length})</summary>
					<div class="symbol-grid">
						{#each analysis.uniqueAsciiPhonemes as phoneme}
							<span class="phoneme">{phoneme}</span>
						{/each}
					</div>
				</details>
			</div>
		{/if}
		
		{#if apiTestResults.length > 0}
			<div class="results-table">
				<h3>Detailed Results</h3>
				<table>
					<thead>
						<tr>
							<th>Word</th>
							<th>IPA</th>
							<th>ASCII Phonemes</th>
							<th>Transliteration</th>
							<th>Swapped</th>
							<th>Final Kairen</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{#each apiTestResults as result}
							<tr class={result.success ? 'success' : 'failure'}>
								<td>{result.word}</td>
								<td>{result.ipa}</td>
								<td>[{result.asciiPhonemes.join(', ')}]</td>
								<td>{result.transliteration}</td>
								<td>{result.swapped}</td>
								<td><strong>{result.final}</strong></td>
								<td>{result.success ? '✅' : '❌'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: Arial, sans-serif;
	}

	section {
		margin-bottom: 3rem;
		padding: 1.5rem;
		border: 1px solid #ddd;
		border-radius: 8px;
	}

	button {
		background: #007acc;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
	}

	button:hover:not(:disabled) {
		background: #005a9e;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.results {
		margin-top: 1rem;
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 4px;
	}

	.results-table {
		margin-top: 1rem;
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1rem;
	}

	th, td {
		padding: 0.5rem;
		text-align: left;
		border-bottom: 1px solid #ddd;
	}

	th {
		background: #f0f0f0;
		font-weight: bold;
	}

	.success {
		background: #f0fff0;
	}

	.failure {
		background: #fff0f0;
	}

	.symbol-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.symbol, .phoneme {
		background: #e0e0e0;
		padding: 0.25rem 0.5rem;
		border-radius: 3px;
		font-family: monospace;
		font-size: 0.9rem;
	}

	.phoneme {
		background: #e0f0ff;
	}

	details {
		margin-top: 1rem;
	}

	summary {
		cursor: pointer;
		font-weight: bold;
		padding: 0.5rem 0;
	}

	summary:hover {
		color: #007acc;
	}
</style>

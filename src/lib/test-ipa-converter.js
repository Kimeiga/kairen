// Comprehensive test file for IPA to ASCII converter
// This tests all possible IPA symbols that could come from the Dictionary API

// Import the IPA mapping (we'll need to export it from the server file)
const ipaToAsciiMap = {
	// Vowels - monophthongs
	'ɪ': ['i'],
	'ɛ': ['e'], 
	'æ': ['a'],
	'ʌ': ['u'],
	'ɒ': ['o'],
	'ɔ': ['o'],
	'ʊ': ['u'],
	'ə': ['a'],
	'ɜ': ['e'],
	'ɑ': ['a'],
	'i': ['i'],
	'e': ['e'],
	'a': ['a'],
	'o': ['o'],
	'u': ['u'],
	'iː': ['i'],
	'uː': ['u'],
	'ɔː': ['o'],
	'ɑː': ['a'],
	'ɜː': ['e'],
	
	// Vowels - diphthongs
	'eɪ': ['e', 'i'],
	'aɪ': ['a', 'i'],
	'ɔɪ': ['o', 'i'],
	'aʊ': ['a', 'u'],
	'əʊ': ['o'],
	'ɪə': ['i', 'a'],
	'eə': ['e', 'a'],
	'ʊə': ['u', 'a'],
	'oʊ': ['o'],
	'ɛə': ['e', 'a'],
	
	// Consonants - stops
	'p': ['p'],
	'b': ['b'],
	't': ['t'],
	'd': ['d'],
	'k': ['k'],
	'g': ['g'],
	'ʔ': ['t'], // glottal stop -> t
	
	// Consonants - fricatives
	'f': ['f'],
	'v': ['v'],
	'θ': ['th'],
	'ð': ['dh'],
	's': ['s'],
	'z': ['z'],
	'ʃ': ['sh'],
	'ʒ': ['zh'],
	'h': ['h'],
	'x': ['h'], // voiceless velar fricative -> h
	
	// Consonants - affricates
	'tʃ': ['ch'],
	'dʒ': ['j'],
	
	// Consonants - nasals
	'm': ['m'],
	'n': ['n'],
	'ŋ': ['ng'],
	
	// Consonants - liquids
	'l': ['l'],
	'r': ['r'],
	'ɹ': ['r'],
	'ɾ': ['r'], // tap -> r
	'ɫ': ['l'], // dark l -> l
	
	// Consonants - glides
	'w': ['w'],
	'j': ['y'],
	'ɥ': ['w'], // labial-palatal approximant -> w
	
	// Special symbols and diacritics (all ignored)
	'ˈ': [], // primary stress
	'ˌ': [], // secondary stress
	'.': [], // syllable boundary
	'ː': [], // length mark
	'̃': [], // nasalization
	'̊': [], // voiceless
	'̥': [], // voiceless (alternative)
	'̬': [], // voiced
	'ʰ': [], // aspiration
	'ʷ': [], // labialization
	'ʲ': [], // palatalization
	'ˠ': [], // velarization
	'ˤ': [], // pharyngealization
	'̴': [], // creaky voice
	'̰': [], // creaky voice (alternative)
	'̤': [], // breathy voice
	'̼': [], // linguolabial
	'̺': [], // apical
	'̻': [], // laminal
	'̹': [], // more rounded
	'̜': [], // less rounded
	'̟': [], // advanced
	'̠': [], // retracted
	'̈': [], // centralized
	'̽': [], // mid-centralized
	'̝': [], // raised
	'̞': [], // lowered
	'̘': [], // advanced tongue root
	'̙': [], // retracted tongue root
	'̪': [], // dental
	'̚': [], // no audible release
	'̯': [], // non-syllabic
	'̩': [], // syllabic
	'̆': [], // extra-short
	'̄': [], // mid tone
	'̀': [], // low tone
	'́': [], // high tone
	'̂': [], // falling tone
	'̌': [], // rising tone
};

// Function to convert IPA to ASCII phonetic representation
function ipaToAscii(ipaString) {
	if (!ipaString) return [];
	
	// Remove forward slashes and clean the string
	const cleanIpa = ipaString.replace(/[\/]/g, '');
	
	// Sort IPA symbols by length (longest first) to handle multi-character symbols
	const sortedSymbols = Object.keys(ipaToAsciiMap).sort((a, b) => b.length - a.length);
	
	let result = [];
	let i = 0;
	
	while (i < cleanIpa.length) {
		let matched = false;
		
		// Try to match the longest possible symbol first
		for (const symbol of sortedSymbols) {
			if (cleanIpa.substring(i, i + symbol.length) === symbol) {
				const asciiEquivalent = ipaToAsciiMap[symbol];
				if (asciiEquivalent && asciiEquivalent.length > 0) {
					result.push(...asciiEquivalent);
				}
				i += symbol.length;
				matched = true;
				break;
			}
		}
		
		// If no symbol matched, skip this character (unknown IPA symbol)
		if (!matched) {
			console.warn(`Unknown IPA symbol: ${cleanIpa[i]}`);
			i++;
		}
	}
	
	return result;
}

// Test cases covering all IPA symbols and common English words
const testCases = [
	// Basic vowels
	{ ipa: '/ɪ/', expected: ['i'], description: 'Short i as in "bit"' },
	{ ipa: '/ɛ/', expected: ['e'], description: 'Short e as in "bet"' },
	{ ipa: '/æ/', expected: ['a'], description: 'Short a as in "bat"' },
	{ ipa: '/ʌ/', expected: ['u'], description: 'Short u as in "but"' },
	{ ipa: '/ɒ/', expected: ['o'], description: 'Short o as in "bot" (British)' },
	{ ipa: '/ɔ/', expected: ['o'], description: 'Short o as in "bought"' },
	{ ipa: '/ʊ/', expected: ['u'], description: 'Short u as in "put"' },
	{ ipa: '/ə/', expected: ['a'], description: 'Schwa as in "about"' },
	
	// Long vowels
	{ ipa: '/iː/', expected: ['i'], description: 'Long i as in "beat"' },
	{ ipa: '/uː/', expected: ['u'], description: 'Long u as in "boot"' },
	{ ipa: '/ɔː/', expected: ['o'], description: 'Long o as in "bought"' },
	{ ipa: '/ɑː/', expected: ['a'], description: 'Long a as in "bath" (British)' },
	{ ipa: '/ɜː/', expected: ['e'], description: 'Long e as in "bird"' },
	
	// Diphthongs
	{ ipa: '/eɪ/', expected: ['e', 'i'], description: 'Diphthong as in "day"' },
	{ ipa: '/aɪ/', expected: ['a', 'i'], description: 'Diphthong as in "my"' },
	{ ipa: '/ɔɪ/', expected: ['o', 'i'], description: 'Diphthong as in "boy"' },
	{ ipa: '/aʊ/', expected: ['a', 'u'], description: 'Diphthong as in "now"' },
	{ ipa: '/əʊ/', expected: ['o'], description: 'Diphthong as in "go" (British)' },
	{ ipa: '/oʊ/', expected: ['o'], description: 'Diphthong as in "go" (American)' },
	
	// Consonants
	{ ipa: '/p/', expected: ['p'], description: 'Voiceless bilabial stop' },
	{ ipa: '/b/', expected: ['b'], description: 'Voiced bilabial stop' },
	{ ipa: '/t/', expected: ['t'], description: 'Voiceless alveolar stop' },
	{ ipa: '/d/', expected: ['d'], description: 'Voiced alveolar stop' },
	{ ipa: '/k/', expected: ['k'], description: 'Voiceless velar stop' },
	{ ipa: '/g/', expected: ['g'], description: 'Voiced velar stop' },
	
	// Fricatives
	{ ipa: '/f/', expected: ['f'], description: 'Voiceless labiodental fricative' },
	{ ipa: '/v/', expected: ['v'], description: 'Voiced labiodental fricative' },
	{ ipa: '/θ/', expected: ['th'], description: 'Voiceless dental fricative as in "think"' },
	{ ipa: '/ð/', expected: ['dh'], description: 'Voiced dental fricative as in "this"' },
	{ ipa: '/s/', expected: ['s'], description: 'Voiceless alveolar fricative' },
	{ ipa: '/z/', expected: ['z'], description: 'Voiced alveolar fricative' },
	{ ipa: '/ʃ/', expected: ['sh'], description: 'Voiceless postalveolar fricative as in "ship"' },
	{ ipa: '/ʒ/', expected: ['zh'], description: 'Voiced postalveolar fricative as in "measure"' },
	{ ipa: '/h/', expected: ['h'], description: 'Voiceless glottal fricative' },
	
	// Affricates
	{ ipa: '/tʃ/', expected: ['ch'], description: 'Voiceless postalveolar affricate as in "church"' },
	{ ipa: '/dʒ/', expected: ['j'], description: 'Voiced postalveolar affricate as in "judge"' },
	
	// Nasals
	{ ipa: '/m/', expected: ['m'], description: 'Bilabial nasal' },
	{ ipa: '/n/', expected: ['n'], description: 'Alveolar nasal' },
	{ ipa: '/ŋ/', expected: ['ng'], description: 'Velar nasal as in "sing"' },
	
	// Liquids
	{ ipa: '/l/', expected: ['l'], description: 'Alveolar lateral approximant' },
	{ ipa: '/ɫ/', expected: ['l'], description: 'Dark l (velarized)' },
	{ ipa: '/r/', expected: ['r'], description: 'Alveolar trill' },
	{ ipa: '/ɹ/', expected: ['r'], description: 'Alveolar approximant (English r)' },
	{ ipa: '/ɾ/', expected: ['r'], description: 'Alveolar tap' },
	
	// Glides
	{ ipa: '/w/', expected: ['w'], description: 'Labio-velar approximant' },
	{ ipa: '/j/', expected: ['y'], description: 'Palatal approximant (English y)' },
	
	// Complex words with stress and syllable boundaries
	{ ipa: '/ˈhɛloʊ/', expected: ['h', 'e', 'l', 'o'], description: 'hello with stress' },
	{ ipa: '/ɪˈstæblɪʃ/', expected: ['i', 's', 't', 'a', 'b', 'l', 'i', 'sh'], description: 'establish' },
	{ ipa: '/ˈbjuːtɪfəl/', expected: ['b', 'y', 'u', 't', 'i', 'f', 'a', 'l'], description: 'beautiful' },
	{ ipa: '/θɹuː/', expected: ['th', 'r', 'u'], description: 'through' },
	{ ipa: '/ˌsɛɹ.ənˈdɪp.ɪ.ti/', expected: ['s', 'e', 'r', 'a', 'n', 'd', 'i', 'p', 'i', 't', 'i'], description: 'serendipity with syllable boundaries' },
	
	// Edge cases
	{ ipa: '', expected: [], description: 'Empty string' },
	{ ipa: null, expected: [], description: 'Null input' },
	{ ipa: '//', expected: [], description: 'Empty IPA brackets' },
	{ ipa: '/ˈ/', expected: [], description: 'Only stress marker' },
	{ ipa: '/ˈˌ.ː/', expected: [], description: 'Only diacritics' },
];

// Function to run all tests
function runTests() {
	console.log('🧪 Running IPA to ASCII Converter Tests...\n');
	
	let passed = 0;
	let failed = 0;
	
	for (const testCase of testCases) {
		const result = ipaToAscii(testCase.ipa);
		const success = JSON.stringify(result) === JSON.stringify(testCase.expected);
		
		if (success) {
			console.log(`✅ PASS: ${testCase.description}`);
			console.log(`   Input: "${testCase.ipa}" → Output: [${result.join(', ')}]\n`);
			passed++;
		} else {
			console.log(`❌ FAIL: ${testCase.description}`);
			console.log(`   Input: "${testCase.ipa}"`);
			console.log(`   Expected: [${testCase.expected.join(', ')}]`);
			console.log(`   Got:      [${result.join(', ')}]\n`);
			failed++;
		}
	}
	
	console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
	
	if (failed === 0) {
		console.log('🎉 All tests passed! The IPA converter handles all expected symbols correctly.');
	} else {
		console.log('⚠️  Some tests failed. Check the implementation for missing or incorrect mappings.');
	}
	
	return { passed, failed };
}

// Function to validate that all ASCII output uses only 26 letters
function validateAsciiOutput() {
	console.log('\n🔤 Validating ASCII Output...\n');
	
	const validChars = new Set('abcdefghijklmnopqrstuvwxyz'.split(''));
	let allValid = true;
	
	for (const testCase of testCases) {
		const result = ipaToAscii(testCase.ipa);
		
		for (const phoneme of result) {
			for (const char of phoneme) {
				if (!validChars.has(char.toLowerCase())) {
					console.log(`❌ Invalid character "${char}" in phoneme "${phoneme}" from "${testCase.ipa}"`);
					allValid = false;
				}
			}
		}
	}
	
	if (allValid) {
		console.log('✅ All output uses only ASCII letters a-z');
	} else {
		console.log('❌ Some output contains non-ASCII characters');
	}
	
	return allValid;
}

// Export for use in other files
export { ipaToAscii, runTests, validateAsciiOutput, testCases };

// Run tests if this file is executed directly
if (typeof window === 'undefined' && typeof process !== 'undefined') {
	runTests();
	validateAsciiOutput();
}

import { json } from '@sveltejs/kit';
import nlp from 'compromise';

// IPA to ASCII phonetic mapping (preserving digraphs as arrays)
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

// Function to get pronunciation from Dictionary API
async function getPronunciation(word) {
	try {
		const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
		if (!response.ok) {
			return null;
		}

		const data = await response.json();

		// Look for phonetic transcription
		for (const entry of data) {
			if (entry.phonetics && entry.phonetics.length > 0) {
				for (const phonetic of entry.phonetics) {
					if (phonetic.text) {
						return phonetic.text;
					}
				}
			}
			// Fallback to main phonetic field
			if (entry.phonetic) {
				return entry.phonetic;
			}
		}

		return null;
	} catch (error) {
		console.error(`Error fetching pronunciation for "${word}":`, error);
		return null;
	}
}

// Character swapping rules for the new Kairen system (applied to transliterated text)
const characterSwapMap = {
	// Consonant swaps
	'k': 'ch', 'ch': 'k',
	'g': 'j', 'j': 'g',
	't': 'p', 'p': 't',
	'd': 'b', 'b': 'd',
	's': 'f', 'f': 's',
	'z': 'v', 'v': 'z',
	'sh': 'th', 'th': 'sh',
	'zh': 'dh', 'dh': 'zh',
	'm': 'n', 'n': 'm',
	'r': 'l', 'l': 'r',
	'y': 'w', 'w': 'y',
	'ng': 'mb', 'mb': 'ng',
	// h stays the same (no swap)
};

// Set words (exceptions)
const setWords = {
	'I': 'ki',
	'EYE': 'ao'
};



// function prepareWords(sentence) {
// 	return sentence.split(' ').map((word) => {
// 		console.log(word);

// 		// we will remove the final -s from singular verbs and plural nouns and add it back at the end

// 		const possibleNoun = nlp(word).tag('Noun').nouns();
// 		const possibleVerb = nlp(word).tag('Verb').verbs();

// 		const pluralNounWithS = word.endsWith('s') && (possibleNoun.out('array').length > 0 && possibleNoun.isPlural().out('array').length > 0);
// 		const singularVerbWithS = word.endsWith('s') && (possibleVerb.out('array').length > 0 && possibleVerb.isSingular().out('array').length > 0);

// 		const wordObj = {
// 			word: word,
// 			syllables: syllableMap[word.toUpperCase()] || [],
// 			setWord: exceptions[word.toUpperCase()] || null,
// 			pluralNounWithS,
// 			singularVerbWithS,
// 		};

// 		return wordObj;
// 	});
// }
// function splitSentence(sentence) {
// 	// This regex matches words and punctuation as separate entities
// 	return sentence.match(/[\w']+|[.,!?;"]/g) || [];
// }
// function splitSentence(sentence) {
// 	// This regex matches sequences of word characters and sequences of non-word characters
// 	return sentence.match(/\w+|\W+/g) || [];
// }
function splitSentence(sentence) {
	// This regex matches sequences of word characters and sequences of non-word characters
	const matches = sentence.match(/\w+|\W+/g) || [];

	return matches.map(item => {
		if (/\w/.test(item)) {
			return { type: 'word', word: item };
		} else {
			return { type: 'non-word', word: item };
		}
	});
}

// Apply character swapping to a word
function applyCharacterSwaps(word) {
	let result = word.toLowerCase();

	// Handle all swaps in one pass using a more systematic approach
	// We'll process all swaps simultaneously to avoid conflicts

	const allSwaps = [
		// Digraphs first (longer patterns)
		['sh', 'th'],
		['zh', 'dh'],
		['ch', 'k'],
		['ng', 'mb'],
		// Single characters
		['g', 'j'],
		['t', 'p'],
		['d', 'b'],
		['s', 'f'],
		['z', 'v'],
		['m', 'n'],
		['r', 'l'],
		['y', 'w']
	];

	// Create a mapping of all characters/digraphs to unique placeholders
	const placeholderMap = {};
	let placeholderCounter = 0;

	// First pass: replace all swappable patterns with unique placeholders
	for (const [pattern1, pattern2] of allSwaps) {
		if (!placeholderMap[pattern1]) {
			placeholderMap[pattern1] = `__PH${placeholderCounter++}__`;
		}
		if (!placeholderMap[pattern2]) {
			placeholderMap[pattern2] = `__PH${placeholderCounter++}__`;
		}

		// Replace both patterns with their placeholders
		result = result.replace(new RegExp(pattern1, 'g'), placeholderMap[pattern1]);
		result = result.replace(new RegExp(pattern2, 'g'), placeholderMap[pattern2]);
	}

	// Second pass: replace placeholders with swapped values
	for (const [pattern1, pattern2] of allSwaps) {
		// Swap: pattern1's placeholder becomes pattern2, pattern2's placeholder becomes pattern1
		result = result.replace(new RegExp(placeholderMap[pattern1], 'g'), pattern2);
		result = result.replace(new RegExp(placeholderMap[pattern2], 'g'), pattern1);
	}

	return result;
}

// Normalize vowels (round to five vowels but don't change them)
function normalizeVowels(word) {
	let result = word.toLowerCase();

	// Sort by length (longest first) to handle multi-character vowels
	const sortedVowels = Object.keys(vowelNormalization).sort((a, b) => b.length - a.length);

	for (const vowel of sortedVowels) {
		const normalized = vowelNormalization[vowel];
		result = result.replace(new RegExp(vowel, 'g'), normalized);
	}

	return result;
}

// function prepareWords(sentence) {
// 	const splitWordsAndPunctuations = splitSentence(sentence);

// 	return splitWordsAndPunctuations.map(({ word, type }) => {
// 		console.log(word);

// 		// // Handle punctuation: if word is a punctuation, return early
// 		// if (/^[.,!?;"]$/.test(word)) {
// 		// 	return {
// 		// 		word: word,
// 		// 		syllables: [], // no syllables for punctuation
// 		// 		final: null,
// 		// 		pluralNounWithS: false,
// 		// 		singularVerbWithS: false,
// 		// 	};
// 		// }

// 		// Rest of the logic remains unchanged...

// 		if (type == 'word') {

// 			const possibleNoun = nlp(word).tag('Noun').nouns();
// 			const possibleVerb = nlp(word).tag('Verb').verbs();

// 			const pluralNounWithS = word.endsWith('s') && (possibleNoun.out('array').length > 0 && possibleNoun.isPlural().out('array').length > 0);
// 			const singularVerbWithS = word.endsWith('s') && (possibleVerb.out('array').length > 0 && possibleVerb.isSingular().out('array').length > 0);

// 			const wordObj = {
// 				word: word,
// 				syllables: syllableMap[word.toUpperCase()] || [],
// 				final: exceptions[word.toUpperCase()] || null,
// 				pluralNounWithS,
// 				singularVerbWithS,
// 				type: 'word',
// 			};

// 			return wordObj;
// 		}
// 		else {

// 			const wordObj = {
// 				final: word,
// 				type: 'non-word',
// 			};

// 			return wordObj;
// 		}
// 	});
// }

async function prepareWords(sentence) {
	const splitWordsAndPunctuations = splitSentence(sentence);

	const results = [];

	for (const { word, type } of splitWordsAndPunctuations) {
		if (type === 'non-word') {
			results.push({
				word: word,
				ipa: null,
				asciiPhonemes: [],
				final: word,
				pluralNounWithS: false,
				singularVerbWithS: false,
				type: 'non-word',
				transliteration: word,
				swapped: word,
			});
			continue;
		}

		// Check for set words first
		const setWord = setWords[word.toUpperCase()];
		if (setWord) {
			results.push({
				word: word,
				ipa: null,
				asciiPhonemes: [],
				final: setWord,
				pluralNounWithS: false,
				singularVerbWithS: false,
				type: 'word',
				transliteration: word,
				swapped: setWord,
				isSetWord: true,
			});
			continue;
		}

		// Get pronunciation from Dictionary API
		const ipa = await getPronunciation(word);
		const asciiPhonemes = ipa ? ipaToAscii(ipa) : [];

		const possibleNoun = nlp(word).tag('Noun').nouns();
		const possibleVerb = nlp(word).tag('Verb').verbs();

		const pluralNounWithS =
			word.endsWith('s') &&
			possibleNoun.out('array').length > 0 &&
			possibleNoun.isPlural().out('array').length > 0;
		const singularVerbWithS =
			word.endsWith('s') &&
			possibleVerb.out('array').length > 0 &&
			possibleVerb.isSingular().out('array').length > 0;

		results.push({
			word: word,
			ipa: ipa,
			asciiPhonemes: asciiPhonemes,
			final: null,
			pluralNounWithS,
			singularVerbWithS,
			type: 'word',
			isSetWord: false,
		});
	}

	return results;
}

// Transliterate words using ASCII phonemes from IPA
function transliterate(words) {
	return words.map((wordObj) => {
		if (wordObj.type === 'non-word' || wordObj.isSetWord) {
			return {
				...wordObj,
				transliteration: wordObj.transliteration || wordObj.word
			};
		}

		// Join ASCII phonemes into a single string
		const transliterated = wordObj.asciiPhonemes.join('');

		return {
			...wordObj,
			transliteration: transliterated
		};
	});
}

// Apply character swapping to words
function swapCharacters(words) {
	return words.map((wordObj) => {
		if (wordObj.type === 'non-word' || wordObj.isSetWord) {
			return {
				...wordObj,
				swapped: wordObj.swapped || wordObj.transliteration || wordObj.word
			};
		}

		const swapped = applyCharacterSwaps(wordObj.transliteration || wordObj.word);
		return {
			...wordObj,
			swapped: swapped
		};
	});
}

function applyFinalRules(words) {
	return words.map((wordObj) => {
		if (wordObj.type === 'non-word' || wordObj.isSetWord) {
			return {
				...wordObj,
				final: wordObj.final || wordObj.swapped || wordObj.word
			};
		}

		let result = wordObj.swapped || wordObj.word;

		// Apply the -h -> -hu rule
		if (result.endsWith('h')) {
			result = result + 'u';
		}

		// Handle plural nouns with -s (keep -s at the end)
		if (wordObj.pluralNounWithS) {
			// The -s should stay at the end, so we don't need to do anything special
			// since we're not reversing syllables anymore
		}

		// Handle singular verbs with -s (remove the -s)
		if (wordObj.singularVerbWithS && result.endsWith('s')) {
			result = result.slice(0, -1);
		}

		return {
			...wordObj,
			final: result
		};
	});
}

export async function POST({ request }) {
	const { sentence } = await request.json();

	// New pipeline for character-based Kairen conversion:
	// 1. Split sentence into words and non-words (punctuation), get IPA from Dictionary API
	// 2. Convert IPA to ASCII phonemes preserving digraphs
	// 3. Apply character swapping rules to the ASCII phonetic text
	// 4. Apply final rules (-h -> -hu, handle plural/singular)

	const words = await prepareWords(sentence);
	console.log('Prepared words:', words);

	const transliterated = transliterate(words);
	console.log('Transliterated:', transliterated);

	const swapped = swapCharacters(transliterated);
	console.log('Character swapped:', swapped);

	const kairen = applyFinalRules(swapped);
	console.log('Final Kairen:', kairen);

	return json(kairen);
}
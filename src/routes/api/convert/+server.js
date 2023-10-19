// @ts-nocheck
import { json } from '@sveltejs/kit';
import syllableMap from '$lib/transformed_syllables.json';
import nlp from 'compromise';


const cmuToKairenMap = {
	"AA": "a",
	"AE": "a",
	"AH": "a",
	"AO": "o",
	"AW": "au",
	"AY": "ai",
	"B": "b",
	"CH": "ch",
	"D": "d",
	"DH": "dh",
	"EH": "e",
	"ER": "er",
	"EY": "ei",
	"F": "f",
	"G": "g",
	"HH": "h",
	"IH": "i",
	"IY": "i",
	"JH": "j",
	"K": "k",
	"L": "l",
	"M": "m",
	"N": "n",
	"NG": "ng",
	"OW": "o",
	"OY": "oi",
	"P": "p",
	"R": "r",
	"S": "s",
	"SH": "sh",
	"T": "t",
	"TH": "th",
	"UH": "u",
	"UW": "u",
	"V": "v",
	"W": "w",
	"Y": "y",
	"Z": "z",
	"ZH": "zh",
}

function reverseSyllable(syllable) {
	return syllable.slice().reverse();
}
const exceptions = {
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

function prepareWords(sentence) {
	const splitWordsAndPunctuations = splitSentence(sentence);

	return splitWordsAndPunctuations.map(({ word, type }) => {
		if (type === 'non-word') {
			return {
				word: word,
				syllables: [],
				final: word,
				pluralNounWithS: false,
				singularVerbWithS: false,
				type: 'non-word',
				transliteration: word,
				reversed: word,
			};
		}

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

		const wordObj = {
			word: word,
			syllables: syllableMap[word.toUpperCase()] || [],
			final: exceptions[word.toUpperCase()] || null,
			pluralNounWithS,
			singularVerbWithS,
			type: 'word',
		};

		return wordObj;
	});
}

function transliterate(words) {
	return words.map(({ syllables, transliteration, ...rest }) => ({
		...rest,
		syllables,
		transliteration: transliteration || syllables.map((syllable) =>
			syllable.map((phoneme) => cmuToKairenMap[phoneme] || phoneme).join('')
		).join('-')
	}));
}

function reverseWords(words) {
	return words.map(({ syllables, reversed, ...rest }) => ({
		...rest,
		syllables,
		reversed: reversed || syllables.map((syllable) =>
			reverseSyllable(syllable.map((phoneme) => cmuToKairenMap[phoneme] || phoneme)).join('')
		).join('')
	}));

	// return words.map(({ syllables, word, plural }) => {
	// 	// if (plural === 'Y' && word.endsWith('s')) {
	// 	// 	const baseWord = syllables.slice(0, -1);
	// 	// 	return reverseSyllable(baseWord.map((phoneme) => cmuToKairenMap[phoneme] || phoneme)).join('') + 's';
	// 	// }

	// 	const reversedWord = syllables.map((syllable) =>
	// 		reverseSyllable(syllable.map((phoneme) => cmuToKairenMap[phoneme] || phoneme)).join('')
	// 	).join('');

	// 	return {
	// 		word: word,
	// 		syllables: syllables,
	// 		reversed: reversedWord,
	// 		plural: plural
	// 	};
	// });
}

function convertToKairen(words) {
	return words.map(({ final, reversed, ...rest }) => {
		const final2 = final || (reversed.endsWith('h') ? reversed + 'u' : reversed);
		return {
			...rest,
			reversed,
			final: final2,
		};
	});
}

export async function POST({ request }) {

	const { sentence } = await request.json();

	// idea
	// return array to client of objects with original word, syllable breakdown, and each step of the transformation
	// [{ originalWord: word gotten from sentence.split(' ') 
	//		transliterated: now transliterated to kairen phonology using the mapping above 
	//		reversed: now reversed benignly (no exceptions)
	//		rules applied: reversed word with rules applied (plural nouns, singular verbs, etc)
	//		final: final word in kairen
	// }]
	// but one way of doing the set words is, at the transliteration stage, if the word matches one in the set words,
	// set the "final" attribute on the word early to that set word, and then the future stages will just skip over that word.
	// my only question is how do we handle punctuation, since when you split on spaces, the punctuation is included in the word
	// so we will have to do the punctuation separately, and then recombine it with the words after the fact so that the 
	// stage of checking for set words and looking up the word in the cmudict is possible. That can be done as a next step I guess.

	const words = prepareWords(sentence);

	console.log(words);

	const transliteration = transliterate(words);

	console.log(transliteration);

	const reversed = reverseWords(transliteration);
	console.log(reversed)


	// convertToKairen() just does the final exceptions and rules
	// ai kail zdik -> ki kail diks
	const kairen = convertToKairen(reversed);
	console.log(kairen)

	return json(kairen);
}
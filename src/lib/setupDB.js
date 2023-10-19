import { setUpDatabase } from 'word-syllable-map';

setUpDatabase(
	{
		dbLocation: './a-word-syllable.db'
	},
	done
);

/**
 * @param {any} error
 */
function done(error) {
	if (error) {
		console.log(error)
	}
	else {
		console.log('Successfully set up database.');
	}
}
let syllableMap = null;

async function fetchSyllableMap() {
	if (syllableMap) return; // If already fetched, return early

	try {
		const response = await fetch('https://gist.githubusercontent.com/kimeiga/0045ed27442d66eb62846d79d0d3d254/raw/transformed_syllables.json');
		syllableMap = await response.json();
		console.log("syllableMap loaded");
	} catch (error) {
		console.error("Error fetching syllableMap:", error);
	}
}

// Fetch the syllableMap as soon as the server starts
fetchSyllableMap();

export function handle({ event, resolve }) {
	// Pass the syllableMap to the API routes
	event.locals.syllableMap = syllableMap;

	return resolve(event);
}

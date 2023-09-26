/**
 * This function masks email addresses in a given string based on specified criteria:
 * 1. It masks only email addresses with specific domain extensions (e.g., .com, .org, .net, etc.).
 * 2. The prefix of the email (i.e., the part before the '@' symbol) should only start and end with alphanumeric characters.
 *    The middle of the prefix can contain the characters '.', '-', or '_', but cannot have two consecutive occurrences of any of these characters.
 * 3. The email address to be masked should either start the string, or be preceded by a space. It should not be followed directly by an alphanumeric character.
 *
 * @param {string} input - The input string possibly containing emails to be masked.
 * @returns {string} - The input string with emails masked based on the criteria.
 */
const validateEmail = (input) => {
	// Regular expression to capture valid email addresses:
	// - It starts with either a space or the beginning of the string.
	// - The prefix starts and ends with alphanumeric characters. It can also contain '.', '_', and '-'.
	// - The domain part of the email can end with specified domain extensions.
	// - The email is not directly followed by an alphanumeric character.
	//const emailRegex = /(\w[._-]?){3}@([a-zA-Z0-9.-]*?\.(com|co|co\.in|org|net|info|biz|us|uk|ca|au|de|gov|edu|mil|int|coop|app|blog|tech|guru))(?![a-zA-Z0-9])/g;
	const emailRegex = /([a-zA-Z0-9][._-]?){3}@([a-zA-Z0-9.-]+(\.[a-zA-Z]*))/g;
	var inputresult = input.replace(emailRegex, function (match, prefix, domain) {
		const regex = /[a-zA-Z0-9._-]{3}@([a-zA-Z0-9.-]*?\.(com|co|co\.in|org|net|info|biz|us|uk|ca|au|de|gov|edu|mil|int|coop|app|blog|tech|guru))/g;
		var prefixChar = match.match(regex);
		if (prefixChar !== null && prefix.length !== 2) {
			// prefix.length is 2 means there is a spl char at the end

			return match.replace(prefixChar[0], '***@*****.**');
		} else {
			return match;
		}
	});
	const emailPattern = /([a-zA-Z0-9][._-]?){1,2}@([a-zA-Z0-9.-]+(\.[a-zA-Z]*))/g;
	const validEmailRegex = /[a-zA-Z0-9._-]{1,2}@([a-zA-Z0-9.-]*?\.(com|co|co\.in|org|net|info|biz|us|uk|ca|au|de|gov|edu|mil|int|coop|app|blog|tech|guru))/g;
	inputresult = inputresult.replace(emailPattern, function (match, prefix, domain) {
		var prefixChar = match.match(validEmailRegex);
		if (prefixChar !== null && prefix.length !== 2) {
			return match.replace(prefixChar[0], '**@*****.**');
		} else {
			return match;
		}
	});
	return inputresult;
};

const avalonMask = (parsedMessage) => {
	var maskedtext = parsedMessage;
	maskedtext = validateEmail(maskedtext);
	return maskedtext;
};
const avalonMasking = (parsedMessage, eventType) => {
	var maskedtext = parsedMessage;
	if (eventType === 'change') {
		maskedtext = maskedtext.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+[^a-zA-Z0-9_-]$)/g, '*****@*****.**.**');
		maskedtext = maskedtext.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+[a-zA-Z0-9_-]+[a-zA-Z0-9_-]+[^a-zA-Z0-9_-]$)/g, '*****@*****.***');
	} else {
		maskedtext = validateEmail(maskedtext);
	}
	return maskedtext;
};

const handleMasking = (eventType, textPhrase) => {
	return validateEmail(textPhrase);
};

const cnxAvalonUtils = {
	avalonMask,
	handleMasking,
};
export default cnxAvalonUtils;


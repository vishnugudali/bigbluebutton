/* eslint-disable max-len */
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
  // const emailRegex = /(\w[._-]?){3}@([a-zA-Z0-9.-]*?\.(com|co|co\.in|org|net|info|biz|us|uk|ca|au|de|gov|edu|mil|int|coop|app|blog|tech|guru))(?![a-zA-Z0-9])/g;

  const validExtensions = ['com', 'co', 'in', 'org', 'net', 'info', 'biz', 'us', 'uk', 'ca', 'au', 'de', 'gov', 'edu', 'mil', 'int', 'coop', 'app', 'blog', 'tech', 'guru'];
  const emailRegex = /([a-zA-Z0-9][._-]?){3}@([a-zA-Z0-9.-]+(\.[a-zA-Z]*))/g;
  let inputresult = input.replace(emailRegex, (match, prefix, domain) => {
    const level2ext = domain.split('.')[2] !== undefined ? domain.split('.')[2] : ' ';
    const regex = /[a-zA-Z0-9._-]{3}@([a-zA-Z0-9.-]*?\.(com|co|co\.in|org|net|info|biz|us|uk|ca|au|de|gov|edu|mil|int|coop|app|blog|tech|guru))/g;
    const prefixChar = match.match(regex);
    if (prefixChar !== null && prefix.length !== 2) {
      // prefix.length is 2 means there is a spl char at the end
      if (validExtensions.includes(level2ext)) match = match.replace(level2ext, '***');
      return match.replace(prefixChar[0], '***@*****.***');
    }
    return match;
  });

  const emailPattern = /([a-zA-Z0-9][._-]?){1,2}@([a-zA-Z0-9.-]+(\.[a-zA-Z]*))/g;
  const validEmailRegex = /[a-zA-Z0-9._-]{1,2}@([a-zA-Z0-9.-]*?\.(com|co|co\.in|org|net|info|biz|us|uk|ca|au|de|gov|edu|mil|int|coop|app|blog|tech|guru))/g;
  inputresult = inputresult.replace(emailPattern, (match, prefix, domain) => {
    const level2ext = domain.split('.')[2] !== undefined ? domain.split('.')[2] : ' ';
    const prefixChar = match.match(validEmailRegex);

    if (prefixChar !== null && prefix.length !== 2) {
      // eslint-disable-next-line no-param-reassign
      if (validExtensions.includes(level2ext)) match = match.replace(level2ext, '***');
      return match.replace(prefixChar[0], '**@*****.***');
    }
    return match;
  });
  return inputresult;
};

const avalonMask = (parsedMessage) => {
  let maskedtext = parsedMessage;
  maskedtext = validateEmail(maskedtext);
  return maskedtext;
};
const avalonMasking = (parsedMessage, eventType) => {
  let maskedtext = parsedMessage;
  if (eventType === 'change') {
    maskedtext = maskedtext.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+[^a-zA-Z0-9_-]$)/g, '*****@*****.**.**');
    maskedtext = maskedtext.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+[a-zA-Z0-9_-]+[a-zA-Z0-9_-]+[^a-zA-Z0-9_-]$)/g, '*****@*****.***');
  } else {
    maskedtext = validateEmail(maskedtext);
  }
  return maskedtext;
};

const handleMasking = (eventType, textPhrase) => validateEmail(textPhrase);

const cnxAvalonUtils = {
  avalonMask,
  handleMasking,
};
export default cnxAvalonUtils;

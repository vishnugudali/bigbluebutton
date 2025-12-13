/* eslint-disable max-len */
/**
 * This function masks email addresses in a given string based on specified criteria:
 * 1. It masks only email addresses with specific domain extensions (e.g., .com, .org, .net, etc.).
 * 2. The prefix of the email (i.e., 1-3 characters before the '@' symbol) should only start and end with alphanumeric characters.
 *    The middle of the prefix can contain the characters '.', '-', or '_', but cannot have two consecutive occurrences of any of these characters.
 * 3. The email address to be masked should either start the string, or be preceded by a space. It should not be followed directly by an alphanumeric character.
 * 4. if prefix is 3 length then the pattern will be ***@*****.*** for prefix length 2 or 1 then the pattern will be **@*****.***
 * @param {string} input - The input string possibly containing emails to be masked.
 * @returns {string} - The input string with emails masked based on the criteria.
 */

const validExtensions = ['com', 'coop', 'int', 'org', 'net', 'info', 'biz', 'us', 'uk', 'ca', 'au', 'de', 'gov', 'edu', 'mil', 'in', 'co', 'app', 'blog', 'tech', 'guru'];

const startsWithAny = (str, prefixes) => {
  for (let i = 0; i < prefixes.length; i += 1) {
    if (str.startsWith(prefixes[i])) {
      return [true, prefixes[i]];
    }
  }
  return false;
};

const endsWithAny = (str, prefixes) => {
  for (let i = 0; i < prefixes.length; i += 1) {
    if (str.endsWith(prefixes[i])) {
      return true;
    }
  }
  return false;
};

const hasContinuousSpecialChars = (inputString) => {
  // to check whether the email prefix has repeated (.,-._) spl char: returns true if it is
  const pattern = /([a-zA-Z0-9][._-]?){2}@/g;
  return pattern.test(`${inputString}@`);
};
const maskEmail = (regexStr, inputString, i, md) => {
  const inputresult = inputString.replace(regexStr, (match, prefix) => {
    const emailPrefix = match.split('@')[0];
    const isPrefixEndsWithSplChar = endsWithAny(emailPrefix, ['.', '_', '-']);
    const isPrefixStartsWithSplChar = startsWithAny(emailPrefix, ['.', '_', '-'])[0];

    let hasNodoubleSplChar = true;
    if (i === 3) hasNodoubleSplChar = hasContinuousSpecialChars(emailPrefix);
    const domainname = prefix.split('.')[0] !== undefined ? prefix.split('.')[0] : ' ';
    const level1ext = prefix.split('.')[1] !== undefined ? prefix.split('.')[1] : ' ';
    const level2ext = prefix.split('.')[2] !== undefined ? prefix.split('.')[2] : ' ';
    const isDomainEndsWithSplChar = startsWithAny(domainname, ['-'])[0];
    if (!isPrefixStartsWithSplChar
        && !isPrefixEndsWithSplChar
        && hasNodoubleSplChar
        && !isDomainEndsWithSplChar) {
      let secondExt = '';
      let firstExt = '';
      let findemail = `${emailPrefix}@${domainname}`;
      const p2 = md ? '\\*\\*@\\*\\*\\*\\*\\*' : '**@*****';
      const p3 = md ? '\\*\\*\\*@\\*\\*\\*\\*\\*' : '***@*****';
      let pattern = i === 3 ? p3 : p2; // +"."+firstExt+"."+secondExt
      const level1extfound = startsWithAny(level1ext, validExtensions)[1];
      const pext = md ? '\\*\\*\\*' : '***';
      firstExt = level1ext.replace(level1extfound, pext);
      if (level1extfound) {
        findemail = `${findemail}.${level1ext}`;
        pattern = `${pattern}.${firstExt}`;
      }
      if (level2ext !== ' ' && validExtensions.includes(level1ext)) {
        const level2extfound = startsWithAny(level2ext, validExtensions)[1];
        const pext2 = md ? '\\*\\*\\*' : '***';
        secondExt = level2ext.replace(level2extfound, pext2);
        findemail = `${findemail}.${level2ext}`;
        pattern = `${pattern}.${secondExt}`;
      }
      if (level1extfound) {
        return match.replace(findemail, pattern);
      }
      return match;
    }
    return match;
  });
  return inputresult;
};
const validateEmail = (input, md) => {
  let inputresult = input;
  for (let i = 3; i >= 1; i -= 1) {
    const regexGen = `[a-zA-Z0-9._-]{${i}}@([a-zA-Z0-9-]+(\\.(com|coop|co\\.in|org|net|info|biz|us|uk|ca|au|de|gov|edu|mil|int|co|app|blog|tech|guru)+))`;
    const regex = new RegExp(regexGen, 'gm');

    inputresult = maskEmail(regex, inputresult, i, md);
    if (i === 3) {
      // double check and masking  needed for 3 length email
      inputresult = maskEmail(regex, inputresult, i, md);
    }
  }
  return inputresult;
};

const emailMasking = (textPhrase, md) => validateEmail(textPhrase, md);

const cnxAvalonUtils = {
  emailMasking,
};
export default cnxAvalonUtils;

/* eslint-disable max-len */
const validStart = ['3', '4', '5', '6'];

const checkForvalidStart = (firstDigit) => {
  let isValid = false;
  validStart.forEach((char) => {
    if (char === firstDigit) {
      isValid = true;
    }
  });
  return isValid;
};

const validCreditCardCheck = (value) => {
  let isValid = true;
  const ints = new Array(value.length);

  for (let i = 0; i < value.length; i += 1) {
    ints[i] = parseInt(value.substring(i, i + 1), 10);
  }

  for (let i = ints.length - 2; i >= 0; i -= 2) {
    let j = ints[i];
    j = parseInt(j, 10) * 2;

    if (j > 9) {
      j = (j % 10) + 1;
    }

    ints[i] = j;
  }

  let sum = 0;

  for (let i = 0; i < ints.length; i += 1) {
    sum += ints[i];
  }

  if (sum % 10 === 0) {
    isValid = true;
  } else {
    isValid = false;
  }

  return isValid;
};

const checkIsCreditCardNo = (value) => {
  const value1 = value.replace(/\s/g, '');
  let ccNumSt = value1.replace('[^\\d]', '');
  ccNumSt = ccNumSt.replace('\\s+', '');
  ccNumSt = ccNumSt.replace(/-/g, '');
  ccNumSt = ccNumSt.replace(/\*/g, '');
  ccNumSt = ccNumSt.replace(/\./g, '');
  ccNumSt = ccNumSt.replace(/_/g, '');
  ccNumSt = ccNumSt.replace(/\//g, '');
  if (ccNumSt.length < 13) {
    return false;
  }

  let isValid = false;
  const firstDigit = ccNumSt.charAt(0);

  if (!checkForvalidStart(firstDigit)) {
    return false;
  }

  isValid = validCreditCardCheck(ccNumSt);
  return isValid;
};
const maskNumbers = (maskedtext, numbersArray, regex, mask, showLastDigits) => {
  let result = maskedtext; // Make a copy of the input

  numbersArray.forEach((number) => {
    const ccNumber = number.replace(/\D/g, '');
    if (number.match(regex)) {
      const isCreditCard = checkIsCreditCardNo(ccNumber);
      const revCCNumber = ccNumber.split('').reverse().join('');
      const isCCNumberRevNumber = checkIsCreditCardNo(revCCNumber);
      if (isCreditCard || isCCNumberRevNumber) {
        if (Number.isNaN(Number(number.slice(-1)))) { // modified to check if the last character is a number
          result = result.replace(number, `${mask}${ccNumber.substring(ccNumber.length - showLastDigits)}${number.slice(-1)}`);
        } else {
          result = result.replace(number, `${mask}${ccNumber.substring(ccNumber.length - showLastDigits)}`);
        }
      }
    }
  });
  return result;
};

const maskCreditCard = (parsedMessage) => {
  let maskedtext = parsedMessage;

  const re19 = /\b(^[_])|(\d[ ]?){19}|(\d[_]?){19}|(\d[/]?){19}|(\d[.]?){19}|(\d[-]?){19}|(\d[*]?){19}|([_]+$|^[_]+?){2}\d\b/g;
  const re18 = /\b(^[_])|(\d[ ]?){18}|(\d[_]?){18}|(\d[/]?){18}|(\d[.]?){18}|(\d[-]?){18}|(\d[*]?){18}|([_]+$|^[_]+?){2}\d\b/g;
  const re17 = /\b(^[_])|(\d[ ]?){17}|(\d[_]?){17}|(\d[/]?){17}|(\d[.]?){17}|(\d[-]?){17}|(\d[*]?){17}|([_]+$|^[_]+?){2}\d\b/g;
  const re16 = /\b(^[_^])|(\d[ ]?){16}|(\d[_]?){16}|(\d[/]?){16}|(\d[.]?){16}|(\d[-]?){16}|(\d[*]?){16}|([_]+$|^[_]+?){2}\d\b/g;
  const re15 = /\b(^[_])|(\d[ ]?){15}|(\d[_]?){15}|(\d[/]?){15}|(\d[.]?){15}|(\d[-]?){15}|(\d[*]?){15}|([_]+$|^[_]+?){2}\d\b/g;
  const re14 = /\b(^[_])|(\d[ ]?){14}|(\d[_]?){14}|(\d[/]?){14}|(\d[.]?){14}|(\d[-]?){14}|(\d[*]?){14}|([_]+$|^[_]+?){2}\d\b/g;
  const re13 = /\b(^[_] )|(\d[ ]?){13}|(\d[_]?){13}|(\d[/]?){13}|(\d[.]?){13}|(\d[-]?){13}|(\d[*]?){13}|([_]+$|^[_]+?){2}\d\b/g;

  const digit19Numbers = parsedMessage.replace(/[A-Za-z]/g, '^').match(re19);
  if (digit19Numbers !== null) {
    const NumberplusminusRegex = /(\d[ *\-./_]?){19}/g;
    maskedtext = maskNumbers(maskedtext, digit19Numbers, NumberplusminusRegex, 'XXXX-XXXX-XXXX-XXXX-', 3);
  }

  const digit18Numbers = maskedtext.replace(/[A-Za-z]/g, '^').match(re18);

  if (digit18Numbers !== null) {
    const NumberplusminusRegex18 = /(\d[ *\-./_]?){18}/g;
    maskedtext = maskNumbers(maskedtext, digit18Numbers, NumberplusminusRegex18, 'XXXX-XXXX-XXXXX-', 5);
  }

  const digit17Numbers = maskedtext.replace(/[A-Za-z]/g, '^').match(re17);

  if (digit17Numbers !== null) {
    const NumberplusminusRegex17 = /(\d[ *\-./_]?){17}/g;
    maskedtext = maskNumbers(maskedtext, digit17Numbers, NumberplusminusRegex17, 'XXXX-XXXX-XXXX-', 5);
  }

  const digit16Numbers = maskedtext.replace(/[A-Za-z]/g, '^').match(re16);

  if (digit16Numbers !== null) {
    const NumberplusminusRegex16 = /(\d[ *\-./_]?){16}/g;
    maskedtext = maskNumbers(maskedtext, digit16Numbers, NumberplusminusRegex16, 'XXXX-XXXX-XXXX-', 4);
  }

  const digit15Numbers = maskedtext.replace(/[A-Za-z]/g, '^').match(re15);

  if (digit15Numbers !== null) {
    const NumberplusminusRegex15 = /(\d[ *\-./_]?){15}/g;
    maskedtext = maskNumbers(maskedtext, digit15Numbers, NumberplusminusRegex15, 'XXXX-XXXX-XXXX-', 3);
  }

  const digit14Numbers = maskedtext.replace(/[A-Za-z]/g, '^').match(re14);

  if (digit14Numbers !== null) {
    const NumberplusminusRegex14 = /(\d[ *\-./_]?){14}/g;
    maskedtext = maskNumbers(maskedtext, digit14Numbers, NumberplusminusRegex14, 'XXXX-XXXXXX-', 4);
  }

  const digit13Numbers = maskedtext.replace(/[A-Za-z]/g, '^').match(re13);

  if (digit13Numbers !== null) {
    const NumberplusminusRegex13 = /(\d[ *\-./_]?){13}/g;
    maskedtext = maskNumbers(maskedtext, digit13Numbers, NumberplusminusRegex13, 'XXXX-XXXX-', 5);
  }
  return maskedtext;
};

const cnxCCValidation = {
  maskCreditCard,
};
export default cnxCCValidation;

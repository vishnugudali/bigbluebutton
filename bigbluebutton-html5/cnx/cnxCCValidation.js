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
  /*
      var match = false;
      invalid.map(element => {

        if (element.includes(ccNumSt)) {
          match = true;
        }

        return match;
      });

      if (!match) {
        isValid = validCreditCardCheck(ccNumSt);
      } else {
        isValid = false;
      } */

  isValid = validCreditCardCheck(ccNumSt);
  /*
      if (!isValid) {
        invalid.push(ccNumSt);
      }
    */
  return isValid;
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
    digit19Numbers.forEach((number) => {
      const ccNumber = number.replace(/\D/g, '');

      if (number.match(NumberplusminusRegex)) {
        const isCreditCard = checkIsCreditCardNo(ccNumber);
        const revCCNumber = ccNumber.split('').reverse().join('');
        const isCCNumberRevNumber = checkIsCreditCardNo(revCCNumber);
        if (isCreditCard || isCCNumberRevNumber) {
          if (Number.isNaN(number.slice(-1))) {
            maskedtext = maskedtext.replace(number, `XXXX-XXXX-XXXX-XXXX-${ccNumber.substring(ccNumber.length - 3)}${number.slice(-1)}`);
          } else {
            maskedtext = maskedtext.replace(number, `XXXX-XXXX-XXXX-XXXX-${ccNumber.substring(ccNumber.length - 3)}`);
          }
        }
      }
    });
  }

  const digit18Numbers = parsedMessage.replace(/[A-Za-z]/g, '^').match(re18);

  if (digit18Numbers !== null) {
    const NumberplusminusRegex18 = /(\d[ *\-./_]?){18}/g;
    digit18Numbers.forEach((number) => {
      const ccNumber = number.replace(/\D/g, '');

      if (number.match(NumberplusminusRegex18)) {
        const isCreditCard = checkIsCreditCardNo(ccNumber);
        const revCCNumber = ccNumber.split('').reverse().join('');
        const isCCNumberRevNumber = checkIsCreditCardNo(revCCNumber);
        if (isCreditCard || isCCNumberRevNumber) {
          if (Number.isNaN(number.slice(-1))) {
            maskedtext = maskedtext.replace(number, `XXXX-XXXX-XXXXX-${ccNumber.substring(ccNumber.length - 5)}${number.slice(-1)}`);
          } else {
            maskedtext = maskedtext.replace(number, `XXXX-XXXX-XXXXX-${ccNumber.substring(ccNumber.length - 5)}`);
          }
        }
      }
    });
  }

  const digit17Numbers = parsedMessage.replace(/[A-Za-z]/g, '^').match(re17);

  if (digit17Numbers !== null) {
    const NumberplusminusRegex17 = /(\d[ *\-./_]?){17}/g;
    digit17Numbers.forEach((number) => {
      const ccNumber = number.replace(/\D/g, '');

      if (number.match(NumberplusminusRegex17)) {
        const isCreditCard = checkIsCreditCardNo(ccNumber);
        const revCCNumber = ccNumber.split('').reverse().join('');
        const isCCNumberRevNumber = checkIsCreditCardNo(revCCNumber);
        if (isCreditCard || isCCNumberRevNumber) {
          if (Number.isNaN(number.slice(-1))) {
            maskedtext = maskedtext.replace(number, `XXXX-XXXX-XXXX-${ccNumber.substring(ccNumber.length - 5)}${number.slice(-1)}`);
          } else {
            maskedtext = maskedtext.replace(number, `XXXX-XXXX-XXXX-${ccNumber.substring(ccNumber.length - 5)}`);
          }
        }
      }
    });
  }

  const digit16Numbers = parsedMessage.replace(/[A-Za-z]/g, '^').match(re16);

  if (digit16Numbers !== null) {
    const NumberplusminusRegex16 = /(\d[ *\-./_]?){16}/g;
    digit16Numbers.forEach((number) => {
      const ccNumber = number.replace(/\D/g, '');

      if (number.match(NumberplusminusRegex16)) {
        const isCreditCard = checkIsCreditCardNo(ccNumber);
        const revCCNumber = ccNumber.split('').reverse().join('');
        const isCCNumberRevNumber = checkIsCreditCardNo(revCCNumber);
        if (isCreditCard || isCCNumberRevNumber) {
          if (Number.isNaN(number.slice(-1))) {
            maskedtext = maskedtext.replace(number, `XXXX-XXXX-XXXX-${ccNumber.substring(ccNumber.length - 4)}${number.slice(-1)}`);
          } else {
            maskedtext = maskedtext.replace(number, `XXXX-XXXX-XXXX-${ccNumber.substring(ccNumber.length - 4)}`);
          }
        }
      }
    });
  }

  const digit15Numbers = parsedMessage.replace(/[A-Za-z]/g, '^').match(re15);

  if (digit15Numbers !== null) {
    const NumberplusminusRegex15 = /(\d[ *\-./_]?){15}/g;
    digit15Numbers.forEach((number) => {
      const ccNumber = number.replace(/\D/g, '');

      if (number.match(NumberplusminusRegex15)) {
        const isCreditCard = checkIsCreditCardNo(ccNumber);
        const revCCNumber = ccNumber.split('').reverse().join('');
        const isCCNumberRevNumber = checkIsCreditCardNo(revCCNumber);
        if (isCreditCard || isCCNumberRevNumber) {
          if (Number.isNaN(number.slice(-1))) {
            maskedtext = maskedtext.replace(number, `XXXX-XXXX-XXXX-${ccNumber.substring(ccNumber.length - 3)}${number.slice(-1)}`);
          } else {
            maskedtext = maskedtext.replace(number, `XXXX-XXXX-XXXX-${ccNumber.substring(ccNumber.length - 3)}`);
          }
        }
      }
    });
  }

  const digit14Numbers = parsedMessage.replace(/[A-Za-z]/g, '^').match(re14);

  if (digit14Numbers !== null) {
    const NumberplusminusRegex14 = /(\d[ *\-./_]?){14}/g;
    digit14Numbers.forEach((number) => {
      const ccNumber = number.replace(/\D/g, '');

      if (number.match(NumberplusminusRegex14)) {
        const isCreditCard = checkIsCreditCardNo(ccNumber);
        const revCCNumber = ccNumber.split('').reverse().join('');
        const isCCNumberRevNumber = checkIsCreditCardNo(revCCNumber);
        if (isCreditCard || isCCNumberRevNumber) {
          if (Number.isNaN(number.slice(-1))) {
            maskedtext = maskedtext.replace(number, `XXXX-XXXXXX-${ccNumber.substring(ccNumber.length - 4)}${number.slice(-1)}`);
          } else {
            maskedtext = maskedtext.replace(number, `XXXX-XXXXXX-${ccNumber.substring(ccNumber.length - 4)}`);
          }
        }
      }
    });
  }

  const digit13Numbers = parsedMessage.replace(/[A-Za-z]/g, '^').match(re13);

  if (digit13Numbers !== null) {
    const NumberplusminusRegex13 = /(\d[ *\-./_]?){13}/g;
    digit13Numbers.forEach((number) => {
      const ccNumber = number.replace(/\D/g, '');

      if (number.match(NumberplusminusRegex13)) {
        const isCreditCard = checkIsCreditCardNo(ccNumber);
        const revCCNumber = ccNumber.split('').reverse().join('');
        const isCCNumberRevNumber = checkIsCreditCardNo(revCCNumber);
        if (isCreditCard || isCCNumberRevNumber) {
          if (Number.isNaN(number.slice(-1))) {
            maskedtext = maskedtext.replace(number, `XXXX-XXXX-${ccNumber.substring(ccNumber.length - 5)}${number.slice(-1)}`);
          } else {
            maskedtext = maskedtext.replace(number, `XXXX-XXXX-${ccNumber.substring(ccNumber.length - 5)}`);
          }
        }
      }
    });
  }
  return maskedtext;
};

const cnxCCValidation = {
  maskCreditCard,
};
export default cnxCCValidation;

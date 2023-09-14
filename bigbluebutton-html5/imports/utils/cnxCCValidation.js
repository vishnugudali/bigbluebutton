var validStart = ['3', '4', '5', '6'];
    var invalid = [];
    
    const checkForvalidStart = firstDigit => {
      var isValid = false;
      validStart.forEach(char => {
        if (char === firstDigit) {
          isValid = true;
        }
      });
      return isValid;
    };
    
    const validCreditCardCheck = value => {
      var isValid = true;
      var ints = new Array(value.length);
    
      for (let i = 0; i < value.length; i += 1) {
        ints[i] = parseInt(value.substring(i, i + 1), 10);
      }
    
      for (let i = ints.length - 2; i >= 0; i = i - 2) {
        var j = ints[i];
        j = parseInt(j, 10) * 2;
    
        if (j > 9) {
          j = j % 10 + 1;
        }
    
        ints[i] = j;
      }
    
      var sum = 0;
    
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
    
    const checkIsCreditCardNo = value => {
      var value1 = value.replace(/\s/g, '');
      var ccNumSt = value1.replace("[^\\d]", "");
      ccNumSt = ccNumSt.replace("\\s+", "");
      ccNumSt = ccNumSt.replace(/-/g, "");
      ccNumSt = ccNumSt.replace(/\*/g, "");
      ccNumSt = ccNumSt.replace(/\./g, "");
      ccNumSt = ccNumSt.replace(/_/g, "");
      ccNumSt = ccNumSt.replace(/\//g, "");
      var length = ccNumSt.length;
    
      if (ccNumSt.length < 13) {
        return false;
      }
    
      var isValid = false;
      var firstDigit = ccNumSt.charAt(0);
    
      if (!checkForvalidStart(firstDigit)) {
        return false;
      }
    
      var match = false;
      invalid.map(element => {
        if (element.includes(ccNumSt)) {
          match = true;
        }
    
        return match;
      });
    
      /*if (!match) {
        isValid = validCreditCardCheck(ccNumSt);
      } else {
        isValid = false;
      }*/
      isValid = validCreditCardCheck(ccNumSt);
      if (!isValid) {
        invalid.push(ccNumSt);
      }
    
      return isValid;
    };
    
    const maskCreditCard = parsedMessage => {
      var maskedtext = parsedMessage;
      var re19 = /\b(^[_]){19}|(\d[ *-./_]?){19}|([_]+$|^[_]+?){19}\d\b/g;
      var re18 = /\b(^[_]){18}|(\d[ *-./_]?){18}|([_]+$|^[_]+?){18}\d\b/g;
      var re17 = /\b(^[_]){17}|(\d[ *-./_]?){17}|([_]+$|^[_]+?){17}\d\b/g;
      var re16 = /\b(^[_]){16}|(\d[ *-./_]?){16}|([_]+$|^[_]+?){16}\d\b/g;
      var re15 = /\b(^[_]){15}|(\d[ *-./_]?){15}|([_]+$|^[_]+?){15}\d\b/g;
      var re14 = /\b(^[_]){14}|(\d[ *-./_]?){14}|([_]+$|^[_]+?){14}\d\b/g;
      var re13 = /\b(^[_]){13}|(\d[ *-./_]?){13}|([_]+$|^[_]+?){13}\d\b/g;
      var digit_19_Numbers = maskedtext.replace(/[A-Za-z]/g, "^").match(re19);
    
      if (digit_19_Numbers !== null) {
        var NumberplusminusRegex = /(\d[ *\-./_]?){19}/g;
        digit_19_Numbers.forEach(number => {
          var ccNumber = number.replace(/\D/g, '');
    
          if (number.match(NumberplusminusRegex)) {
            var isCreditCard = checkIsCreditCardNo(ccNumber);
	    var revCCNumber = ccNumber.split("").reverse().join("");
	    var isCCNumber_revNumber = checkIsCreditCardNo(revCCNumber);
            if (isCreditCard || isCCNumber_revNumber) {
			  if (isNaN(number.slice(-1))) {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-XXXX-XXXX-" + ccNumber.substring(ccNumber.length - 3) + number.slice(-1));
              } else {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-XXXX-XXXX-" + ccNumber.substring(ccNumber.length - 3));
              }
            }
          }
        });
      }
    
      var digit_18_Numbers = maskedtext.replace(/[A-Za-z]/g, "^").match(re18);
    
      if (digit_18_Numbers !== null) {
        var NumberplusminusRegex18 = /(\d[ *\-./_]?){18}/g;
        digit_18_Numbers.forEach(number => {
          var ccNumber = number.replace(/\D/g, '');
    
          if (number.match(NumberplusminusRegex18)) {
            var isCreditCard = checkIsCreditCardNo(ccNumber);
	    var revCCNumber = ccNumber.split("").reverse().join("");
            var isCCNumber_revNumber = checkIsCreditCardNo(revCCNumber);
            if (isCreditCard || isCCNumber_revNumber) {
              if (isNaN(number.slice(-1))) {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-XXXXX-" + ccNumber.substring(ccNumber.length - 5) + number.slice(-1));
              } else {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-XXXXX-" + ccNumber.substring(ccNumber.length - 5));
              }
            }
          }
        });
      }
    
      var digit_17_Numbers = maskedtext.replace(/[A-Za-z]/g, "^").match(re17);
    
      if (digit_17_Numbers !== null) {
        var NumberplusminusRegex17 = /(\d[ *\-./_]?){17}/g;
        digit_17_Numbers.forEach(number => {
          var ccNumber = number.replace(/\D/g, '');
    
          if (number.match(NumberplusminusRegex17)) {
            var isCreditCard = checkIsCreditCardNo(ccNumber);
	    var revCCNumber = ccNumber.split("").reverse().join("");
	    var isCCNumber_revNumber = checkIsCreditCardNo(revCCNumber);
            if (isCreditCard || isCCNumber_revNumber) {
              if (isNaN(number.slice(-1))) {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-XXXX-" + ccNumber.substring(ccNumber.length - 5) + number.slice(-1));
              } else {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-XXXX-" + ccNumber.substring(ccNumber.length - 5));
              }
            }
          }
        });
      }
    
      var digit_16_Numbers = maskedtext.replace(/[A-Za-z]/g, "^").match(re16);
    
      if (digit_16_Numbers !== null) {
        var NumberplusminusRegex16 = /(\d[ *\-./_]?){16}/g;
        digit_16_Numbers.forEach(number => {
          var ccNumber = number.replace(/\D/g, '');
    
          if (number.match(NumberplusminusRegex16)) {
            var isCreditCard = checkIsCreditCardNo(ccNumber);
	    var revCCNumber = ccNumber.split("").reverse().join("");
            var isCCNumber_revNumber = checkIsCreditCardNo(revCCNumber);
            if (isCreditCard || isCCNumber_revNumber) {
              if (isNaN(number.slice(-1))) {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-XXXX-" + ccNumber.substring(ccNumber.length - 4) + number.slice(-1));
              } else {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-XXXX-" + ccNumber.substring(ccNumber.length - 4));
              }
            }
          }
        });
      }
    
      var digit_15_Numbers = maskedtext.replace(/[A-Za-z]/g, "^").match(re15);
    
      if (digit_15_Numbers !== null) {
        var NumberplusminusRegex15 = /(\d[ *\-./_]?){15}/g;
        digit_15_Numbers.forEach(number => {
          var ccNumber = number.replace(/\D/g, '');
    
          if (number.match(NumberplusminusRegex15)) {
            var isCreditCard = checkIsCreditCardNo(ccNumber);
	    var revCCNumber = ccNumber.split("").reverse().join("");
	    var isCCNumber_revNumber = checkIsCreditCardNo(revCCNumber);
            if (isCreditCard || isCCNumber_revNumber) {
              if (isNaN(number.slice(-1))) {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-XXXX-" + ccNumber.substring(ccNumber.length - 3) + number.slice(-1));
              } else {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-XXXX-" + ccNumber.substring(ccNumber.length - 3));
              }
            }
          }
        });
      }
    
      var digit_14_Numbers = maskedtext.replace(/[A-Za-z]/g, "^").match(re14);
    
      if (digit_14_Numbers !== null) {
        var NumberplusminusRegex14 = /(\d[ *\-./_]?){14}/g;
        digit_14_Numbers.forEach(number => {
          var ccNumber = number.replace(/\D/g, '');
    
          if (number.match(NumberplusminusRegex14)) {
            var isCreditCard = checkIsCreditCardNo(ccNumber);
	    var revCCNumber = ccNumber.split("").reverse().join("");
	    var isCCNumber_revNumber = checkIsCreditCardNo(revCCNumber);
            if (isCreditCard || isCCNumber_revNumber) {
              if (isNaN(number.slice(-1))) {
                maskedtext = maskedtext.replace(number, "XXXX-XXXXXX-" + ccNumber.substring(ccNumber.length - 4) + number.slice(-1));
              } else {
                maskedtext = maskedtext.replace(number, "XXXX-XXXXXX-" + ccNumber.substring(ccNumber.length - 4));
              }
            }
          }
        });
      }
    
      var digit_13_Numbers = maskedtext.replace(/[A-Za-z]/g, "^").match(re13);
    
      if (digit_13_Numbers !== null) {
        var NumberplusminusRegex13 = /(\d[ *\-./_]?){13}/g;
        digit_13_Numbers.forEach(number => {
          var ccNumber = number.replace(/\D/g, '');
    
          if (number.match(NumberplusminusRegex13)) {
            var isCreditCard = checkIsCreditCardNo(ccNumber);
	    var revCCNumber = ccNumber.split("").reverse().join("");
	    var isCCNumber_revNumber = checkIsCreditCardNo(revCCNumber);
            if (isCreditCard || isCCNumber_revNumber) {
              if (isNaN(number.slice(-1))) {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-" + ccNumber.substring(ccNumber.length - 5) + number.slice(-1));
              } else {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-" + ccNumber.substring(ccNumber.length - 5));
              }
            }
          }
        });
      }
    
      invalid = [];
      return maskedtext;
    };
    
    const cnxCCValidation = {
      maskCreditCard
    };
    module.exportDefault(cnxCCValidation);

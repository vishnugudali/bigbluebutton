import cnxCCValidation from "./cnxCCValidation";

const validateEmail = (maskedText) => {
	var maskedTextArray = maskedText.replace(/\n/g, ' ').split(' ');
	var validRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
	var emailMaskPattern = '*****@*****.***';
	
  maskedTextArray.forEach((string) => {
		var emailFound = string.match(validRegex);
		if (emailFound) {
			maskedText = maskedText.replace(string, emailMaskPattern);
		}
	});
  
	return maskedText;
};
const avalonMask = (parsedMessage) => {
	var maskedtext=parsedMessage;
  	//CNX-Avalon number masking
	//maskedtext = maskedtext.replace(/\d/gi, 'X');
	maskedtext=cnxCCValidation.maskCreditCard(maskedtext);
  	//CNX Apple/Avalon/email masking
  	//maskedtext = maskedtext.replace(/apple/gi, 'XXXXX');
  	//maskedtext = maskedtext.replace(/avalon/gi, 'XXXXX');
  	//maskedtext = maskedtext.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g, "*****@*****.***");
	/*
	maskedtext = maskedtext.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/g, "*****@*****.**.**");
        maskedtext = maskedtext.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+[a-zA-Z0-9_-]+[a-zA-Z0-9_-]+)/g, "*****@*****.***");
	*/
	maskedtext=validateEmail(maskedtext);
	return maskedtext;
}
const avalonMasking = (parsedMessage,eventType) => {
     var maskedtext = parsedMessage;
     //CNX-Avalon number masking
     //maskedtext = maskedtext.replace(/\d/gi, 'X');
     maskedtext=cnxCCValidation.maskCreditCard(maskedtext);
     //CNX Apple/Avalon/email masking
     //maskedtext = maskedtext.replace(/apple/gi, 'XXXXX');
     //maskedtext = maskedtext.replace(/avalon/gi, 'XXXXX');
     if(eventType ==='change'){
       maskedtext = maskedtext.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+[^a-zA-Z0-9_-]$)/g, "*****@*****.**.**");
       maskedtext = maskedtext.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+[a-zA-Z0-9_-]+[a-zA-Z0-9_-]+[^a-zA-Z0-9_-]$)/g, "*****@*****.***");

    }else{
    /*	    
      maskedtext = maskedtext.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/g, "*****@*****.**.**");
      maskedtext = maskedtext.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+[a-zA-Z0-9_-]+[a-zA-Z0-9_-]+)/g, "*****@*****.***");
      */
     maskedtext=validateEmail(maskedtext);
   }
  return maskedtext;
 }

const handleMasking = (eventType,validatedQuestion) => {
    let maskedText='';
    if(validatedQuestion && validatedQuestion !== ''){
      let textTobeMasked=validatedQuestion;
      if(eventType !=='change'){
        maskedText=avalonMasking(textTobeMasked,eventType);
      /*	      
        maskedText = maskedText.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/g, "*****@*****.**.**");
        maskedText = maskedText.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g, "*****@*****.***");
      */
      maskedText=validateEmail(maskedText);
      }else{
        const lastChar = textTobeMasked.substring(textTobeMasked.length - 1, textTobeMasked.length);
        const isNumeric = !isNaN(lastChar);
        if (isNumeric) {
          textTobeMasked = textTobeMasked.substring(0, textTobeMasked.length - 1);
          maskedText = avalonMasking(textTobeMasked,eventType) + lastChar;
        } else {
          maskedText = avalonMasking(textTobeMasked,eventType)
        }
      }
    }
    return maskedText;
  }
const cnxAvalonUtils = {
	avalonMask,
        handleMasking
}
export default cnxAvalonUtils

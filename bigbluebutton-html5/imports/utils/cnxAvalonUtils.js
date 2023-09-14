const validateEmail = (maskedText) => {

  var maskedTextArray = maskedText.replace( /\n/g, " " ).split(" ");

  var validRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;

    var emailMaskPattern="*****@*****.***";

    maskedTextArray.forEach(string => {

      var emailFound = string.match(validRegex);

      if(emailFound ){

        maskedText = maskedText.replace(string,emailMaskPattern)

      }

    })

   return maskedText;

 }

const avalonMask = (parsedMessage) => {
	var maskedtext=parsedMessage;
  	maskedtext=validateEmail(maskedtext);
	return maskedtext;
}
const avalonMasking = (parsedMessage,eventType) => {
     var maskedtext = parsedMessage;
     if(eventType ==='change'){
       maskedtext = maskedtext.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+[^a-zA-Z0-9_-]$)/g, "*****@*****.**.**");
       maskedtext = maskedtext.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+[a-zA-Z0-9_-]+[a-zA-Z0-9_-]+[^a-zA-Z0-9_-]$)/g, "*****@*****.***");

    }else{
    maskedtext=validateEmail(maskedtext);
   }
  return maskedtext;
 }



const handleMasking = (eventType,textPhrase) => {
    return validateEmail(textPhrase);;
  }

const cnxAvalonUtils = {
	avalonMask,
        handleMasking
}
export default cnxAvalonUtils

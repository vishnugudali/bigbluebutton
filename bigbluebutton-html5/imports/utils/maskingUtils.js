import cnxCCValidation from './cnxCCValidation';
import cnxAvalonUtils from './cnxAvalonUtils';

/**
 * Determines the current instance type based on the hostname
 * @returns {string} - 'enterprise', 'guest', or 'unknown'
 */
const getInstanceType = () => {
  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;
    if (hostname.includes('aeqcom.cnxmeeting.com') || hostname.includes('avl-') || hostname.includes('test.cnxmeeting.com')) {
      return 'enterprise';
    } if (hostname.includes('agqcom.cnxmeeting.com') || hostname.includes('dev.cnxmeeting.com')) {
      return 'guest';
    }
  }
  return 'unknown';
};

/**
 * Masks the word "Apple" based on instance type
 * @param {string} text - The text to process
 * @param {string} instanceType - The instance type ('enterprise', 'guest', or 'unknown')
 * @returns {string} - The text with Apple masking applied
 */
const maskAppleWord = (text, instanceType, md) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  const replacement = md ? '\\*\\*\\*\\*\\*' : '*****';
  let maskedText = text;

  if (instanceType === 'enterprise') {
    // enterprise: mask apple/appleS everywhere except in URLs
    // catch protocol URLs and www. URLs
    const urlRegex = /(\b(?:https?:\/\/|www\.)[^\s]+\b)/gi;
    maskedText = maskedText
      .split(urlRegex)
      .map((chunk, i) => {
        // odd‑indexed chunks are the URLs themselves
        if (i % 2 === 1) return chunk;
        // in non‑URL chunks, mask all "apple" (case‑insensitive)
        return chunk.replace(/Apple/gi, replacement);
      })
      .join('');
  } else if (instanceType === 'guest') {
    // Guest: mask "Apple" in all cases, including URLs
    maskedText = maskedText.replace(/Apple/gi, replacement);
  }
  // For 'unknown' instance type, no Apple masking is applied
  return maskedText;
};

/**
 * Applies comprehensive masking
 * (email, credit card, and instance-specific Apple masking) to input text
 * @param {string} text - The text to mask
 * @returns {string} - The text with all masking applied
 */
export const applyComprehensiveMasking = (text, md = false) => {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  // Apply email masking, credit card masking, and Apple masking
  let maskedText = text;
  maskedText = cnxAvalonUtils.emailMasking(maskedText, md); // Email masking
  maskedText = cnxCCValidation.maskCreditCard(maskedText); // Credit card masking

  // Apply instance-specific Apple masking
  const instanceType = getInstanceType();
  maskedText = maskAppleWord(maskedText, instanceType, md);
  return maskedText;
};

export default {
  applyComprehensiveMasking,
};

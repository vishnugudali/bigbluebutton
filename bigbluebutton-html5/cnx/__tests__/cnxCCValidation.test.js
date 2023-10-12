/* eslint-disable max-len */
import cnxCCValidation from '../cnxCCValidation';

const { maskCreditCard } = cnxCCValidation;

describe('maskCreditCard', () => {
  // Mask a message with no credit card numbers
  it('should return the original message when there are no credit card numbers 601100099013', () => {
    const parsedMessage = 'This is a message without any credit card numbers 601100099013';
    const expected = 'This is a message without any credit card numbers 601100099013';
    const result = maskCreditCard(parsedMessage);
    expect(result).toEqual(expected);
  });

  // Mask a message with one credit card number of each length (13-19 digits)
  it('should mask a message with one credit card number of each length', () => {
    const parsedMessage = 'This is a message with credit card numbers: 4111111111111111, 41111111111111111, 411111111111111111, 4111111111111111111, 41111111111111111, 4111111111111111, 41111111111111, 4111111111111';
    const expected = 'This is a message with credit card numbers: XXXX-XXXX-XXXX-1111, XXXX-XXXX-XXXX-11111, XXXX-XXXX-XXXX-111111, XXXX-XXXX-XXXX-1111111, XXXX-XXXX-XXXX-11111, XXXX-XXXX-XXXX-1111, 41111111111111, 4111111111111';
    const result = maskCreditCard(parsedMessage);
    expect(result).toEqual(expected);
  });

  // Mask a message with multiple credit card numbers of different lengths
  it('should mask a message with multiple credit card numbers of different lengths', () => {
    const parsedMessage = 'This is a message with multiple credit card numbers: 4111111111111111, 6011.0009.9013.9424, 5105105105105100';
    const expected = 'This is a message with multiple credit card numbers: XXXX-XXXX-XXXX-1111, XXXX-XXXX-XXXX-9424, XXXX-XXXX-XXXX-5100';
    const result = maskCreditCard(parsedMessage);
    expect(result).toEqual(expected);
  });

  // Mask a message with a credit card number that is not valid according to Luhn algorithm
  it('should return the original message when the credit card number is not valid', () => {
    const parsedMessage = 'This is a message with an invalid credit card number: 4111111111111112';
    const expected = 'This is a message with an invalid credit card number: 4111111111111112';
    const result = maskCreditCard(parsedMessage);
    expect(result).toEqual(expected);
  });

  // Mask a message with a credit card number that is valid according to Luhn algorithm but not recognized by the function's checkIsCreditCardNo
  it('should return the original message when the credit card number is valid but not recognized', () => {
    const parsedMessage = 'This is a message with a valid but unrecognized credit card number: 6011111111111117.M';
    const expected = 'This is a message with a valid but unrecognized credit card number: XXXX-XXXX-XXXX-1117.M';
    const result = maskCreditCard(parsedMessage);
    expect(result).toEqual(expected);
  });

  // Mask a message with credit card numbers separated by different characters
  it('should mask multiple reversed credit card numbers separated by different characters', () => {
    const parsedMessage = 'This is a message with credit card numbers: 0015-0150-1501-5015, 4249.3109.9000.1106, and 4249*3109*9000*1106';
    const expected = 'This is a message with credit card numbers: XXXX-XXXX-XXXX-5015, XXXX-XXXX-XXXX-1106, and XXXX-XXXX-XXXX-1106';
    const result = maskCreditCard(parsedMessage);
    expect(result).toEqual(expected);
  });

  // Mask a message with credit card numbers surrounded by different characters
  it('should mask credit card numbers surrounded by different characters', () => {
    const parsedMessage = 'This is a message with credit card numbers: [4012-8888-8888-1881], {1111 2222 3333 4444}, and *1111*2222*3333*4444*';
    const expected = 'This is a message with credit card numbers: [XXXX-XXXX-XXXX-1881], {XXXX-XXXX-XXXX-4444}, and *XXXX-XXXX-XXXX-4444';
    const result = maskCreditCard(parsedMessage);
    expect(result).toEqual(expected);
  });

  // Mask a message with credit card numbers in different formats (e.g. with spaces, dots, dashes)
  it("should mask the credit card numbers in the message with 'XXXX-XXXX-XXXX-XXXX' format", () => {
    const parsedMessage = 'This is a message with credit card numbers: 4012 8888 8888 1881, 4012-8888-8888-1881, 4012.8888.8888.1881';
    const expected = 'This is a message with credit card numbers: XXXX-XXXX-XXXX-1881, XXXX-XXXX-XXXX-1881, XXXX-XXXX-XXXX-1881';
    const result = maskCreditCard(parsedMessage);
    expect(result).toEqual(expected);
  });

  // Mask a message with a credit card number that is valid according to Luhn algorithm but reversed digits are not recognized by the function's checkIsCreditCardNo
  it('should mask the credit card number in the message even if the reversed digits', () => {
    const parsedMessage = 'This is a message with a valid credit card number: 1881888888882104';
    const expected = 'This is a message with a valid credit card number: XXXX-XXXX-XXXX-2104';
    const result = maskCreditCard(parsedMessage);
    expect(result).toEqual(expected);
  });

  // Mask a message with a credit card number that is part of a longer number (e.g. 1234567812345678)
  it('should mask the credit card number in the message even if it is part of a longer number', () => {
    const parsedMessage = 'This is a message with a credit card number as part of a longer number: 4012888888881881';
    const expected = 'This is a message with a credit card number as part of a longer number: XXXX-XXXX-XXXX-1881';
    const result = maskCreditCard(parsedMessage);
    expect(result).toEqual(expected);
  });

  // For credit card numbers where the last character is not a number
  it('should mask the credit card number but retain the last non-numeric character', () => {
    const parsedMessage = 'Number with char: 4111111111111111A and without: 4111111111111111.';
    const expected = 'Number with char: XXXX-XXXX-XXXX-1111A and without: XXXX-XXXX-XXXX-1111.';
    const result = maskCreditCard(parsedMessage);
    expect(result).toEqual(expected);
  });
});

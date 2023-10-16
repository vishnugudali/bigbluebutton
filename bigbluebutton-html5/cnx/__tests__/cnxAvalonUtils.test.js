import cnxAvalonUtils from '../cnxAvalonUtils';

describe('avalonMask', () => {
  // Input string with no email addresses
  it('should return the input string unchanged when there are no email addresses', () => {
    const input = 'This is a test string with no email addresses';
    const expected = 'This is a test string with no email addresses';
    const result = cnxAvalonUtils.avalonMask(input);
    expect(result).toEqual(expected);
  });

  // Input string with one valid email address
  it('should mask the valid email address in the input string', () => {
    const input = 'This is a test string with an email address: test@example.com';
    const expected = 'This is a test string with an email address: t***@*****.***';
    const result = cnxAvalonUtils.avalonMask(input);
    expect(result).toEqual(expected);
  });

  // Input string with multiple valid email addresses
  it('should mask all valid email addresses in the input string', () => {
    const input = 'This is a test string with multiple email addresses: test1@example.com, test2@example.com, test@gmail.co.in. test@test.com_test@gmail.com_test@gmail.com.in_';
    const expected = 'This is a test string with multiple email addresses: te***@*****.***, te***@*****.***, t***@*****.***.***. t***@*****.***_t***@*****.***_t***@*****.***.***_';
    const result = cnxAvalonUtils.avalonMask(input);
    expect(result).toEqual(expected);
  });

  // Input string with invalid email addresses
  it('should return the input string unchanged when there are invalid email addresses', () => {
    const input = 'This is a test string with invalid email addresses: test@example, test@example.';
    const expected = 'This is a test string with invalid email addresses: test@example, test@example.';
    const result = cnxAvalonUtils.avalonMask(input);
    expect(result).toEqual(expected);
  });

  // Input string with email addresses containing invalid characters
  it('should return the input string unchanged when there are email addresses with invalid characters', () => {
    const input = 'This is a test string with email addresses containing invalid characters: test@exa_mple.com, test@exa-mple.com';
    const expected = 'This is a test string with email addresses containing invalid characters: test@exa_mple.com, t***@*****.***';
    const result = cnxAvalonUtils.avalonMask(input);
    expect(result).toEqual(expected);
  });

  // Input string with email addresses containing invalid top-level domains
  it('should return the input string unchanged when there are email addresses with invalid top-level domains', () => {
    const input = 'This is a test string with email addresses containing invalid top-level domains: test@example.xyz, test@example.abc';
    const expected = 'This is a test string with email addresses containing invalid top-level domains: test@example.xyz, test@example.abc';
    const result = cnxAvalonUtils.avalonMask(input);
    expect(result).toEqual(expected);
  });
});

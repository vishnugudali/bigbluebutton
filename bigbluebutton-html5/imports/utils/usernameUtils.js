/**
 * Extracts the username part from a formatted username string
 * @param {string | null | undefined} fullUsername - The username in format "username~@||@~email" or plain username
 * @returns {string} - Just the username portion
 */
export const extractUsername = (fullUsername) => {
  if (!fullUsername || typeof fullUsername !== 'string') {
    return '';
  }

  return fullUsername.split('~@||@~')[0]
};

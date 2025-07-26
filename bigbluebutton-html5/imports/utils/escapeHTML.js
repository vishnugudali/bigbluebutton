/**
 * Strip out all HTML tags (and any auto‑linked URLs) from a string,
 * returning only the plain text.
 */

export function escapeHTML(str) {
	const tmp = document.createElement('div');
	tmp.innerHTML = str;
	// textContent unwraps any entities and removes all tags
	return tmp.textContent || tmp.innerText || '';
}


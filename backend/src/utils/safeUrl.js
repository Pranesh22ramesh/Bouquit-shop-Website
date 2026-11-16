const isSafeUrl = (value) => {
  if (typeof value !== 'string' || /[\s\\\u0000-\u001f\u007f]/.test(value)) return false;
  if (value === '') return true;
  if (value.startsWith('/')) return !value.startsWith('//');
  if (!/^https:\/\//i.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch (_) { return false; }
};

module.exports = { isSafeUrl };

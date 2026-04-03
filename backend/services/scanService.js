exports.checkMalware = (filename) => {
  const suspicious = [".exe", ".bat", ".sh", ".js"];

  return suspicious.some(ext =>
    filename.toLowerCase().endsWith(ext)
  );
};

exports.checkURL = (url) => {
  const suspicious = ["login", "verify", "bank", "free"];

  return suspicious.some(word =>
    url.toLowerCase().includes(word)
  );
};
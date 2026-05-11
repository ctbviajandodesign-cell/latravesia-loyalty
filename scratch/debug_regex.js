const pageRegex = /unsplash\.com\/.*?(?:fotos|photos)\/([a-zA-Z0-9_-]+)/;
const testUrl = "https://unsplash.com/es/fotos/e4kmTGIQFIw";
const match = testUrl.match(pageRegex);
console.log("Match:", match);
if (match) console.log("ID:", match[1]);

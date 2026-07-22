const espree = require("espree");
const fs = require("fs");

const path = process.argv[2];
let src = fs.readFileSync(path, "utf8");

const ast = espree.parse(src, {
  ecmaVersion: "latest", sourceType: "module",
  comment: true, range: true, ecmaFeatures: { jsx: true },
});

const comments = ast.comments || [];
comments.sort((a, b) => b.range[0] - a.range[0]);

for (const c of comments) {
  let [s, e] = c.range;
  let li = s - 1;
  while (li >= 0 && (src[li] === " " || src[li] === "\t")) li--;
  let ri = e;
  while (ri < src.length && (src[ri] === " " || src[ri] === "\t")) ri++;
  if (src[li] === "{" && src[ri] === "}") { s = li; e = ri + 1; }
  src = src.slice(0, s) + src.slice(e);
}

// Normalize: strip trailing whitespace per line, squeeze 3+ blank lines to 1 blank,
// trim leading blank lines, ensure single trailing newline.
let lines = src.split(/\r?\n/).map((l) => l.replace(/[ \t]+$/,""));
const out = [];
let blank = 0;
for (const l of lines) {
  if (l === "") { blank++; if (blank <= 1) out.push(l); }
  else { blank = 0; out.push(l); }
}
while (out.length && out[0] === "") out.shift();
while (out.length && out[out.length-1] === "") out.pop();
fs.writeFileSync(path, out.join("\n") + "\n");
console.log(`OK ${path}`);

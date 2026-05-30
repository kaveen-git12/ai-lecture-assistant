const fetch = require('node-fetch'); // actually fetch is global in Node 18+
async function run() {
  const res = await fetch("http://localhost:3000/api/llm/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "hi" })
  });
  console.log(await res.text());
}
run();

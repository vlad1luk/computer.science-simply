const http = require("http");
const url = require("url");
const vm = require("vm");
require("dotenv").config();
const { OpenAI } = require("openai");


// SOURCES
// https://nodejs.org/api/vm.html#vm-executing-javascript
// https://platform.openai.com/


// const sandbox = {
//   console: {
//     log: (...args) => {
//       sandbox.output.push(args.join(" "));
//     },
//   },
//   output: [],
// };

function allowCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function openai_req(question) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: question },
      ],
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error during OpenAI API call:", error);
    return "Service temporairement indisponible.";
  }
}

function getScriptResult(code) {
  const sandbox = {
    console: {
      log: (...args) => {
        sandbox.output.push(args.join(" "));
      },
    },
    output: [],
  };

  const context = vm.createContext(sandbox);

  try {
    vm.runInContext(code, context, { timeout: 1000 }); // Timeout de 1 seconde
    return {
      output: sandbox.output.join("\n") || "No output",
    };
  } catch (error) {
    return {
      error: error.message,
    };
  }
}

const server = http.createServer(async (req, res) => {
  allowCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  if (req.method === "GET" && parsedUrl.pathname === "/question") {
    const question = parsedUrl.query.question;
    const responseText = await openai_req(question);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(responseText);

  } else if (req.method === "POST" && parsedUrl.pathname === "/run") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const { code } = JSON.parse(body);
      console.log("Code reçu :\n", code);

      const result = getScriptResult(code);

      console.log(result);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

const PORT = 3033;
server.listen(PORT, () => {
  console.log(`Le serveur écoute sur le port ${PORT}`);
});
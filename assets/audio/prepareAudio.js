const fs = require("fs");
const files = fs.readdirSync("./assets/audio").filter(x => x.includes("mp3"));
const ex =
  "{\n" +
  files.map(x => `"${x.split(".mp3")[0]}": require("./${x}"),`).join("\n") +
  "}";
const res = "export default " + ex;
fs.writeFileSync("./assets/audio/index.js", res);

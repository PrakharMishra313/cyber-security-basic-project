
const { exec } = require("child_process");

function runNmapScan(target, ports = "1-1000") {
  return new Promise((resolve, reject) => {
    const command = `nmap -p ${ports} -sV -oX - ${target}`;

    console.log("Running:", command);

    exec(command, { maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Error:", stderr);
        return reject(stderr);
      }

      const results = [];

      // 🔥 Extract ports using simple XML parsing (no library needed)
      const portMatches = stdout.match(/<port protocol="tcp" portid="(.*?)">([\s\S]*?)<\/port>/g);

      if (portMatches) {
        portMatches.forEach((block) => {
          const port = block.match(/portid="(\d+)"/)?.[1];
          const state = block.match(/state state="(.*?)"/)?.[1];
          const service = block.match(/name="(.*?)"/)?.[1];

          if (state === "open") {
            results.push({
              port: parseInt(port),
              state,
              service,
            });
          }
        });
      }

      resolve(results);
    });
  });
}

module.exports = { runNmapScan };

import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";

export function prompt(question: string, hidden = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (hidden) {
      const stdin = process.stdin as any;
      stdin.setRawMode?.(true);
      process.stdout.write(question);

      let input = "";
      stdin.on("data", (char: Buffer) => {
        const c = char.toString();
        if (c === "\n" || c === "\r" || c === "\u0004") {
          stdin.setRawMode?.(false);
          stdin.pause();
          process.stdout.write("\n");
          rl.close();
          resolve(input);
        } else if (c === "\u0003") {
          process.exit();
        } else if (c === "\u007f" || c === "\b") {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else {
          input += c;
        }
      });
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

export function getShellConfigFile(): string {
  const home = os.homedir();
  const shell = process.env.SHELL || "";

  if (shell.includes("zsh")) {
    return path.join(home, ".zshrc");
  } else if (shell.includes("bash")) {
    const bashProfile = path.join(home, ".bash_profile");
    const bashrc = path.join(home, ".bashrc");
    if (fs.existsSync(bashProfile)) {
      return bashProfile;
    }
    return bashrc;
  } else if (shell.includes("fish")) {
    return path.join(home, ".config/fish/config.fish");
  }

  return path.join(home, ".bashrc");
}

export function sourceShellConfig(configFile: string): void {
  try {
    const shell = process.env.SHELL || "";

    if (shell.includes("fish")) {
      const output = execSync(`fish -c "source ${configFile}; env"`, {
        encoding: "utf-8",
      });
      output.split("\n").forEach((line) => {
        if (
          line.includes("AI_CHAT_CMS_") ||
          line.includes("LLM_") ||
          line.includes("UPLOAD_API_")
        ) {
          const [key, ...valueParts] = line.split("=");
          const value = valueParts.join("=");
          if (key && value) {
            process.env[key] = value;
          }
        }
      });
    } else {
      const output = execSync(`source ${configFile} && env`, {
        shell: shell || "/bin/bash",
        encoding: "utf-8",
      });
      output.split("\n").forEach((line) => {
        if (
          line.includes("AI_CHAT_CMS_") ||
          line.includes("LLM_") ||
          line.includes("UPLOAD_API_")
        ) {
          const [key, ...valueParts] = line.split("=");
          const value = valueParts.join("=");
          if (key && value) {
            process.env[key] = value;
          }
        }
      });
    }

    console.log(" Configuration loaded successfully!");
  } catch (error) {
    console.log("\n�  Could not auto-load configuration.");
    console.log(`   Please reload your shell: source ${configFile}`);
    console.log("   Or restart your terminal.\n");
  }
}

export function updateShellConfig(vars: Record<string, string>): void {
  const configFile = getShellConfigFile();
  let content = "";

  if (fs.existsSync(configFile)) {
    content = fs.readFileSync(configFile, "utf-8");
  }

  if (!content.includes("# AI Chat CMS Configuration")) {
    content += "\n# AI Chat CMS Configuration\n";
  }

  for (const [key, value] of Object.entries(vars)) {
    const pattern = new RegExp(`export ${key}=.*`);
    const line = `export ${key}="${value}"`;
    if (pattern.test(content)) {
      content = content.replace(pattern, line);
    } else {
      content += `${line}\n`;
    }
  }

  fs.writeFileSync(configFile, content, "utf-8");

  console.log(`\n  Configuration saved to: ${configFile}`);

  sourceShellConfig(configFile);

  console.log("\n  You're all set! Run: chatai-script fetch\n");
}

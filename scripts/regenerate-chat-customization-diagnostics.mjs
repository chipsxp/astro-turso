import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const DIAGNOSTICS_FILE = path.join(
  ROOT,
  "## Chat Customization Diagnostics.md",
);

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dirPath, suffix) {
  if (!(await fileExists(dirPath))) {
    return [];
  }

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

async function findLatestExtensionFolder(prefix) {
  const extensionsDir = path.join(os.homedir(), ".vscode", "extensions");
  if (!(await fileExists(extensionsDir))) {
    return null;
  }

  const entries = await fs.readdir(extensionsDir, { withFileTypes: true });
  const matches = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(prefix))
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a));

  return matches[0] ?? null;
}

function relFromRoot(toAbsolutePath) {
  return path
    .relative(ROOT, toAbsolutePath)
    .replace(/\\/g, "/")
    .replace(/^\.\//, "");
}

function renderTreeLine(name, link, isLast) {
  const branch = isLast ? "└─" : "├─";
  return `${branch} [\`${name}\`](${link})<br>`;
}

async function main() {
  const githubAgents = await listFiles(
    path.join(ROOT, ".github", "agents"),
    ".agent.md",
  );
  const githubInstructions = await listFiles(
    path.join(ROOT, ".github", "instructions"),
    ".instructions.md",
  );
  const githubPrompts = await listFiles(
    path.join(ROOT, ".github", "prompts"),
    ".prompt.md",
  );
  const githubHooks = await listFiles(
    path.join(ROOT, ".github", "hooks"),
    ".json",
  );

  const aiStudioFolder = await findLatestExtensionFolder(
    "ms-windows-ai-studio.windows-ai-studio-",
  );
  const copilotChatFolder = await findLatestExtensionFolder(
    "github.copilot-chat-",
  );

  const aiStudioBase = aiStudioFolder
    ? relFromRoot(
        path.join(os.homedir(), ".vscode", "extensions", aiStudioFolder),
      )
    : "../../.vscode/extensions/<missing-ms-windows-ai-studio-version>";

  const copilotChatBase = copilotChatFolder
    ? relFromRoot(
        path.join(os.homedir(), ".vscode", "extensions", copilotChatFolder),
      )
    : "../../.vscode/extensions/<missing-github-copilot-chat-version>";

  const customAgentsCount = githubAgents.length + 3; // AI Studio (2) + Copilot Plan (1)
  const instructionsCount = githubInstructions.length + 1; // AGENTS.md
  const promptsCount = githubPrompts.length + 3; // built-in Copilot prompts

  const lines = [];
  lines.push("## Chat Customization Diagnostics", "");
  lines.push("_WARNING: This file may contain sensitive information._", "");

  lines.push("**Custom Agents**<br>");
  lines.push(`_${customAgentsCount} files loaded_`, "");
  lines.push(".github/agents<br>");
  githubAgents.forEach((file, index) => {
    const link = `.github/agents/${file}`;
    lines.push(renderTreeLine(file, link, index === githubAgents.length - 1));
  });
  lines.push(".claude/agents<br>");
  lines.push("User Data<br>");
  lines.push("Extension: ms-windows-ai-studio.windows-ai-studio<br>");
  lines.push(
    `├─ [\`AIAgentExpert.agent.md\`](${aiStudioBase}/resources/lmt/chatAgents/AIAgentExpert.agent.md)<br>`,
  );
  lines.push(
    `└─ [\`DataAnalysisExpert.agent.md\`](${aiStudioBase}/resources/lmt/chatAgents/DataAnalysisExpert.agent.md)<br>`,
  );
  lines.push("Extension: GitHub.copilot-chat<br>");
  lines.push(
    "└─ [`Plan.agent.md`](../../AppData/Roaming/Code/User/globalStorage/github.copilot-chat/plan-agent/Plan.agent.md)<br>",
  );
  lines.push("");

  lines.push("**Instructions**<br>");
  lines.push(`_${instructionsCount} files loaded_`, "");
  lines.push(".github/instructions<br>");
  githubInstructions.forEach((file, index) => {
    const link = `.github/instructions/${file}`;
    lines.push(
      renderTreeLine(file, link, index === githubInstructions.length - 1),
    );
  });
  lines.push(".claude/rules<br>");
  lines.push("~/.claude/rules<br>");
  lines.push("User Data<br>");
  lines.push("AGENTS.md<br>");
  lines.push("└─ [`AGENTS.md`](AGENTS.md)<br>");
  lines.push("");

  lines.push("**Prompt Files**<br>");
  lines.push(`_${promptsCount} files loaded_`, "");
  lines.push(".github/prompts<br>");
  githubPrompts.forEach((file, index) => {
    const link = `.github/prompts/${file}`;
    lines.push(renderTreeLine(file, link, index === githubPrompts.length - 1));
  });
  lines.push("User Data<br>");
  lines.push("Extension: GitHub.copilot-chat<br>");
  lines.push(
    `├─ [\`savePrompt.prompt.md\`](${copilotChatBase}/assets/prompts/savePrompt.prompt.md)<br>`,
  );
  lines.push(
    `├─ [\`plan.prompt.md\`](${copilotChatBase}/assets/prompts/plan.prompt.md)<br>`,
  );
  lines.push(
    `└─ [\`init.prompt.md\`](${copilotChatBase}/assets/prompts/init.prompt.md)<br>`,
  );
  lines.push("");

  lines.push("**Skills**<br>");
  lines.push("_4 skills loaded_", "");
  lines.push(".github/skills<br>");
  lines.push(".agents/skills<br>");
  lines.push(
    "└─ [`eraser-diagrams`](.agents/skills/eraser-diagrams/SKILL.md)<br>",
  );
  lines.push(".claude/skills<br>");
  lines.push(
    "└─ [`project-memory`](.claude/skills/project-memory/SKILL.md)<br>",
  );
  lines.push("~/.copilot/skills<br>");
  lines.push("~/.agents/skills<br>");
  lines.push(
    "└─ [`find-skills`](../../.agents/skills/find-skills/SKILL.md)<br>",
  );
  lines.push("~/.claude/skills<br>");
  lines.push("Extension: ms-windows-ai-studio.windows-ai-studio<br>");
  lines.push(
    `└─ [\`agent-workflow-builder_ai_toolkit\`](${aiStudioBase}/resources/skills/agent-workflow-builder_ai_toolkit/SKILL.md)<br>`,
  );
  lines.push("");

  lines.push("**Hooks**<br>");
  lines.push("_2 skipped_", "");
  lines.push("_No files loaded_", "");

  if (githubHooks.length > 0) {
    lines.push(
      "Workspace hook files present but not loaded by this diagnostics view:<br>",
    );
    githubHooks.forEach((file, index) => {
      const link = `.github/hooks/${file}`;
      lines.push(renderTreeLine(file, link, index === githubHooks.length - 1));
    });
  }

  await fs.writeFile(DIAGNOSTICS_FILE, `${lines.join("\n")}\n`, "utf8");
  console.log(`Regenerated ${path.basename(DIAGNOSTICS_FILE)}`);
  console.log(
    `Detected Copilot Chat folder: ${copilotChatFolder ?? "not found"}`,
  );
  console.log(`Detected AI Studio folder: ${aiStudioFolder ?? "not found"}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

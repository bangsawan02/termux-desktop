import express from "express";
import path from "path";
import { exec } from "child_process";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function to run shell commands as a promise
function runCommand(cmd: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      resolve({
        stdout: stdout || "",
        stderr: stderr || "",
        code: error ? error.code || 1 : 0
      });
    });
  });
}

let cachedRemoteUrl = "";

async function initGitRemoteUrl() {
  const res = await runCommand("git config --get remote.origin.url");
  if (res.code === 0 && res.stdout.trim()) {
    cachedRemoteUrl = res.stdout.trim();
    console.log("Cached Git Remote URL successfully.");
  }
}
initGitRemoteUrl();

// 1. Get Git Status
app.get("/api/git/status", async (req, res) => {
  try {
    const statusResult = await runCommand("git status --porcelain");
    const branchResult = await runCommand("git branch --show-current");
    const rawResult = await runCommand("git status");

    const lines = statusResult.stdout.split("\n").filter(Boolean);
    const modified: string[] = [];
    const untracked: string[] = [];

    lines.forEach(line => {
      const type = line.slice(0, 2);
      const file = line.slice(3).trim();
      if (type.includes("M") || type.includes("A") || type.includes("D") || type.includes("R")) {
        modified.push(file);
      } else if (type.includes("?")) {
        untracked.push(file);
      }
    });

    res.json({
      success: true,
      branch: branchResult.stdout.trim() || "main",
      modified,
      untracked,
      raw: rawResult.stdout || statusResult.stderr || "No status output"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Commit and Push
app.post("/api/git/push", async (req, res) => {
  const { commitMessage, files } = req.body;
  if (!commitMessage) {
    return res.status(400).json({ success: false, error: "Commit message is required" });
  }

  try {
    let filesToAdd = ".";
    if (files && Array.isArray(files) && files.length > 0) {
      filesToAdd = files.map(f => `"${f}"`).join(" ");
    }

    const addRes = await runCommand(`git add ${filesToAdd}`);
    if (addRes.code !== 0) {
      return res.json({
        success: false,
        error: "Failed to stage files",
        output: addRes.stderr || addRes.stdout
      });
    }

    // Try to commit
    const commitRes = await runCommand(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
    if (commitRes.code !== 0 && !commitRes.stdout.includes("nothing to commit")) {
      return res.json({
        success: false,
        error: "Failed to commit changes",
        output: commitRes.stderr || commitRes.stdout
      });
    }

    // Push to remote
    const branchRes = await runCommand("git branch --show-current");
    const currentBranch = branchRes.stdout.trim() || "main";
    const pushRes = await runCommand(`git push origin ${currentBranch}`);

    if (pushRes.code !== 0) {
      return res.json({
        success: false,
        error: "Failed to push to GitHub",
        output: pushRes.stderr || pushRes.stdout
      });
    }

    res.json({
      success: true,
      output: [commitRes.stdout, pushRes.stdout, pushRes.stderr].filter(Boolean).join("\n")
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Fix Corrupted Git Repository
app.post("/api/git/fix", async (req, res) => {
  try {
    let remoteUrl = cachedRemoteUrl;
    if (!remoteUrl) {
      const remoteRes = await runCommand("git config --get remote.origin.url");
      if (remoteRes.code === 0 && remoteRes.stdout.trim()) {
        remoteUrl = remoteRes.stdout.trim();
      }
    }
    if (!remoteUrl) {
      remoteUrl = "https://github.com/bangsawan02/termux-desktop.git";
    }

    const steps = [
      "rm -rf /tmp/fresh-clone",
      `git clone --depth 1 ${remoteUrl} /tmp/fresh-clone`,
      "rm -rf .git",
      "mv /tmp/fresh-clone/.git .git",
      "git status"
    ];

    let combinedOutput = "";
    for (const step of steps) {
      combinedOutput += `> ${step}\n`;
      const cmdRes = await runCommand(step);
      combinedOutput += cmdRes.stdout + cmdRes.stderr + "\n";
      if (step.startsWith("git clone") && cmdRes.code !== 0) {
        return res.json({
          success: false,
          error: "Failed during clone repair step",
          output: combinedOutput
        });
      }
    }

    res.json({
      success: true,
      output: combinedOutput
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vite / SPA integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function collectFiles(startDir, extension, results = []) {
  const entries = readdirSync(startDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".git") {
      continue;
    }

    const fullPath = join(startDir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, extension, results);
      continue;
    }

    if (entry.isFile() && fullPath.endsWith(extension)) {
      results.push(fullPath);
    }
  }
  return results;
}

function validateJavaScriptSyntax(jsFiles) {
  const errors = [];
  for (const filePath of jsFiles) {
    try {
      execFileSync("node", ["--check", filePath], { stdio: "pipe" });
    } catch (error) {
      errors.push(`JS構文エラー: ${filePath}\n${String(error.stderr || error.message)}`);
    }
  }
  return errors;
}

function validateLocalLinks(htmlFiles) {
  const errors = [];
  const assetPattern = /(?:href|src)=["']([^"'#?]+)["']/g;

  for (const filePath of htmlFiles) {
    const htmlText = readFileSync(filePath, "utf8");
    const fileDir = dirname(filePath);

    for (const match of htmlText.matchAll(assetPattern)) {
      const pathValue = match[1];
      if (
        pathValue.startsWith("http://") ||
        pathValue.startsWith("https://") ||
        pathValue.startsWith("mailto:") ||
        pathValue.startsWith("tel:")
      ) {
        continue;
      }

      const targetPath = resolve(fileDir, pathValue);
      if (!existsSync(targetPath) || !statSync(targetPath).isFile()) {
        errors.push(`リンク切れ: ${filePath} -> ${pathValue}`);
      }
    }
  }

  return errors;
}

const jsFiles = collectFiles(rootDir, ".js");
const htmlFiles = collectFiles(rootDir, ".html");

const allErrors = [
  ...validateJavaScriptSyntax(jsFiles),
  ...validateLocalLinks(htmlFiles)
];

if (allErrors.length > 0) {
  console.error("ビルド前チェックで問題を検出しました。\n");
  for (const error of allErrors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("ビルド前チェックOK: JS構文とローカルリンクに問題はありません。");

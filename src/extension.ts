// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, extension "u-copyright" is now active!');

  let pkg: {
    name: string;
    version: string;
    author: string | { name: string };
    license: string;
    repository: string | { url: string };
  };

  const updatePackageJson = async () => {
    console.log("updatePackageJson");
    let packageJsonStr;
    try {
      const base = vscode.workspace.workspaceFolders?.[0].uri;

      if (base) {
        const packageJsonUri = vscode.Uri.joinPath(base, "package.json");
        packageJsonStr = JSON.parse(
          (await vscode.workspace.fs.readFile(packageJsonUri)).toString()
        );

        vscode.window.showInformationMessage("u-copyright: package.json updated!");
      }
    } catch (error: any) {
      vscode.window.showInformationMessage(
        "u-copyright: package.json not updated with error: \n" + error.message + "!"
      );
    } finally {
      pkg = {
        name: "u-copyright",
        version: "0.0.0",
        author: "https://github.com/undefinedofficial",
        license: "MIT",
        repository: "https://github.com/undefinedofficial/u-copyright.git",
        ...(packageJsonStr || {}),
      };
    }
  };

  updatePackageJson();

  const createTemplate = (data?: string) =>
    `/**
 * ${pkg?.name || ""} v${pkg?.version || ""}
 * ${(typeof pkg.repository === "object" ? pkg.repository?.url : pkg.repository) || ""}
 *
 * Copyright (c) ${new Date().getFullYear()} ${
      (typeof pkg?.author === "object" ? pkg?.author.name : pkg?.author) || ""
    }
 * Released under the ${pkg?.license || ""} license
 */\n\n` + (data || "");

  const watcher = vscode.workspace.createFileSystemWatcher(
    "**/*.{js,jsx,ts,tsx,json}",
    false,
    false,
    true
  );

  watcher.onDidCreate((uri) => {
    // eslint-disable-next-line curly
    if (uri.fsPath.endsWith("package.json")) return updatePackageJson();

    vscode.commands.executeCommand("u-copyright.insert-copyright");
  });

  watcher.onDidChange((uri) => {
    // eslint-disable-next-line curly
    if (uri.fsPath.endsWith("package.json")) return updatePackageJson();
  });

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("u-copyright.insert-copyright", async () => {
    vscode.window.activeTextEditor?.edit((editBuilder) => {
      const text = vscode.window.activeTextEditor?.document.getText(new vscode.Range(0, 0, 7, 0));
      if (text === undefined) return;

      const start = text.indexOf("/**");
      const end = text.lastIndexOf(" */");
      if (start === -1 || end === -1) {
        editBuilder.insert(new vscode.Position(0, 0), createTemplate());
        return;
      }
      editBuilder.replace(new vscode.Range(start, 0, 8, 0), createTemplate());
    });
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import path = require('path');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('TCD CSU1102x helper extension is active');

	// Check for bad Windows UNC paths (which are unsupported)
	checkWinUncFolder();
	
	// Register commands
	let disposable = vscode.commands.registerCommand('tcd-csu1102x-helper.applyConfig', applyConfig);

	context.subscriptions.push(disposable);
}


interface IHelperConfig {
	name: string;
	ordinal?: number;
	helperSettings: object;
	globalSettings: object;
}


async function quickPickConfig(): Promise<(IHelperConfig | undefined)> {

	class QuickPickModuleConfig implements vscode.QuickPickItem {
		label: string;
		description: string;
		spec: IHelperConfig;
		ordinal: number = 99;
		constructor(filename: string, config: IHelperConfig) {
			this.label = config.name;
			this.description = filename;
			this.spec = config;
			this.ordinal = config.ordinal || 99;
		}
	}

	const settingsPath = path.join(__dirname, '..', 'resources', 'settings');
	const settingsFiles = fs.readdirSync(settingsPath);

	const qpItems = [];
	for (const file of settingsFiles) {
		console.log("Found: " + file);
		const configPath = path.join(settingsPath, file);
		try {
			const rawJson = fs.readFileSync(configPath, 'utf8');
			const config = JSON.parse(rawJson);	
			qpItems.push(new QuickPickModuleConfig(file, config));
		} catch (err) {
			console.log("Error parsing file: " + file);
			console.log(err);
		}
	}

	if (qpItems.length === 0) {
		vscode.window.showInformationMessage('No configurations found.');
		return undefined;
	}

	qpItems.sort((a, b) => a.ordinal - b.ordinal);

	// Prompt user to select a module
	const pick = await vscode.window.showQuickPick(qpItems, {
		placeHolder: "Select a configuration to apply to your Visual Studio Code settings.",
		canPickMany: false
	});

	return pick?.spec as IHelperConfig;
}


// Implementation of command 'Apply Configuration'
// Applies configurations settings from a JSON object
//   to VSCode user settings.
export async function applyConfig() {

	// Retrieve available configurations and ask user to select one
	const newConf = await quickPickConfig();

	if (newConf === undefined) {
		return;
	}

	console.log("Selected: " + newConf.name);

	const conf = vscode.workspace.getConfiguration('tcd-csu1102x-helper');

	for (const[key, value] of Object.entries(newConf.helperSettings)) {
		try {
			await conf.update(key, value, vscode.ConfigurationTarget.Global);
		}
		catch (err) {
			console.log("Error merging settings.");
			console.log(err);
			vscode.window.showErrorMessage('An error occurred when updating setting for ' + key + ".");
			return;
		}
	}
}


function checkWinUncFolder() {

	if (process.platform !== 'win32') {
		return;
	}

	if (vscode.workspace.workspaceFolders === undefined) {
		return;
	}
	
	if (vscode.workspace.workspaceFolders.length == 0)
	{
		return;
	}

	const folder = vscode.workspace.workspaceFolders[0];
	console.log("Checking folder: " + folder.uri.fsPath);

	const regex = new RegExp("^\\\\\\\\tholosug\\.(?:itserv\\.)?scss\\.tcd\\.ie\\\\ugrad\\\\[a-zA-Z0-9_]+\\\\", "i");
	if (regex.test(folder.uri.fsPath)) {
		console.log("UNC path detected.");
		const fixPath = folder.uri.fsPath.replace(regex, 'U:\\');
		let fixAvailable = false;
		try {
			fs.accessSync(fixPath);
			fixAvailable = true;
		}
		catch (err) {
			fixAvailable = false;
		}
		if (fixAvailable) {
			console.log("Fix path available.");
			vscode.window
				.showErrorMessage(
					"Network (UNC) paths are not supported for CSU11021/CSU11022. " +
					"Close this window and re-open the project from a mapped network drive (e.g. your U: drive). " +
					"Would you like to try to do this automatically?",
					"Yes", "No")
				.then(answer => {
					if (answer === "Yes") {
						const fixUri = vscode.Uri.file(fixPath);
						vscode.commands.executeCommand('vscode.openFolder', fixUri);
					}
				});
		}
		else {
			console.log("Fix path not available.");
			vscode.window.showErrorMessage(
				"Network (UNC) paths are not supported by CSU11021/CSU11022.\n" +
				"Close this window and re-open the project from a mapped network drive (e.g. your U: drive).");
		}
	}
	else {
		console.log("Not a UNC path.");
	}
}


// This method is called when your extension is deactivated
export function deactivate() {}

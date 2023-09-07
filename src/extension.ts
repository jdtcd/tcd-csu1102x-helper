// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import path = require('path');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('TCD CSU1102x helper extension is now active!');

	const userDnsDomain = process.env['USERDNSDOMAIN'];
	if (userDnsDomain !== undefined) {
		console.log("USERDNSDOMAIN=%s", userDnsDomain);
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
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
	const config = await quickPickConfig();

	if (config === undefined) {
		return;
	}

	console.log("Selected: " + config.name);

	// Apply selected module configuration
	const conf = vscode.workspace.getConfiguration();
	const helperConf = conf.get('tcd-csu1102x-helper', {});

	try {
		const newConf = Object.assign(config.helperSettings, helperConf);
		conf.update('tcd-csu1102x-helper', newConf, vscode.ConfigurationTarget.Global).then(() => {
			vscode.window.showInformationMessage('Settings updated!');
		});
		}
	catch (err) {
		console.log("Error merging settings.");
		console.log(err);
		vscode.window.showErrorMessage('An error occurred when updating settings.');
		return;
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}

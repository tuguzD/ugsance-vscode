import * as vs from 'vscode';
import { MultiStepInput } from './model';

export async function multiStepInput() {
	const resourceGroups: vs.QuickPickItem[] = [
		'vscode-data-function',
		'vscode-appservice-microservices', 'vscode-appservice-monitor',
		'vscode-appservice-preview', 'vscode-appservice-prod',
	].map(label => ({ label }));

	const title = 'Create Application Service';
	const state = await collectInputs();
	vs.window.showInformationMessage(`Creating Application Service '${state.name}'`);

	interface State {
		title: string;
		step: number; totalSteps: number;
		resourceGroup: vs.QuickPickItem;
		name: string; runtime: vs.QuickPickItem;
	}
	async function collectInputs() {
		const state = {} as Partial<State>;
		await MultiStepInput.run(input => pickResourceGroup(input, state));
		return state as State;
	}

	async function pickResourceGroup(input: MultiStepInput, state: Partial<State>) {
		state.resourceGroup = await input.showQuickPick({
			title, step: 1, totalSteps: 3,
			placeholder: 'Pick a resource group',
			items: resourceGroups,
			activeItem: state.resourceGroup,
			buttons: [],
			shouldResume: shouldResume,
		});
		return (input: MultiStepInput) => inputName(input, state);
	}

	async function inputName(input: MultiStepInput, state: Partial<State>) {
		state.name = await input.showInputBox({
			title, step: 2, totalSteps: 3,
			value: state.name || '',
			placeholder: '...',
			prompt: 'Choose a unique name for the Application Service',
			validate: validateNameIsUnique,
			shouldResume: shouldResume,
		});
		return (input: MultiStepInput) => pickRuntime(input, state);
	}

	async function pickRuntime(input: MultiStepInput, state: Partial<State>) {
		const runtimes = await getAvailableRuntimes(state.resourceGroup!, undefined /* TODO: token */);
		state.runtime = await input.showQuickPick({
			title, step: 3, totalSteps: 3,
			placeholder: 'Pick a runtime',
			items: runtimes,
			activeItem: state.runtime,
			shouldResume: shouldResume,
		});
	}

	async function validateNameIsUnique(name: string) {
		return name === 'vscode' ? 'Name not unique' : undefined;
	}

	async function getAvailableRuntimes(
		_resourceGroup: vs.QuickPickItem | string, _token?: vs.CancellationToken,
	): Promise<vs.QuickPickItem[]> {
		// await new Promise(resolve => setTimeout(resolve, 1000));
		return ['Node 8.9', 'Node 6.11', 'Node 4.5']
			.map(label => ({ label }));
	}
}

function shouldResume() {
	return new Promise<boolean>((_resolve, _reject) => {
		// noop
	});
}

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
		title: string, step: number, totalSteps: number,
		resourceGroup: vs.QuickPickItem,
		name: string, runtime: vs.QuickPickItem,
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
			items: resourceGroups, activeItem: state.resourceGroup,
			// onHighlight: (items: vs.QuickPickItem[]) =>
			// 	console.log(`HELLO FROM INDEX!!! ${items[0].label}`),
		});
		return (input: MultiStepInput) => inputName(input, state);
	}

	async function inputName(input: MultiStepInput, state: Partial<State>) {
		state.name = await input.showInputBox({
			title, step: 2, totalSteps: 3,
			placeholder: '...', value: state.name || '',
			prompt: 'Choose a unique name for the Application Service',
		});
		return (input: MultiStepInput) => pickRuntime(input, state);
	}

	async function pickRuntime(input: MultiStepInput, state: Partial<State>) {
		const runtimes = ['Node 8.9', 'Node 6.11', 'Node 4.5']
			.map(label => ({ label }));
		state.runtime = await input.showQuickPick({
			title, step: 3, totalSteps: 3,
			placeholder: 'Pick a runtime',
			items: runtimes, activeItem: state.runtime,
		});
	}
}

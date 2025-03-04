import * as vs from 'vscode';

class InputFlowAction {
	static back = new InputFlowAction();
	static cancel = new InputFlowAction();
	static resume = new InputFlowAction();
}

interface QuickPickParameters<T extends vs.QuickPickItem> {
	title: string;
	step: number;
	totalSteps: number;
	items: T[];
	activeItem?: T;
	ignoreFocusOut?: boolean;
	placeholder: string;
	buttons?: vs.QuickInputButton[];
	shouldResume: () => Thenable<boolean>;
}
interface InputBoxParameters {
	title: string;
	step: number;
	totalSteps: number;
	value: string;
	prompt: string;
	validate: (value: string) => Promise<string | undefined>;
	buttons?: vs.QuickInputButton[];
	ignoreFocusOut?: boolean;
	placeholder?: string;
	shouldResume: () => Thenable<boolean>;
}
type InputStep = (input: MultiStepInput) => Thenable<InputStep | void>;

export class MultiStepInput {
	private current?: vs.QuickInput;
	private steps: InputStep[] = [];

	static async run(start: InputStep) {
		const input = new MultiStepInput();
		return input.stepThrough(start);
	}

	private async stepThrough(start: InputStep) {
		let step: InputStep | void = start;
		while (step) {
			this.steps.push(step);
			if (this.current) {
				this.current.enabled = false;
				this.current.busy = true;
			}
			try {
				step = await step(this);
			} catch (err) {
				switch (err) {
					case InputFlowAction.back: {
						this.steps.pop();
						step = this.steps.pop();
						break;
					}
					case InputFlowAction.resume: {
						step = this.steps.pop();
						break;
					}
					case InputFlowAction.cancel: {
						step = undefined;
						break;
					}
					default: throw err;
				}
			}
		}
		if (this.current)
			this.current.dispose();
	}

	async showQuickPick<T extends vs.QuickPickItem, P extends QuickPickParameters<T>>(p: P) {
		const disposables: vs.Disposable[] = [];
		try {
			return await new Promise<T | (
				P extends { buttons: (infer I)[] } ? I : never
			)>((resolve, reject) => {

				const input = vs.window.createQuickPick<T>();
				input.title = p.title;
				input.step = p.step;
				input.totalSteps = p.totalSteps;
				input.ignoreFocusOut = p.ignoreFocusOut ?? false;
				input.placeholder = p.placeholder;
				input.items = p.items;
				if (p.activeItem) {
					input.activeItems = [p.activeItem];
				}
				input.buttons = [
					...(this.steps.length > 1 ? [vs.QuickInputButtons.Back] : []),
					...(p.buttons || [])
				];
				disposables.push(
					input.onDidTriggerButton(item => {
						if (item === vs.QuickInputButtons.Back)
							reject(InputFlowAction.back);
						else resolve((item as any));
					}),
					input.onDidChangeSelection(items => resolve(items[0])),
					input.onDidHide(() => {
						(async () => {
							reject(p.shouldResume && await p.shouldResume()
								? InputFlowAction.resume : InputFlowAction.cancel);
						})().catch(reject);
					})
				);
				if (this.current)
					this.current.dispose();
				this.current = input;
				this.current.show();
			});

		} finally {
			disposables.forEach(d => d.dispose());
		}
	}

	async showInputBox<P extends InputBoxParameters>(p: P) {
		const disposables: vs.Disposable[] = [];
		try {
			return await new Promise<string | (
				P extends { buttons: (infer I)[] } ? I : never
			)>((resolve, reject) => {

				const input = vs.window.createInputBox();
				input.title = p.title;
				input.step = p.step;
				input.totalSteps = p.totalSteps;
				input.value = p.value || '';
				input.prompt = p.prompt;
				input.ignoreFocusOut = p.ignoreFocusOut ?? false;
				input.placeholder = p.placeholder;
				input.buttons = [
					...(this.steps.length > 1 ? [vs.QuickInputButtons.Back] : []),
					...(p.buttons || [])
				];
				let validating = p.validate('');
				disposables.push(
					input.onDidTriggerButton(item => {
						if (item === vs.QuickInputButtons.Back)
							reject(InputFlowAction.back);
						else resolve(item as any);
					}),
					input.onDidAccept(async () => {
						const value = input.value;
						input.enabled = false;
						input.busy = true;
						if (!(await p.validate(value))) {
							resolve(value);
						}
						input.enabled = true;
						input.busy = false;
					}),
					input.onDidChangeValue(async text => {
						const current = p.validate(text);
						validating = current;
						const validationMessage = await current;
						if (current === validating) {
							input.validationMessage = validationMessage;
						}
					}),
					input.onDidHide(() => {
						(async () => {
							reject(p.shouldResume && await p.shouldResume()
								? InputFlowAction.resume : InputFlowAction.cancel);
						})().catch(reject);
					})
				);
				if (this.current)
					this.current.dispose();
				this.current = input;
				this.current.show();
			});

		} finally {
			disposables.forEach(d => d.dispose());
		}
	}
}

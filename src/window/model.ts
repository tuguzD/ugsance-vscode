import * as vs from 'vscode';

class FlowAction {
	static back = new FlowAction();
	static cancel = new FlowAction();
	static resume = new FlowAction();
}

interface QuickPickParameters<T extends vs.QuickPickItem> {
	title: string, step: number, totalSteps: number,
	items: T[], activeItem?: T,
	ignoreFocusOut?: boolean, placeholder: string,
	buttons?: vs.QuickInputButton[],
	shouldResume: () => Thenable<boolean>,
}
interface InputBoxParameters {
	title: string, step: number, totalSteps: number,
	value: string, prompt: string,
	validate: (value: string) => Promise<string | undefined>,
	buttons?: vs.QuickInputButton[],
	ignoreFocusOut?: boolean, placeholder?: string,
	shouldResume: () => Thenable<boolean>,
}
type Step = (input: MultiStepInput) => Thenable<Step | void>;

export class MultiStepInput {
	private current?: vs.QuickInput;
	private steps: Step[] = [];

	static async run(start: Step) {
		const input = new MultiStepInput();
		return input.stepThrough(start);
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
					...(p.buttons || []),
				];
				disposables.push(
					// input.onDidChangeActive(items => {
					// 	console.log(`change selection to ${items[0].label}`)
					// }),
					input.onDidTriggerButton(item => {
						if (item === vs.QuickInputButtons.Back)
							reject(FlowAction.back);
						else resolve((item as any));
					}),
					input.onDidChangeSelection(items => resolve(items[0])),
					input.onDidHide(() => {
						(async () => {
							reject(p.shouldResume && await p.shouldResume()
								? FlowAction.resume : FlowAction.cancel);
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
							reject(FlowAction.back);
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
								? FlowAction.resume : FlowAction.cancel);
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

	private async stepThrough(start: Step) {
		let step: Step | void = start;
		while (step) {
			this.steps.push(step);
			if (this.current) {
				this.current.enabled = false;
				this.current.busy = true;
			}
			try { step = await step(this) }
			catch (err) {
				if (err == FlowAction.back) {
					this.steps.pop();
					step = this.steps.pop();
				} else if (err == FlowAction.resume) {
					step = this.steps.pop();
				} else if (err == FlowAction.cancel) {
					step = undefined;
				} else throw err;
			}
		}
		if (this.current)
			this.current.dispose();
	}
}

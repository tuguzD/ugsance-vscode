import * as vs from 'vscode';

class FlowAction {
	static back = new FlowAction();
	static cancel = new FlowAction();
	static resume = new FlowAction();
}

interface Parameters {
	title: string, step: number, totalSteps: number,
	buttons?: vs.QuickInputButton[],
	ignoreFocusOut?: boolean, placeholder: string,
	shouldResume: () => Thenable<boolean>,
}
interface QuickPickParameters<T extends vs.QuickPickItem> extends Parameters {
	items: T[], activeItem?: T,
}
interface InputBoxParameters extends Parameters {
	value: string, prompt: string,
	validate: (value: string) => Promise<string | undefined>,
}
type Step = (input: MultiStepInput) => Thenable<Step | void>;

export class MultiStepInput {
	private current?: vs.QuickInput;
	private steps: Step[] = [];

	static async run(start: Step) {
		const input = new MultiStepInput();
		return input.stepThrough(start);
	}

	// private async test<T extends vs.QuickPickItem, P extends Parameters>(
	// 	input: vs.QuickPick<T> | vs.InputBox,
	// 	p: P, disposables: vs.Disposable[],
	// ) {
	// 	try {
	// 		return await new Promise<T | (
	// 			P extends { buttons: (infer I)[] } ? I : never
	// 		)>((resolve, reject) => {
	// 			this.modify(input, p, disposables, resolve, reject);
	// 		});
	// 	} finally { disposables.forEach(d => d.dispose()) }
	// }

	async showQuickPick<T extends vs.QuickPickItem, P extends QuickPickParameters<T>>(p: P) {
		const input = vs.window.createQuickPick<T>();
		input.items = p.items;
		input.activeItems = p.activeItem ? [p.activeItem] : [];

		const disposables: vs.Disposable[] = [];
		try {
			return await new Promise<T | (
				P extends { buttons: (infer I)[] } ? I : never
			)>((resolve, reject) => {
				disposables.push(
					// input.onDidChangeActive(items => {
					// 	console.log(`change selection to ${items[0].label}`)
					// }),
					input.onDidChangeSelection(items => resolve(items[0])),
				);
				this.quickInput(input, p, disposables, resolve, reject);
			});
		} finally { disposables.forEach(d => d.dispose()) }
	}

	async showInputBox<P extends InputBoxParameters>(p: P) {
		const input = vs.window.createInputBox();
		input.value = p.value || '';
		input.prompt = p.prompt;
		let validating = p.validate('');

		const disposables: vs.Disposable[] = [];
		try {
			return await new Promise<string | (
				P extends { buttons: (infer I)[] } ? I : never
			)>((resolve, reject) => {
				disposables.push(
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
				);
				this.quickInput(input, p, disposables, resolve, reject);
			});
		} finally { disposables.forEach(d => d.dispose()) }
	}

	private quickInput<T extends vs.QuickPickItem, P extends Parameters>(
		input: vs.QuickPick<T> | vs.InputBox,
		p: P, disposables: vs.Disposable[],
		resolve: any, reject: any,
	) {
		input.title = p.title;
		input.step = p.step;
		input.totalSteps = p.totalSteps;
		input.ignoreFocusOut = p.ignoreFocusOut ?? false;

		input.placeholder = p.placeholder;
		input.buttons = [
			...(this.steps.length > 1 ? [vs.QuickInputButtons.Back] : []),
			...(p.buttons || []),
		];

		disposables.push(
			input.onDidTriggerButton(button => {
				if (button === vs.QuickInputButtons.Back)
					reject(FlowAction.back);
				else resolve(button as any);
			}),
			input.onDidHide(() => {
				(async () => {
					reject(p.shouldResume && await p.shouldResume()
						? FlowAction.resume : FlowAction.cancel);
				})().catch(reject);
			}),
		);

		if (this.current)
			this.current.dispose();
		this.current = input;
		this.current.show();
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

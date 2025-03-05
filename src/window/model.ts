import * as vs from 'vscode';

interface Parameters {
	title?: string, placeholder?: string,
	step?: number, totalSteps?: number,
	buttons?: vs.QuickInputButton[],
	ignoreFocusOut?: boolean,
	shouldResume?: () => Promise<boolean>,
}
interface QuickPickParameters<T extends vs.QuickPickItem> extends Parameters {
	items: T[], activeItem?: T,
	onSelect?: (items: T[]) => void,
	onHighlight?: (items: T[]) => void,
	onItemButton?: (event: vs.QuickPickItemButtonEvent<T>) => void,
}
interface InputBoxParameters extends Parameters {
	value: string, prompt: string,
	validate?: (value: string) => Promise<string | undefined>,
	onEnter?: (value: string) => void,
}

class FlowAction {
	static back = new FlowAction();
	static cancel = new FlowAction();
	static resume = new FlowAction();
}
type Step = (input: MultiStepInput) => Thenable<Step | void>;

type Alias = (Parameters extends { buttons: (infer I)[] } ? I : never);

export class MultiStepInput {
	private current?: vs.QuickInput;
	private steps: Step[] = [];

	static async run(start: Step) {
		const input = new MultiStepInput();
		return input.stepThrough(start);
	}

	async showQuickPick<T extends vs.QuickPickItem>(p: QuickPickParameters<T>) {
		const input = vs.window.createQuickPick<T>();
		input.items = p.items;
		input.activeItems = p.activeItem ? [p.activeItem] : [];

		const disposables: vs.Disposable[] = [
			input.onDidTriggerItemButton(items => {
				console.log(`Pressed button ${items.button.tooltip} of '${items.item.label}' option`);
				if (p.onItemButton)
					p.onItemButton(items);
			}),
			input.onDidChangeActive(items => {
				console.log(`Highlight '${items[0].label}' option`);
				if (p.onHighlight) p.onHighlight([...items]);
			}),
		];

		try {
			return await new Promise<T | Alias>((resolve, reject) => {
				disposables.push(
					input.onDidChangeSelection(items => {
						resolve(items[0]);
						console.log(`Select '${items[0].label}' option (as a result)`);
						if (p.onSelect) p.onSelect([...items]);
					}),
				);
				this.quickInput(input, p, disposables, resolve, reject);
			});
		} finally { disposables.forEach(d => d.dispose()) }
	}

	async showInputBox(p: InputBoxParameters) {
		const input = vs.window.createInputBox();
		input.value = p.value || '';
		input.prompt = p.prompt;

		const disposables: vs.Disposable[] = [
			input.onDidChangeValue(async text => {
				if (!p.validate)
					return;
				const current = p.validate(text);
				let validating = current;
				const validationMessage = await current;
				if (current === validating)
					input.validationMessage = validationMessage;
			}),
		];

		try {
			return await new Promise<string | Alias>((resolve, reject) => {
				disposables.push(
					input.onDidAccept(async () => {
						const value = input.value;
						input.enabled = false;
						input.busy = true;
						if (!p.validate || !(await p.validate(value))) {
							resolve(value);
							console.log(`Enter '${input.value}' (as a result)`);
							if (p.onEnter)
								p.onEnter(value);
						}
						input.enabled = true;
						input.busy = false;
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
		if (!p.shouldResume) 
			p.shouldResume = () => new Promise<boolean>(() => {});

		disposables.push(
			input.onDidTriggerButton(button => {
				if (button === vs.QuickInputButtons.Back)
					reject(FlowAction.back);
				else resolve(button as any);

				console.log(`Pressed window button ${button.tooltip}`);
			}),
			input.onDidHide(() => {
				(async () => {
					reject(p.shouldResume && await p.shouldResume()
						? FlowAction.resume : FlowAction.cancel);
				})().catch(reject);

				console.log(`Hide this window!`);
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

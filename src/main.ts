import { Plugin } from 'obsidian';

/**
 * Text Formatter: commands that reformat the currently selected text.
 * Run them from the command palette or bind hotkeys in Settings → Hotkeys.
 */
export default class TextFormatter extends Plugin {
	onload() {
		this.addCommand({
			id: 'remove-return',
			name: 'Remove returns',
			callback: () => this.removeReturn(),
		});

		this.addCommand({
			id: 'double-to-single-return',
			name: 'Convert double returns to single',
			callback: () => this.doubleToSingleReturn(),
		});

		this.addCommand({
			id: 'level-down-headers',
			name: 'Level down headers',
			callback: () => this.levelDownHeaders(),
		});

		this.addCommand({
			id: 'level-up-headers',
			name: 'Level up headers',
			callback: () => this.levelUpHeaders(),
		});
	}

	/** Join all lines into one, replacing each line break (and surrounding spaces) with a single space. */
	removeReturn() {
		this.transform((s) => s.replace(/\s*\n+\s*/g, ' '));
	}

	/** Collapse runs of blank lines into a single line break. */
	doubleToSingleReturn() {
		this.transform((s) => s.replace(/\n{2,}/g, '\n'));
	}

	/** Make headers deeper by one level (# → ##), up to a maximum of ######. Applies to every line touched by the selection. */
	levelDownHeaders() {
		this.transformLines((s) => s.replace(/^(#{1,5})(?= )/gm, '$1#'));
	}

	/** Make headers shallower by one level (## → #); top-level headers are left unchanged. Applies to every line touched by the selection. */
	levelUpHeaders() {
		this.transformLines((s) => s.replace(/^#(#+)(?= )/gm, '$1'));
	}

	/** Apply `fn` to the current selection in the active editor and replace it with the result. */
	private transform(fn: (s: string) => string) {
		const editor = this.app.workspace.activeEditor?.editor;
		if (editor) editor.replaceSelection(fn(editor.getSelection()));
	}

	/** Like `transform`, but first extends the selection to whole lines (or the cursor's line if nothing is selected). */
	private transformLines(fn: (s: string) => string) {
		const editor = this.app.workspace.activeEditor?.editor;
		if (!editor) return;
		const from = editor.getCursor('from');
		const to = editor.getCursor('to');
		// A selection ending at column 0 of a line doesn't really include that line.
		const lastLine = to.ch === 0 && to.line > from.line ? to.line - 1 : to.line;
		const start = { line: from.line, ch: 0 };
		const end = { line: lastLine, ch: editor.getLine(lastLine).length };
		editor.replaceRange(fn(editor.getRange(start, end)), start, end);
	}
}
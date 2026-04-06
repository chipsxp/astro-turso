export interface QuillColorEditor {
  getModule: (name: string) => unknown;
  getSelection: (focus?: boolean) => unknown;
  format: (
    name: "color" | "background",
    value: string | false,
    source?: "user" | "api" | "silent",
  ) => void;
  focus: () => void;
}

function applyColor(
  editor: QuillColorEditor,
  format: "color" | "background",
  value: string | false,
): void {
  editor.focus();
  editor.getSelection(true);
  editor.format(format, value, "user");
}

function attachPickerControl(
  editor: QuillColorEditor,
  picker: Element,
  format: "color" | "background",
): void {
  const options = picker.querySelector(
    ".ql-picker-options",
  ) as HTMLElement | null;
  if (!options || options.dataset.customColorMounted === "1") return;

  const row = document.createElement("div");
  row.className = "ql-custom-color-row";

  const label = document.createElement("span");
  label.className = "ql-custom-color-label";
  label.textContent = "Custom";

  const input = document.createElement("input");
  input.type = "color";
  input.className = "ql-custom-color-input";
  input.setAttribute(
    "aria-label",
    format === "color"
      ? "Choose custom text color"
      : "Choose custom highlight color",
  );
  input.value = "#000000";

  input.addEventListener("input", () => {
    applyColor(editor, format, input.value);
  });

  label.addEventListener("click", () => {
    input.click();
  });

  row.appendChild(label);
  row.appendChild(input);

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "ql-custom-color-clear";
  clearButton.textContent = "Clear";
  clearButton.setAttribute(
    "aria-label",
    format === "color" ? "Clear text color" : "Clear background highlight",
  );
  clearButton.addEventListener("click", () => {
    applyColor(editor, format, false);
  });
  row.appendChild(clearButton);

  options.appendChild(row);
  options.dataset.customColorMounted = "1";
}

export function enableCustomColorPickers(editor: QuillColorEditor): void {
  const toolbarModule = editor.getModule("toolbar") as
    | { container?: HTMLElement }
    | undefined;
  const toolbar = toolbarModule?.container;
  if (!toolbar) return;

  const colorPicker = toolbar.querySelector(".ql-picker.ql-color");
  const backgroundPicker = toolbar.querySelector(".ql-picker.ql-background");

  if (colorPicker) {
    attachPickerControl(editor, colorPicker, "color");
  }

  if (backgroundPicker) {
    attachPickerControl(editor, backgroundPicker, "background");
  }
}

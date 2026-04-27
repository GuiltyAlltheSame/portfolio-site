export function initTerminalInput({
  cmdInput,
  commands,
  out,
  onGameCommand
}) {
  cmdInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;

    const raw = cmdInput.value.trim();
    const key = raw.toUpperCase();
    cmdInput.value = '';

    if (commands[key]) {
      commands[key]();
      return;
    }

    if (typeof onGameCommand === 'function' && onGameCommand(key)) {
      return;
    }

    out.textContent += `\n$ ${raw}  — unknown command`;
    out.scrollTop = out.scrollHeight;
  });
}
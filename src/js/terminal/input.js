export function initTerminalInput({
  cmdInput,
  commands,
  out,
  onGameCommand
}) {
  const history = [];
  const historyLimit = 50;
  let historyIndex = -1;
  let historyDraft = '';

  function splitCommand(raw) {
    const match = raw.match(/^(\S+)(?:\s+([\s\S]*))?$/);

    return {
      name: match?.[1]?.toUpperCase() || '',
      args: match?.[2]?.trim() || ''
    };
  }

  function looksLikeMathExpression(value) {
    return /\d/.test(value)
      && /^[\d\s.,()+\-*/%^xXeE\u00d7\u00f7\u2212\u2013\u2014]+$/.test(value);
  }

  function appendUnknownCommand(raw) {
    clearInterval(out._timer);
    out.dataset.typing = 'false';
    out.textContent += `\n$ ${raw} - unknown command`;
    out.scrollTop = out.scrollHeight;
  }

  function setInputValue(value) {
    cmdInput.value = value;
    cmdInput.setSelectionRange?.(value.length, value.length);
  }

  function addToHistory(command) {
    if (history.at(-1) !== command) {
      history.push(command);

      if (history.length > historyLimit) {
        history.shift();
      }
    }

    historyIndex = -1;
    historyDraft = '';
  }

  function browseHistory(event) {
    if (history.length === 0) return false;

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (historyIndex === -1) {
        historyDraft = cmdInput.value;
        historyIndex = history.length - 1;
      } else if (historyIndex > 0) {
        historyIndex -= 1;
      }

      setInputValue(history[historyIndex]);
      return true;
    }

    if (event.key === 'ArrowDown' && historyIndex !== -1) {
      event.preventDefault();

      if (historyIndex < history.length - 1) {
        historyIndex += 1;
        setInputValue(history[historyIndex]);
      } else {
        historyIndex = -1;
        setInputValue(historyDraft);
      }

      return true;
    }

    return false;
  }

  cmdInput.addEventListener('input', () => {
    if (historyIndex !== -1) {
      historyIndex = -1;
      historyDraft = cmdInput.value;
    }
  });

  cmdInput.addEventListener('keydown', (event) => {
    if (browseHistory(event)) return;
    if (event.key !== 'Enter') return;

    const raw = cmdInput.value.trim();
    const { name, args } = splitCommand(raw);
    cmdInput.value = '';

    if (!raw) return;

    addToHistory(raw);

    if (commands[name]) {
      commands[name]({ raw, args, name });
      return;
    }

    if (looksLikeMathExpression(raw) && typeof commands.CALC === 'function') {
      commands.CALC({ raw, args: raw, name: 'CALC', direct: true });
      return;
    }

    if (!args && typeof onGameCommand === 'function' && onGameCommand(name)) {
      return;
    }

    appendUnknownCommand(raw);
  });
}

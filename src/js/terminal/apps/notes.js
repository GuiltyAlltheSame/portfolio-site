import { openTerminalApp } from './shell.js';

const NOTES_STORAGE_KEY = 'flexboxer.terminal.notes.v1';
const AUTO_SAVE_DELAY_MS = 700;
const CLEAR_CONFIRMATION_MS = 4500;

const notesTemplate = `
  <section class="terminal-app terminal-app--notes" aria-labelledby="notes-app-title">
    <header class="terminal-app__toolbar">
      <div class="terminal-app__heading">
        <span id="notes-app-title" class="terminal-app__title">NOTES</span>
        <span class="terminal-app__meta">LOCAL MEMORY // AUTOSAVE ENABLED</span>
      </div>
      <button class="terminal-app__exit" type="button" data-terminal-app-close>EXIT</button>
    </header>

    <div class="notes-app__body">
      <div class="notes-app__status-row">
        <span id="notes-save-state" class="notes-app__save-state" aria-live="polite">LOADING LOCAL NOTE...</span>
        <span id="notes-stats" class="notes-app__stats">WORDS 000 // LINES 000</span>
      </div>

      <label class="notes-app__editor-label" for="notes-editor">UNTITLED NOTE</label>
      <textarea
        id="notes-editor"
        class="notes-app__editor"
        rows="12"
        spellcheck="true"
        placeholder="Write something worth keeping..."
        aria-describedby="notes-help"
      ></textarea>

      <div class="notes-app__footer">
        <span id="notes-help" class="terminal-app__hint">CTRL / CMD + S TO SAVE // ESC TO EXIT</span>
        <div class="terminal-app__actions">
          <button id="notes-clear" class="terminal-app__button terminal-app__button--quiet" type="button">CLEAR</button>
          <button id="notes-save" class="terminal-app__button" type="button">SAVE NOTE</button>
        </div>
      </div>
    </div>
  </section>
`;

function readStoredNote() {
  try {
    return localStorage.getItem(NOTES_STORAGE_KEY) || '';
  } catch (error) {
    return '';
  }
}

function writeStoredNote(value) {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, value);
    return true;
  } catch (error) {
    return false;
  }
}

function formatSavedTime(date = new Date()) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function getNoteStats(value) {
  const trimmedValue = value.trim();
  const words = trimmedValue ? trimmedValue.split(/\s+/).length : 0;
  const lines = value ? value.split(/\r?\n/).length : 0;

  return { words, lines };
}

export function openNotesApp(options = {}) {
  const app = openTerminalApp({
    name: 'notes',
    template: notesTemplate,
    focusSelector: '#notes-editor',
    shell: options.shell
  });

  if (!app) return false;

  const editor = app.root.querySelector('#notes-editor');
  const saveButton = app.root.querySelector('#notes-save');
  const clearButton = app.root.querySelector('#notes-clear');
  const saveState = app.root.querySelector('#notes-save-state');
  const stats = app.root.querySelector('#notes-stats');
  let saveTimer = null;
  let clearConfirmationTimer = null;
  let clearIsArmed = false;

  editor.value = readStoredNote();

  function updateStats() {
    const { words, lines } = getNoteStats(editor.value);
    stats.textContent = `WORDS ${String(words).padStart(3, '0')} // LINES ${String(lines).padStart(3, '0')}`;
  }

  function resetClearConfirmation() {
    clearIsArmed = false;
    clearButton.textContent = 'CLEAR';

    if (clearConfirmationTimer) {
      clearTimeout(clearConfirmationTimer);
      clearConfirmationTimer = null;
    }
  }

  function saveNote({ announce = true } = {}) {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }

    const saved = writeStoredNote(editor.value);
    saveState.textContent = saved
      ? `SAVED LOCALLY // ${formatSavedTime()}`
      : 'LOCAL STORAGE UNAVAILABLE';

    if (announce && saved) {
      saveButton.textContent = 'SAVED';
      window.setTimeout(() => {
        if (saveButton.isConnected) {
          saveButton.textContent = 'SAVE NOTE';
        }
      }, 1200);
    }
  }

  function scheduleAutoSave() {
    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    saveTimer = window.setTimeout(() => saveNote({ announce: false }), AUTO_SAVE_DELAY_MS);
  }

  function handleEditorInput() {
    updateStats();
    saveState.textContent = 'UNSAVED CHANGES // AUTOSAVE QUEUED';
    resetClearConfirmation();
    scheduleAutoSave();
  }

  function handleSaveClick() {
    resetClearConfirmation();
    saveNote();
  }

  function handleClearClick() {
    if (!editor.value) {
      resetClearConfirmation();
      saveState.textContent = 'NOTE IS ALREADY EMPTY';
      return;
    }

    if (!clearIsArmed) {
      clearIsArmed = true;
      clearButton.textContent = 'CONFIRM CLEAR';
      saveState.textContent = 'PRESS CONFIRM CLEAR TO ERASE LOCAL NOTE';
      clearConfirmationTimer = window.setTimeout(resetClearConfirmation, CLEAR_CONFIRMATION_MS);
      return;
    }

    editor.value = '';
    updateStats();
    resetClearConfirmation();
    saveNote({ announce: false });
    saveState.textContent = 'LOCAL NOTE CLEARED';
    editor.focus();
  }

  function handleEditorKeydown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      handleSaveClick();
    }
  }

  editor.addEventListener('input', handleEditorInput);
  editor.addEventListener('keydown', handleEditorKeydown);
  saveButton.addEventListener('click', handleSaveClick);
  clearButton.addEventListener('click', handleClearClick);

  updateStats();
  saveState.textContent = editor.value
    ? 'LOCAL NOTE RESTORED'
    : 'READY // SAVES ONLY IN THIS BROWSER';

  app.addCleanup(() => {
    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    if (clearConfirmationTimer) {
      clearTimeout(clearConfirmationTimer);
    }

    // Closing during the short autosave delay must not discard the latest edit.
    writeStoredNote(editor.value);

    editor.removeEventListener('input', handleEditorInput);
    editor.removeEventListener('keydown', handleEditorKeydown);
    saveButton.removeEventListener('click', handleSaveClick);
    clearButton.removeEventListener('click', handleClearClick);
  });

  return true;
}

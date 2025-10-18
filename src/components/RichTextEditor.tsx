import React, { useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

// NOTE: This editor uses contenteditable and document.execCommand for broad browser support without extra deps.
// Back-end sanitization should be applied before sending emails.
export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;
    onChange(el.innerHTML);
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const range = savedSelectionRef.current;
    if (!range) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const apply = (cmd: string, arg?: string) => {
    focusEditor();
    restoreSelection();
    if (typeof document !== 'undefined') {
      document.execCommand(cmd, false, arg);
      handleInput();
      saveSelection();
    }
  };

  const normalizeToParagraph = () => {
    // Some browsers need lowercase, others uppercase; try both to be safe.
    document.execCommand('formatBlock', false, 'P');
    document.execCommand('formatBlock', false, 'p');
  };

  const clearFormatting = () => {
    focusEditor();
    restoreSelection();
    // Remove inline formatting and links
    document.execCommand('removeFormat');
    document.execCommand('unlink');
    // If currently inside a list, toggle lists off
    try {
      if (document.queryCommandState('insertUnorderedList')) {
        document.execCommand('insertUnorderedList');
      }
      if (document.queryCommandState('insertOrderedList')) {
        document.execCommand('insertOrderedList');
      }
    } catch (_) {
      // queryCommandState may not be supported in all contexts; best-effort only
    }
    // Normalize block to paragraph
    normalizeToParagraph();
    handleInput();
    saveSelection();
  };

  const getCurrentBlockTag = (): string | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node: Node | null = sel.anchorNode;
    const editor = editorRef.current;
    while (node && node !== editor) {
      if (node instanceof HTMLElement) {
        const tag = node.tagName.toUpperCase();
        if (['H1','H2','H3','H4','H5','H6','P','DIV','LI'].includes(tag)) return tag;
      }
      node = node.parentNode;
    }
    return null;
  };

  const toggleUnderline = () => {
    focusEditor();
    restoreSelection();
    document.execCommand('underline', false);
    handleInput();
    saveSelection();
  };

  const toggleFormatBlock = (tag: 'H2') => {
    focusEditor();
    restoreSelection();
    const current = getCurrentBlockTag();
    const target = current === tag ? 'P' : tag;
    document.execCommand('formatBlock', false, target);
    handleInput();
    saveSelection();
  };

  const forceParagraph = () => {
    focusEditor();
    restoreSelection();
    normalizeToParagraph();
    handleInput();
    saveSelection();
  };

  const openLinkModal = () => {
    saveSelection();
    setLinkUrl('');
    setShowLinkModal(true);
  };

  const createLinkFromModal = () => {
    if (!linkUrl.trim()) {
      setShowLinkModal(false);
      return;
    }
    const url = linkUrl.match(/^https?:\/\//i) ? linkUrl.trim() : `https://${linkUrl.trim()}`;
    apply('createLink', url);
    setShowLinkModal(false);
    setLinkUrl('');
  };

  const onModalKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      createLinkFromModal();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setShowLinkModal(false);
    }
  };

  return (
    <div className={className}>
      <div className="rte-toolbar flex flex-wrap items-center gap-2 mb-2 text-black">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => apply('bold')} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">B</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => apply('italic')} className="px-2 py-1 text-sm border rounded hover:bg-gray-50 italic">I</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={toggleUnderline} className="px-2 py-1 text-sm border rounded hover:bg-gray-50 underline">U</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => apply('insertUnorderedList')} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">• List</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => apply('insertOrderedList')} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">1. List</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleFormatBlock('H2')} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">H2</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={forceParagraph} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">P</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={openLinkModal} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">Link</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={clearFormatting} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">Clear</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={saveSelection}
        className="rte-content min-h-[180px] max-h-[500px] overflow-auto border rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        data-placeholder={placeholder || 'Write your newsletter content...'}
        suppressContentEditableWarning
      />

      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowLinkModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-5 pt-5 pb-3">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Insert link</h3>
              <input
                type="url"
                autoFocus
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={onModalKeyDown}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-2 text-xs text-gray-500">Enter a full URL. If you omit the protocol, we'll add https:// automatically.</p>
            </div>
            <div className="px-5 py-3 flex items-center justify-end gap-2 bg-gray-50 rounded-b-lg">
              <button type="button" onClick={() => setShowLinkModal(false)} className="px-3 py-1.5 text-sm border rounded hover:bg-white">Cancel</button>
              <button type="button" onClick={createLinkFromModal} className="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700">Insert</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af; /* gray-400 */
        }
        /* Ensure visible text color inside editor */
        .rte-content, .rte-content * { color: #111827; }
        .rte-content a { color: #2563eb; text-decoration: underline; }
        .rte-content h1, .rte-content h2, .rte-content h3 { font-weight: 700; margin: .5rem 0; }
        .rte-content h2 { font-size: 1.25rem; }
        .rte-content p { margin: .25rem 0; }
        .rte-content ul { list-style: disc; padding-left: 1.25rem; margin: .25rem 0; }
        .rte-content ol { list-style: decimal; padding-left: 1.25rem; margin: .25rem 0; }
      `}</style>
    </div>
  );
}

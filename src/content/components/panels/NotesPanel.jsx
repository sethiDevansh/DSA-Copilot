import React, { useState, useEffect, useCallback, useRef } from 'react';
import { notesService } from '../../../shared/services/notesService.js';
import { debounce } from '../../../shared/utils/index.js';

export function NotesPanel({ problem }) {
  const [content,  setContent]  = useState('');
  const [tags,     setTags]     = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(true);
  const [focused,  setFocused]  = useState(false);
  const textareaRef = useRef(null);
  const titleSlug   = problem?.titleSlug;

  // ── Load existing note ────────────────────────────────────────────────────
  useEffect(() => {
    if (!titleSlug) return;
    notesService.getNoteForProblem(titleSlug).then((note) => {
      if (note) {
        setContent(note.content ?? '');
        setTags(note.customTags ?? []);
      } else {
        setContent('');
        setTags([]);
      }
      setSaved(true);
    });
  }, [titleSlug]);

  // ── Auto-save with debounce ───────────────────────────────────────────────
  const saveNote = useCallback(
    debounce(async (c, t) => {
      if (!titleSlug) return;
      setSaving(true);
      try {
        await notesService.saveNote(titleSlug, { content: c, customTags: t });
        setSaved(true);
      } finally {
        setSaving(false);
      }
    }, 800),
    [titleSlug]
  );

  const handleChange = (e) => {
    const val = e.target.value;
    setContent(val);
    setSaved(false);
    saveNote(val, tags);
  };

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(',', '');
      if (!tags.includes(newTag) && newTag.length > 0) {
        const newTags = [...tags, newTag];
        setTags(newTags);
        saveNote(content, newTags);
      }
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      const newTags = tags.slice(0, -1);
      setTags(newTags);
      saveNote(content, newTags);
    }
  };

  const removeTag = (tag) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    saveNote(content, newTags);
  };

  const isEmpty = !content.trim();

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      height:        '100%',
      overflow:      'hidden',
      background:    'rgba(9,9,11,0.6)',
    }}>

      {/* ── Save status bar ─────────────────────────────────────────────── */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '8px 14px',
        borderBottom:   '1px solid rgba(255,255,255,0.05)',
        flexShrink:     0,
      }}>
        <span style={{ fontSize: 11, color: '#3d3d52', fontFamily: 'monospace' }}>
          {content.trim().split(/\s+/).filter(Boolean).length} words
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            width:        6,
            height:       6,
            borderRadius: '50%',
            background:   saving ? '#fbbf24' : saved ? '#4ade80' : '#fb923c',
            boxShadow:    `0 0 6px ${saving ? '#fbbf24' : saved ? '#4ade80' : '#fb923c'}`,
            transition:   'background 0.3s ease',
          }} />
          <span style={{ fontSize: 10, color: '#52526d' }}>
            {saving ? 'saving...' : saved ? 'saved' : 'unsaved'}
          </span>
        </div>
      </div>

      {/* ── Main textarea ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {/* Empty state — only shows when truly empty and not focused */}
        {isEmpty && !focused && (
          <div style={{
            position:      'absolute',
            top:           '50%',
            left:          '50%',
            transform:     'translate(-50%, -50%)',
            textAlign:     'center',
            pointerEvents: 'none',
            userSelect:    'none',
            zIndex:        1,
          }}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.15 }}>✎</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#3d3d52', marginBottom: 3 }}>
              Start taking notes
            </div>
            <div style={{ fontSize: 10, color: '#26262f' }}>
              Markdown · Auto-saved
            </div>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          spellCheck={false}
          placeholder=""
          style={{
            position:   'relative',
            zIndex:     2,
            width:      '100%',
            height:     '100%',
            minHeight:  200,
            background: 'transparent',
            border:     'none',
            resize:     'none',
            color:      '#c4c4d8',
            fontSize:   13,
            lineHeight: 1.8,
            padding:    '14px 16px',
            outline:    'none',
            fontFamily: "'DM Sans', sans-serif",
            caretColor: '#09d2f5',
          }}
        />
      </div>

      {/* ── Tags section ────────────────────────────────────────────────── */}
      <div style={{
        padding:      '10px 14px',
        borderTop:    '1px solid rgba(255,255,255,0.05)',
        flexShrink:   0,
        background:   'rgba(255,255,255,0.01)',
      }}>
        <div style={{ fontSize: 9, color: '#3d3d52', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>
          Tags
        </div>
        <div style={{
          display:    'flex',
          flexWrap:   'wrap',
          gap:        5,
          alignItems: 'center',
        }}>
          {/* Existing tags */}
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          4,
                fontSize:     10,
                padding:      '3px 8px',
                borderRadius: 99,
                background:   'rgba(9,210,245,0.08)',
                border:       '1px solid rgba(9,210,245,0.2)',
                color:        '#09d2f5',
                fontWeight:   500,
              }}
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                style={{
                  background:  'none',
                  border:      'none',
                  color:       'rgba(9,210,245,0.5)',
                  cursor:      'pointer',
                  fontSize:    10,
                  padding:     0,
                  lineHeight:  1,
                  display:     'flex',
                  alignItems:  'center',
                }}
              >
                ✕
              </button>
            </span>
          ))}

          {/* Tag input */}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder={tags.length === 0 ? '+ add tag' : '+'}
            style={{
              background:   'transparent',
              border:       'none',
              outline:      'none',
              color:        '#737394',
              fontSize:     11,
              fontFamily:   "'DM Sans', sans-serif",
              width:        tags.length === 0 ? 80 : 30,
              padding:      '2px 4px',
              caretColor:   '#09d2f5',
            }}
          />
        </div>
      </div>
    </div>
  );
}
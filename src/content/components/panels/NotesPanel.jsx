import React, { useState, useEffect, useCallback, useRef } from 'react';
import { notesService } from '../../../shared/services/notesService.js';
import { debounce } from '../../../shared/utils/index.js';

const S = {
  container: {
    display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
  },
  toolbar: {
    padding: '12px 16px 8px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    flexShrink: 0,
  },
  textarea: {
    flex: 1,
    width: '100%',
    background: 'transparent',
    border: 'none',
    resize: 'none',
    color: '#c4c4d8',
    fontSize: 13,
    lineHeight: 1.7,
    padding: '14px 16px',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    caretColor: '#09d2f5',
  },
  tagInput: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    color: '#9b9bba',
    fontSize: 11,
    padding: '4px 8px',
    outline: 'none',
    width: 110,
    fontFamily: "'DM Sans', sans-serif",
  },
  tag: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 10, padding: '2px 8px', borderRadius: 99,
    background: 'rgba(9,210,245,0.08)',
    border: '1px solid rgba(9,210,245,0.18)',
    color: '#09d2f5',
    cursor: 'pointer',
  },
  savedIndicator: {
    fontSize: 10, color: '#52526d',
    display: 'flex', alignItems: 'center', gap: 4,
  },
};

export function NotesPanel({ problem }) {
  const [content, setContent]   = useState('');
  const [tags, setTags]         = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(true);
  const titleSlug = problem?.titleSlug;

  // Load existing note
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
    });
  }, [titleSlug]);

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
    }, 1000),
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
      if (!tags.includes(newTag)) {
        const newTags = [...tags, newTag];
        setTags(newTags);
        saveNote(content, newTags);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    saveNote(content, newTags);
  };

  return (
    <div style={S.container}>
      {/* Toolbar */}
      <div style={S.toolbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1, marginRight: 8 }}>
          {tags.map((tag) => (
            <span key={tag} style={S.tag} onClick={() => removeTag(tag)} title="Click to remove">
              {tag} ✕
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="+ tag"
            style={S.tagInput}
          />
        </div>
        <div style={S.savedIndicator}>
          {saving ? (
            <><span style={{ color: '#f59e0b' }}>●</span> saving</>
          ) : saved ? (
            <><span style={{ color: '#4ade80' }}>●</span> saved</>
          ) : (
            <><span style={{ color: '#fb923c' }}>●</span> unsaved</>
          )}
        </div>
      </div>

      {/* Placeholder hint */}
      {!content && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#313140',
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✎</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#3d3d52' }}>
            Start taking notes
          </div>
          <div style={{ fontSize: 11, color: '#26262f' }}>
            Markdown supported · Auto-saved
          </div>
        </div>
      )}

      {/* Text area */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <textarea
          style={S.textarea}
          value={content}
          onChange={handleChange}
          placeholder="Write notes here...

# Approach
- Key insight: ...

# Time & Space
- Time: O(n)
- Space: O(1)

# Edge Cases
- Empty array
- Single element

# Code Snippet
```python
def solve(nums):
    ...
```"
          spellCheck={false}
        />
      </div>

      {/* Tips footer */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', gap: 12,
        flexShrink: 0,
      }}>
        {['# heading', '**bold**', '`code`', '- list'].map((tip) => (
          <span key={tip} style={{
            fontSize: 10,
            color: '#313140',
            fontFamily: 'JetBrains Mono, monospace',
          }}>{tip}</span>
        ))}
      </div>
    </div>
  );
}

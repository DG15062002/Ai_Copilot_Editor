import React, { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import axios from 'axios';
import './App.css';

const App = () => {
  const [transformedText, setTransformedText] = useState('');

  const editor = useEditor({
    extensions: [StarterKit, BubbleMenu],
    content: '<p>Hello! Select this text to see AI actions.</p>',
  });

  const handleAIAction = async (action) => {
    const selectedText = editor.state.selection.content().toString();
    if (!selectedText) return;

    // const url =
      // action === 'shorter' ? '/api/make-shorter' : '/api/make-longer';

    try {
      const response = await axios.post(url, { text: selectedText });
      const { result } = response.data;
      editor.chain().focus().insertContentAt(editor.state.selection.ranges[0], result).run();
    } catch (error) {
      console.error('AI action failed:', error);
    }
  };

  return (
    <div className="App">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
        >
          <button onClick={() => handleAIAction('shorter')}>Make Shorter</button>
          <button onClick={() => handleAIAction('longer')}>Make Longer</button>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default App;

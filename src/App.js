import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { BubbleMenu } from "@tiptap/extension-bubble-menu";
import { FontFamily } from "@tiptap/extension-font-family";
import { Heading } from "@tiptap/extension-heading";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import { FontSize } from './FontExtension'; 
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver"; // For exporting to Word
import "./App.css"; 

const fontOptions = [
  "Arial",
  "Courier New",
  "Georgia",
  "Times New Roman",
  "Verdana",
];

const App = () => {
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState("16");
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [isTextSelected, setIsTextSelected] = useState(false);

  const bubbleMenuRef = useRef(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      FontFamily,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      TextStyle,
      Underline,
      FontSize,
      BubbleMenu.configure({
        element: bubbleMenuRef.current,
      }),
    ],
    content: "<p>Hello, select some text to see the bubble menu!</p>",
  });

  useEffect(() => {
    if (!editor) return;

    const updateBubbleMenu = () => {
      const isTextSelected = !editor.state.selection.empty;
      setIsTextSelected(isTextSelected);
      const bubbleMenu = bubbleMenuRef.current;

      if (bubbleMenu) {
        if (isTextSelected) {
          bubbleMenu.style.display = "block";
          const { from, to } = editor.state.selection;
          const startPos = editor.view.coordsAtPos(from);
          const endPos = editor.view.coordsAtPos(to);

          bubbleMenu.style.left = `${(startPos.left + endPos.left) / 2 - bubbleMenu.offsetWidth / 2}px`; 
          bubbleMenu.style.top = `${startPos.top - bubbleMenu.offsetHeight - 10}px`;
        } else {
          bubbleMenu.style.display = "none";
        }
      }
    };

    editor.on("selectionUpdate", updateBubbleMenu);

    return () => editor.off("selectionUpdate", updateBubbleMenu);
  }, [editor]);

  const handleAction = async (action) => {
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );
  
    if (!selectedText.trim()) {
      console.warn("No text selected.");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5001/ai/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: selectedText }),
      });
  
      if (!response.ok) {
        console.error(`API request failed with status: ${response.status}`);
        return;
      }
  
      const data = await response.json();
  
      console.log("Response from API:", data);
  
      if (data && data.result) {
        editor.chain().focus().insertContentAt(editor.state.selection, data.result).run();
      } else {
        console.error("Unexpected API response structure:", data);
      }
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  const handleFontChange = (font) => {
    setFontFamily(font);
    editor.chain().focus().setFontFamily(font).run();
    setShowFontMenu(false); // Hide the menu after selecting a font
  };

  const handleFontSizeChange = (e) => {
    setFontSize(e.target.value);
    editor.chain().focus().setFontSize(e.target.value).run();
  };

  const addHeader = (level) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const createNewPage = () => {
    // Reset the editor content to an empty page (or create a new page if using a page layout)
    editor.commands.setContent('<p>This is a new page. Start writing here.</p>');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.html(document.querySelector('.editor-content'), {
      callback: function (doc) {
        doc.save('document.pdf');
      },
    });
  };

  const exportToWord = () => {
    const content = document.querySelector('.editor-content').innerHTML;
    const blob = new Blob([content], { type: 'application/msword' });
    saveAs(blob, 'document.doc');
  };

  return (
    <div className="main-page">
      <div className="editor-container">
        <div className="editor-header">AI Copilot Editor 📝</div>

        {/* Controls */}
        <div className="editor-controls">
          <button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()}>Underline</button>

          {/* Font Family Dropdown */}
          <button onClick={() => setShowFontMenu(!showFontMenu)}>{fontFamily}</button>
          {showFontMenu && (
            <div className="font-menu">
              {fontOptions.map((font, index) => (
                <div key={index} onClick={() => handleFontChange(font)}>
                  {font}
                </div>
              ))}
            </div>
          )}

          <input
            type="number"
            value={fontSize}
            onChange={handleFontSizeChange}
            min="10"
            max="100"
            step="1"
            style={{ width: "60px" }}
          />
          <button onClick={() => addHeader(1)}>Add Header</button>
          
          {/* New Page Button */}
          <button onClick={createNewPage}>New Page</button>

          {/* Export Buttons */}
          <button onClick={exportToPDF}>Export to PDF 📄</button>
          <button onClick={exportToWord}>Export to Word 📁</button>
        </div>

        {/* Bubble Menu */}
        {isTextSelected &&
        (<div
          id="bubble-menu"
          ref={bubbleMenuRef}
          className="bubble-menu"
        >
          <button onClick={() => handleAction("shorten")}>Make Shorter ✂️</button>
          <button onClick={() => handleAction("lengthen")}>Make Longer ＋</button>
        </div>
        )}

        {/* Editor Content */}
        <EditorContent editor={editor} className="editor-content" />
      </div>
    </div>
  );
};

export default App;

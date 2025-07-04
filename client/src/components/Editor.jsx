import { useEffect, useRef } from 'react';
import ReactTextareaAutosize from 'react-textarea-autosize';

export default function Editor({ content, onChange }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <ReactTextareaAutosize
      ref={textareaRef}
      value={content}
      onChange={handleChange}
      className="editor-textarea"
      minRows={15}
      placeholder="Start typing your note here..."
    />
  );
}
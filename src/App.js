// App.js
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './styles.css';

function App() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("notes");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("");
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleAddOrEdit = () => {
    if (input.trim() === "" || category.trim() === "") return;
    const newNote = { text: input, category, created: new Date().toISOString() };
    if (editId !== null) {
      const updated = notes.map((note, index) =>
        index === editId ? newNote : note
      );
      setNotes(updated);
      setEditId(null);
    } else {
      setNotes([newNote, ...notes]);
    }
    setInput("");
    setCategory("");
  };

  const handleEdit = (index) => {
    setInput(notes[index].text);
    setCategory(notes[index].category);
    setEditId(index);
  };

  const handleDelete = (index) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.json';
    a.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const importedNotes = JSON.parse(reader.result);
          setNotes(importedNotes);
        } catch (err) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(notes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setNotes(items);
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (sortOption === "newest") return new Date(b.created) - new Date(a.created);
    if (sortOption === "oldest") return new Date(a.created) - new Date(b.created);
    if (sortOption === "az") return a.text.localeCompare(b.text);
    if (sortOption === "category") return a.category.localeCompare(b.category);
    return 0;
  });

  const filteredNotes = sortedNotes.filter(note =>
    note.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <h1>📝 My Notes</h1>

      <div className="top-bar">
        <input
          className="search"
          type="text"
          placeholder="Search notes or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="az">A-Z</option>
          <option value="category">Category</option>
        </select>
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>

      <div className="input-section">
        <textarea
          placeholder="Write your note..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <input
          className="category-input"
          type="text"
          placeholder="Enter category/tag..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button onClick={handleAddOrEdit}>
          {editId !== null ? "Update" : "Add Note"}
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="notes">
          {(provided) => (
            <div className="notes-list" {...provided.droppableProps} ref={provided.innerRef}>
              {filteredNotes.length ? (
                filteredNotes.map((note, index) => (
                  <Draggable key={index} draggableId={index.toString()} index={index}>
                    {(provided) => (
                      <div
                        className="note"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div className="note-header">
                          <span className="category">📂 {note.category}</span>
                          <span className="date">🕒 {new Date(note.created).toLocaleString()}</span>
                        </div>
                        <p>{note.text}</p>
                        <div className="actions">
                          <button onClick={() => handleEdit(index)}>✏️</button>
                          <button onClick={() => handleDelete(index)}>🗑️</button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              ) : (
                <p className="no-notes">No matching notes found.</p>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="import-export">
        <button onClick={handleExport}>📤 Export</button>
        <label className="import-btn">
          📥 Import
          <input type="file" onChange={handleImport} hidden />
        </label>
      </div>
    </div>
  );
}

export default App;

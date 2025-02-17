import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Make sure to import the CSS file

function App() {
  const [text, setText] = useState(""); // Text input from user
  const [corrections, setCorrections] = useState(null); // Store grammar corrections
  const [correctedText, setCorrectedText] = useState(""); // Store text after applying corrections
  const [loading, setLoading] = useState(false); // Loading state for the submit button

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    setLoading(true); // Start loading when the request is being made

    try {
      // Send POST request to the backend
      const response = await axios.post('http://localhost:5000/correct', { text });

      // Update state with the received grammar corrections
      setCorrections(response.data.matches);

      // Apply all corrections to the text (not just the first one)
      let newText = text;
      response.data.matches.forEach(match => {
        newText = newText.replace(match.context.text, match.replacements[0].value);
      });
      setCorrectedText(newText);

    } catch (error) {
      console.error('Error:', error);
      alert("Something went wrong while checking grammar.");
    } finally {
      setLoading(false); // Stop loading when done
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(correctedText);
    alert('Corrected text copied to clipboard!');
  };

  return (
    <div className="App">
      <h1>Grammar Fixer Tool</h1>

      <form onSubmit={handleSubmit} className="form">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here..."
          className="input-text"
          maxLength="500"
          required
        />
        <br />
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Checking...' : 'Check Grammar'}
        </button>
      </form>

      {corrections && corrections.length > 0 && (
        <div className="corrections">
          <h2>Corrections:</h2>
          <ul>
            {corrections.map((match, index) => (
              <li key={index} className="correction-item">
                <strong>Issue:</strong> {match.message}<br />
                <strong>Suggested Fix:</strong> 
                {match.replacements.map((replacement, idx) => (
                  <span key={idx} className="replacement">{replacement.value}</span>
                ))}
                <br />
                <strong>Context:</strong> <i>{match.context.text}</i>
              </li>
            ))}
          </ul>
          <button onClick={handleCopyText} className="copy-btn">Copy Corrected Text</button>
        </div>
      )}

      {corrections && corrections.length === 0 && (
        <p>Your text is grammatically correct!</p>
      )}

      {correctedText && (
        <div className="corrected-text">
          <h3>Corrected Text:</h3>
          <p>{correctedText}</p>
        </div>
      )}
    </div>
  );
}

export default App;

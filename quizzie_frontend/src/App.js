import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState([]);   // Data from backend
  const [loading, setLoading] = useState(true); // Loading spinner

  useEffect(() => {
    // Fetch data from backend
    fetch('http://localhost:8080/api/data')
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Firebase Data Viewer</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {data.length === 0 ? (
            <p>No data found.</p>
          ) : (
            <pre style={{ background: "#eee", padding: "1rem", borderRadius: "5px" }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

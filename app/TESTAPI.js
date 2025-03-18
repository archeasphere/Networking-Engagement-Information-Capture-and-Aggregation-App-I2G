import React, { useEffect, useState } from "react";
import { fetchData } from "./api";  // Import API function

const TestAPI = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData("/test-db") // Calls your backend API
      .then(response => setData(response))
      .catch(error => setError(error.message));
  }, []);

  return (
    <div>
      <h1>Test API Connection</h1>
      {data ? <p>Database Time: {data.time}</p> : <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default TestAPI;

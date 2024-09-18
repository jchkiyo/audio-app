import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserDashboard = ({ username, token, setToken, setRole }) => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Define the ref here
  useEffect(() => {
    fetchAudioFiles();
  }, []);

  //send to app route /audio-files

  const handleClearAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear all audio files and records?"
      )
    ) {
      try {
        const response = await axios.delete("http://localhost:5000/clear-all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        alert(response.data.message); // Display the success message
        fetchAudioFiles(); // Refresh the audio file list (will be empty now)
      } catch (error) {
        console.error(
          "Error clearing all files and records:",
          error.response?.data || error.message
        );
        alert("Failed to clear all files and records.");
      }
    }
  };

  const fetchAudioFiles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/audio-files", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAudioFiles(response.data); // This triggers re-render since state is updated
    } catch (error) {
      console.error("Error fetching audio files:", error);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      console.error("No file selected for upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:5000/upload", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("File uploaded successfully!");
      fetchAudioFiles(); // Refresh the audio file list
      setFile(null); // Clear the file input state
      fileInputRef.current.value = ""; // Clear the file input visually
    } catch (error) {
      console.error(
        "Error uploading file:",
        error.response?.data || error.message
      );
    }
  };

  const handleDelete = async (fileId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/audio-files/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(response.data.message); // Display the success message
      await fetchAudioFiles(); // Refresh the audio file list and update the state
    } catch (error) {
      console.error(
        "Error deleting file:",
        error.response?.data || error.message
      );
    }
  };

  const handlePlay = (audioFile) => {
    const audioUrl = `http://localhost:5000/audio-files/${audioFile.id}`; // Update to fetch directly
    const audio = new Audio(audioUrl);
    audio.play().catch((err) => console.error("Playback failed:", err));
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/"); // Redirect to home page
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome, {username || "Guest"}!</h1>
      <p>Here you can manage your audio files and settings.</p>

      <input
        type="file"
        ref={fileInputRef} // Attach the ref
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleFileUpload}>Upload</button>

      <h2>Your Audio Files</h2>
      <ul>
        {audioFiles.length === 0 ? (
          <li>No files found.</li>
        ) : (
          audioFiles.map((audioFile) => (
            <li key={audioFile.id}>
              {audioFile.filename}
              <button onClick={() => handlePlay(audioFile)}>Play</button>
              <button onClick={() => handleDelete(audioFile.id)}>Delete</button>
            </li>
          ))
        )}
      </ul>

      <button onClick={handleLogout} style={{ marginTop: "20px" }}>
        Logout
      </button>
    </div>
  );
};

export default UserDashboard;

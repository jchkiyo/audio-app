import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactAudioPlayer from "react-audio-player"; // Import React Audio Player

const UserDashboard = ({ username, token, setToken, setRole }) => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null); // State for the current audio URL
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAudioFiles();
  }, []);

  const fetchAudioFiles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/audio-files", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAudioFiles(response.data);
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

      alert(response.data.message);
      fetchAudioFiles(); // Refresh the audio file list
    } catch (error) {
      console.error(
        "Error deleting file:",
        error.response?.data || error.message
      );
    }
  };

  const handlePlay = async (audioFile) => {
    const audioUrl = `http://localhost:5000/audio-files/${audioFile.id}`; // Construct the URL

    try {
      const response = await axios.get(audioUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // Specify that you're expecting a Blob response
      });

      // Create a Blob URL for the audio file
      const url = URL.createObjectURL(new Blob([response.data]));
      setCurrentAudioUrl(url); // Set the current audio URL for the player
    } catch (error) {
      console.error(
        "Error fetching audio file:",
        error.response?.data || error.message
      );
    }
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
        ref={fileInputRef}
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

      {currentAudioUrl && (
        <ReactAudioPlayer
          src={currentAudioUrl}
          controls
          onEnded={() => setCurrentAudioUrl(null)} // Clear the URL when finished
        />
      )}

      <button onClick={handleLogout} style={{ marginTop: "20px" }}>
        Logout
      </button>
    </div>
  );
};

export default UserDashboard;

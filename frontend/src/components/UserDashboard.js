import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactAudioPlayer from "react-audio-player"; // Import React Audio Player
import "./css/UserDashboard.css"; // Import your CSS for styling
import uploadIcon from "./images/upload.svg"; // Import your upload icon
import listIcon from "./images/list.svg"; // Import your list icon

const UserDashboard = ({ username, token, setToken, setRole }) => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [audioDetails, setAudioDetails] = useState({
    description: "",
    category: "",
  });
  const [view, setView] = useState("upload");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (view === "list") {
      fetchAudioFiles();
    }
  }, [view]);

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
    formData.append("description", audioDetails.description);
    formData.append("category", audioDetails.category);

    try {
      await axios.post("http://localhost:5000/upload", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("File uploaded successfully!");
      resetForm();
    } catch (error) {
      console.error(
        "Error uploading file:",
        error.response?.data || error.message
      );
    }
  };

  const resetForm = () => {
    setFile(null);
    setAudioDetails({ description: "", category: "" });
    fileInputRef.current.value = ""; // Clear the file input visually
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
    const audioUrl = `http://localhost:5000/audio-files/${audioFile.id}`;

    try {
      const response = await axios.get(audioUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([response.data]));
      setCurrentAudioUrl(url);
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
    navigate("/login"); // Redirect to login page
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      setFile(droppedFiles[0]); // Set the first dropped file
    }
  };

  const openFileDialog = () => {
    fileInputRef.current.click(); // Programmatically click the file input
  };

  return (
    <div className="container">
      <h1 style={{ display: "inline-block" }}>
        Welcome, {username || "Guest"}!{" "}
      </h1>
      <button
        onClick={handleLogout}
        className="logout-button"
        style={{ float: "right" }}
      >
        Logout
      </button>
      <p style={{ clear: "both" }}>Manage your audio files and settings.</p>

      <div className="left-right-container">
        {view === "upload" && (
          <div className="upload-container">
            <div
              className="drag-drop-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={openFileDialog} // Open file dialog on click
            >
              {file ? (
                <p>File ready: {file.name}</p>
              ) : (
                <p>Drag and drop an audio file here or click to select</p>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: "none" }} // Hide the file input
            />
          </div>
        )}

        {view === "list" && (
          <div className="audio-list-container">
            <h2>Your Audio Files</h2>
            <div className="audio-table">
              <table>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {audioFiles.length === 0 ? (
                    <tr>
                      <td colSpan="4">No files found.</td>
                    </tr>
                  ) : (
                    audioFiles.map((audioFile) => (
                      <tr key={audioFile.id}>
                        <td>{audioFile.filename}</td>
                        <td>{audioFile.description}</td>
                        <td>{audioFile.category}</td>
                        <td>
                          <button onClick={() => handlePlay(audioFile)}>
                            Play
                          </button>
                          <button onClick={() => handleDelete(audioFile.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {currentAudioUrl && (
              <ReactAudioPlayer
                src={currentAudioUrl}
                controls
                onEnded={() => setCurrentAudioUrl(null)}
              />
            )}
          </div>
        )}

        <div className="button-container">
          <button onClick={() => setView("upload")} className="action-button">
            <img src={uploadIcon} alt="Upload" className="icon" />
          </button>
          <button onClick={() => setView("list")} className="action-button">
            <img src={listIcon} alt="List" className="icon" />
          </button>
        </div>
      </div>

      {view === "upload" && (
        <div className="details-container">
          {file && (
            <>
              <input
                type="text"
                placeholder="Audio Description"
                value={audioDetails.description}
                onChange={(e) =>
                  setAudioDetails({
                    ...audioDetails,
                    description: e.target.value,
                  })
                }
                className="input-field"
              />
              <input
                type="text"
                placeholder="Audio Category"
                value={audioDetails.category}
                onChange={(e) =>
                  setAudioDetails({
                    ...audioDetails,
                    category: e.target.value,
                  })
                }
                className="input-field"
              />
              <button onClick={handleFileUpload} className="upload-button">
                Upload
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

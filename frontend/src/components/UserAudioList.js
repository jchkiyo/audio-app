import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserAudioList = ({ token }) => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);

  useEffect(() => {
    const fetchAudioFiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/user/audio', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAudioFiles(response.data);
      } catch (error) {
        console.error('Error fetching audio files', error);
      }
    };

    fetchAudioFiles();
  }, [token]);

  const handlePlay = (audioId) => {
    setSelectedAudio(`http://localhost:5000/audio/play/${audioId}`);
  };

  return (
    <div>
      <h2>Your Uploaded Audio Files</h2>
      <ul>
        {audioFiles.map((file) => (
          <li key={file.id}>
            <span>{file.filename} - {file.description} ({file.category})</span>
            <button onClick={() => handlePlay(file.id)}>Play</button>
          </li>
        ))}
      </ul>

      {selectedAudio && (
        <div>
          <h3>Now Playing</h3>
          <audio controls>
            <source src={selectedAudio} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default UserAudioList;

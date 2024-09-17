import React, { useState } from 'react';
import axios from 'axios';

const UploadAudio = ({ token }) => {
  const [audioFile, setAudioFile] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('music');
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!audioFile) {
      setMessage('Please select an audio file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('description', description);
    formData.append('category', category);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error uploading the file.');
    }
  };

  return (
    <div>
      <h2>Upload Audio</h2>
      <form onSubmit={handleUpload}>
        <input type="file" accept="audio/*" onChange={handleFileChange} required />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="music">Music</option>
          <option value="podcast">Podcast</option>
          <option value="speech">Speech</option>
          <option value="sound effects">Sound Effects</option>
        </select>
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UploadAudio;

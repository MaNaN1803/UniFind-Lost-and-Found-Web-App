import React, { useState } from 'react';
import axios from 'axios';
import './ClaimFoundItem.css';
import Navbar from './Navbar';
import toast from "react-hot-toast";
import Card from './Card';

const ClaimFoundItem = () => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('image', image);
    formData.append('description', description);

    try {
      const response = await axios.post('http://localhost:8080/api/claimfounditem', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Claimed found item report submitted:', response.data);
    } catch (error) {
      console.error('Error submitting claimed found item report:', error);
    }
  };

  return (
    <div>
        <Navbar/>
    <div className="container">
      <h1>Claim a Found Item</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Please describe the found item you want to claim."
          />
        </div>
        <div>
          <label>Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <button type="submit" onClick={()=>toast.success("Report Submitted Successfully")}>Submit Claim</button>
      </form>
      
    </div>
    </div>
  );
};

export default ClaimFoundItem;

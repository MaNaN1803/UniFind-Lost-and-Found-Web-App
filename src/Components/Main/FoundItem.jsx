import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FoundItem.css';
import Navbar from './Navbar';
import toast from "react-hot-toast";

const FoundItem = () => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState();
  

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
      const response = await axios.post('http://localhost:8080/api/founditem/report-found', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Found item report submitted:', response.data);
    } catch (error) {
      console.error('Error submitting found item report:', error);
    }
  };
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const categories = ['Stationary', 'Mobile', 'Electronics', 'Jewelry','instruments','id cards','documents','keys','wallets','others'];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setDropdownOpen(false);
    
  };
  const [file, setFile] = useState(null);
const handleUpload = (e) => {
  const formdata=new FormData()
  formdata.append('file',file)
axios.post('http://localhost:8080/uploads',formdata)
.then(res=>console.log(res))
.catch(err=>console.log(err))
}

useEffect(()=>{
  axios.get('http://localhost:8080/getImage')
  .then(res=>setImage(res.data[1].image))
  .catch(err=>console.log(err))
},[])

  return (
    <div>
        <Navbar/>
    <div className="container">
      <h1>Report a Found Item</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Please describe the found item."
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
        <div>
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
        }}
      >
        <button
          onClick={() => setDropdownOpen(!isDropdownOpen)}
          style={{
            padding: '10px 20px',
            border: '2px solid #3498db',
            borderRadius: '5px',
            backgroundColor: 'white',
            color: 'white',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          Select Category: {selectedCategory} &#9660;
        </button>
        {isDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              border: '2px solid #3498db',
              borderRadius: '0 0 5px 5px',
              backgroundColor: 'white',
              zIndex: '1',
            }}
          >
            {categories.map((category) => (
              <div
                key={category}
                onClick={() => handleCategorySelect(category)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: selectedCategory === category ? '#f39c12' : 'white',
                  color: selectedCategory === category ? 'white' : '#3498db',
                }}
              >
                {category}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
        <button type="submit" onClick={()=>toast.success("Report Submitted Successfully")}>Submit Report</button>
      </form>
      <div>
        <input type="file" onChange={e => setFile(e.target.files [0])}/>
      <button onClick={handleUpload}>Upload</button>
        <img src={`http://localhost:8080/images/`+image} alt=""/>
      </div>
    </div>
            </div>
  );
};

export default FoundItem;

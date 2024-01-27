import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LostItem.css';
// import LostItemsList from './LostItemsList';
import Navbar from './Navbar';
import toast from "react-hot-toast";


const LostItem = () => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [privateQuestion, setPrivateQuestion] = useState('');
  const [lostItems, setLostItems] = useState([]);

  
  const fetchLostItems = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/lostitem/report-lost');
      setLostItems(response.data);
    } catch (error) {
      console.error('Error fetching lost items:', error);
    }
  };

  useEffect(() => {
    
    async function fetchLostItems() {
      try {
        const response = await axios.get('http://localhost:8080/api/lostitem/all');
        setLostItems(response.data);
      } catch (error) {
        console.error('Error fetching lost items:', error);
      }
    }

    fetchLostItems();
  }, []);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handlePrivateQuestionChange = (e) => {
    setPrivateQuestion(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('image', image);
    formData.append('description', description);
    formData.append('privateQuestion', privateQuestion);

    try {
      const response = await axios.post('http://localhost:8080/api/lostitem/report-lost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Lost item report submitted:', response.data);

     
      fetchLostItems();
    } catch (error) {
      console.error('Error submitting lost item report:', error);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const categories = ['Stationary', 'Mobile', 'Electronics', 'Jewelry','instruments','id cards','documents','keys','wallets','others']; // Add more categories as needed

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
    <div className="lost-item-container">
      <h1 className="title">Report a Lost Item</h1>
      
      {/* 
      <LostItemsList lostItems={lostItems} /> */}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Please describe the lost item."
            />
        </div>
        <div className="form-group">
          <label htmlFor="image">Image</label>
          {/* <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            /> */}
            <div className="form-group">
        <input type="file" onChange={e => setFile(e.target.files [0])}/>
      <button onClick={handleUpload}>Upload</button>
        <img src={`http://localhost:8080/images/`+image} alt=""/>
    </div>
        </div>
        <div className="form-group">
          <label htmlFor="privateQuestion">Private Question</label>
          <input
            type="text"
            id="privateQuestion"
            name="privateQuestion"
            value={privateQuestion}
            onChange={handlePrivateQuestionChange}
            placeholder="Optional: Add a private question to verify the item."
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
        <button type="submit" className="submit-button" onClick={()=>toast.success("Report Submitted Successfully")}>Submit Report</button>
      </form>
    </div>
                <br /><br /><br /><br /><br />
    <div className="form-group">
        <input type="file" onChange={e => setFile(e.target.files [0])}/>
      <button onClick={handleUpload}>Upload</button>
        <img src={`http://localhost:8080/images/`+image} alt=""/>
    </div>

</div>
  );
};

export default LostItem;

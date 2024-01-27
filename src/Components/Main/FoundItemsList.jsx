// components/FoundItemsList.js
import React, { useEffect, useState } from 'react';

const FoundItemsList = () => {
  const [foundItems, setFoundItems] = useState([]);

  useEffect(() => {
    const fetchFoundItems = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/founditems/all');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setFoundItems(data);
      } catch (error) {
        console.error('Error fetching found items:', error);
      }
    };

    fetchFoundItems();
  }, []);

  const [file, setFile] = useState()
const handleUpload = (e) =>{
console.log(file);
}

  return (
    <div>
      <h1>Found Items List</h1>
      <ul>
        {foundItems.map((item) => (
          <li key={item._id}>
            <div>
              <h3>Item Description</h3>
              <p>{item.description}</p>
            </div>
            <div>
              <h3>Item Image</h3>
               <img src={`http://localhost:8080/${item.imagePath}`} alt={`Item ${item._id}`} />
              {/* <img src={`http://localhost:8080/${item.imagePath}`} alt={`Item ${item._id}`} /> */}
            </div>
            <div>
              <div>
<input type="file" onChange={e => setFile(e.target.files[0])}/>
<button onClick={handleUpload}>Upload</button>
</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FoundItemsList;

import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../../apiConfig';

const LostItemsList = () => {
  const [lostItems, setLostItems] = useState([]);

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/lostitem/all`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setLostItems(data);
      } catch (error) {
        console.error('Error fetching lost items:', error);
      }
    };

    fetchLostItems();
  }, []);

  return (
    <div>
      <h1>Lost Items List</h1>
      <ul>
        {lostItems.map((item) => (
          <li key={item.id}>
            <div>
              <h3>Item Description</h3>
              <p>{item.description}</p>
            </div>
            <div>
              <h3>Item Image</h3>
              <img src={item.imageUrl} alt={`Item ${item.id}`} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LostItemsList;

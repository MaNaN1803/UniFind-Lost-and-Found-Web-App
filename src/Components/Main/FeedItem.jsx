// FeedItem.jsx

import React from 'react';

const FeedItem = ({ item ,imagePath }) => {
  return (
    <div className="feed-item">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
        <img src={`http://localhost:8080/${item.imagePath}`} alt={`Item ${item._id}`} />
    </div>
  );
};

export default FeedItem;

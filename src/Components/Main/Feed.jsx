// components/Feed.js
import React, { useEffect, useState } from 'react';
import LostItemsList from './LostItemsList';
import FoundItemsList from './FoundItemsList';
import FeedItem from './FeedItem';
import './Feed.css';
import Card from './Card';


const Feed = () => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [feedItems, setFeedItems] = useState([]);

  useEffect(() => {
    
    async function fetchFeedItems() {
      try {
        const response = await fetch('http://localhost:8080/api/feed');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setFeedItems(data);
      } catch (error) {
        console.error('Error fetching feed items:', error);
      }
    }

    fetchFeedItems();
  }, []);

  useEffect(() => {
    
    async function fetchLostItems() {
      try {
        const response = await fetch('http://localhost:8080/api/lostitem/all');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setLostItems(data);
      } catch (error) {
        console.error('Error fetching lost items:', error);
      }
    }

    async function fetchFoundItems() {
      try {
        const response = await fetch('http://localhost:8080/api/founditems/all');
        if (!response.ok) {
          throw Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Found items data:', data);
        setFoundItems(data);
      } catch (error) {
        console.error('Error fetching found items:', error);
      }
    }
    

    fetchLostItems();
    fetchFoundItems();
  }, []);

  return (
    <div className="feed-container">
      <h1 className="feed-title">Feed</h1>
      <div className="feed-list">
        <div className="feed-section">
          
          <h2>Lost Items</h2>
          <LostItemsList lostItems={lostItems} />
          <Card/>
        </div>
        <div className="feed-section">
          <h2>Found Items</h2>
          <FoundItemsList foundItems={foundItems} />
        </div>
        <div className="feed-list">
          {feedItems.map((item) => (
            <FeedItem key={item._id} item={item} />
          ))}
        </div>
        <Card/>
      </div>
      
    </div>
  );
};

export default Feed;

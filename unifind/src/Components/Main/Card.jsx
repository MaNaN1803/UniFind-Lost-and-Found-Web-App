// Card.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';
import './Card.css';

const Card = ({ description, imagePath }) => {
  const [image, setImage] = useState();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/getImage`)
      .then(res => setImage(res.data[1].image))
      .catch(err => console.log(err))
  }, [])

  return (
    <div className="card">
      <img src={`${API_BASE_URL}/images/` + image} alt="" />
      <p>{description}</p>

    </div>
  );
};

export default Card;

// Card.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Card.css'; 

const Card = ({ description, imagePath }) => {
  const [image, setImage] = useState();
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
    <div className="card">
      <img src={`http://localhost:8080/images/`+image} alt=""/>
      <p>{description}</p>
      
    </div>
  );
};

export default Card;

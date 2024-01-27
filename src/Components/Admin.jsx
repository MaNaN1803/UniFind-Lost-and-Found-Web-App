import React from "react";
import { Link } from "react-router-dom";
// import styles from "./Admin.module.css"; 

const Admin = () => {
  return (
    <div>
      <h1>Welcome to the Admin Panel</h1>
      <p>This is a secure area for admin users.</p>

      
      
      <Link to="/">Go back to the homepage</Link>
    </div>
  );
};

export default Admin;

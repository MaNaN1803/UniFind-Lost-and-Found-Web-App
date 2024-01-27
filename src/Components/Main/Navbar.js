import React from "react";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";
import logo from "./unifindlogo.png";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <img className="logo" src={logo} alt="Logo" />
      </div>
      <div className={styles.navLinks}>
        <Link to="/about">About</Link>
        <Link to="/post-lost-item">Post Lost Item</Link>
        <Link to="/post-found-item">Post Found Item</Link>
        <Link to="/feed">Feed</Link>
        <Link to="/claim-found-item">Claim Found Item</Link>
        <Link to="/rewards">Rewards</Link>
        <Link to="/contact-us">Contact Us</Link>
      </div>
    </nav>
  );
};

export default Navbar;

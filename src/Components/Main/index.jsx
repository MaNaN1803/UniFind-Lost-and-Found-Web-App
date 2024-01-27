import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';
import Typed from 'typed.js';
import logo from './unifindlogo.png';
import io from "socket.io-client";
import Chat from './Chat';
import './mainhome3.jpg';

const socket = io.connect("http://localhost:8080");

const Main = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const typedTextRef = useRef(null);

  useEffect(() => {
    const options = {
      strings: ['Welcome To UniFind'],
      typeSpeed: 60,
      backSpeed: 30,
      showCursor: true,
    };

    const typed = new Typed(typedTextRef.current, options);

    return () => {
      typed.destroy();
    };
  }, []);

  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setRoom(room);
      setShowChat(true);
    }
  };

  return (
    <div className={styles.main_container}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <img className='logo' src={logo} alt="Logo" />
        </div>
        <h1 ref={typedTextRef} className="welcome">
          Welcome To UniFind
        </h1>
        <div className={styles.navLinks}>
          {/* <Link to="/about">About</Link> */}
          <Link to="/post-lost-item">Post Lost Item</Link>
          <Link to="/post-found-item">Post Found Item</Link>
          <Link to="/feed">Feed</Link>
          <Link to="/claim-found-item">Claim Found Item</Link>
          <Link to="/rewards">Rewards</Link>
          {/* <Link to="/contact-us">Contact Us</Link> */}
          
        </div>
        <button className={styles.white_btn} onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <div style={{marginTop:'0%',
  backgroundImage: `url(${process.env.PUBLIC_URL}/mainhome3.jpg)`, 
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  minHeight: '100vh', 
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}}
    >
  <h1 className="head" style={{ backgroundColor:'#000032', fontSize: '60px', color: 'white', textAlign: 'center', marginBottom: '20px', borderRadius:'10px',padding:'16px'}}>
    !! Welcome To UniFind !!  
  </h1>
  <p className="home" style={{ backgroundColor:'#000032', fontSize: '20px', lineHeight: '1.6', textAlign: 'center', color: 'white',borderRadius:'10px',padding:'16px' }}>
   || This is a platform where you can post lost items and found items. You can also claim found items. ||
  </p>
  <h2 className="tag" style={{ backgroundColor:'#000032', fontSize: '60px', color: 'white', textAlign: 'center', marginTop: '20px',borderRadius:'10px',padding:'16px' }}>
    lost It . List It . Find It
  </h2>
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    <Link to="/post-lost-item" style={{ textDecoration: 'none' }}>
      <button style={{ fontSize: '18px', backgroundColor: '#007BFF', color: 'white', padding: '10px 20px', margin: '10px', border: 'none', cursor: 'pointer' }}>
        Post Lost Item
      </button>
    </Link>
    <Link to="/post-found-item" style={{ textDecoration: 'none' }}>
      <button style={{ fontSize: '18px', backgroundColor: '#007BFF', color: 'white', padding: '10px 20px', margin: '10px', border: 'none', cursor: 'pointer' }}>
        Post Found Item
      </button>
    </Link>
  </div>
</div>


      <div className='App'>
        {showChat ? (
          <Chat socket={socket} username={username} room={room} />
        ) : (
          <div className="joinChatContainer">
            <h1>Community Chat</h1>
            <h3>JOIN A CHAT</h3>
            <input
              type="text"
              placeholder='Username...'
              onChange={(event) => {
                setUsername(event.target.value);
              }}
            />
            <input
              type="text"
              placeholder='Room ID...'
              onChange={(event) => {
                setRoom(event.target.value);
              }}
            />
            <button onClick={joinRoom}>Join A Room</button>
          </div>
        )}
      </div>

              <div>
  <h1 style={{ textAlign: 'center', fontSize: '36px', color: '#007BFF' }}>
    Featured Categories
  </h1>
  <div style={{ display: 'flex', justifyContent: 'space-around' }}>
    <div
      className="card"
      style={{
        backgroundColor: '#FFFF00',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
        transition: '0.3s',
        width: '300px',
        margin: '20px',
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      <div className="card-content">
        <h2 style={{ fontSize: '24px', color: '#000' }}>Lost Items</h2>
        <p style={{ fontSize: '16px', color: '#333' }}>
          Help us find your lost items by posting details and descriptions here.
        </p>
      </div>
    </div>

    <div
      className="card"
      style={{
        backgroundColor: '#00FF00',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
        transition: '0.3s',
        width: '300px',
        margin: '20px',
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      <div className="card-content">
        <h2 style={{ fontSize: '24px', color: '#000' }}>Found Items</h2>
        <p style={{ fontSize: '16px', color: '#333' }}>
          Found something? Share it here and help reunite lost items with their owners.
        </p>
      </div>
    </div>

    <div
      className="card"
      style={{
        backgroundColor: '#FF0000',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
        transition: '0.3s',
        width: '300px',
        margin: '20px',
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      <div className="card-content">
        <h2 style={{ fontSize: '24px', color: '#000' }}>Claim Items</h2>
        <p style={{ fontSize: '16px', color: '#333' }}>
          Claim a found item that belongs to you or report a found item to its owner.
        </p>
      </div>
    </div>
  </div>
</div>

      <div>
        <div>
  <h1 style={{ textAlign: 'center', fontSize: '36px', color: '#007BFF' }}>
    Contact Us
  </h1>
  <div style={{ display: 'flex', justifyContent: 'space-around' }}>
    {/* Contact Form */}
    <div
      className="card"
      style={{
        backgroundColor: 'rgb(68 69 71)',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
        transition: '0.3s',
        width: '400px',
        margin: '20px',
        textAlign: 'center',
      }}
    >
      <div className="card-content">
        <h2 style={{ fontSize: '24px', color: '#fff' }}>Get In Touch</h2>
        <form>
          <input
            type="text"
            placeholder="Name"
            style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px' }}
          />
          <input
            type="email"
            placeholder="Email"
            style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px' }}
          />
          <textarea
            placeholder="Message"
            style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px' }}
          />
          <button
            type="submit"
            style={{ backgroundColor: '#fff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
          >
            Send Message
          </button>
        </form>
      </div>
    </div>

    
  </div>
</div>
      </div>

      <div style={{ backgroundColor: '#333', color: '#fff', padding: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0 }}>UniFind<sup>™</sup></h2>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 2 }}>
          <h4>Services</h4>
          <p><a href="#" style={{ color: '#fff' }}>Lost items</a></p>
          <p><a href="#" style={{ color: '#fff' }}>Found Items</a></p>
          <p><a href="#" style={{ color: '#fff' }}>Claim Items</a></p>
        </div>
        <div style={{ flex: 2 }}>
          <h4>Social</h4>
          <p>
            <a href="#" style={{ color: '#fff' }}>
              <i className="fab fa-linkedin"></i> Linkedin
            </a>
          </p>
          <p>
            <a href="#" style={{ color: '#fff' }}>
              <i className="fab fa-twitter"></i> Twitter
            </a>
          </p>
          <p>
            <a href="https://github.com/unifind" style={{ color: '#fff' }}>
              <i className="fab fa-github"></i> Github
            </a>
          </p>
          <p>
            <a href="https://www.facebook.com/unifind" style={{ color: '#fff' }}>
              <i className="fab fa-facebook"></i> Facebook
            </a>
          </p>
          <p>
            <a href="https://www.instagram.com/unifind" style={{ color: '#fff' }}>
              <i className="fab fa-instagram"></i> Instagram
            </a>
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <h4 className="address">Address</h4>
          <p>
            
            AITR INDORE
          </p>
          <h4 className="mobile">Mobile</h4>
          <p><a href="#" style={{ color: '#fff' }}>+91-12225*****</a></p>
          <h4 className="mail">Email</h4>
          <p><a href="#" style={{ color: '#fff' }}>unifind@gmail.com</a></p>
        </div>
      </div>
      <footer>
        <hr style={{ borderColor: '#555' }} />
        © 2023 UniFind.
      </footer>
    </div>


    </div>
  );
};

export default Main;

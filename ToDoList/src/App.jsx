import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Squares from "./components/Squares";

import Home from "./pages/Home";
import Postits from "./pages/Postits";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        {/*Sfondo*/}
        <div className="background-wrapper">
          <Squares
            speed={0.5}
            squareSize={40}
            direction="diagonal"
            borderColor="#000"
            hoverFillColor="#0b1f3a"
          />
        </div>

        {/* Contenuto */}
        <div className="content-wrapper">
          <AppContent />
        </div>
      </div>
    </BrowserRouter>
  );
}

function AppContent() {
  return (
    <>
      <Container className="my-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/postits" element={<Postits />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;

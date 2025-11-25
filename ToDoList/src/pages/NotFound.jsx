import React from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Pagina Non Trovata</h2>
        <p className="not-found-text">
          Ops! La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Button variant="primary" size="lg" className="not-found-button" onClick={() => navigate("/")}>
          Torna alla Home
        </Button>
      </div>
    </Container>
  );
};

export default NotFound;

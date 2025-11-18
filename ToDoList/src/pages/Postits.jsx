import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";

const Postits = () => {
  const [user, setUser] = useState(null);
  const [postits, setPostits] = useState([]);
  const [selectedPostit, setSelectedPostit] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [modalColor, setModalColor] = useState("#fff176");
  const [loading, setLoading] = useState(true);
  const [ModalDate, setModalDate] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const colors = ["red", "yellow", "green", "orange", "blue", "purple"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    const fetchUser = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8080/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Errore user");
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error(err);
        navigate("/");
      }
    };

    const fetchPostits = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8080/feed/postsIt/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Errore postits");
        const data = await res.json();
        setPostits(data.postIts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchPostits();
  }, [navigate]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Sei sicuro di voler cancellare questo post-it?"))
      return;
    try {
      const res = await fetch(`http://127.0.0.1:8080/feed/postIt/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Errore cancellazione");
      setPostits(postits.filter((p) => p.id !== id));
      setSelectedPostit(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://127.0.0.1:8080/feed/postIt/${selectedPostit.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: editContent }),
        }
      );
      if (!res.ok) throw new Error("Errore modifica");
      setPostits(
        postits.map((p) =>
          p.id === selectedPostit.id ? { ...p, content: editContent } : p
        )
      );
      setSelectedPostit(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPostit = async () => {
    const token = localStorage.getItem("token");
    if (newContent.trim().length < 3) {
      setError("Il contenuto deve avere almeno 3 caratteri.");
      return;
    }

    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    try {
      const res = await fetch("http://127.0.0.1:8080/feed/postIt", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newContent.trim(),
          color: randomColor,
        }),
      });

      if (!res.ok) throw new Error("Errore creazione post-it");

      const newPost = await res.json();
      setPostits([...postits, newPost]);
      setShowAddModal(false);
      setNewContent("");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Errore durante la creazione del post-it.");
    }
  };

  if (loading) return <p>Caricamento...</p>;

  return (
    <Container fluid className="postits-container">
      {user && (
        <div className="header d-flex align-items-center justify-content-center">
          <h3 className="welcome-text">Benvenuto, {user.name}</h3>
          <img
            src={`http://127.0.0.1:8080/${user.profileImage}`}
            alt="Profilo"
            className="profile-pic"
            onClick={() => navigate("/profile")}
          />
        </div>
      )}

      <div className="d-flex justcon mt-4">
        <Button
          variant="dark"
          onClick={() => {
            setShowAddModal(true);
            setError("");
            setNewContent("");
          }}
        >
          + Aggiungi Post-it
        </Button>
      </div>

      {postits.length === 0 ? (
        <p className="postit0 mt-5">
          {user?.name} al momento non hai alcun post-it.
        </p>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-3">
          {postits.map((post) => (
            <Col key={post.id}>
              <Card
                className="postit-card mt-5"
                style={{ backgroundColor: post.color }}
                onClick={() => {
                  setSelectedPostit(post);
                  setEditContent(post.content);
                  setModalColor(post.color || "#fff176");
                  setModalDate(post.createdAt);
                }}
              >
                <Card.Body>
                  {post.content.length > 100
                    ? post.content.substring(0, 100) + "..."
                    : post.content}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* MODALE POST-IT */}
      <Modal
        show={!!selectedPostit}
        onHide={() => setSelectedPostit(null)}
        centered
        dialogClassName="custom-modal"
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: modalColor,
            borderColor: "black",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Modal.Title>Post-it</Modal.Title>
            <small
              style={{ fontSize: "0.8rem", color: "#333", marginTop: "2px" }}
            >
              Creato: {new Date(ModalDate).toLocaleString()}
            </small>
          </div>
        </Modal.Header>

        <Modal.Body style={{ backgroundColor: modalColor }}>
          <Form.Control
            as="textarea"
            rows={10}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            style={{
              backgroundColor: modalColor,
              color: "#000",
              borderColor: modalColor,
            }}
          />
        </Modal.Body>

        <Modal.Footer
          style={{ backgroundColor: modalColor, borderColor: "black" }}
        >
          <Button
            variant="danger"
            onClick={() => handleDelete(selectedPostit.id)}
          >
            Cancella
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Modifica
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODALE AGGIUNTA */}
      <Modal
        show={showAddModal}
        onHide={() => {
          setShowAddModal(false);
          setError("");
          setNewContent("");
        }}
        centered
        backdrop="static"
        contentClassName="bg-dark text-white"
      >
        <Modal.Header closeButton>
          <Modal.Title>Aggiungi un nuovo Post-it</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Control
            as="textarea"
            rows={5}
            placeholder="Scrivi il contenuto..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Annulla
          </Button>
          <Button variant="success" onClick={handleAddPostit}>
            Conferma
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Postits;

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Form,
  Modal,
  Alert,
  Spinner,
} from "react-bootstrap";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    newPassword: "",
    image: null,
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    try {
      const res = await fetch("http://127.0.0.1:8080/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        return navigate("/");
      }

      if (!res.ok) throw new Error("Errore fetch user");

      const data = await res.json();
      setUser(data.user);
      setFormData({
        name: data.user.name,
        email: data.user.email,
        password: "",
        newPassword: "",
        image: null,
      });
      setPreview(`http://127.0.0.1:8080/${data.user.profileImage}`);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      if (files && files.length > 0) {
        const file = files[0];
        const validExtensions = ["image/png", "image/jpg", "image/jpeg"];
        if (!validExtensions.includes(file.type)) {
          alert("Formato immagine non valido. Usa png, jpg o jpeg.");
          e.target.value = null;
          setFormData((prev) => ({ ...prev, image: null }));
          setPreview(null);
          return;
        }
        setFormData((prev) => ({ ...prev, image: file }));
        setPreview(URL.createObjectURL(file));
      } else {
        setFormData((prev) => ({ ...prev, image: null }));
        setPreview(null);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!formData.password) {
      setError("Inserisci la tua password per modificare il profilo.");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const updateData = new FormData();
      if (formData.name) updateData.append("name", formData.name);
      if (formData.email) updateData.append("email", formData.email);
      updateData.append("password", formData.password);
      if (formData.newPassword)
        updateData.append("newPassword", formData.newPassword);
      if (formData.image) {
        updateData.append("image", formData.image);
      } else {
        const response = await fetch("/images/defaultImg.png");
        const blob = await response.blob();
        let imageFile = new File([blob], "defaultImg.png", {
          type: "image/png",
        });
        updateData.append("image", imageFile);
      }

      const res = await fetch("http://127.0.0.1:8080/auth/update", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: updateData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Errore aggiornamento profilo");
      } else {
        setSuccess("Profilo aggiornato con successo!");
        setShowEditModal(false);
        fetchUser();

        // se è stata modificata email o password, eseguo logout
        if (
          (formData.email && formData.email !== user.email) ||
          formData.newPassword
        ) {
          localStorage.removeItem("token");
          navigate("/");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Errore aggiornamento profilo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleDelete = async () => {
    setError("");
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8080/auth/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Errore cancellazione profilo");
      } else {
        localStorage.removeItem("token");
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError("Errore cancellazione profilo");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading)
    return <Spinner animation="border" className="d-block mx-auto mt-5" />;

  return (
    <Container className="profile-container mt-5">
      <Card className="p-4 text-center">
        <Button
          variant="black"
          className="mb-3 align-self-baseline"
          style={{ fontSize: "2rem", textDecoration: "none" }}
          onClick={() => navigate("/postits")}
        >
          ←
        </Button>
        <img
          src={preview}
          alt="Profilo"
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
          className="mb-3 align-self-center"
        />
        <h4>{user?.name}</h4>
        <p>{user?.email}</p>
        <div className="d-flex flex-column flex-sm-row justify-content-center gap-2 mt-3">
          <Button variant="primary" onClick={() => setShowEditModal(true)}>
            Modifica Profilo
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            Cancella Profilo
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Card>

      {/* MODALE MODIFICA */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Modifica Profilo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Vecchia Password *</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formNewPassword">
              <Form.Label>Nuova Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formImage">
              <Form.Label>Immagine Profilo</Form.Label>
              {preview && (
                <div className="mb-2">
                  <img
                    src={preview}
                    alt="anteprima"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              )}
              <Form.Control
                type="file"
                name="image"
                onChange={handleChange}
                accept="image/png, image/jpg, image/jpeg"
              />
            </Form.Group>

            <Button variant="success" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvataggio..." : "Salva Modifiche"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODALE DELETE */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Conferma Cancellazione Profilo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3" controlId="deletePassword">
              <Form.Label>Password *</Form.Label>
              <Form.Control
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Inserisci la tua password"
              />
            </Form.Group>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={!deletePassword || isDeleting}
            >
              {isDeleting ? "Eliminazione..." : "Conferma Cancellazione"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Profile;

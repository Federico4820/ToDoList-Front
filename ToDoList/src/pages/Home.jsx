import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Container,
} from "react-bootstrap";

const Home = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    verifyPassword: "",
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      try {
        const res = await fetch("https://apitodolist.lepore.pro/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          return navigate("/");
        }

        if (!res.ok) throw new Error("Errore user");
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    checkToken();
  }, [navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      alert("Compila tutti i campi obbligatori");
      return;
    }
    if (!isLogin && formData.password.length < 6) {
      alert("La password deve essere almeno di 6 caratteri");
      return;
    }
    if (!isLogin && formData.password !== formData.verifyPassword) {
      alert("Le password non corrispondono");
      return;
    }

    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("password", formData.password);
    submitData.append("verifyPassword", formData.verifyPassword);

    if (isLogin) {
      try {
        const res = await fetch("https://apitodolist.lepore.pro/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("token", data.token);
          navigate("/postits");
        } else {
          alert(data.message || "Errore login");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        let imageFile = formData.image;
        if (!imageFile) {
          const response = await fetch("/images/defaultImg.png");
          const blob = await response.blob();
          imageFile = new File([blob], "defaultImg.png", {
            type: "image/png",
          });
        }
        submitData.append("image", imageFile);

        const res = await fetch("https://apitodolist.lepore.pro/auth/register", {
          method: "POST",
          body: submitData,
        });
        const data = await res.json();
        if (res.ok) {
          alert("Registrazione completata! Ora puoi effettuare il login.");
          setIsLogin(true);
        } else {
          alert(data.message || "Errore registrazione");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isFormValid =
    formData.email &&
    formData.password &&
    (isLogin ||
      (formData.name &&
        formData.password.length >= 6 &&
        formData.password === formData.verifyPassword));

  return (
    <Container className="home-container">
      <Card className="home-card">
        <ToggleButtonGroup
          type="radio"
          name="loginSignup"
          defaultValue={1}
          className="home-toggle"
        >
          <ToggleButton
            id="tbg-radio-1"
            type="radio"
            value={1}
            onClick={() => setIsLogin(true)}
          >
            Login
          </ToggleButton>
          <ToggleButton
            id="tbg-radio-2"
            type="radio"
            value={2}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </ToggleButton>
        </ToggleButtonGroup>

        <Form onSubmit={handleSubmit} className="home-form">
          {!isLogin && (
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </Form.Group>

          {!isLogin && (
            <>
              <Form.Group className="mb-3" controlId="formVerifyPassword">
                <Form.Label>Verify Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Verify Password"
                  name="verifyPassword"
                  value={formData.verifyPassword}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formImage">
                <Form.Label>Profile Image</Form.Label>
                {!isLogin && preview && (
                  <div className="image-preview-container mb-2">
                    <img
                      src={preview}
                      alt="anteprima"
                      className="image-preview"
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
                  accept="image/png, image/jpg, image/jpeg"
                  onChange={handleChange}
                />
              </Form.Group>
            </>
          )}

          <Button
            variant="primary"
            type="submit"
            className="home-submit"
            disabled={!isFormValid || isSubmitting}
          >
            {isLogin ? "Login" : "Sign Up"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default Home;

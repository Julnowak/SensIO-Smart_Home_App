import { useState } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";

export default function UserProfile() {
  const [user, setUser] = useState({
    firstName: "Jan",
    lastName: "Kowalski",
    username: "janek123",
    email: "jan.kowalski@example.com",
    password: "",
    agreements: true,
    profileImage: "https://via.placeholder.com/150",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser({
      ...user,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Czy na pewno chcesz usunąć swoje konto?")) {
      console.log("Konto usunięte");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="p-4 shadow" style={{ width: "400px" }}>
        <h3 className="text-center text-primary">Profil użytkownika</h3>
        <div className="text-center mb-3">
          <img src={user.profileImage} alt="Profil" className="rounded-circle" width="100" />
        </div>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Imię</Form.Label>
            <Form.Control type="text" name="firstName" value={user.firstName} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nazwisko</Form.Label>
            <Form.Control type="text" name="lastName" value={user.lastName} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nazwa użytkownika</Form.Label>
            <Form.Control type="text" name="username" value={user.username} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={user.email} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Hasło</Form.Label>
            <Form.Control type="password" name="password" placeholder="Zmień hasło" onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Wyrażam zgodę na przetwarzanie danych osobowych"
              name="agreements"
              checked={user.agreements}
              onChange={handleChange}
            />
          </Form.Group>
          <Button variant="primary" className="w-100 mb-2">Zapisz zmiany</Button>
          <Button variant="danger" className="w-100" onClick={handleDeleteAccount}>Usuń konto</Button>
        </Form>
      </Card>
    </Container>
  );
}

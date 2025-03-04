import React from 'react';
import { Link } from "react-router-dom";
import { Container, Button, Form, Card } from "react-bootstrap";

const Login = () => {
 return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="p-4 shadow" style={{ width: "350px" }}>
        <h3 className="text-center text-primary">Login</h3>
        <Form>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="Wprowadź email" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Hasło</Form.Label>
            <Form.Control type="password" placeholder="Wprowadź hasło" />
          </Form.Group>
          <Button variant="primary" className="w-100">Zaloguj się</Button>
        </Form>
        <p className="text-center mt-3">
          Nie masz konta? <Link to="/register">Zarejestruj się</Link>
        </p>
      </Card>
    </Container>
  );
};

export default Login;
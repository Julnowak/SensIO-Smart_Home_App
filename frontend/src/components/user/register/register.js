import React, {useContext, useState} from 'react';
import {Link} from "react-router-dom";
import {Container, Button, Form, Card} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import { AuthContext } from "../../../AuthContext";

const Register = () => {
    const { registerUser } = useContext(AuthContext);
    const [errmess, setErrmess] = useState(null);
    const navigate = useNavigate()
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordSecond, setPasswordSecond] = useState("");

    async function submitRegistration(event) {
        event.preventDefault();
        await registerUser(email, password);
        navigate("/main")
    }


    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Card className="p-4 shadow" style={{width: "350px"}}>
                <h3 className="text-center text-primary">Rejestracja</h3>
                <Form onSubmit={submitRegistration}>
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Label>Nazwa użytkownika</Form.Label>
                        <Form.Control value={username} onChange={e => setUsername(e.target.value)} type="email" placeholder="Wprowadź email"/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Wprowadź email"/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Hasło</Form.Label>
                        <Form.Control value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Wprowadź hasło"/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password_second">
                        <Form.Label>Powtórz hasło</Form.Label>
                        <Form.Control value={passwordSecond} onChange={e => setPasswordSecond(e.target.value)} type="password" placeholder="Wprowadź hasło"/>
                    </Form.Group>
                    <Button variant="primary" type={"submit"} className="w-100">Zaloguj się</Button>
                </Form>
                <p className="text-center mt-3">
                    Masz już konto? <Link to="/login">Zaloguj się</Link>
                </p>
            </Card>
        </Container>
    );
};

export default Register;
import React, {useState} from 'react';
import {Link} from "react-router-dom";
import {Container, Button, Form, Card} from "react-bootstrap";
import client from "../../client";
import {useNavigate} from "react-router-dom";
import {API_BASE_URL} from "../../config";

const Login = () => {
    const [errmess, setErrmess] = useState(null);
    const navigate = useNavigate()
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState("");

    async function submitLogin(event) {
        event.preventDefault();
        try {
            console.log("dfwf")

            // Perform login
            const response = await client.post(
                `${API_BASE_URL}/login/`,
                {
                    email: email,
                    password: password,
                    login: username
                },
            )

            console.log(response.data)
            if(response){
                navigate("/main")
            }

        } catch (err) {
            setErrmess("Podaj poprawny login lub hasło.");
            console.error('Login failed:', err.message);
        }
    }


    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Card className="p-4 shadow" style={{width: "350px"}}>
                <h3 className="text-center text-primary">Login</h3>
                <Form onSubmit={submitLogin}>
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Wprowadź email"/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Hasło</Form.Label>
                        <Form.Control value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Wprowadź hasło"/>
                    </Form.Group>
                    <Button variant="primary" type={"submit"} className="w-100">Zaloguj się</Button>
                </Form>
                <p className="text-center mt-3">
                    Nie masz konta? <Link to="/register">Zarejestruj się</Link>
                </p>
            </Card>
        </Container>
    );
};

export default Login;
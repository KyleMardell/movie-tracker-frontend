"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../useAuth";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { searchMovies } from "../lib/tmdb";

const MovieSearchPage = () => {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [searchTerm, setSearchTerm] = useState<string | "">("");
    const [error, setError] = useState<string | null>(null);
    const [showError, setShowError] = useState<boolean | false>(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log("Searching for:", searchTerm);
            const response = await searchMovies(searchTerm, 1);
            console.log(response);

        } catch (err: any) {
            setError(err);
            setShowError(true);
        }
    }

    return (
        <Container>
            {
                showError ?
                    <Alert variant="danger" onClose={() => { setShowError(false); }} dismissible>
                        <Alert.Heading>Oh No! You got an error.</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                    : <></>
            }
            <Row>
                <Col>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Search Movie</Form.Label>
                            <Form.Control type="text" name="searchTerm" id="searchTerm" value={searchTerm} placeholder="Enter movie name" onChange={e => { setSearchTerm(e.target.value); setError(null); }} required />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

export default MovieSearchPage
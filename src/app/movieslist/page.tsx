"use client"

import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../useAuth";
import { UserMoviesContext } from "../context/UserMoviesContext";
import { Col, Container, Row } from "react-bootstrap";
import MovieCarousel from "../components/moviecarousel/MovieCarousel";
import MovieModal from "../components/moviemodal/MovieModal";


const UserMoviesPage = () => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const context = useContext(UserMoviesContext);
    const [modalShow, setModalShow] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

    // User auth
    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading]);

    if (!context) return null; // No context, add error message later

    const { userMovies } = context;

    const handleMovieClick = (movie: any) => {
        setSelectedMovie(movie);
        setModalShow(true);
    };

    const resetModalState = () => {
        setModalShow(false);
        setSelectedMovie(null);
    };

    return (
        <Container>
            <Row>
                <Col>
                    <MovieCarousel
                        movies={userMovies}
                        onReachEnd={() => { }}
                        onMovieClick={handleMovieClick}
                        listName="trending" />
                </Col>
            </Row>
            <MovieModal
                show={modalShow}
                onHide={resetModalState}
                movie={selectedMovie}
            />
        </Container>
    )
}

export default UserMoviesPage;
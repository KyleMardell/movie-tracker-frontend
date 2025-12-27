"use client"

import { useContext, useState } from "react";
import { UserMoviesContext } from "../context/UserMoviesContext";
import { Col, Container, Row } from "react-bootstrap";
import MovieCarousel from "../components/moviecarousel/MovieCarousel";
import MovieModal from "../components/moviemodal/MovieModal";


const UserMoviesPage = () => {

    const context = useContext(UserMoviesContext);
    const [modalShow, setModalShow] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

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
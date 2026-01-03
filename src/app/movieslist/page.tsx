"use client"

import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../useAuth";
import { UserMoviesContext } from "../context/UserMoviesContext";
import { Col, Container, Row } from "react-bootstrap";
import MovieCarousel from "../components/moviecarousel/MovieCarousel";
import MovieModal from "../components/moviemodal/MovieModal";

// NEEDS FILTERING ADDING FOR WATCHED STATUS

// types
type Movie = {
    id: number;
    title: string;
    poster_path: string;
    image_path: string;
};

// displays the users movie list
const UserMoviesPage = () => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const context = useContext(UserMoviesContext);
    const [modalShow, setModalShow] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    // User auth
    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading]);

    if (!context) return null;

    const { userMovies } = context;

    // shows modal when a movie is clicked
    const handleMovieClick = (movie: Movie) => {
        setSelectedMovie(movie);
        setModalShow(true);
    };

    // reset the modal
    const resetModalState = () => {
        setModalShow(false);
        setSelectedMovie(null);
    };

    // renders the user movie list page
    return (
        <Container>
            <Row className="my-5">
                <Col className="text-center">
                    <h1>{user}'s Movie List</h1>
                </Col>
            </Row>
            {
                userMovies.length > 0 ?
                    <Row>
                        <Col>
                            <MovieCarousel
                                movies={userMovies}
                                onReachEnd={() => { }}
                                onMovieClick={handleMovieClick}
                                listName="trending" />
                        </Col>
                    </Row>
                    :
                    <Row className="my-5">
                        <Col className="text-center">
                            <h2>No movies added to list</h2>
                        </Col>
                    </Row>
            }

            <MovieModal
                show={modalShow}
                onHide={resetModalState}
                movie={selectedMovie}
            />
        </Container>
    )
}

export default UserMoviesPage;
"use client"

import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../useAuth";
import { UserMoviesContext } from "../context/UserMoviesContext";
import { Col, Container, Row, Form } from "react-bootstrap";
import MovieCarousel from "../components/moviecarousel/MovieCarousel";
import MovieModal from "../components/moviemodal/MovieModal";
import styles from "./UserMoviesPage.module.css";

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

    const [selectedFilter, setSelectedFilter] = useState("all");
    const [filteredList, setFilteredList] = useState<Movie[]>([]);

    // User auth
    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading]);

    if (!context) return null;

    const { userMovies } = context;

    useEffect(() => {
        if (selectedFilter === "all") {
            setFilteredList(userMovies);
        } else if (selectedFilter === "watched") {
            setFilteredList(userMovies.filter(movie => movie.watched === true));
        } else if (selectedFilter === "unwatched") {
            setFilteredList(userMovies.filter(movie => movie.watched === false));
        }
    }, [userMovies, selectedFilter]);

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
            <Row className="my-5 text-center">
                <Col>
                    <h1>{user}'s<br />Movie List</h1>
                </Col>
            </Row>
            <Row className="mb-5">
                <Col className="d-flex justify-content-center">
                    <Form className={`d-flex ${styles.customRadio}`}>
                        <Form.Check
                            type="radio"
                            name="filter"
                            id="all"
                            label="All"
                            className="mx-3 electrolize-regular"
                            checked={selectedFilter === "all"}
                            onChange={() => setSelectedFilter("all")}
                        />
                        <Form.Check
                            type="radio"
                            name="filter"
                            id="watched"
                            label="Watched"
                            className="mx-3 electrolize-regular"
                            checked={selectedFilter === "watched"}
                            onChange={() => setSelectedFilter("watched")}
                        />
                        <Form.Check
                            type="radio"
                            name="filter"
                            id="unwatched"
                            label="Not Watched"
                            className="mx-3 electrolize-regular"
                            checked={selectedFilter === "unwatched"}
                            onChange={() => setSelectedFilter("unwatched")}
                        />
                    </Form>
                </Col>
            </Row>
            {
                filteredList.length > 0 ?
                    <Row>
                        <Col>
                            <MovieCarousel
                                movies={filteredList}
                                onReachEnd={() => { }}
                                onMovieClick={handleMovieClick}
                                listName="trending" />
                        </Col>
                    </Row>
                    :
                    <Row className="my-5 text-center">
                        <Col>
                            <h2>No movies yet...</h2>
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
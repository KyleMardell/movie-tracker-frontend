import { Card, Row, Col } from "react-bootstrap";
import styles from "./MovieCard.module.css";


// Types
type Movie = {
    id: number,
    title: string;
    poster_path: string;
    image_path: string;
};

// Movie card used in movie carousel
// Displays the movie poster and passes the onclick function as a 
// param to allow a user to click the card and open the modal
const MovieCard = ({ movie, className, onClick }: { movie: Movie; className?: string; onClick: (movie: Movie) => void }) => {

    const imageSrc =
        movie.poster_path
            ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
            : movie.image_path
                ? `https://image.tmdb.org/t/p/w500/${movie.image_path}`
                : "/images/logo.png";
    return (
        <Card className={`${styles.movieCard} ${className}`} onClick={() => onClick(movie)}>
            <Card.Img
                variant="top"
                src={imageSrc}
            />
            {imageSrc == "/images/logo.png" ?
                <Row className="text-center">
                    <Col>
                        <span className={styles.backupName}>{movie.title}</span>
                    </Col>
                </Row>
                :
                <></>}
        </Card>
    );
};

export default MovieCard
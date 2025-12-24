import { Card } from "react-bootstrap";
import styles from "./MovieCard.module.css";

type Movie = {
    title: string;
    poster_path: string;
};

const MovieCard = ({ movie, className }: { movie: Movie; className?: string }) => {
    return (
        <Card className={`${styles.movieCard} ${className}`}>
            <Card.Img
                variant="top"
                src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
            />
        </Card>
    );
};

export default MovieCard
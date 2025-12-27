import { Card } from "react-bootstrap";
import styles from "./MovieCard.module.css";

type Movie = {
    id: number,
    title: string;
    poster_path: string;
    image_path: string;
};

const MovieCard = ({ movie, className, onClick }: { movie: Movie; className?: string; onClick: (movie: Movie) => void }) => {
    return (
        <Card className={`${styles.movieCard} ${className}`} onClick={() => onClick(movie)}>
            <Card.Img
                variant="top"
                src={`https://image.tmdb.org/t/p/w500/${movie.poster_path? movie.poster_path : movie.image_path}`}
            />
        </Card>
    );
};

export default MovieCard
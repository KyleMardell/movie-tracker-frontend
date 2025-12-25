"use client";

import { useEffect, useState } from "react";
import MovieCard from "../moviecard/MovieCard";
import styles from "./MovieCarousel.module.css";
import { useCarouselDrag } from "./useCarouselDrag";

type Movie = {
    id: number;
    title: string;
    poster_path: string;
};

type Movies = Movie[];

type MovieCarouselProps = {
    movies: Movies;
    onReachEnd?: () => void;
    onMovieClick: (movie: Movie) => void;
    listName: string;
}

const MovieCarousel = ({ movies, onReachEnd, onMovieClick, listName }: MovieCarouselProps) => {
    const [cardWidth, setCardWidth] = useState(250);

    useEffect(() => {
        const update = () => setCardWidth(window.innerWidth <= 768 ? 110 : 250);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const { outerRef, focusedIndex, handlers } = useCarouselDrag({
        cardWidth,
        moviesLength: movies.length,
        onReachEnd,
    });

    return (
        <div
            className={styles.carouselOuter}
            ref={outerRef}
            {...handlers}
        >
            <div className={styles.carouselInner}>
                {cardWidth >= 150 && <div className={styles.falseCard} />}
                <div className={styles.falseCard} />

                {movies.map((movie, index) => (
                    <MovieCard
                        key={`${listName}-${movie.id}`}
                        movie={movie}
                        onClick={index == focusedIndex ? onMovieClick : () => {}}
                        className={index === focusedIndex ? styles.focused : ""}
                    />
                ))}

                <div className={styles.falseCard} />
                {cardWidth >= 150 && <div className={styles.falseCard} />}
            </div>
        </div>
    );
};

export default MovieCarousel;

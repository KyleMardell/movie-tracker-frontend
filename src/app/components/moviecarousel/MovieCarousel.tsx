"use client";

import { useEffect, useState } from "react";
import MovieCard from "../moviecard/MovieCard";
import styles from "./MovieCarousel.module.css";
import { useCarouselDrag } from "./useCarouselDrag";


// types
type Movie = {
    id: number;
    title: string;
    poster_path: string;
    image_path: string;
};

type MovieCarouselProps = {
    movies: Movie[];
    onReachEnd?: () => void;
    onMovieClick: (movie: Movie) => void;
    listName: string;
}

// movie carousel displays the movie cards in a horizontally scrolling list
// only allows the user to click the focused/centered movie to avoid false clicks
const MovieCarousel = ({ movies, onReachEnd, onMovieClick, listName }: MovieCarouselProps) => {
    const [cardWidth, setCardWidth] = useState(250);

    // checks the screen width and sets the card width accordingly
    useEffect(() => {
        const update = () => setCardWidth(window.innerWidth <= 768 ? 110 : 250);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    // de-structures the drag helpers from the carousel drag hook
    const { outerRef, focusedIndex, handlers } = useCarouselDrag({
        cardWidth,
        moviesLength: movies.length,
        onReachEnd,
    });

    // renders the carousel, uses the mouse drag helpers and passed on click function
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

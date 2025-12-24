"use client";

import { useState, useRef, useEffect } from "react";
import MovieCard from "../moviecard/MovieCard";
import styles from "./MovieCarousel.module.css";

type Movie = {
    id: number;
    title: string;
    poster_path: string;
};

type Movies = Movie[];

const MovieCarousel = ({ movies }: { movies: Movies }) => {
    const [dragStart, setDragStart] = useState<number | null>(null);
    const outerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const [focusedIndex, setFocusedIndex] = useState<number>(0);
    const [cardWidth, setCardWidth] = useState<number>(300);

    // Update card width on resize
    useEffect(() => {
        const updateCardWidth = () => setCardWidth(window.innerWidth <= 768 ? 136 : 316);
        updateCardWidth();
        window.addEventListener("resize", updateCardWidth);
        return () => window.removeEventListener("resize", updateCardWidth);
    }, []);

    // Mouse down / touch start
    const onDragStart = (pageX: number) => {
        if (!outerRef.current) return;
        isDragging.current = true;
        setDragStart(pageX);
    };

    const onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        onDragStart(e.pageX);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        onDragStart(touch.pageX);
    };

    // Mouse move / touch move
    const onDragMove = (currentX: number) => {
        if (!isDragging.current || !outerRef.current || dragStart === null) return;
        const diff = currentX - dragStart;
        outerRef.current.scrollLeft -= diff;
        setDragStart(currentX);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        e.preventDefault();
        onDragMove(e.pageX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        onDragMove(touch.pageX);
    };

    // Mouse up / touch end
    const stopDrag = () => {
        if (!outerRef.current) return;

        const outerWidth = outerRef.current.clientWidth;
        const falseCardsStart = 2;

        // adjust scrollLeft to account for false cards at start
        const centerIndex = Math.round(
            (outerRef.current.scrollLeft + outerWidth / 2 - cardWidth / 2) / cardWidth
        ) - falseCardsStart;

        setFocusedIndex(centerIndex);

        const scrollTo = cardWidth * (centerIndex + falseCardsStart) - outerWidth / 2 + cardWidth / 2;
        outerRef.current.scrollTo({
            left: scrollTo,
            behavior: "smooth",
        });

        isDragging.current = false;
        setDragStart(null);
    };

    return (
        <div
            className={styles.carouselOuter}
            ref={outerRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={stopDrag}
        >
            <div className={styles.carouselInner}>
                <div className={styles.falseCard}></div>
                <div className={styles.falseCard}></div>
                {movies.map((movie, index) => (
                    <MovieCard
                        key={movie.id}
                        movie={movie}
                        className={index === focusedIndex ? styles.focused : ""}
                    />
                ))}
                <div className={styles.falseCard}></div>
                <div className={styles.falseCard}></div>
            </div>
        </div>
    );
};

export default MovieCarousel;

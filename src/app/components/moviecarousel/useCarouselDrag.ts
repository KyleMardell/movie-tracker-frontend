import { useRef, useState, useEffect } from "react";

// types
type UseCarouselDragProps = {
    cardWidth: number;
    moviesLength: number;
    onReachEnd?: () => void;
};

// function to allow the carousel to drag from left to right
// measures when a user clicks and drags left to right within the carousel
export const useCarouselDrag = ({
    cardWidth,
    moviesLength,
    onReachEnd,
}: UseCarouselDragProps) => {
    const outerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const hasTriggeredEnd = useRef(false);

    const [dragStart, setDragStart] = useState<number | null>(null);
    const [focusedIndex, setFocusedIndex] = useState(0);

    // ---- drag helpers ----

    // sets the drag to true and logs the click/swipe starting X position
    const startDrag = (pageX: number) => {
        isDragging.current = true;
        setDragStart(pageX);
    };

    // updates scrollLeft based on the X position difference / amount moved
    const moveDrag = (currentX: number) => {
        if (!outerRef.current || dragStart === null || !isDragging.current) return;

        const diff = currentX - dragStart;
        outerRef.current.scrollLeft -= diff;
        setDragStart(currentX);
        handleNearEnd();
    };

    // snaps carousel to the nearest centered card after dragging
    // resets the center index to allow correct highlighting of selected movie
    // resets is dragging to false and position to null
    const stopDrag = () => {
        if (!outerRef.current) return;

        const outerWidth = outerRef.current.clientWidth;
        const falseCardsStart = cardWidth <= 150 ? 1 : 2;

        const centerIndex =
            Math.round(
                (outerRef.current.scrollLeft + outerWidth / 2 - cardWidth / 2) /
                    cardWidth
            ) - falseCardsStart;

        setFocusedIndex(centerIndex);

        const scrollTo =
            cardWidth * (centerIndex + falseCardsStart) -
            outerWidth / 2 +
            cardWidth / 2;

        outerRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });

        isDragging.current = false;
        setDragStart(null);
    };

    // ---- pagination ----

    // check when the list end enters the screen
    // triggers end to load next page of results
    const handleNearEnd = () => {
        if (!outerRef.current || !onReachEnd) return;

        const { scrollLeft, clientWidth, scrollWidth } = outerRef.current;

        if (
            scrollLeft + clientWidth >= scrollWidth - cardWidth * 2 &&
            !hasTriggeredEnd.current
        ) {
            hasTriggeredEnd.current = true;
            onReachEnd();
        }
    };

    // sets the end trigger to false when the movie list length changes
    useEffect(() => {
        hasTriggeredEnd.current = false;
    }, [moviesLength]);

    // returns handlers to use in carousel
    // checks on mouse/swipe down, move and release
    // checks for screen bounds
    return {
        outerRef,
        focusedIndex,
        handlers: {
            onMouseDown: (e: React.MouseEvent) => {
                e.preventDefault();
                startDrag(e.pageX);
            },
            onMouseMove: (e: React.MouseEvent) => {
                e.preventDefault();
                moveDrag(e.pageX);
            },
            onMouseUp: stopDrag,
            onMouseLeave: stopDrag,
            onTouchStart: (e: React.TouchEvent) =>
                startDrag(e.touches[0].pageX),
            onTouchMove: (e: React.TouchEvent) =>
                moveDrag(e.touches[0].pageX),
            onTouchEnd: stopDrag,
        },
    };
};

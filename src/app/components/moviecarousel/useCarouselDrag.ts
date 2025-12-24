import { useRef, useState, useEffect } from "react";

type UseCarouselDragProps = {
    cardWidth: number;
    moviesLength: number;
    onReachEnd?: () => void;
};

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
    const startDrag = (pageX: number) => {
        isDragging.current = true;
        setDragStart(pageX);
    };

    const moveDrag = (currentX: number) => {
        if (!outerRef.current || dragStart === null || !isDragging.current) return;

        const diff = currentX - dragStart;
        outerRef.current.scrollLeft -= diff;
        setDragStart(currentX);

        handleNearEnd();
    };

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

    useEffect(() => {
        hasTriggeredEnd.current = false;
    }, [moviesLength]);

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

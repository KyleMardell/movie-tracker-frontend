"use client";

import { useEffect, useState, useRef } from "react";

// When a user clicks outside the ref component, sets expanded to false
const useClickOutsideToggle = () => {
    const [expanded, setExpanded] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                ref.current &&
                event.target instanceof HTMLElement &&
                !ref.current.contains(event.target)
            ) {
                setExpanded(false);
            }
        };

        document.addEventListener("mouseup", handleClickOutside);
        return () => {
            document.removeEventListener("mouseup", handleClickOutside);
        };
    }, []);

    return { expanded, setExpanded, ref };
};

export default useClickOutsideToggle;

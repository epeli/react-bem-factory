import React from "react";

export function useScrollLock(isActive: boolean) {
    React.useEffect(() => {
        if (!isActive) {
            return;
        }

        const origHeight = document.body.style.height;
        const origOverflow = document.body.style.overflow;

        document.body.style.height = "100%;";
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.height = origHeight;
            document.body.style.overflow = origOverflow;
        };
    }, [isActive]);
}

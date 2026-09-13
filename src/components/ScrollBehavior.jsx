import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollBehavior() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      // Restore scroll to top on path changes
      window.scrollTo(0, 0);
      return;
    }

    // Scroll to the hash anchor element if present
    const elementId = hash.replace("#", "");
    
    // Give React rendering cycle a moment to complete and paint the DOM
    const timeoutId = setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo(0, 0);
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [pathname, hash]);

  return null;
}

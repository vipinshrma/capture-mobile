"use client";

import { useEffect } from "react";

export function RevealMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    root.classList.add("motion-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );

    function revealHashTarget() {
      if (!window.location.hash) return;
      const target = document.getElementById(window.location.hash.slice(1));
      target?.closest("section")?.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
        element.classList.add("is-visible");
        observer.unobserve(element);
      });
    }

    elements.forEach((element) => {
      const bounds = element.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) {
        element.classList.add("is-visible");
        return;
      }
      observer.observe(element);
    });
    revealHashTarget();
    window.addEventListener("hashchange", revealHashTarget);
    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", revealHashTarget);
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}

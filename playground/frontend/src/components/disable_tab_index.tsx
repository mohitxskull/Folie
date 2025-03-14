import { ReactNode, useEffect, useRef } from "react";

type Props = {
  children: ReactNode;
};

export const DisableTabIndex = (props: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const elements = container.querySelectorAll("[tabindex]");
      elements.forEach((element) => {
        element.setAttribute("tabindex", "-1");
      });

      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof Element) {
                const elementsWithTabIndex =
                  node.querySelectorAll("[tabindex]");
                elementsWithTabIndex.forEach((el) => {
                  el.setAttribute("tabindex", "-1");
                });
                if (node.hasAttribute("tabindex")) {
                  node.setAttribute("tabindex", "-1");
                }
              }
            });
          }
        }
      });

      observer.observe(container, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
      };
    }
  }); // Run only once on mount

  return <div ref={containerRef}>{props.children}</div>;
};

export const scrollToElement = (
  element: HTMLElement | null,
  headerHeight: number = 80
): void => {
  if (!element) return;
  
  requestAnimationFrame(() => {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  });
};

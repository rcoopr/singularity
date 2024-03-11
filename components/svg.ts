export function createIconStar() {
  const star = document.createElement('div');

  star.innerHTML = html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 32 32"
    fill="none"
    class="star"
  >
    <path
      class="fill"
      fill="currentColor"
      d="m16 3.333-4.076 8.319-9.257 1.341 6.706 6.556-1.604 9.118L16 24.28l8.23 4.387-1.59-9.117 6.693-6.556-9.206-1.342L16 3.333Z"
    />
    <path
      class="stroke"
      stroke="currentColor"
      stroke-linejoin="round"
      stroke-width="2.667"
      d="m16 3.333-4.076 8.319-9.257 1.341 6.706 6.556-1.604 9.118L16 24.28l8.23 4.387-1.59-9.117 6.693-6.556-9.206-1.342L16 3.333Z"
    />
  </svg>`;

  return star.firstChild as SVGElement;
}

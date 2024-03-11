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
    <path
      class="stroke"
      stroke="currentColor"
      stroke-linejoin="round"
      stroke-width="2.667"
      d="m16 3.333-4.076 8.319-9.257 1.341 6.706 6.556-1.604 9.118L16 24.28l8.23 4.387-1.59-9.117 6.693-6.556-9.206-1.342L16 3.333Z"
    />
  </svg>`;

  star.innerHTML = html`<svg
    width="26"
    height="26"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="star"
  >
    <path
      d="M16.9009 5.15006C16.5323 4.4073 15.4719 4.41 15.1071 5.15463L12.1562 11.178C12.0109 11.4746 11.7285 11.6803 11.4016 11.7277L4.66925 12.7031C3.84947 12.8219 3.52127 13.8288 4.11358 14.4079L8.99547 19.1806C9.23152 19.4113 9.33847 19.7437 9.2813 20.0688L8.12467 26.646C7.98032 27.4668 8.84442 28.0937 9.57989 27.7017L15.5296 24.5307C15.8236 24.374 16.1763 24.374 16.4703 24.5307L22.4226 27.7033C23.1575 28.095 24.0212 27.4694 23.8781 26.649L22.7304 20.0681C22.6738 19.7438 22.7805 19.4123 23.0158 19.1819L27.891 14.4067C28.4822 13.8277 28.1544 12.8221 27.3355 12.7028L20.6459 11.7276C20.3211 11.6802 20.0403 11.4765 19.8944 11.1825L16.9009 5.15006Z"
      fill="currentColor"
      class="fill"
    />
    <path
      d="M15.9994 5L12.3316 12.2241L4 13.3889L10.0354 19.0823L8.5924 27L16 23.1905L23.407 27L21.976 19.0829L28 13.3895L19.7146 12.2241L15.9994 5Z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
      class="stroke"
    />
  </svg> `;

  return star.firstChild as SVGElement;
}

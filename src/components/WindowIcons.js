export const MinimizeIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 6H10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const MaximizeIcon = ({ isMaximized }) => (
  isMaximized ? (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 4V2.5C8 2.22386 7.77614 2 7.5 2H2.5C2.22386 2 2 2.22386 2 2.5V7.5C2 7.77614 2.22386 8 2.5 8H4M4.5 4H9.5C9.77614 4 10 4.22386 10 4.5V9.5C10 9.77614 9.77614 10 9.5 10H4.5C4.22386 10 4 9.77614 4 9.5V4.5C4 4.22386 4.22386 4 4.5 4Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  ) : (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2"
        y="2"
        width="8"
        height="8"
        rx="0.5"
        stroke="currentColor"
        strokeWidth="1.25"
        fill="none"
      />
    </svg>
  )
);

export const CloseIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 3L9 9M9 3L3 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

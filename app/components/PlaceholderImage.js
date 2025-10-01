export default function PlaceholderImage({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="400" height="300" fill="#E5E7EB" />
      <path
        d="M200 120C188.954 120 180 128.954 180 140C180 151.046 188.954 160 200 160C211.046 160 220 151.046 220 140C220 128.954 211.046 120 200 120Z"
        fill="#9CA3AF"
      />
      <path
        d="M160 180L140 220H260L220 160L200 185L180 160L160 180Z"
        fill="#9CA3AF"
      />
      <text
        x="200"
        y="250"
        textAnchor="middle"
        fill="#6B7280"
        fontSize="14"
        fontFamily="Arial"
      >
        No Image Available
      </text>
    </svg>
  );
}
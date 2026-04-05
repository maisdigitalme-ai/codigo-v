'use client';

interface AvatarIconProps {
  size?: number;
  bgColor?: string;
  iconColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AvatarIcon({
  size = 32,
  bgColor = '#E63946',
  iconColor = 'white',
  className = '',
  style = {},
}: AvatarIconProps) {
  const iconSize = Math.round(size * 0.55);

  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        background: bgColor,
        ...style,
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="8" r="4.5" fill={iconColor} />
        <path
          d="M4 21c0-3.866 3.582-7 8-7s8 3.134 8 7"
          fill={iconColor}
        />
      </svg>
    </div>
  );
}

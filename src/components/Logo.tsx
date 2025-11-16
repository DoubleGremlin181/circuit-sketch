export const Logo = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="32" height="32" fill="currentColor" rx="6" opacity="0.1"/>
    <path 
      d="M8 8 L8 24 L10 24 L10 14 Q10 12 12 12 L20 12 Q22 12 22 10 L22 8 L20 8 L20 10 L12 10 L12 8 Z" 
      fill="currentColor"
    />
    <circle cx="22" cy="18" r="3" fill="currentColor"/>
    <path 
      d="M14 16 Q16 18 18 16" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
      fill="none"
    />
  </svg>
)

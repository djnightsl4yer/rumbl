import { useEffect, useState } from 'react';

export default function ChainScrollbar() {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const trackHeight = documentHeight - windowHeight;
      const percentage = trackHeight > 0 ? (scrollTop / trackHeight) * 100 : 0;
      setScrollPercentage(percentage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const chainLinks = 20;

  return (
    <div className="fixed right-4 top-0 bottom-0 w-8 pointer-events-none z-[200] flex items-center">
      <div className="relative w-full h-[90%] my-auto">
        {Array.from({ length: chainLinks }).map((_, index) => {
          const linkPosition = (index / chainLinks) * 100;
          const isActive = linkPosition <= scrollPercentage;
          const distanceFromScroll = Math.abs(linkPosition - scrollPercentage);
          const scale = isActive
            ? 1 + (1 - distanceFromScroll / 100) * 0.3
            : 1;

          return (
            <div
              key={index}
              className="absolute left-1/2 -translate-x-1/2 transition-all duration-300"
              style={{
                top: `${linkPosition}%`,
                transform: `translateX(-50%) scale(${scale}) rotateY(${isActive ? 20 : 0}deg)`,
                filter: `brightness(${isActive ? 1.5 : 0.6})`,
              }}
            >
              <svg
                width="32"
                height="40"
                viewBox="0 0 32 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                }}
              >
                <ellipse
                  cx="16"
                  cy="12"
                  rx="10"
                  ry="8"
                  fill="none"
                  stroke={isActive ? '#ffffff' : '#666666'}
                  strokeWidth="3"
                  style={{
                    transition: 'stroke 0.3s',
                  }}
                />
                <ellipse
                  cx="16"
                  cy="28"
                  rx="10"
                  ry="8"
                  fill="none"
                  stroke={isActive ? '#ffffff' : '#666666'}
                  strokeWidth="3"
                  style={{
                    transition: 'stroke 0.3s',
                  }}
                />
                <ellipse
                  cx="16"
                  cy="12"
                  rx="7"
                  ry="5"
                  fill={isActive ? 'rgba(255,255,255,0.1)' : 'rgba(100,100,100,0.1)'}
                  style={{
                    transition: 'fill 0.3s',
                  }}
                />
                <ellipse
                  cx="16"
                  cy="28"
                  rx="7"
                  ry="5"
                  fill={isActive ? 'rgba(255,255,255,0.1)' : 'rgba(100,100,100,0.1)'}
                  style={{
                    transition: 'fill 0.3s',
                  }}
                />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

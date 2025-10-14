import { useEffect, useState } from 'react';

export default function BarbedWireBackground() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
      <div
        className="absolute w-screen h-screen transition-transform duration-300 ease-out"
        style={{
          backgroundImage: 'url(/BACKGROUND.jpg)',
          backgroundSize: '100vw 100vh',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: `
            translate(${mousePosition.x}px, ${mousePosition.y - scrollY * 0.5}px)
          `,
        }}
      />
    </div>
  );
}

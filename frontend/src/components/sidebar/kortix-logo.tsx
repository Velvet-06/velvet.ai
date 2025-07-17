'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface VelvetLogoProps {
  size?: number;
}
export function VelvetLogo({ size = 36 }: VelvetLogoProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mount, we can access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Remove color inversion for logo
  return (
    <Image
        src="/velvet-symbol.png"
        alt="Velvet"
        width={size}
        height={size}
        className="flex-shrink-0"
      />
  );
}

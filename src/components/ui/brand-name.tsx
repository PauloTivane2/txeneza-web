import React from "react";

interface BrandNameProps {
  className?: string;
}

export const BrandName: React.FC<BrandNameProps> = ({ className = "" }) => {
  return (
    <span className={`inline-flex items-baseline ${className}`} aria-label="Txeneza">
      <span className="bg-gradient-to-r from-mintGreen via-forestGreen to-mintGreen bg-clip-text text-transparent">
        T
      </span>
      <span className="bg-gradient-to-r from-limeGreen to-mintGreen bg-clip-text text-transparent">x</span>
      <span className="bg-gradient-to-r from-mintGreen via-forestGreen to-mintGreen bg-clip-text text-transparent">
        eneza
      </span>
    </span>
  );
};

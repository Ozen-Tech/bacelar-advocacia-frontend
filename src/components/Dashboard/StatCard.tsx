// src/components/Dashboard/StatCard.tsx
import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  Icon: React.ElementType; // Permite passar um componente de ícone
  className?: string;
}

export default function StatCard({ title, value, Icon, className }: StatCardProps) {
  return (
    <div className={`flex flex-col justify-between rounded-lg bg-bacelar-gray-dark p-6 shadow-md document-watermark ${className}`}>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-bacelar-gray-light">
          {title}
        </h3>
        <p className="mt-2 text-5xl font-bold text-white">
          {value}
        </p>
      </div>
      <div className="self-end text-3xl text-bacelar-gold">
        <Icon />
      </div>
    </div>
  );
}
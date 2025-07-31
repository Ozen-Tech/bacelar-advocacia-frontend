
// src/components/Forms/Select.tsx
import React from 'react';

type SelectProps = React.ComponentPropsWithoutRef<'select'>;

export default function Select({ children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className="w-full border-2 border-bacelar-gray-light/20 bg-bacelar-gray-dark px-4 py-2 text-white transition focus:border-bacelar-gold focus:outline-none focus:ring-0"
    >
      {children}
    </select>
  );
}
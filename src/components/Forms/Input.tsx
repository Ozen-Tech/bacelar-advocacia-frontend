// src/components/Forms/Input.tsx
import React from 'react';

// Usamos as props nativas do input para máxima flexibilidade
type InputProps = React.ComponentPropsWithoutRef<'input'>;

export default function Input(props: InputProps) {
  return (
    <input
      {...props}
      className="w-full border-2 border-bacelar-gray-light/20 bg-bacelar-gray-dark px-4 py-2 text-white placeholder-bacelar-gray-light transition focus:border-bacelar-gold focus:outline-none focus:ring-0"
    />
  );
}

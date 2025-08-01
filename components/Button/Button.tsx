import React from 'react'

interface ButtonProps {
    count: number;
    increment: () => void;
}
  
export default function Button({count, increment}: ButtonProps) {
  return (
    <button 
        onClick={increment}
        className="p-2 mt-2 mb-2 w-full bg-yellow-200 border border-black hover:bg-yellow-300 rounded-xl"
        >
        Clique o botão (já foi clicado {count} vezes)
    </button>)
}

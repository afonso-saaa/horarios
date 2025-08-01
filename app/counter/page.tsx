'use client'

import Button from '@/components/Button/Button'
import React, { useEffect, useState } from 'react'

export default function Page() {

  //
  // A. Gestão de estados
  const [count, setCount] = useState(() => {
    const countStr = localStorage.getItem('count');
    return countStr ? parseInt(countStr, 10) : 0
  })

  //
  // B. Fetch de Dados
  // C. Transformação de dados
  // D. Funções utilitárias
  // E. Handlers
  
  //
  // F. Efeitos
  useEffect(() => {
    localStorage.setItem('count', count.toString())
    console.log(count)
  }, [count])

    
  //
  // G. Renderização
  return <>
    <h2 className="text-xl font-bold">Contador</h2>
    <Button
      count={count}
      increment={() => setCount(count + 1)}
    />

    <p className="font-bold">O contador vai em {count}.</p>

    <p>O botão é um componente React. O clique no botão altera o valor disponível na página,
      porque a função responsável pela atualização do estado é passada como prop para o componente botão.</p>

  </>
}

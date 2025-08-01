import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function page() {
  return <>
    <p className="font-bold text-xl pb-3">Página que interage com a API dos Municípios.</p>
    <p className="pb-3">
      Endpoint: 
      <Link 
        className="underline"
        href="https://api.carrismetropolitana.pt/municipalities">
          https://api.carrismetropolitana.pt/municipalities
      </Link>
    </p>
    <Image
      src="/municipios.webp"
      width={500}
      height={300}
      alt="Acesso a API externa"
    ></Image>
  </>
}

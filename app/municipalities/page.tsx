'use client'

import React, { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Municipality } from '../../models/interfaces'
import MunicipalityCard from '@/components/MunicipalityCard/MunicipalityCard'

export default function Page() {

  //
  // A. Gestão de Estados
  const [municipalitiesList, setMunicipalitiesList] = useState<string[]>([])


  //
  // B. Fetch de Dados
  const fetcher = (url: string) => fetch(url).then(res => res.json())
  const { data, error, isLoading } = useSWR<Municipality[], Error>('api/municipalities', fetcher)


  //
  // C. Transformaçao/processamento de Dados
  const transformedMunicipalities = data?.map(m => ({
    ...m,
    displayName: `${m.name} (${m.district_name})`, // adiciona nome formatado para exibição
  })) || [];

  
  //
  // D. Funções utilitárias
  function toggleItemInList(list: string[], item: string): string[] {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
  }


  //
  // E. Handlers (interação do utilizador)
  function addRemoveMunicipality(municipio: string) {
    setMunicipalitiesList(prev => toggleItemInList(prev, municipio));
  }


  //
  // F. Efeitos
  useEffect(() => {
    const localMunicipalitiesList = localStorage.getItem('municipalitiesList') || '[]';
    setMunicipalitiesList(JSON.parse(localMunicipalitiesList))
  }, [])

  useEffect(() => {
    localStorage.setItem('municipalitiesList', JSON.stringify(municipalitiesList));
  }, [municipalitiesList])


  //
  // G. Renderização
  if (error) return <div>Error loading data</div>
  if (isLoading) return <div>Loading... </div>
  if (!data) return <div>No data!</div>

  return <section className="h-full flex">

    <article className="w-1/3 bg-gray-100 p-2 m-2">
      <p className="p-2">Municípios Escolhidos:</p>
      {municipalitiesList.map(m =>
        <div key={m} className="p-2 m-2 bg-gray-300">{m}</div>
      )}
    </article>

    <article className="overflow-auto w-2/3">
      {transformedMunicipalities.map(m => (
        <MunicipalityCard
          key={m.id}
          displayName={m.displayName}
          addRemoveMunicipality={() => addRemoveMunicipality(m.name)}
          isSelected={municipalitiesList.includes(m.name)}
        />
      ))}
    </article>

  </section>
}

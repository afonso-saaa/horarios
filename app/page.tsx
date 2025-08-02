import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Horarios from '@/components/Horarios/Horarios'
import CalendarioSemanal from '@/components/CalendarioSemanal/CalendarioSemanal'

export default function page() {
  return <>
    <Horarios></Horarios>
    <CalendarioSemanal></CalendarioSemanal>
  </>
}

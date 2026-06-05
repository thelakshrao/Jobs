import EmployerHero from '@/employerComponets/EmployerHero'
import EmployerVersatility from '@/employerComponets/EmployerVersatility'
import HowItWorks from '@/employerComponets/HowItWorks'
import EmpNavbar from '@/employerComponets/EmpNavbar'
import React from 'react'

const page = () => {
  return (
    <>
        <EmpNavbar/>
        <EmployerHero/>
        <EmployerVersatility/>
        <HowItWorks/>
    </>
  )
}

export default page

import EmployerHero from '@/employerComponets/EmployerHero'
import EmployerVersatility from '@/employerComponets/EmployerVersatility'
import HowItWorks from '@/employerComponets/HowItWorks'
import EmpNavbar from '@/employerComponets/EmpNavbar'
import React from 'react'
import PostJobBanner from '@/employerComponets/PostJobBanner'
import FaQuestion from '@/employerComponets/Faquestion'
import Footer from '@/employerComponets/Footer'
import EmployerContact from '@/employerComponets/Employercontact'

const page = () => {
  return (
    <>
      <EmpNavbar />
      <EmployerHero />
      <PostJobBanner />
      <EmployerVersatility />
      <HowItWorks />
      <FaQuestion />
      <EmployerContact />
      <Footer />
    </>
  )
}

export default page

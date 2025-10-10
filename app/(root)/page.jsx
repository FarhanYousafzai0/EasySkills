import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import YoutubePricing from '@/components/YoutubePricing'
import Hero from '@/components/Hero'
import React from 'react'
import FAQSection from '@/components/Faqs'
import StatsAndEnroll from '@/components/StatsAndEnroll'
import TrainerShowcase from '@/components/SupportingTrainers'

const Home = () => {
  return (
   
   <>
  
   <Hero/>
  <YoutubePricing/>
  <StatsAndEnroll/> 
<TrainerShowcase/>
  <FAQSection/>
 
   </>
 
 
  )
}

export default Home 

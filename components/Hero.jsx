import React from 'react'


const Hero = () => {
  return (
    <>
    <div className='h-screen mx-auto w-[95%] px-10 py-8   '>
    

   <div className='mx-auto flex flex-col gap-5 items-center h-full justify-center w-[70%]  '>
   <span className='border border-[#9D4EDD] rounded-full p-2 '>Conquer YouTube using the power of AI.⭐</span>
  

{/* Video-Section */}
   <div className='w-full h-[100%] bg-black rounded'></div>


   <div className='flex items-center gap-4'>

   <button className="bg-[#9D4EDD] text-white cursor-pointer  rounded-md px-5 py-3 font-semibold shadow hover:bg-[#7B2CBF] transition-colors duration-200">
     Enroll Now
   </button>
   <button className="border border-[#9D4EDD] text-[#9D4EDD] cursor-pointer rounded-md px-5 py-3 font-semibold hover:bg-[#F3E8FF] transition-colors duration-200">
     Get in Touch
   </button>
   </div>

   {/* Call to action. */}


   </div>
    </div>
      
    </>
  )
}

export default Hero

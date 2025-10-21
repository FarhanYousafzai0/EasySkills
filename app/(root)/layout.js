import Footer from "@/components/User/Footer";
import Nav from "@/components/Nav";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body
        >
          <Nav/>
          {children}
        <Footer/>

        <WhatsAppButton
  phoneNumber="923001234567" 
  message="Hello! I'd like to know more" 
  position="bottom-right" 
/>
        </body>
      </html>
    );
  }
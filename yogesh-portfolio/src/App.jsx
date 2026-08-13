import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import Stats from './components/Stats'
import Cities from './components/Cities'
import GlobalHire from './components/GlobalHire'
import Engagement from './components/Engagement'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Stats />
        <Cities />
        <GlobalHire />
        <Engagement />
      </main>
      <Footer />
    </>
  )
}

export default App

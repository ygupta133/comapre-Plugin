import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import PageSeo from './PageSeo'
import FloatingWidgets from './FloatingWidgets'
import RegionalPhoneBar from './RegionalPhoneBar'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function Layout() {
  return (
    <>
      <PageSeo />
      <ScrollToTop />
      <RegionalPhoneBar />
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  )
}

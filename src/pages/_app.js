import '../styles/globals.css'
import TitleBar from '../components/TitleBar'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <TitleBar />
      <div style={{ height: 'calc(100vh - 32px)' }}>
        <Component {...pageProps} />
      </div>
    </>
  )
}

export default MyApp

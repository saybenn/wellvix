import "../styles/globals.css";
import Layout from "../components/layout/Layout";
import { site as siteStatic } from "../lib/siteConfig";

export default function MyApp({ Component, pageProps }) {
  // NOTE: If you want dynamic data, call loadSite() (async) and pass via pageProps in _app's getInitialProps or per-page.
  const site = siteStatic;

  return (
    <Layout site={site}>
      <Component {...pageProps} />
    </Layout>
  );
}


import "../styles/globals.css";
import { useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import Layout from "../components/layout/Layout";
import { site as siteStatic } from "../lib/siteConfig";

export default function MyApp({ Component, pageProps }) {
  const [browserClient] = useState(() => createPagesBrowserClient());

  // NOTE: If you want dynamic data, call loadSite() (async) and pass via pageProps in _app's getInitialProps or per-page.
  const site = siteStatic;

  return (
    <SessionContextProvider
      supabaseClient={browserClient}
      initialSession={pageProps.initialSession}
    >
      <Layout site={site}>
        <Component {...pageProps} />
      </Layout>
    </SessionContextProvider>
  );
}


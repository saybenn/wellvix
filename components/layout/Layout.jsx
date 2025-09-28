import Header from "./Header";
import Footer from "./Footer";
import { Analytics } from "../../lib/analytics";

/** Generic layout that consumes site object */
export default function Layout({ site, children }) {
  const { logo, nav, footer } = site ?? {};
  const brand = { logo };

  return (
    <div className=" flex flex-col bg-white">
      <Header brand={brand} nav={nav} />
      <main className="flex-1">{children}</main>
      <Footer footer={footer} />
      <Analytics />
    </div>
  );
}

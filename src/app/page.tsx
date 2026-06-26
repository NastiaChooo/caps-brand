import { SiteNav } from "@/components/layout/site-nav";
import { Hero } from "@/components/sections/hero";
import { Craft } from "@/components/sections/craft";
import { Specs } from "@/components/sections/specs";
import { Drop } from "@/components/sections/drop";
import { SiteFooter } from "@/components/layout/site-footer";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main id="top">
        <Hero />
        <Craft />
        <Specs />
        <Drop />
      </main>
      <SiteFooter />
    </>
  );
}

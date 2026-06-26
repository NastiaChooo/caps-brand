const COLUMNS = [
  {
    title: "Object",
    links: ["The Cap", "Craft", "Spec", "The Drop"],
  },
  {
    title: "House",
    links: ["Story", "Stockists", "Contact", "Press"],
  },
  {
    title: "Connect",
    links: ["Instagram", "Newsletter"],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="text-2xl font-semibold tracking-[0.3em]">BRAND</div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-mute">
              Matte-black headwear with a hidden neon underbrim. Worn in shadow,
              known by the few.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 md:col-span-7">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <div className="eyebrow">{col.title}</div>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-mute transition-colors hover:text-bone"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-8 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} BRAND — concept study.</span>
          <span className="font-mono tracking-wider">Anastasiya Chuprey</span>
        </div>
      </div>
    </footer>
  );
}

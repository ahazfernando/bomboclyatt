import Link from "next/link";

const categories = [
  {
    title: "Sealed Product",
    href: "/browse?category=Sealed%20Product",
    image: "/categories/Cat_Sealed.png",
    alt: "Sealed Pokémon and One Piece boxes",
    className: "md:col-span-6",
    imgClass: "h-[95%] w-auto max-w-none -right-6 -bottom-8 -rotate-[8deg] sm:-right-10 sm:-bottom-10",
  },
  {
    title: "Single Hits",
    href: "/browse?category=Single%20Hits",
    image: "/categories/Cat_Hits.png",
    alt: "Fanned single Pokémon cards",
    className: "md:col-span-6",
    imgClass: "h-[100%] w-auto max-w-none -right-4 -bottom-10 rotate-[6deg] sm:-right-8 sm:-bottom-12",
  },
  {
    title: "Accessories",
    href: "/browse?category=Accessories",
    image: "/categories/Cat_Accessories.png",
    alt: "Pokémon plush accessories",
    className: "md:col-span-3",
    imgClass: "h-[90%] w-auto max-w-none -right-8 -bottom-6 -rotate-[4deg] sm:-right-10",
  },
  {
    title: "Slabs",
    href: "/browse?category=Slabs",
    image: "/categories/Cat_Slabs.png",
    alt: "Graded slab cards",
    className: "md:col-span-3",
    imgClass: "h-[105%] w-auto max-w-none -right-4 -bottom-10 -rotate-[10deg] sm:-right-6 sm:-bottom-12",
  },
  {
    title: "Comics",
    href: "/browse?category=Comics",
    image: "/categories/Cat_Comics.png",
    alt: "Collectible comic book",
    className: "md:col-span-3",
    imgClass: "h-[110%] w-auto max-w-none -right-6 -bottom-8 -rotate-[14deg] sm:-right-8",
  },
  {
    title: "Diecast",
    href: "/browse?category=Diecast",
    image: "/categories/Inno64Diecast%201.png",
    alt: "INNO64 diecast Nissan Skyline GT-R",
    className: "md:col-span-3",
    imgClass: "h-[95%] w-auto max-w-none -right-4 -bottom-4 rotate-[6deg] sm:-right-6 sm:-bottom-6",
  },
] as const;

export function CategoryBrowse() {
  return (
    <section className="page-shell py-16">
      <h2 className="display text-center text-4xl md:text-5xl">Browse by Category</h2>

      <div className="mt-10 rounded-[2rem] bg-secondary/70 p-4 sm:p-5 md:rounded-[2.5rem] md:p-7">
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12 md:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className={`group relative isolate min-h-[240px] overflow-hidden rounded-[1.75rem] bg-card p-6 shadow-card transition-transform duration-300 hover:-translate-y-0.5 sm:min-h-[280px] md:min-h-[300px] ${cat.className}`}
            >
              <div className="relative z-10 max-w-[55%]">
                <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {cat.title}
                </h3>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors group-hover:text-primary">
                  View Products <span aria-hidden>→</span>
                </span>
              </div>

              {/* Soft fade so black photo backgrounds blend into the white card */}
              <div
                className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_bottom_right,transparent_35%,var(--card)_72%)]"
                aria-hidden
              />

              <img
                src={cat.image}
                alt={cat.alt}
                className={`pointer-events-none absolute z-0 object-contain drop-shadow-xl transition-transform duration-500 ease-out group-hover:scale-105 ${cat.imgClass}`}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

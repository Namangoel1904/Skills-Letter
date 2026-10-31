import { getLatestEdition } from "@/lib/api";
import { HeroLanding } from "@/components/hero-landing";

export const revalidate = 60;

export default async function HomePage() {
  const edition = await getLatestEdition().catch(() => null);

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center">
      <HeroLanding latestEdition={edition} />
    </div>
  );
}

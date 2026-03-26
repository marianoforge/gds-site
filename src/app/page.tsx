import HomePage from "@/components/home-page";
import { getGoogleReviews } from "@/lib/google-reviews";
import { getFeaturedProperties } from "@/lib/featured-properties";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [googleReviews, featuredProperties] = await Promise.all([
    getGoogleReviews(),
    getFeaturedProperties(3),
  ]);
  return <HomePage googleReviews={googleReviews} featuredProperties={featuredProperties} />;
}

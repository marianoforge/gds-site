import HomePage from "@/components/home-page";
import { getGoogleReviews } from "@/lib/google-reviews";

export const dynamic = "force-dynamic";

export default async function Page() {
  const googleReviews = await getGoogleReviews();
  return <HomePage googleReviews={googleReviews} />;
}

import { useParams } from "wouter";
import VariantHome from "@/components/VariantHome";
import { variants } from "@/data/variants";
import NotFound from "@/pages/not-found";

const CITIES: Record<string, string> = {
  "los-angeles": "Los Angeles",
  "san-bernardino": "San Bernardino",
  riverside: "Riverside",
  "orange-county": "Orange County",
  "san-diego": "San Diego",
  fresno: "Fresno",
  sacramento: "Sacramento",
  bakersfield: "Bakersfield",
};

export const CITY_SLUGS = Object.keys(CITIES);

export default function CityPage() {
  const params = useParams<{ city: string }>();
  const name = CITIES[params.city || ""];
  if (!name) return <NotFound />;
  return <VariantHome config={variants.a} cityName={name} />;
}

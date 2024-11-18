import { loadCityData } from "@/libs";
import { GoogleMaps } from "@/components";

const Page = async ({ params }: { params: { city?: string } }) => {
  const { city } = await params;
  const cityData = loadCityData(city ?? "");

  return <GoogleMaps data={cityData} />;
};

export default Page;

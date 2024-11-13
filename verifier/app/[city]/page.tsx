import { loadCityData } from "@/libs"

const Page = async ({ params }: { params: { city: string } }) => {
  const { city } = await params
  const cityData = loadCityData(city);

  return (
    <div>
      {JSON.stringify(cityData.locations.districts)}
    </div>
  )
}

export default Page

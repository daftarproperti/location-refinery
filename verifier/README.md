## Getting Started

To get started with this project, follow these steps:

### Installation:

1. **Install Dependencies:**

   ```bash
   yarn install
   ```

2. **Set up Environment Variables:**

   Create a `.env.local` file in the root of your project and add the following variables with your own credentials. These can be obtained from the Google Cloud Console:

   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   NEXT_PUBLIC_GOOGLE_MAPS_ID=your-google-maps-id
   ```

### Running the Project

To run the development server, execute:

`yarn dev`

Open http://localhost:3000 in your browser to see the project in action.

### Dynamic City Pages

To view a specific city, append the city name to the URL. For instance:

`/Surabaya`

`/Jakarta%20Pusat`

Ensure that the city name matches an entry in the output folder.

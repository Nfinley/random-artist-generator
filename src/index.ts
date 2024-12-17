import { Hono } from 'hono';
import { html } from 'hono/html';
import OpenAI from 'openai';

/* TODO LIST: 
1. Add custom font
2. Update styling
3. Use Twind to avoid entire tailwind css

**/

type Bindings = {
  OPENAI_API_SECRET: string;
  OPENAI_PROJECT_ID: string;
  OPENAI_ORG_ID: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/images/*', async (c, next) => {
  c.header('Cache-Control', 'public, max-age=31536000, immutable');
  return next();
});

app.use('/js/*', async (c, next) => {
  c.header('Cache-Control', 'public, max-age=31536000, immutable');
  return next();
});

app.use('/font/*', async (c, next) => {
  c.header('Cache-Control', 'public, max-age=31536000, immutable');
  return next();
});
// Cache for a week
app.use('/css/*', async (c, next) => {
  c.header('Cache-Control', 'public, max-age=604800, immutable');
  return next();
});

app.get('/', (c) => {
  return c.html(html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="icon"
          href="/images/favicon/favicon.ico"
          type="image/x-icon"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/favicon/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/favicon/favicon-32x32.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/favicon/apple-touch-icon.png"
        />

        <link rel="manifest" href="/images/favicon/site.webmanifest" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/images/favicon/android-chrome-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/images/favicon/android-chrome-512x512.png"
        />
        <title>Archie's Pick</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
        @font-face {
          font-family: 'Rambors';
          src: url('/font/RamborsRegular-lgRPX.otf') format('otf'),
                url('/font/RamborsRegular-nR9nM.ttf') format('ttf');
          font-weight: normal;
          font-style: normal;
    }
        .font-retro {
          font-family: 'Rambors', sans-serif; 
        }
        </style>
      </head>
      <body
        class="bg-[#051a1f] min-h-screen flex flex-col items-center justify-center"
      >
        <div class="p-12 mb-8 text-center">
          <div class="flex justify-center">
            <img class="h-32 border-white border-2 rounded-xl text-center" src="/images/APP_logo.jpg" alt="">

          </div>
          <h1 class="font-retro text-white text-4xl font-bold mb-6 mt-8 text-center">Archie's Pick</h1>
          <p class="text-white">
            Welcome! This little generator was inspired by my son as I want to
            expose him to all sorts of music and what better way then to select
            random artists
          </p>
        </div>
        <div id="main" class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <form
            id="musicForm"
            class="space-y-4"
            hx-post="/api/random-artist"
            hx-swap="outerHTML"
            hx-target="#main"
            hx-trigger="submit"
            hx-headers='{"Content-Type": "application/json"}'
            hx-ext="json-enc"
          >
            <div class="flex items-center space-x-2">
              <select
                id="genre"
                name="genre"
                class="flex-grow p-2 border rounded"
              >
                <option value="">Select Genre</option>
                <option value="Folk">Folk</option>
                <option value="Pop">Pop</option>
                <option value="Jazz">Jazz</option>
                <option value="Rock">Rock</option>
                <option value="Funk">Funk</option>
              </select>
              <button
                type="button"
                id="randomizeGenre"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Randomize Genre
              </button>
            </div>
            <div class="flex items-center space-x-2">
              <select
                id="decade"
                name="decade"
                class="flex-grow p-2 border rounded"
              >
                <option value="">Select Decade</option>
                <option value="1950s">1950s</option>
                <option value="1960s">1960s</option>
                <option value="1970s">1970s</option>
                <option value="1980s">1980s</option>
                <option value="1990s">1990s</option>
                <option value="2000s">2000s</option>
                <option value="2010s">2010s</option>
                <option value="2020s">2020s</option>
              </select>
              <button
                type="button"
                id="randomizeDecade"
                class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Randomize Decade
              </button>
            </div>
            <button
              type="submit"
              class="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Pick my Artist
            </button>
          </form>
          <div id="artist-result" class="mt-8">
        </div>
        <script src="https://unpkg.com/htmx.org"></script>
        <script src="https://unpkg.com/htmx.org@1.9.12/dist/ext/json-enc.js"></script>
        <script>
          function randomize(selectId) {
            const select = document.getElementById(selectId);
            const options = select.options;
            const randomIndex =
              Math.floor(Math.random() * (options.length - 1)) + 1;
            select.selectedIndex = randomIndex;
          }

          document
            .getElementById('randomizeGenre')
            .addEventListener('click', () => randomize('genre'));
          document
            .getElementById('randomizeDecade')
            .addEventListener('click', () => randomize('decade'));
        </script>
      </body>
    </html>`);
});

app.post('/api/random-artist', async (c) => {
  const json = await c.req.json();
  console.log('🚀 ~ app.post ~ content:', json);
  const decade = json['decade'] || '1980s';
  const genre = json['genre'] || 'Rock';

  const openai = new OpenAI({
    apiKey: `${c.env.OPENAI_API_SECRET}`,
    organization: `${c.env.OPENAI_ORG_ID}`,
    project: `${c.env.OPENAI_PROJECT_ID}`,
  });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: [
          {
            type: 'text',
            text: `
            You are musical historian that has knowledge of all bands and artists in every genre starting from the 1950s all the way to the 2020s.
            You will provide a completely random artist name based on the genre and decade the user provides. In your response please return an object that has the keys exactly as artist, genre, decade and their most_popular_song. Do not include any filler words.
          `,
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Please provide to me a random artist name from the ${decade} in the genre of ${genre}.`,
          },
        ],
      },
    ],
  });
  const jsonParsed = JSON.parse(
    completion.choices?.[0].message?.content?.trim() || '{}'
  );

  const {
    artist,
    decade: parsedDecade,
    genre: parsedGenre,
    most_popular_song,
  } = jsonParsed;

  return c.html(html`<h2 class="text-white text-xl font-semibold mb-4">
      Your Random Artist Is:
    </h2>
    <div class="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-purple-600 text-white">
            <th class="py-3 px-4 text-left font-semibold text-sm uppercase">
              Artist
            </th>
            <th class="py-3 px-4 text-left font-semibold text-sm uppercase">
              Popular Song
            </th>
            <th class="py-3 px-4 text-left font-semibold text-sm uppercase">
              Genre
            </th>
            <th class="py-3 px-4 text-left font-semibold text-sm uppercase">
              Decade
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr class="hover:bg-gray-50 transition-colors duration-200">
            <td class="py-3 px-4">${artist}</td>
            <td class="py-3 px-4">${most_popular_song}</td>
            <td class="py-3 px-4">${parsedGenre}</td>
            <td class="py-3 px-4">${parsedDecade}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-center items-center">
      <button
        type="button"
        hx-get="/"
        hx-swap="outerHTML"
        hx-target="body"
        class="mt-8 w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
      >
        Reset
      </button>
    </div>`);
});

export default app;

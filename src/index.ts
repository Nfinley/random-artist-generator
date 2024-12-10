import { Hono } from 'hono';
import { html } from 'hono/html';
import fetch from 'node-fetch'; // Fetch API to call OpenAI's API

const app = new Hono();

// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })

app.get('/', (c) => {
  return c.html(
    html`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Random Artist Picker</title>
        </head>
        <body>
          <h1>Random Popular Artist Picker</h1>
          <button hx-post="/api/random-artist" hx-target="#artist-result">
            Get Random Artist
          </button>
          <div id="artist-result"></div>
          <script src="https://unpkg.com/htmx.org"></script>
        </body>
      </html>
    `
  );
});

app.post('/api/random-artist', async (c) => {
  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer YOUR_OPENAI_API_KEY`,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: 'Provide the name of a current popular music artist.',
      max_tokens: 10,
    }),
  });

  const data = await response.json();
  const artistName = data.choices?.[0]?.text?.trim() || 'Unknown Artist';

  return c.html(`<p>Random Popular Artist: <strong>${artistName}</strong></p>`);
});

export default app;

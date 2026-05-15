import { generalNotesSchema } from './lib/consultationNotesSchemas';
import { zodToJsonSchema } from './lib/schemaUtils';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const schema = zodToJsonSchema(generalNotesSchema);

async function run() {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'test' }],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'clinical_note',
          strict: true,
          schema: schema,
        },
      },
    }),
  });
  const data = await response.json();
  console.log("OPENAI RESPONSE:", JSON.stringify(data, null, 2));
}

run();

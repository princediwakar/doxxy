import { schemasByDepartment } from './lib/consultationNotesSchemas';
import { zodToJsonSchema } from './lib/schemaUtils';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const departments = Object.keys(schemasByDepartment);
  for (const dept of departments) {
    const schema = zodToJsonSchema(schemasByDepartment[dept]);
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
    if (!response.ok) {
      const err = await response.text();
      console.log(`DEPT ${dept} FAILED:`, err);
    } else {
      console.log(`DEPT ${dept} OK`);
    }
  }
}
run();

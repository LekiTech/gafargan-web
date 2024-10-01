import { Client } from '@gradio/client';

const client = Client.connect("leks-forever/lezghian-nllb-200-distilled-600M");

export async function POST(request: Request) {
    const { text } = await request.json()

    const result = await (await client).predict("/translate", {
        text,
      })
    return Response.json({ text: result.data })
}
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama", // required but unused
});

const ReceiptItem = z.object({
  description: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
  total: z.number(),
});

const ReceiptExtraction = z.object({
  date: z.string(),
  merchant_name: z.string(),
  items: z.array(ReceiptItem),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
});

async function extractReceiptInfo(text) {
  const completion = await openai.chat.completions.create({
    model: "llama3.2:3b",
    messages: [
      {
        role: "system",
        content: `You are an expert at extracting structured information from receipt images. Extract all relevant details including date, items, prices, and totals.
          `,
      },
      {
        role: "user",
        content: `Please extract the information from this receipt image in Json format. Here is the text : ${text}`,
      },
    ],
    temperature: 1,
    response_format: zodResponseFormat(ReceiptExtraction, "receipt_extraction"),
  });

  console.log(completion.choices[0].message.content);
  return JSON.parse(completion.choices[0].message.content);
}

// async function readImageAsBase64(imagePath) {
//   const fs = await import("fs/promises");
//   const buffer = await fs.readFile(imagePath);
//   return buffer.toString("base64");
// }

export { extractReceiptInfo };

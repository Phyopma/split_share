import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const openai = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama', // required but unused
});

const ReceiptItem = z.object({
  description: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
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
    model: 'custom:latest',
    messages: [
      {
        role: 'system',
        content: `You are an AI assistant that extracts structured data from receipt text. 
                Your task is to analyze the given OCR text and extract key receipt details in a structured JSON format. 
                ### **Guidelines**: - **Vendor Information**: Extract store (merchant) name, address, and phone number. - **Receipt Details**: Extract the receipt number, date (YYYY-MM-DD format), 
                and time (HH:MM format). - **Financial Data**: Extract 'total_amount', 'subtotal', 'tax', 'discount', and 'tip'. 
                - **Items List**: Identify purchased items, their quantity, unit price, and total price. 
                - **Other Details**: Extract store ID and cashier's name if available. Quantity should be 1 by default - 
                **Ensure Accuracy**: Only include fields found in the OCR text. If a value is missing, exclude the field instead of guessing. ### **Example Input (OCR Text)**:`,
      },
      {
        role: 'user',
        content: `convert this into json format : ${text}`,
      },
    ],
    temperature: 0.25,
    response_format: zodResponseFormat(ReceiptExtraction, 'receipt_extraction'),
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

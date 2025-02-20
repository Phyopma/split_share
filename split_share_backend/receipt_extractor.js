import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama", // required but unused
});

const ReceiptItem = z.object({
  name: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
});

const ReceiptExtraction = z.object({
  merchant_name: z.string(),
  date: z.string(),
  items: z.array(ReceiptItem),
  subtotal: z.number(),
  discount: z.number(),
  tip: z.number(),
  tax: z.number(),
  total: z.number(),
});

async function extractReceiptInfo(text) {
  const completion = await openai.chat.completions.create({
    model: "cm:latest",
    messages: [
      // {
      //   role: "system",
      //   content: `
      //       You are a receipt data extraction assistant. Your task is to analyze the provided OCR text from a receipt and extract the following fields:
      //       - **date**: The date when the receipt was issued.
      //       - **merchant_name**: The name of the merchant.
      //       - **items**: A list of purchased items. For each item, extract:
      //         - **description**: A brief description of the item.
      //         - **quantity**: The number of units purchased.
      //         - **unit_price**: The price per unit.
      //       - **subtotal**: The total amount before tip and tax.
      //       - **tip**: The tip amount.
      //       - **tax**: The tax amount.
      //       - **total**: The final total amount including subtotal, tip, and tax.
      //       Output your result as valid JSON in exactly the following format:
      //       {
      //           "date": "<date>",
      //           "merchant_name": "<merchant_name>",
      //           "items": [
      //               {
      //                   "description": "<item description>",
      //                   "quantity": <quantity>,
      //                   "unit_price": <unit price>
      //               },
      //               ...
      //           ],
      //           "subtotal": <subtotal>,
      //           "tip": <tip>,
      //           "tax": <tax>,
      //           "total": <total>
      //       }

      //       Please ensure that the JSON output is strictly formatted as above without any additional text or explanation. If any field is missing in the OCR text, use null as its value.
      //       `,
      // },
      {
        role: "user",
        content: `convert this into json format : ${text}`,
      },
    ],
    temperature: 0,
    response_format: zodResponseFormat(ReceiptExtraction, "receipt_extraction"),
  });

  // console.log(completion.choices[0].message.content);
  return JSON.parse(completion.choices[0].message.content);
}

// async function readImageAsBase64(imagePath) {
//   const fs = await import("fs/promises");
//   const buffer = await fs.readFile(imagePath);
//   return buffer.toString("base64");
// }

export { extractReceiptInfo };

GroqCloud

[grog cloud](/)

[grog cloud](/)

[Playground](/playground)

[API Keys](/keys)

[Dashboard](/dashboard)

[Documentation](/docs)

[Log In](/login)

[Playground](/playground)

[API Keys](/keys)

[Dashboard](/dashboard)

[Documentation](/docs)

Documentation
-------------

[Docs](/docs/overview)

[API Reference](/docs/api-reference)

[Docs](/docs/overview)

[API Reference](/docs/api-reference)

Get Started

[Overview](/docs/overview)

[Quickstart](/docs/quickstart)

[OpenAI Compatibility](/docs/openai)

[Models](/docs/models)

[Rate Limits](/docs/rate-limits)

Features

[Text](/docs/text-chat)

[Speech to Text](/docs/speech-to-text)

[Text to Speech](/docs/text-to-speech)

[Reasoning](/docs/reasoning)

[Vision](/docs/vision)

Advanced Features

[Batch Processing](/docs/batch)

[Flex Processing](/docs/flex-processing)

[Content Moderation](/docs/content-moderation)

[Prefilling](/docs/prefilling)

[Tool Use](/docs/tool-use)

Developer Resources

[Groq Libraries](/docs/libraries)

[Groq Badge](/docs/badge)

[Examples](/docs/examples)

[Applications Showcase](/docs/showcase-applications)

Resources

[Prompting Guide](/docs/prompting)

Integrations

[Agno](/docs/agno)

[AutoGen](/docs/autogen)

[Arize](/docs/arize)

[Composio](/docs/composio)

[CrewAI](/docs/crewai)

[MLflow](/docs/mlflow)

[E2B](/docs/e2b)

[Gradio](/docs/gradio)

[JigsawStack](/docs/jigsawstack)

[LangChain](/docs/langchain)

[LlamaIndex](/docs/llama-index)

[LiteLLM](/docs/litellm)

[LiveKit](/docs/livekit)

[Toolhouse](/docs/toolhouse)

[Vercel](/docs/ai-sdk)

[xRx](/docs/xrx)

Support & Guidelines

[Errors](/docs/errors)

[Changelog](/docs/changelog)

[Policies & Notices](/docs/legal)

Vision
------

Groq API offers fast inference and low latency for multimodal models with vision capabilities for understanding and interpreting visual data from images. By analyzing the content of an image, multimodal models can generate
human-readable text for providing insights about given visual data.

### [Supported Models](#supported-models)

Groq API supports powerful multimodal models that can be easily integrated into your applications to provide fast and accurate image processing for tasks such as visual question answering, caption generation,
and Optical Character Recognition (OCR):

**Note**: Images are billed at 6,400 tokens per image.

### Llama 3.2 90B Vision (Preview)

Model ID

`llama-3.2-90b-vision-preview`

Description

A powerful multimodal model capable of processing both text and image inputs that supports multilingual, multi-turn conversations, tool use, and JSON mode.

Context Window

8,192 tokens

Preview Model

Currently in preview and should be used for experimentation.

Image Size Limit

Maximum allowed size for a request containing an image URL as input is 20MB. Requests larger than this limit will return a 400 error.

Request Size Limit (Base64 Encoded Images)

Maximum allowed size for a request containing a base64 encoded image is 4MB. Requests larger than this limit will return a 413 error.

Single Image per Request

Only one image can be processed per request in the preview release. Requests with multiple images will return a 400 error.

System Prompt

Does not support system prompts and images in the same request.

### Llama 3.2 11B Vision (Preview)

Model ID

`llama-3.2-11b-vision-preview`

Description

A powerful multimodal model capable of processing both text and image inputs that supports multilingual, multi-turn conversations, tool use, and JSON mode.

Context Window

8,192 tokens

Preview Model

Currently in preview and should be used for experimentation.

Image Size Limit

Maximum allowed size for a request containing an image URL as input is 20MB. Requests larger than this limit will return a 400 error.

Request Size Limit (Base64 Encoded Images)

Maximum allowed size for a request containing a base64 encoded image is 4MB. Requests larger than this limit will return a 413 error.

Single Image per Request

Only one image can be processed per request in the preview release. Requests with multiple images will return a 400 error.

System Prompt

Does not support system prompts and images in the same request.

### [How to Use Vision](#how-to-use-vision)

Use Groq API vision features via:

* **[GroqCloud Console Playground](https://console.groq.com/playground)**: Select

  `llama-3.2-90b-vision-preview`

  or

  `llama-3.2-11b-vision-preview`

  as the model and
  upload your image.
* **Groq API Request:** Call the `chat.completions` API endpoint (i.e. `https://api.groq.com/openai/v1/chat/completions`) and set `model_id` to `llama-3.2-90b-vision-preview` or `llama-3.2-11b-vision-preview`.
  See code examples below.

  

#### How to Pass Images from URLs as Input

The following are code examples for passing your image to the model via a URL:

curlJavaScriptPythonJSON

```
1from groq import Groq
2
3client = Groq()
4completion = client.chat.completions.create(
5    model="llama-3.2-11b-vision-preview",
6    messages=[
7        {
8            "role": "user",
9            "content": [
10                {
11                    "type": "text",
12                    "text": "What's in this image?"
13                },
14                {
15                    "type": "image_url",
16                    "image_url": {
17                        "url": "https://upload.wikimedia.org/wikipedia/commons/f/f2/LPU-v1-die.jpg"
18                    }
19                }
20            ]
21        }
22    ],
23    temperature=1,
24    max_completion_tokens=1024,
25    top_p=1,
26    stream=False,
27    stop=None,
28)
29
30print(completion.choices[0].message)
```

  

#### How to Pass Locally Saved Images as Input

To pass locally saved images, we'll need to first encode our image to a base64 format string before passing it as the `image_url` in our API request as follows:

  

```
1from groq import Groq
2import base64
3
4
5# Function to encode the image
6def encode_image(image_path):
7  with open(image_path, "rb") as image_file:
8    return base64.b64encode(image_file.read()).decode('utf-8')
9
10# Path to your image
11image_path = "sf.jpg"
12
13# Getting the base64 string
14base64_image = encode_image(image_path)
15
16client = Groq()
17
18chat_completion = client.chat.completions.create(
19    messages=[
20        {
21            "role": "user",
22            "content": [
23                {"type": "text", "text": "What's in this image?"},
24                {
25                    "type": "image_url",
26                    "image_url": {
27                        "url": f"data:image/jpeg;base64,{base64_image}",
28                    },
29                },
30            ],
31        }
32    ],
33    model="llama-3.2-11b-vision-preview",
34)
35
36print(chat_completion.choices[0].message.content)
```

  

#### Tool Use with Images

The `llama-3.2-90b-vision-preview` and `llama-3.2-11b-vision-preview` models support tool use! The following cURL example defines a `get_current_weather` tool that the model can leverage to answer a user query that contains a question about the
weather along with an image of a location that the model can infer location (i.e. New York City) from:

  

```
curl https://api.groq.com/openai/v1/chat/completions -s \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $GROQ_API_KEY" \
-d '{
"model": "llama-3.2-11b-vision-preview",
"messages": [
{
    "role": "user",
    "content": [{"type": "text", "text": "Whats the weather like in this state?"}, {"type": "image_url", "image_url": { "url": "https://cdn.britannica.com/61/93061-050-99147DCE/Statue-of-Liberty-Island-New-York-Bay.jpg"}}]
}
],
"tools": [
{
    "type": "function",
    "function": {
    "name": "get_current_weather",
    "description": "Get the current weather in a given location",
    "parameters": {
        "type": "object",
        "properties": {
        "location": {
            "type": "string",
            "description": "The city and state, e.g. San Francisco, CA"
        },
        "unit": {
            "type": "string",
            "enum": ["celsius", "fahrenheit"]
        }
        },
        "required": ["location"]
    }
    }
}
],
"tool_choice": "auto"
}' | jq '.choices[0].message.tool_calls'
```

  

The following is the output from our example above that shows how our model inferred the state as New York from the given image and called our example function:

  

```
[
  {
    "id": "call_q0wg",
    "function": {
      "arguments": "{\"location\": \"New York, NY\",\"unit\": \"fahrenheit\"}",
      "name": "get_current_weather"
    },
    "type": "function"
  }
]
```

  

#### JSON Mode with Images

The `llama-3.2-90b-vision-preview` and `llama-3.2-11b-vision-preview` models support JSON mode! The following Python example queries the model with an image and text (i.e. "Please pull out relevant information as a JSON object.") with `response_format`
set for JSON mode:

  

```
1from groq import Groq
2
3client = Groq()
4completion = client.chat.completions.create(
5    model="llama-3.2-90b-vision-preview",
6    messages=[
7        {
8            "role": "user",
9            "content": [
10                {
11                    "type": "text",
12                    "text": "List what you observe in this photo in JSON format."
13                },
14                {
15                    "type": "image_url",
16                    "image_url": {
17                        "url": "https://upload.wikimedia.org/wikipedia/commons/d/da/SF_From_Marin_Highlands3.jpg"
18                    }
19                }
20            ]
21        }
22    ],
23    temperature=1,
24    max_completion_tokens=1024,
25    top_p=1,
26    stream=False,
27    response_format={"type": "json_object"},
28    stop=None,
29)
30
31print(completion.choices[0].message)
```

  

#### Multi-turn Conversations with Images

The `llama-3.2-90b-vision-preview` and `llama-3.2-11b-vision-preview` models support multi-turn conversations! The following Python example shows a multi-turn user conversation about an image:

  

```
1from groq import Groq
2
3client = Groq()
4completion = client.chat.completions.create(
5    model="llama-3.2-11b-vision-preview",
6    messages=[
7        {
8            "role": "user",
9            "content": [
10                {
11                    "type": "text",
12                    "text": "What is in this image?"
13                },
14                {
15                    "type": "image_url",
16                    "image_url": {
17                        "url": "https://upload.wikimedia.org/wikipedia/commons/d/da/SF_From_Marin_Highlands3.jpg"
18                    }
19                }
20            ]
21        },
22        {
23            "role": "user",
24            "content": "Tell me more about the area."
25        }
26    ],
27    temperature=1,
28    max_completion_tokens=1024,
29    top_p=1,
30    stream=False,
31    stop=None,
32)
33
34print(completion.choices[0].message)
```

  

### [Venture Deeper into Vision](#venture-deeper-into-vision)

#### Use Cases to Explore

Vision models can be used in a wide range of applications. Here are some ideas:

* **Accessibility Applications:** Develop an application that generates audio descriptions for images by using a vision model to generate text descriptions for images, which can then
  be converted to audio with one of our audio endpoints.
* **E-commerce Product Description Generation:** Create an application that generates product descriptions for e-commerce websites.
* **Multilingual Image Analysis:** Create applications that can describe images in multiple languages.
* **Multi-turn Visual Conversations:** Develop interactive applications that allow users to have extended conversations about images.

These are just a few ideas to get you started. The possibilities are endless, and we're excited to see what you create with vision models powered by Groq for low latency and fast inference!

  

#### Next Steps

Check out our [Groq API Cookbook](https://github.com/groq/groq-api-cookbook) repository on GitHub (and give us a ⭐) for practical examples and tutorials:

* [Image Moderation](https://github.com/groq/groq-api-cookbook/blob/main/tutorials/image_moderation.ipynb)
* [Multimodal Image Processing (Tool Use, JSON Mode)](https://github.com/groq/groq-api-cookbook/tree/main/tutorials/multimodal-image-processing)

  

We're always looking for contributions. If you have any cool tutorials or guides to share, submit a pull request for review to help our open-source community!
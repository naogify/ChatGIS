import OpenAI from 'openai';
import style from '../public/style.json';

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"]
});

const getStyleArguments = async (input) => {

  const messages = [
    {
      role: "user", content: `以下の Mapbox Style Spec に準拠した style.json を解析して、ユーザーの命令に従って 地図のスタイルを変更して下さい。

    あなたが使えるのは、Mapbox GL JS のメソッドの setPaintProperty(layerId, name, value) と、setFilter(layerId, filter) です。

    setPaintProperty と setFilter どちらを使うかはを、あなたが決めてください。

    setPaintProperty を使う場合は、引数となる layerId、name、value の適切な値と functionType: setPaintProperty を返して下さい。

    setFilter を使う場合は、引数となる layerId、filter の適切な値と functionType: setFilter を返して下さい。
    setFilter で数値を使う場合は、['to-number', value] を使用して、数値に変換して下さい。

    アシスタントの回答は日本語で返して下さい。

    ユーザーの命令は、以下の通りです:
    ${input}

    以下 が style.json です:
    ${JSON.stringify(style)}`
    },
  ];
  const tools = [
    {

      type: "function",
      function: {
        name: "get_map_style",
        description: "Get the arguments for map.setPaintProperty() or map.setFilter() to change the Mapbox GL JS's map style",
        parameters: {
          type: "object",
          properties: {
            layerId: {
              type: "string",
              description: "The layer ID to change",
            },
            name: {
              type: "string",
              description: "The paint property name to change",
            },
            value: {
              type: "string",
              description: "The paint property value to change",
            },
            filter: {
              type: "string",
              description: "The filter to change",
            },
            functionType: {
              type: "string",
              description: "The function type to change map style (setPaintProperty or setFilter)",
            },
          },
          required: ["functionType"],
        },
      },
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: messages,
    tools: tools,
    tool_choice: "auto", // auto is default, but we'll be explicit
  });
  const responseMessage = response.choices[0].message;

  if (responseMessage.tool_calls) {

    return JSON.parse(responseMessage.tool_calls[0].function.arguments);
  }

  return {
    layerId: null,
    name: null,
    value: null,
    filter: null,
    functionType: null,
  }
}

export default getStyleArguments;

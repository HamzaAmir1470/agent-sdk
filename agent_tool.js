import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";

const GetWeatherResultSchema = z.object({
  city: z.string().describe("name of the city"),
  degree_c: z.number().describe("the degree celcius of the temp"),
  condition: z.string().optional().describe("condition of the weather"),
});

const getWeatherTool = tool({
  name: "get_weather",
  description: "returns the current weather information for the given city",
  parameters: z.object({
    city: z.string().describe("name of the city"),
  }),
  execute: async function ({ city }) {
    const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
    const reponse = await axios.get(url, { responseType: "text" });
    const [condition, degree_c] = reponse.data.split(" ");
    return GetWeatherResultSchema.parse({
      city,
      degree_c: parseFloat(degree_c),
      condition,
    });
  },
});

const sendEmailTool = tool({
  name: "send_email",
  description: "sends an email to the given email address",
  parameters: z.object({
    toemail: z.string().email().describe("email address of the recipient"),
    subject: z.string().describe("subject of the email"),
    body: z.string().describe("body of the email"),
  }),
  execute: async function ({ toemail, subject, body }) {
    // Simulate sending an email
    console.log(
      `Sending email to ${toemail} with subject "${subject}" and body "${body}"`,
    );
    return `Email sent to ${toemail}`;
  },
});

const agent = new Agent({
  name: "Weather Agent",
  instructions:
    "You are an expert weather agent that helps user to tell weather report",
  tools: [getWeatherTool, sendEmailTool],
  outputType: GetWeatherResultSchema,
});

async function main(query = "") {
  const result = await run(agent, query);
  console.log(`Result:`, result.finalOutput);
}

main("What is the weather like today in Pakistan?");

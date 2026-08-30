import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";

const getWeatherTool = tool({
  name: "get_weather",
  description: "returns the current weather information for the given city",
  parameters: z.object({
    city: z.string().describe("name of the city"),
  }),
  execute: async function ({ city }) {
    const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
    const reponse = await axios.get(url, { responseType: "text" });
    return reponse.data;
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
  execute: async function ({ email, subject, body }) {
    // Simulate sending an email
    console.log(
      `Sending email to ${email} with subject "${subject}" and body "${body}"`,
    );
    return `Email sent to ${email}`;
  },
});

const agent = new Agent({
  name: "Weather Agent",
  instructions:
    "You are an expert weather agent that helps user to tell weather report",
  tools: [getWeatherTool, sendEmailTool],
});

async function main(query = "") {
  const result = await run(agent, query);
  console.log(`Result:`, result.finalOutput);
}

main("What is the weather like today in Pakistan?");

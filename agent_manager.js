import "dotenv/config";
import { Agent, tool, run } from "@openai/agents";
import fs from "node:fs/promises"

const fetchAvailablePlans = tool({
  name: 'fetch_available_plans',
  description: 'fetches the available plans for internet',
  parameters: z.object({}),
  execute: async function () {
    return [
      { plan_id: '1', price_inr: 399, speed: '30MB/s' },
      { plan_id: '2', price_inr: 499, speed: '100MB/s' },
      { plan_id: '3', price_inr: 599, speed: '200MB/s' },
    ];
  }
});

const processRefund = tool({
  name: 'process_refund',
  description: 'This tool processes the refund for a customer',
  parameters: z.object({
    customer_id: z.string(),
    reason: z.number().describe('reason for refund'),
  }),
  execute: async function ({ customer_id, reason }) {
    await fs.appendFile(
      './refund.txt',
      `Refund processed for customer ${customer_id} for reason ${reason}\n`,
      'utf-8'
    )
    return { success: true, message: `Refund of INR ${amount} processed for customer ${customer_id}` };
  }
});

const refundAgent = new Agent({
  name: "Refund Agent",
  instructions:
    "You are an expert refund agent for an internet broadband comapny. Talk to the user and help them with what they need.",
  tools: [processRefund],
});

const salesAgent = new Agent({
  name: "Sales Agent",
  instructions:
    "You are an expert sales agent for an internet broadband comapny.Talk to the user and help them with what they need.",
  tools: [fetchAvailablePlans, refundAgent.asTool({
    toolName: 'refund_agent',
    toolDescription: 'This tool is used to process refunds for customers. It can be used when a customer requests a refund for their broadband plan.',
  })],
});

async function runAgent(query = '') {
  const result = await run(salesAgent, query);
  console.log(result.finaloutput);
}

runAgent("Hey there, I had a plan of 399. with customerId is this cut123 and I want to cancel it and get a refund because I am shifting to a new place. Can you help me with that?").catch(console.error);
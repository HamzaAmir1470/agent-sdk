import 'dotenv/config';
import { Agent, tool, run } from '@openai/agents';
import { z } from 'zod';
import fs from 'node:fs/promises';


// Tool to Refund a Customer
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

// Tool to Fetch Available Plans
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


// Refund Agent
const refundAgent = new Agent({
    name: "Refund Agent",
    instructions:
        "You are an expert refund agent for an internet broadband comapny. Talk to the user and help them with what they need.",
    tools: [processRefund],
});

// Sales Agent
const salesAgent = new Agent({
    name: "Sales Agent",
    instructions:
        "You are an expert sales agent for an internet broadband comapny.Talk to the user and help them with what they need.",
    tools: [fetchAvailablePlans, refundAgent.asTool({
        toolName: 'refund_agent',
        toolDescription: 'This tool is used to process refunds for customers. It can be used when a customer requests a refund for their broadband plan.',
    })],
});

// Reception Agent
const receptionAgent = new Agent({
    name: "Reception Agent",
    instructions:
        "You are an expert reception agent for an internet broadband comapny. Talk to the user and help them with what they need by route them or handoff them to the appropriate agent.",
    handoffDescription: `If the user needs to talk to a sales agent or refund agent, you can handoff the conversation to them: 
    - salesAgent: Expert sales agent for broadband plans and refunds.,
    - refundAgent: Expert refund agent for processing refunds.
    `,
    handoffs: [salesAgent, refundAgent],
});

async function main(query = "") {
    const result = await run(receptionAgent, query);
    console.log("Final Output:", result.finalOutput);
    console.log("Conversation History:", result.conversationHistory);
}

main("Hey There , Can you tell me what plan is best for me? Also show me all the available plans. I also want to know if I can get a refund for my current plan.");
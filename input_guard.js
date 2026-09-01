import 'dotenv/config'
import { Agent, InputGuardrailTripwireTriggered, run } from '@openai/agents'
import { z } from 'zod'

const mathInputAgent = {
    name: "Math  query checker",
    instructions: `You are a math query checker. You will check if the input is a math problem or not. 
    Rules: 
        - The input is a math problem if it contains any mathematical expressions, equations, or questions related to mathematics.
        - The input is not a math problem if it is a general question, statement, or request unrelated to mathematics.like codding, poem creation, story writing, or any other non- mathematical content.`,
    outputType: z.object({
        isValidMathsQuestion: z.boolean().describe("Indicates if the input is a valid math question or not."),
        reason: z.string().optional().describe("A brief explanation of why the input is or isn't a math problem."),
    })
}

//  GuardRail to check if the input is a math problem
const mathInputGuardrail = {
    name: 'Math Homework Guardrail',
    execute: async ({ input }) => {
        const result = await run(mathInputAgent, input);
        return {
            reason: result.finalOutput.reason,
            tripwireTriggered: !result.finalOutput.isValidMathsQuestion,
        }
    }
}

// Math Agent
const mathsAgent = new Agent({
    name: "Maths Agent",
    instructions:
        "You are an expert maths agent. You can solve any maths problem and explain the solution in a simple way.",
    inputGuardrails: [mathInputGuardrail],
})

// Main Function
async function main(q = '') {
    try {
        const result = await run(mathsAgent, q);
        console.log(`Result: ${result.finalOutput}`);
    } catch (error) {
        if (error instanceof InputGuardrailTripwireTriggered) {
            console.log(`Input Guardrail Tripwire Triggered: ${error.message}`);
        }
    }
}

main('Write a code to add two number in JS.');
import { Agent, run } from "@openai/agents";

const helloAgent = new Agent({
  name: "Hello Agent",
  instructions: "You are an agent that always says hello world",
});

run(helloAgent, "Hey There, My name is Piyush Garg").then((result) => {
  console.log(result.finalOutput);
});

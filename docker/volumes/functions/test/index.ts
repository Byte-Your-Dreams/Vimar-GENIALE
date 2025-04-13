import { OpenAI} from 'npm:openai';
import { AIAnswer } from "../models/aiAnswer.ts";
import { AIPrompt } from "../models/aiPrompt.ts";
import { dependencyInjection } from "../utils/dependency_injection.ts";
import { AIQuestion } from '../models/aiQuestion.ts';


const services = dependencyInjection();
Deno.serve(async (req: Request) => {    

    let question = await services.getProductUseCase.getProduct(null, '02973');
    console.log(question);

    return new Response(
        JSON.stringify({ 'result': 'ok' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
});

// curl -i --location --request POST 'http://localhost:8000/functions/v1/test' --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q'  --header 'Content-Type: application/json'
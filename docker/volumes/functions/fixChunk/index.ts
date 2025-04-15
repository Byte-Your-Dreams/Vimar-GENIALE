import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";

Deno.serve(async (req) => {
    try {
        // Formattazione  supabase
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseAnonKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error(
                "Missing environment variables SUPABASE_URL or ANON_KEY",
            );
        }

        const authorization = req.headers.get("Authorization");

        if (!authorization) {
            return new Response(
                JSON.stringify({ error: "No authorization header passed" }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
        //supabase client
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const all_pdfs = await supabase.from("manuale").select(
            "link, nome, storage_object_id",
        );
        if (all_pdfs.error) {
            console.error("Error fetching data from Supabase:", all_pdfs.error);
            return new Response(
                JSON.stringify({ error: "Error fetching data from Supabase" }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
        for (const pdfs of all_pdfs.data) {
            if (!pdfs.link || !pdfs.nome || !pdfs.storage_object_id) {
                console.error("Missing required fields in PDF data:", pdfs);
                continue; // Skip this iteration if any field is missing
            }
            console.log("Invoking function with data:", pdfs);
            const functionName = "generateChunks";
            const { data, error } = await supabase.functions.invoke(
                functionName,
                {
                    body: {
                        link: pdfs.link,
                        nome: pdfs.nome,
                        objID: pdfs.storage_object_id,
                    },
                },
            );
            if (error) {
                console.error("Error invoking function:", error);
                return new Response(
                    JSON.stringify({ error: "Error invoking function" }),
                    {
                        status: 500,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }
            console.log("Function invoked successfully:", data);
            setTimeout(() => {
                console.log("Waiting for 5 seconds...");
            }, 3000);
            // Attendi 5 secondi prima di invocare la funzione successiva
        }
        return new Response(
            JSON.stringify({ message: "ok finito" }),
            { headers: { "Content-Type": "application/json" } },
        );
    } catch (error) {
        console.error("Error handling request:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
});
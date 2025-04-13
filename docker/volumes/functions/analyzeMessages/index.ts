import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js';
import { dependencyInjection } from "../utils/dependency_injection.ts";
import { GeneralProductInfo } from "../models/generalProductInfo.ts";
import { Message } from "../models/chat.ts";

const services = dependencyInjection();

Deno.serve(async (req) => {
    try {

        // Formattazione  supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseAnonKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing environment variables SUPABASE_URL or ANON_KEY');
        }

        const authorization = req.headers.get('Authorization');

        if (!authorization) {
            return new Response(
                JSON.stringify({ error: `No authorization header passed` }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }
        //supabase client
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Prende tutti i nomi dei prodotti e gli id (getallproducts !!!)
        let all_products = await services.getAllProductUseCase.getAllProduct();
        const names = all_products.getNames();
        const ids = all_products.getIds();
        

        // // <nome: string, id: string>[] dove ogni nome e ogni id sono in minuscolo
        const vocabulary = names.map((name, i) => ({ nome: name.toLowerCase(), id: ids[i].toString().toLowerCase() }));


        const wordCounts: { [word: string]: number } = {};
        let totalWords = 0;
        const messages = await services.obtainAllMessagesUseCase.obtainAllMessages(); // Funzione da aggiungere
        
        for (const message of messages) {
            const lowerCaseMessage = message.getQuestion().toLowerCase();
            const words = lowerCaseMessage.split(/\W+/); // splitta il messaggio in parole
            totalWords += words.length; // conta il numero totale di parole
            //nome estratto
            const extractedProductNames = extractProductNames(message, all_products);
            if (extractedProductNames) {
                for (const extractedProductName of extractedProductNames) {
                    wordCounts[extractedProductName.toLocaleLowerCase()] = (wordCounts[extractedProductName.toLocaleLowerCase()] || 0) + 1; // incrementa il contatore della parola
                }
            } else {
                vocabulary.forEach(vocabulary_elem => {
                    if (lowerCaseMessage.includes(vocabulary_elem.nome) || lowerCaseMessage.includes(vocabulary_elem.id)) { // controlla se la parola è presente nel messaggio
                        wordCounts[vocabulary_elem.nome] = (wordCounts[vocabulary_elem.nome] || 0) + 1; // incrementa il contatore della parola
                    }
                });
            }
        }

        const averageWords = totalWords / messages.length; // calcola la media delle parole per messaggio
        const sortedWords = Object.keys(wordCounts) // ordina le parole in base al numero di occorrenze: prima le più frequenti dopo le meno
            .map(word => ({ word: word, count: wordCounts[word] })) 
            .sort((a, b) => b.count - a.count);
        return new Response(
            JSON.stringify({ averageWords: averageWords, wordCounts: sortedWords }),
            { headers: { 'Content-Type': 'application/json' } }
        );



    }
    catch (error) {
        console.error('Error handling request:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
})


function extractProductNames(message: Message, allProducts: GeneralProductInfo): string[] | null {
        try {
            const relevantProd: { name: string, percentage: number }[] = [];
    
            for (const productName of allProducts.getNames()) { // Usa allProducts.getNames() invece di message.getProductNames()
                const splittedProduct = productName.split(' ');
                let sum = 0;
                let den = 0;
    
                for (let i = 0; i < splittedProduct.length; i++) {
                    const elem = splittedProduct[i];
                    if (elem.length >= 4) {
                        den += splittedProduct.length - i;
                        if (message.getQuestion().toLowerCase().includes(elem.toLowerCase())) {
                            sum += splittedProduct.length - i;
                        }
                    }
                }
    
                const percentage = den > 0 ? (sum / den) * 100 : 0;
                relevantProd.push({ name: productName, percentage });

                if (percentage >= 50.00) {
                    console.log(`[extractProductNames] Found ${productName} with ${percentage}% similarity`);
                }
            }
    
            const topProducts = relevantProd
                .filter(prod => prod.percentage >= 65.00)
                .map(prod => prod.name);
    
            const uniqueProducts = new Set<string>();
            const finalProducts = topProducts.filter(product => {
                const baseName = product.split(' ').slice(0, 3).join(' ');
                return !uniqueProducts.has(baseName) && uniqueProducts.add(baseName);
            });
    
            return finalProducts.length > 0 ? finalProducts : null;
        } catch (e) {
            console.error('[extractProductNames] Error:', e);
            return null;
        }
    }
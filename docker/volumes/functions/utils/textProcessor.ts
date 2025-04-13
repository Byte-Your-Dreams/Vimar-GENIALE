import { RecursiveCharacterTextSplitter } from "npm:langchain/text_splitter";
import { franc } from "npm:franc";

export class TextProcessor {

    public _isIta(text: string): boolean {
        return franc(text, { minLength: 1 }) === 'ita';
    }

    public async _cleanAndChunk(pages: string[]): Promise<string[]> {
        let split: string[] = [];

        for (let page of pages) {
            const chunks = page.split(/\.\n/);
            for (let chunk of chunks) {
                if (this._isIta(chunk)) {
                    split.push(chunk);
                }
            }
        }

        let txt = split.join(' ');

        txt = this._backslashSplit(txt).join(' ');
        txt = this._removeHigh_(txt.split(' ')).join(' ');
        txt = this._removeOtherSpecial(txt);

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 700,
            chunkOverlap: 140,
        });

        const chunks = await textSplitter.splitText(txt);

        return chunks;
    }

    private _removeOtherSpecial(text: string): string {
        let cleanedText = text.replace(/[|•\t]/g, ' ');
        cleanedText = cleanedText.replace(/\s+/g, ' ');
        return cleanedText.trim();
    }

    private _backslashSplit(document: string): string[] {
        return document.split('\n');
    }

    private _removeHigh_(lista: string[]): string[] {
        return lista.map(elem =>
            elem.endsWith('-') ? elem.slice(0, -1) : elem
        );
    }
}
# Vimar Geniale
Progetto svolto dal gruppo **Byte Your Dreams** per il corso di Ingegneria del Software 2024-2025 - Università degli Studi di Padova.

## Installazione
> Per il funzionamento, è necessario aver installato docker nella macchina.

### Download applicazione
1. Clonare la repository *GitHub* di Vimar Geniale, eseguendo sul terminale:
    ```
    git clone https://github.com/Byte-Your-Dreams/Vimar-GENIALE.git
    ```
2. Posizionarsi nella cartella della repository:
    ```
    cd Vimar-GENIALE/
    ```
3. Configurare il file **```docker/.env```**.  
All'interno della cartella **```docker/```** è presente il file **```.env.example```** che fornisce degli esempi di variabili d'ambiente utilizzate. Prima di eseguire il deploy, modificare tali variabili e rinominare il file in **```.env```**.
### Avviare il sistema
Una volta eseguiti i passaggi precedenti, per avviare il sistema, eseguire sul terminale:
```
./geniale.sh up {nvidia|amd|cpu}
```
> In base alla *gpu* della macchina su cui viene eseguito il sistema, digitare **nvidia** o **amd**. Se non si possiede una gpu dedicata, digitare **cpu**.

### Terminare il sistema
Per terminare l'esecuzione del sistema, eseguire:
```
geniale.sh down {nvidia|amd|cpu}
```

## Esecuzione dell'Applicazione
Aprire il browser e digitare:
```
localhost
```
Verrà visualizzata l'applicazione web, pronta per creare una nuova chat e richiedere informazioni.
> Le istruzioni per l'utilizzo dell'applicazione si trovano all'interno del documento [Manuale Utente](https://github.com/Byte-Your-Dreams/Documents/blob/main/Documenti%20Esterni/Manuale%20utente%20v1.0.0.pdf).

### Accesso alla dashboard
> Prima di poter eseguire il login, è necessario creare l'utente all'interno del database. per farlo eseguire sul terminale il commando 
```./docker/setup_admin.sh```.

Accedere alla pagina ```login``` e inserire le seguenti credenziali:
* E-mail: admin@placeholder.com
* Password: admin0

Se le credenziali saranno inserite correttamente, si sarà reindirizzati alla pagina ```dashboard```.

## Esecuzione dei test
Vimar geniale è stato testato con test di unità e di integrazione e test end-2-end.

I test realizzati per l'applicativo di estrazione dati e per il backend, sono disponibili rispettivamente all'interno delle cartelle:
* ```Scraper/Vimar/tests```
* ```docker/volumes/functions/tests```

I test dell'applicativo web, invece, sono presenti all'interno delle cartelle di ciascun componente, dentro i file ```*.spec.ts```. I test end-2-end sono presenti dentro la cartella ```app/cypress```
## Come eseguire i test dell'applicativo di estrazione dati
1. Installare nell'ambiente le dipendenze contenute nel file *requirements.txt*:
    ```
    pip install -r requirements.txt
    ```
2. Eseguire il comando:
    ``` 
    coverage run --branch -m unittest discorver -s Vimar/tests/*/
    coverage report
    ```
Sul terminare sarà visualizzato l'esito dei test e la coverage raggiunta.

### Come eseguire i test delle edge functions:
1. Installare deno:
    * Windows, utilizzando PowerShell:
        ```
        irm https://deno.land/install.ps1 | iex
        ```
    * MacOS,  utilizzando la Shell:
        ```
        curl -fsSL https://deno.land/install.sh | sh
        ```
    * Linux, utilizzando la Shell:
        ```
        curl -fsSL https://deno.land/install.sh | sh
        ```
    > Nel caso in cui l'installazione non andasse a buon fine, consultare il seguente [link](https://docs.deno.com/runtime/getting_started/installation/).
2. Eseguire sul terminale:
    ```
    deno test --coverage=coverage ./docker/volumes/functions/tests/*/*.ts
    ```
Sul terminale verrà visualizzato l'esito dei relativi test.

### Come eseguire i test dell'applicativo web
1. Accedere alla cartella app/
    ```
    cd app/
    ```
2. Scaricare le dipendenze necessarie:
   ```
    npm install --save-dev cypress@^14.2.0 @cypress/schematic@^3.0.0 wait-on@^8.0.3
    npm install --save-dev jasmine-core@~5.5.0 @types/jasmine@~5.1.0 karma@~6.4.0 karma-chrome-launcher@~3.2.0 karma-coverage@~2.2.0 karma-jasmine@~5.1.0 karma-jasmine-html-reporter@~2.1.0
    `` 
3. Per i test di unità e di integration eseguire il comando:
    > Se si usa linux digitare: export CHROME_BIN=/usr/bin/chromium
    ```
    ng test
    ```
    Verrà aperta una finestra browser in cui sarà visualizzato l'esito dei test svolti, la loro descrizione e la loro classificazione.   
    Sul terminale apparirà la coverage raggiunta.
4. Per i test e2e eseguire il comando:
    ```
    ng e2e
    ```
   Verrà aperta una finestra browser in cui sarà visualizzato l'esito dei test svolti, la loro descrizione e la loro classificazione.   
Sul terminale apparirà la coverage raggiunta.

Per chiudere la finestra del browser, schiacciare ```Ctrl+c``` nel terminale.
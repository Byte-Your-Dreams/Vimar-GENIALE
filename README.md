# Vimar Geniale
Progetto svolto dal gruppo **Byte Your Dreams** per il corso di Ingegneria del Software 2024-2025 - Università degli Studi di Padova.

## Installazione
> Per il funzionamento, è necessario aver installato docker nella macchina.

### Download applicazione
1. Clonare la repository *GitHub* di Vimar Geniale, eseguendo sul terminale:
    ```
    git clone https://github.com/...
    ```
2. Posizionarsi nella cartella della repository:
    ```
    cd VimarGeniale/
    ```
3. Configurare il file **```docker/.env```**.  
All'interno della cartella **```docker/```** è presente il file **```.env.test```** che fornisce degli esempi di variabili d'ambiente utilizzate. Prima di eseguire il deploy, modificare tali variabili e rinominare il file in **```.env```**.
### Avviare il sistema
Una volta eseguiti i passaggi precedenti, per avviare il sistema, eseguire sul terminale:
```
./geniale.sh up {nvidia|amd}
```
> In base alla *gpu* della macchina su cui viene eseguito il sistema, digitare **nvidia** o **amd**.

### Terminare il sistema
Per terminare l'esecuzione del sistema, eseguire:
```
geniale.sh down {nvidia|amd}
```

## Esecuzione dell'Applicazione
Aprire il browser e digitare:
```
localhost:4200
```
Verrà visualizzata l'applicazione web, pronta per creare una nuova chat e richiedere informazioni.
> Le istruzioni per l'utilizzo dell'applicazione si trovano all'interno del documento Manuale Utente [DA AGGIUNTERE LINK].

### Accesso alla dashboard
> Prima di poter eseguire il login, è necessario creare l'utente all'interno del database. per farlo eseguire sul terminale il commando 
```./docker/setup_admin.sh```.

Accedere alla pagina ```login``` e inserire le seguenti credenziali:
* E-mail: admin@placeholder.com
* Password: admin

Se le credenziali saranno inserite correttamente, si sarà reindirizzati alla pagina ```dashboard```.

## Esecuzione dei test
Vimar geniale è stato testato con test di unità e di integrazione, raggiungendo un coverage pari al 100%. 

I test realizzati per l'applicativo di estrazione dati e per il backend, sono disponibili rispettivamente all'interno delle cartelle:
* ```Scraper/Vimar/tests```
* ```docker/volumes/functions/tests```

I test dell'applicativo web, invece, sono presenti all'interno delle cartelle di ciascun componente, dentro i file ```*.spec.ts```.
## Come eseguire i test dell'applicativo di estrazione dati
1. Installare nell'ambiente le dipendenze contenute nel file *requirements.txt*:
    ```
    pip install -r requirements.txt
    ```
2. Eseguire il comando:
    ``` 
    pytest ???
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
2. Accedere alla cartella **```docker/volumes/functions/tests```**
    ```
    cd ./docker/volumes/functions
    ```
3. Eseguire sul terminale:
    ```
    deno test --allow-read ./*/*.ts
    ```
Sul terminale verrà visualizzato l'esito dei relativi test.

### Come eseguire i test dell'applicativo web
1. Accedere alla cartella app/
    ```
    cd app/
    ```
2. Eseguire il commando:
    ```
    ng test
    ```
Verrà aperta una finestra browser in cui sarà visualizzato l'esito dei test svolti, la loro descrizione e la loro classificazione.   
Sul terminale apparirà la coverage raggiunta.

Per chiudere la finestra del browser, schiacciare ```Ctrl+c``` nel terminale.
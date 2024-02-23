class User{
    constructor(username, password, usertype, dayQ, weekQ, monthQ) {
        this.username = username;
        this.password = password;
        this.usertype = usertype;
        this.dayQ = dayQ;
        this.weekQ = weekQ;
        this.monthQ = monthQ;
    }
}
class Squeal{
    costructor(body, bodytype, author, data, hasBeenRead){
        this.body = body;
        this.bodytype = bodytype;
        this.author = author;
        this.data = data;
        this.hasBeenRead = hasBeenRead;
    }
}
var imageOrGeo = false;              //tiene conto se il bodytype di uno squeal che si crea è un'immagine
let firstTimeView = new Array();     //tiene conto della visualizzazione degli squeal ricevuti
var fatherChannels = new Array();    //canali di cui si ha la paternità
var defaultChannels = new Array();   //canali default a cui si è iscritti per forza
var iscrittoChannels = new Array();  //lista dei canali a cui si è iscritti
var iscrivitiChannels = new Array(); //lista dei canali a cui ci si può iscrivere
var squealRicevuti = new Array();    //lista degli squeal già letti
var squealNotifiche = new Array();   //lista degli squeal ancora da leggere
var usedChar = 0;                    //caratteri usati nel body dello squeal
var destinatarioUser = false;        //tiene conto della presenza di un destinatario utente
var devoAprireDavvero = true;        //var che aiuta nella gestione dell'apertura/chiusura dei pannelli
var privateTrue = false;             //variabile che tiene conto del campo 'PRIVATO', diventa 'true' se è checked
var actualUser = new User();         //utente attuale che sta usando la piattaforma, giunge fresco fresco dal server
var nDestinatari = 1;                //numero destinatari del nuovo squeal
var canSquealBeSubmitted = true;     //variabile che tiene conto delle condizioni di creazione di un nuovo squeal

/*
* Invio al server delle modifiche effettuate ad uno dei canali di cui si è genitori,
* la modifica consiste nell'aggiornare lo stato di un utente( inserito in input) nei riguardi di un canale,
* si può aggiungerlo/rimuoverlo alla/dalla lista dei genitori oppure add/remove from blacklist( utenti che non possono scrivere o leggere
*/
function submitGestisciCanali(){

    let selectedChannel = document.querySelector('input[name="radioGestisci"]:checked').value;
    let choosenOneUsername = document.getElementById('gestisciCanaliInputUsername').value;
    let actionChecked = document.querySelector('input[name="radioPrivilege"]:checked').value;
    let addOrRemove;        //true -> add, false -> remove
    let parentsOrBlacklist; //true -> parents, false -> blacklist
    if(actionChecked === 'addParent'){
        parentsOrBlacklist = true;
        addOrRemove = true;
    }else if(actionChecked === 'addBlack'){
        parentsOrBlacklist = false;
        addOrRemove = true;
    }else if(actionChecked === 'remParent'){
        parentsOrBlacklist = true;
        addOrRemove = false;
    }else{
        parentsOrBlacklist = false;
        addOrRemove = false;
    }

    let payload = {
        creator: actualUser.username,
        password: actualUser.password,
        username: choosenOneUsername,
        parents: parentsOrBlacklist,
        add: addOrRemove
    }
    let url = `http://localhost:8080/api/channel/${selectedChannel}`;
    fetch(url, {
        method: "PUT",
        headers:{
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(payload)
    })
    .then((response) => {
        if(response.ok){
            console.log('request succeded');
            return response.json();
        } else {
            throw new Error("something's wrong with the server")
        }  
    })
    .then(data => {
        if(data){
            alert("Modificato con successo!");
            location.reload();       
        }
    })
    .catch((error) => {
        console.log("ahimè questa volta non ce l'abbiamo prprio fatta");
    });

}

/*
* Submit Richiesta d'Iscrizione ai Canali Selezionati 
*/
function submitIscrivitiCanali(){

    let almenoUno = false;
    let channelString = "";
    let canaliEsposti = document.getElementsByClassName('canaliDaIscriversi');
    if(canaliEsposti.length != 0){
        for(let i = 0; i < canaliEsposti.length; i++){
            if(canaliEsposti[i].checked){
                channelString = `${channelString}§${iscrivitiChannels[i-1].name}`;
                almenoUno = true;
            }
        }

        //richiesta al server
        let payload = {
            username: actualUser.username,
            password: actualUser.password,
            channelString: channelString
        }
        let url = `http://localhost:8080/api/user/${actualUser.username}/channel`;
        fetch(url, {
            method: "PUT",
            headers:{
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(payload)
        })
        .then((response) => {
            if(response.ok){
                console.log('request succeded');
                return response.json();
            } else {
                throw new Error("something's wrong with the server")
            }  
        })
        .then(data => {
            if(data){
                alert("Iscrizione avvenuta con successo!");
                location.reload();       
            }
        })
        .catch((error) => {
            console.log("non tutte le ciambelle escono col buco");
        });
        
        if(!almenoUno){ alert("Per iscriverti ad un canale devi selezionarne almeno uno ;)")}
    }
}

/*
* Crea Nuovo Canale
*/
function creaNuovoCanale(){

    let canaleNome = document.getElementById('channelNameInput').value.trim();
    let descrizioneCanale = document.getElementById('channelDescrizione').value;
    let officialFalse = 'false';

    let payload = {
        author: actualUser.username,
        name: canaleNome,
        official: officialFalse,
        descrizione: descrizioneCanale
    }
    let validRequest = false;
    let url = `http://localhost:8080/api/channel`;
    fetch(url, {
        method: "POST",
        headers:{
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(payload)
    })
    .then((response) => {
        if(response.ok){
            validRequest = true;
            return response.json();
        }else{
            if(response.status == 400){
                alert("Nome canale non disponible, si prega di trovarne un altro");
            }else if(response.status == 409){
                alert("Pare ci siano problemi legati al tuo account,\nsi è creata una disdicevole situazione di conflittuale imbarazzo reciproco");
            }
            else{
                throw new Error("server error");
            }
        }
    })
    .then(data => { 
        if(validRequest){   
            if(data){
                console.log(data);
                alert(`§${document.getElementById('channelNameInput').value} creato con successo`);
        
                document.getElementById('channelNameInput').value = "";
                document.getElementById('channelDescrizione').value = "";
                location.reload();
            }
        }
    })
    .catch((error) => {   
        location.href = '../serverError.html';   
    });
}

/*
* Mostra i Canali a schermo per la gestione delle iscrizioni 
*
* [n=4 iscrizione, n=6 gestione]
*/
function mostraCanali(n){        
    if(n==4){      
        //vista a schermo dei canali a cui iscriversi
        if(iscrivitiChannels.length != 0){
            let contieniIscriversi = document.getElementById('contieniIscriversi');
            let channelIscriviti = document.getElementById("channelIscriviti");

            for(let i = 0; i < iscrivitiChannels.length; i++){

                if(document.getElementById(`channelIscriviti${i}`)){              //se esiste già cambia solo il valore, altrimenti ex novo
                   let newChannelIscriviti = document.getElementById(`channelIscriviti${i}`);
                   newChannelIscriviti.querySelector('.canale').innerHTML = `§${iscrivitiChannels[i].name}`;
                }else{
                    let newChannelIscriviti = channelIscriviti.cloneNode(true);
                    contieniIscriversi.appendChild(newChannelIscriviti);
        
                    newChannelIscriviti.id = `channelIscriviti${i}`;
                    newChannelIscriviti.querySelector('.canaliDaIscriversi').id = `canaleDaIscriversi${i}`;
                    newChannelIscriviti.querySelector('.canale').for = `canaleDaIscriversi${i}`;
                    newChannelIscriviti.querySelector('.canale').innerHTML = `§${iscrivitiChannels[i].name}`;
                }
            }
        } else{
            document.getElementById('contieniIscriversi').style.display = 'none';
        }
    
        //vista a schermo dei canali a cui si è iscritti - compresi canali default
        if(iscrittoChannels.length != 0){
            let contieniIscritti = document.getElementById('contieniIscritti');
            let channelIscritto = document.getElementById("channelIscritto");
    
            for(let i = 0; i < iscrittoChannels.length; i++){                  //se esiste già cambia solo il valore, altrimenti ex novo
                if(document.getElementById(`channelIscritto${i}`)){
                    document.getElementById(`channelIscritto${i}`).innerHTML = `§${iscrittoChannels[i].name}`;
                }else{
                    let newChannelIscritto = channelIscritto.cloneNode(true);
                    contieniIscritti.appendChild(newChannelIscritto);
    
                    newChannelIscritto.id = `channelIscritto${i}`;
                    newChannelIscritto.innerHTML = `§${iscrittoChannels[i].name}`;
                }
            }
            let j = iscrittoChannels.length;
            for(let i = 0; i < defaultChannels.length; i++){
                if(document.getElementById(`channelIscritto${j}`)){           //se esiste già cambia solo il valore, altrimenti ex novo                   
                    document.getElementById(`channelIscritto${j}`).innerHMTL = `§${iscrittoChannels[i].name}`;
                }else{
                    let defChannelIscritto = channelIscritto.cloneNode(true);
                    contieniIscritti.appendChild(defChannelIscritto);
    
                    defChannelIscritto.id = `channelIscritto${j}`;
                    defChannelIscritto.innerHTML = `§${iscrittoChannels[i].name}`;
                } 
                j++;
            }
        } else{
            document.getElementById('contieniIscritti').style.display = 'none';
        }
    }else if(n == 6){
        if(fatherChannels.length != 0){
            let contieniGestisci = document.getElementById('contieniGestisciCanali');
            let channelGestione = document.getElementById("channelGestione");

            for(let i = 0; i < fatherChannels.length; i++){
                if(document.getElementById(`channelGestione${i}`)){                  //se esiste già cambia solo il valore, altrimenti ex novo
                    let newChannelGestione = document.getElementById(`channelGestione${i}`);
                    newChannelGestione.querySelector('.canaliDaGestire').value = fatherChannels[i].name;
                    newChannelGestione.querySelector('.canaleGestione').innerHTML = `§${fatherChannels[i].name}`;
                }else{
                    let newChannelGestione = channelGestione.cloneNode(true);
                    contieniGestisci.appendChild(newChannelGestione);
        
                    newChannelGestione.id = `channelGestione${i}`;
                    newChannelGestione.querySelector('.canaliDaGestire').id = `canaleDaGestire${i}`;
                    newChannelGestione.querySelector('.canaliDaGestire').value = fatherChannels[i].name;
                    newChannelGestione.querySelector('.canaleGestione').for = `canaleDaGestire${i}`;
                    newChannelGestione.querySelector('.canaleGestione').innerHTML = `§${fatherChannels[i].name}`;
                }
            }
        }
    }
}

/*
* Carica i canali dal server [n = 4 -> iscrizione, n = 6 -> gestione/moderazione]
*/
function loadCanali(n){

    //richiesta al server
    let url = `http://localhost:8080/api/channel/${actualUser.username}`;
    fetch(url, {
        method: "GET",
    })
    .then((response) => {
        if(response.ok){
            console.log('request succeded');
            if(n == 4){
                defaultChannels = new Array(); 
                iscrittoChannels = new Array();  
                iscrivitiChannels = new Array(); 
            }
            if(n == 6){
                fatherChannels = new Array();
            }
            return response.json();
        }
        throw new Error("something's wrong with the server")
    })
    .then(data => {
        if(data){
            if(n == 4){
                iscrittoChannels = new Array();
                iscrivitiChannels = new Array(); 
                defaultChannels = new Array();
                for(let i = 0; i < data.length; i++){
                    if(data[i].iscritto == true){
                        if(data[i].official == false){
                            iscrittoChannels.push(data[i]);
                        }else{
                            defaultChannels.push(data[i]);
                        }
                    }else{
                        iscrivitiChannels.push(data[i]);
                    }
                }
            }else if(n == 6){
                fatherChannels = new Array();
                let siamoPadri = false;
                for(let i = 0; i < data.length; i++){
                    let genitori = data[i].parents;
                    if(genitori.length != 0){
                        for(let j = 0; j < genitori.length; j++){
                            if(genitori[j].username == actualUser.username){
                                siamoPadri = true;
                            }
                        }
                        if(siamoPadri){
                            fatherChannels.push(data[i]);
                        }
                    }
                    siamoPadri = false;
                }
            } 
            mostraCanali(n);  
        }else{
            console.log("no channel 4 u baby");
        }
    })
    .catch((error) => {
        console.log("no fishing allowed today in this channel, my fellow");
    });
}

/*
* Acquisto quota
*/
function submitCompraQuota(){
    let quotaComprata = document.getElementById('intQuoteToBuy').value;
    let payload = {
        password: actualUser.password,
        quote: quotaComprata
    }
    let url = `http://localhost:8080/api/user/${actualUser.username}/addQuote`;
    fetch(url, {
        method: "PUT",
        headers:{
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(payload)
    })
    .then((response) => {
        if(response.ok){
            console.log('request succeded');
            return response.json();
        } else {
            throw new Error("something's wrong with the server")
        }  
    })
    .then(data => {
        if(data){
            alert("Il vostro acquisto è andato in porto :)");
            location.reload();       
        }else{
            console.log("Quel vile e sporco danaro");
        }
    })
    .catch((error) => {
        console.log("...che al mercato mio padre comprò");
    });
}

/*               
* - creazione di un nuovo squeal
* Quando vengono premuti i radio button si controlla se il campo è privato,
* in tal caso si bypassa il conteggio dei caratteri.
*/
function checkRadioButton(){

    let destinatariInput = document.getElementsByClassName('destinatari');

    if(document.getElementById('privateButton').checked){

        privateTrue = true;
        let contaCaratteri = document.getElementById('contaCaratteri');
        contaCaratteri.style.display = "none";

        //mostra il campo destinatario rivolto all'utente
        for(let i = 0; i < destinatariInput.length; i++){
            destinatariInput[i].placeholder = "utente destinatario...";
            destinatariInput[i].required = true;
        }
        
        destinatarioUser = true;
        canSquealBeSubmitted = true;  //non c'è controllo sul numero dei caratteri
    }else{

        privateTrue = false;
        let contaCaratteri = document.getElementById('contaCaratteri');
        contaCaratteri.style.display = "block";

        //mostra il campo destinatario rivolto ad un canale
        for(let i = 0; i < destinatariInput.length; i++){
            destinatariInput[i].placeholder = "canale destinatario...";
            destinatariInput[i].required = false;
        }

        destinatarioUser = false;
        canSquealBeSubmitted = false;      //c'è ancora da controllare il numero dei caratteri
    }
}

/*
* riempe i dati dell'utente con le informazioni droppate fresche dal server
*/
function compileInfo(){

    let username = document.getElementById('username');
    let usertype = document.getElementById('usertype');
    let dayQ = document.getElementById('dayQ');    
    let weekQ = document.getElementById('weekQ');
    let monthQ = document.getElementById('monthQ');

    username.innerHTML = actualUser.username;
    usertype.innerHTML = actualUser.usertype;
    dayQ.innerHTML = actualUser.dayQ;
    weekQ.innerHTML = actualUser.weekQ;
    monthQ.innerHTML = actualUser.monthQ;

    if(actualUser.usertype === 'VIP'){
        let belloStile = document.getElementById('dati').style;
        belloStile.backgroundImage = "url('../pics/patternVIP.png')";
        belloStile.backgroundSize = "100%";
    } else if(actualUser.usertype === 'MODERATOR'){
        let geometricalStile = document.getElementById('dati').style;
        geometricalStile.backgroundColor = "rgb(90,10,90)";
        geometricalStile.backgroundSize = "100%";
    }

    let caratteriDisponibili = document.getElementById('caratteriDisponibili');
    caratteriDisponibili.innerHTML = actualUser.dayQ;
}

/*
* clean dei campi di testo per l'input del cambio password
*/
function cleanPasswordField(){

    let curPassword = document.getElementById('curPwd');
    let newPassword = document.getElementById('newPwd');
    curPassword.value = '';
    newPassword.value = '';
}

/*
* Gestione Server Call per aggiornare lo stato di uno squeal notifica -quando viene letto- in squeal ricevuti
*/
function updateSquealState(squealAuthor, squealDate){

    let firstCall = true;
    if(firstCall){
        let payload = {
            author: squealAuthor,
            data: squealDate
        }
        let url = `http://localhost:8080/api/user/${actualUser.username}/updateSquealState`;
        fetch(url, {
            method: "PUT",
            headers:{
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(payload)
        })
        .then((response) => {
            if(response.ok){
                console.log('request succeded');
                return response.json();
            } else {
                throw new Error("something's wrong with the server")
            }  
        })
        .then(data => {
            if(data){
                console.log("updated successfully");
            }    
        })
        .catch((error) => {
            console.log("L'etere ha avuto le sue turbolenze, ti preghiamo di pazientare.");
        });
    
        firstCall = false;
    }
}

/*
* quando uno squeal non ancora letto viene visualizzato si cambia il colore e si notifica al server l'avvenuta lettura
*/
function stoLeggendoSqueal(squealNotificaId){

    let squealNotifica = document.getElementById(squealNotificaId);
    let squealAuthor = squealNotifica.querySelector('.leggiSquealAuthor');

    if(squealAuthor.style.backgroundColor === "rgb(90, 30, 90)"){ 
        //viene tolto il viola -> il messaggio è stato letto
        let squealDate = squealNotifica.querySelector('.dataLeggiSqueal');
        let squealNewMessageTag = squealNotifica.querySelector('.nuovoMessaggioTag');

        squealAuthor.style.backgroundColor = "rgb(65, 65, 65)";
        squealDate.style.backgroundColor = "rgb(65, 65, 65)";
        squealNewMessageTag.style.visibility = 'hidden';
        squealNewMessageTag.style.opacity = '0';
        squealNotifica.querySelector('.leggiSquealBody').style.backgroundColor = "rgb(90,90,90)";

        //server call to update the squeal state from news to read
        updateSquealState(squealAuthor.innerHTML, squealDate.innerHTML);
    }  
}

/*
* Richiesta al server per aver le info su un utente o un canale menzionati
*/
function popolaMention(mentionName, isChannel){

    let url;
    if(isChannel){
        url = `http://localhost:8080/api/channel/info/${mentionName}`;
    }else{
        url = `http://localhost:8080/api/user/info/${mentionName}`;
    }

    //richiesta al server
    fetch(url, {
        method: "GET",
    })
    .then((response) => {
        if(response.ok){
            console.log('request succeded');
            return response.json();
        }
        throw new Error("something's wrong with the server")
    })
    .then(data => {
        if(data.username || data.name){
            document.getElementById('noInfoMention').style.display = 'none';
            document.getElementById('menInfName').style.display = 'block';
            if(isChannel){
                document.getElementById('mentionInfoName').innerHTML = data.name;
                document.getElementById('mentionInfoDescrizione').innerHTML = data.descrizione;
                document.getElementById('menInfDesc').style.display = 'block';
                document.getElementById('menInfType').style.display = 'none';
            }else{
                document.getElementById('mentionInfoName').innerHTML = data.username;
                document.getElementById('mentionInfoUsertype').innerHTML = data.usertype;
                document.getElementById('menInfType').style.display = 'block';
                document.getElementById('menInfDesc').style.display = 'none';
            }
        }else{
            document.getElementById('menInfName').style.display = 'none';
            document.getElementById('menInfDesc').style.display = 'none';
            document.getElementById('menInfType').style.display = 'none';
            document.getElementById('noInfoMention').style.display = 'block';
            console.log("nada!");
        }
    })
    .catch((error) => {
        console.log("Today is not the best day of our server");
    });
}

/*
* Gestione del pannello info che si apre sul mouseover ad una menzione, sia essa di un user o di un canale
* e successivo popolamento con le info chieste al server
*/
function gestisciMenzioni(){

    let mentionPanel = document.getElementById('mentionInfo');

    if(document.getElementsByClassName('mentionLink').length != 0){
        if(document.getElementsByClassName('mentionUser').length != 0){
            for(let i = 0; i < document.getElementsByClassName('mentionUser').length; i++){

                //listener per l'entrata/uscita del mouse -> show/hide infoPanel
                let tempUserMention = document.getElementsByClassName('mentionUser')[i];
                tempUserMention.addEventListener('mouseover', ()=>{
                    mentionPanel.style.opacity = '1';
                    popolaMention(tempUserMention.innerHTML.substring(1), false);        //richiesta al server [isChannel = false]
                });
                tempUserMention.addEventListener('mouseout', ()=>{
                    mentionPanel.style.opacity = '0';
                });
            }
        }
        if(document.getElementsByClassName('mentionChannel').length != 0){
            for(let i = 0; i < document.getElementsByClassName('mentionChannel').length; i++){

                //listener per l'entrata/uscita del topo -> show/hide the infoPanel
                let tempChannelMention = document.getElementsByClassName('mentionChannel')[i];
                tempChannelMention.addEventListener('mouseover', ()=>{
                    mentionPanel.style.opacity = '1';
                    popolaMention(tempChannelMention.innerHTML.substring(1), true);        //richiesta al server []isChannel = true]
                });
                tempChannelMention.addEventListener('mouseout', ()=>{
                    mentionPanel.style.opacity = '0';
                });
            }
        }
    }else{
        mentionPanel.style.opacity = '0';
    }
}

/*
* Vista a schermo del body dello squeal, 
* se 'text' -> view del testo e gestione delle menzioni,
* se 'img/geo' -> view dedicata
*/
function displayBody(squeal, tempSquealBody, templateDiv){

    if(squeal.bodytype === 'Text'){     

        let nUserMention = 0;
        let nChannelMention = 0;
        let finalBody = '';                           //il testo viene copiato carattere per c., sostituendo la parte @user o §canale
        for(let i = 0; i < squeal.body.length; i++){                 // con una menzione in <span></span> -> di un bel rosa sostenuto
            let mentionString = ''; 
            let specialChar = '';
            if(squeal.body.charAt(i) === '@' || squeal.body.charAt(i) === '§'){       //quando si incontra @/§ si salva la parola intera
                specialChar = squeal.body.charAt(i);
                while(squeal.body.charAt(i) !== ' ' && squeal.body.charAt(i) !== ',' && squeal.body.charAt(i) !== '.' && i < squeal.body.length){
                    mentionString = mentionString + squeal.body.charAt(i);
                    i++;
                }
                if(specialChar === '§'){

                    let mentionChannel = "<span class='mentionLink mentionChannel'>" + mentionString + "</span>";
                    finalBody = finalBody + mentionChannel;
                    nChannelMention++;
                }
                else if(specialChar === '@'){

                    let mentionUser = "<span class='mentionLink mentionUser'>" + mentionString + "</span>";
                    finalBody = finalBody + mentionUser;
                    nUserMention++;
                }
            }
            finalBody = finalBody + squeal.body.charAt(i);
        }
        tempSquealBody.innerHTML = squeal.body;
        tempSquealBody.innerHTML = finalBody;

    }else{                                               //img or geo
        let imgWell = true;
        tempSquealBody.style.backgroundColor = 'rgb(17, 17, 17)';

        if(squeal.body.charAt(0) !== '.'){             //gli url relativi iniziano col punto, gli altri no
            try {                                      //provo a creare un URL con l'indirizzo mandato
                let urlProva = new URL(squeal.body);   //se non riesco -> l'url non è valido e mostro errore
            } catch (error){
                imgWell = false;
            }
        }          
        if(!imgWell){
            console.log(`${squeal.bodytype}-url is not valid`);
            tempSquealBody.innerHTML = "Vultures say: 'no image or geo found at given URL'" ;
            tempSquealBody.style.backgroundImage = `url(../pics/creepySqueal.png)`;
            tempSquealBody.style.backgroundSize = '100%';
            tempSquealBody.style.backgroundColor = 'rgb(70, 0, 0)';
            tempSquealBody.style.width = '90%';
            tempSquealBody.style.height = '150px';
            tempSquealBody.style.margin = 'auto';
            tempSquealBody.style.borderRadius = '0px';
        }else{
            tempSquealBody.innerHTML = "";
            tempSquealBody.style.backgroundImage = `url(${squeal.body})`;
            tempSquealBody.style.backgroundSize = '100%';
            tempSquealBody.style.height = '250px';
            tempSquealBody.style.maxHeight = '300px';
            tempSquealBody.style.width = '300px';
            tempSquealBody.style.margin = 'auto';
            tempSquealBody.style.marginTop = '20px';
            tempSquealBody.style.marginBottom = '19px';
            tempSquealBody.style.borderRadius = '2.5px';
            tempSquealBody.style.boxShadow = '1px 1px 4px rgb(25, 25, 25)';
            tempSquealBody.style.backgroundRepeat = 'no-repeat';
            templateDiv.style.paddingBottom = '1px';
        }
    }
}

/*
* mostra a schermo gli squeal ricevuti, mettendo in viola quelli non ancora letti
*/
function mostraSquealToRead(){

    let leggiSquealSample = document.getElementById('leggiSquealSample');

    if((squealRicevuti.length == 0) && (squealNotifiche.length == 0)){
        document.getElementById('zeroSqueal4u').display = 'block';
    } else {
        document.getElementById('zeroSqueal4u').display = 'none';
        let squilliPanel = document.getElementById('magicLeggiSqueal');
        if(squealRicevuti.length != 0){
            let nRicevuti = 0;
            squealRicevuti.forEach((squeal) =>{

            //per ogni squeal ricevuto -> crea il div dedicato, clonando il sample
                let templateDiv = leggiSquealSample.cloneNode(true);
                templateDiv.id = `lettoSquealTemplateNotifiche${nRicevuti}`;
                squilliPanel.appendChild(templateDiv);
            //riempie il div con i relativi dati, se il bodytype è Img/Geo mostra l'immagine
                templateDiv.querySelector('.leggiSquealAuthor').innerHTML = squeal.author;
                templateDiv.querySelector('.dataLeggiSqueal').innerHTML = squeal.sexyData;
                let tempSquealBody = templateDiv.querySelector('.leggiSquealBody');

                displayBody(squeal, tempSquealBody, templateDiv);

                nRicevuti++;
            });
        }
        if(squealNotifiche != 0){
            let nNotifiche = 0;                   //conta squeal per generare l'id

            squealNotifiche.forEach((squeal) => {
            //per ogni squeal non letto -> crea il div dedicato, clona il sample, genera un id e inserisce i dati
                let templateDiv = leggiSquealSample.cloneNode(true);
                let freshId = `leggiSquealTemplateNotifiche${nNotifiche}`;
                templateDiv.id = freshId;
                squilliPanel.appendChild(templateDiv);

                let leggiSquealAuthor = templateDiv.querySelector('.leggiSquealAuthor');
                let dataLeggiSqueal = templateDiv.querySelector('.dataLeggiSqueal');
                let leggiSquealBody = templateDiv.querySelector('.leggiSquealBody');
            //riempie il div con i relativi dati
                leggiSquealAuthor.innerHTML = squeal.author;
                dataLeggiSqueal.innerHTML = squeal.sexyData;
            //appone un generoso tocco di viola per notificare che il messaggio non è ancora stato letto e mostra 'NON LETTO'   
                leggiSquealAuthor.style.backgroundColor = "rgb(90, 30, 90)";
                dataLeggiSqueal.style.backgroundColor = "rgb(90, 30, 90)";
                leggiSquealBody.style.backgroundColor = "rgb(120, 70, 120)";
                templateDiv.querySelector('.nuovoMessaggioTag').style.visibility = 'visible';

            //aggiunta del listener per la visualizzazione
                templateDiv.addEventListener('mouseover', ()=>stoLeggendoSqueal(templateDiv.id));  
                
                displayBody(squeal, leggiSquealBody, templateDiv);
                
                nNotifiche++;
            });
        }
    }
    gestisciMenzioni();
    leggiSquealSample.style.display = 'none';
}

/*
* load from server -> squeal da leggere
*/
function loadSquealToRead(){
    
    let tempPwd = {
        password: actualUser.password
    }
    let url = `http://localhost:8080/api/squeal/${actualUser.username}/private`;
    fetch(url, {
        method: "PUT",
        headers:{
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(tempPwd)
    })
    .then((response) => {
        if(response.ok){
            console.log('squeals loaded');
            return response.json();
        } else {
            throw new Error("something's wrong with the server")
        }  
    })
    .then(data => {
        if(data){
            if(data.length == 0){
                document.getElementById('zeroSqueal4u').style.display = 'block';
            }else{
                document.getElementById('zeroSqueal4u').style.display = 'none';

                squealRicevuti = new Array();    
                squealNotifiche = new Array();
                for(let i = 0; i<data.length; i++){
                    console.log(data[i]);
                    if(data[i].hasBeenRead){
                        squealRicevuti.push(data[i]);
                    }else{
                        squealNotifiche.push(data[i]);
                    }      
                } 
                mostraSquealToRead(); //mostra gli squeal a schermo
            }
        } else {
            console.log("E' probabile che il Mauri abbia avuto un intoppo,\n è un uccello spazzino dopotutto!");
        }
    })
    .catch((error) => {
        console.log("Ops, Muzio ne ha combinata un'altra delle sue -.-");
    });

}

/*
* Nella creazione di un nuovo squeal si controllano i caratteri immessi, che non eccedano la quota disponibile
*/
function gestisciCreaSqueal(){

    //gestione della textarea dello squeal, se il campo di visibilità è privato non si contano i caratteri
    let squealBody = document.getElementById('squealBody');
    let squealType = document.getElementById('chooseSquealFormat');


    //change squeal type
        squealType.addEventListener('change', () => {
            if(squealType.value === 'Img'){
                imageOrGeo = true;
                squealBody.placeholder = "inserisci url dell'immagine";
            }else if(squealType.value === 'Geo'){
                imageOrGeo = true;
                squealBody.placeholder = "inserisci url della geolocalizzazione";
            } else{
                imageOrGeo = false;
                squealBody.placeholder = "inserisci testo";
            }
        });

    //aggiungi destinatari
        let addReceiverButton = document.getElementById('aggiungiDestinatario');
        addReceiverButton.addEventListener('click', (e) =>{
            e.preventDefault();
            let aggiungi = true;
            aggiungiDestinatario(aggiungi);
        });

    //rimuovi ultimo destinatario
        let removeDestinatarioButton = document.getElementById('rimuoviDestinatario');
        removeDestinatarioButton.addEventListener('click', (e) =>{
            e.preventDefault();
            let aggiungi = false;
            aggiungiDestinatario(aggiungi);
        });


    //listener sul radio button 'PRIVATO', se è 'true' si bypassa il conteggio dei caratteri 
        let privateRadioButton = document.getElementById("privateButton");
        let publicRadioButton = document.getElementById("publicButton");
        privateRadioButton.addEventListener('change', checkRadioButton);
        publicRadioButton.addEventListener('change', checkRadioButton);

    //count input characters escaping white spaces and go next line \n 
    squealBody.addEventListener('input', ()=>{
        if(!privateTrue){ 
            let caratteriUsati = document.getElementById("caratteriUsati");

            if(!imageOrGeo){
                let trimUsed = squealBody.value.trim();
                let countChar = 0;
                for (let i = 0; i < trimUsed.length; i++) {
                    if((trimUsed.charAt(i) !== " ") && (trimUsed.charAt(i) !== "\n")){
                        countChar++;
                    }  
                }
                caratteriUsati.innerHTML = countChar;
                usedChar = countChar; //tengo salvato il numero dei caratteri impiegati
            
            }else{           //se bodtype è img/geo la quota è 125
                caratteriUsati.innerHTML = "125";
                usedChar = 125;
            }

            //se i caratteri usati eccedono si tingono di rosso e non è possibile creare lo squeal
            let charCount = document.getElementById('caratteriUsati');
            if(usedChar > actualUser.dayQ){
                charCount.style.color = "red";

                //blocca il submit
                canSquealBeSubmitted = false;
            }else{
                charCount.style.color = "white";

                //sblocca il submit
                canSquealBeSubmitted = true;
            }
        }
    });
}

/*
* Gestione dell'apertura e chiusura dei panel con le azioni per l'utente;
* il boolean 'devoAprireDavvero' fa sì che quando si clicca sul chiudiFinestra,
* non si inneschi anche l'apertura - essendo triggerata dal clic sul panel.
*/
function apriTutto(yes, n){
    /* 
    *  n = 0 -> change password,
    *  n = 1 -> new squeal,
    *  n = 2 -> leggi squeal,
    *  n = 3 -> compra quota,
    *  n = 4 -> iscrizioni canali,
    *  n = 5 -> crea canale,
    *  n = 6 -> gestisci canali
    */

    let panelButton = document.getElementsByClassName('action')[n];
    let magicPanel = document.getElementsByClassName('magicWindow')[n].style;
    let closeButton = document.getElementsByClassName('chiudiFinestra')[n].style;

    if(yes){
        if(devoAprireDavvero){
            panelButton.removeEventListener("click", ()=>{
                let yes = true;
                apriTutto(yes, n);
            }, true);

            if(panelButton.style.width !== '60%'){
                if(n == 1){ gestisciCreaSqueal(); }    //n = 1 -> crea squeal
                if(n == 2){ loadSquealToRead(); }      //n = 2 -> leggi squeal
                if(n == 4){ loadCanali(n); }           //n = 4 -> iscriviti ai canali        
                if(n == 6){ loadCanali(n); }           //n = 6 -> gestisci canali
            }

            panelButton.style.width = '60%';
            magicPanel.display = 'block';
            closeButton.display = 'block';

            devoAprireDavvero = false;
        }else{
            devoAprireDavvero = true;
        }
    } else{
        panelButton.addEventListener("click", ()=>{
            let yes = true;
            apriTutto(yes, n);
        }, true);
        panelButton.style.width = '29%';
        magicPanel.display = 'none';
        closeButton.display = 'none';
    }
}

/*
* aggiunge un campo destinatario, porta il titolo al plurale, aggiunge un campo di testo
*/

function aggiungiDestinatario(aggiungi){
    //aggiungi è true se il destinatario è da aggiungere, false se è da rimuovere
    let titolo = document.getElementById('destinatarioTitle');
    if(aggiungi){
        nDestinatari++;
        const inputReceiver = document.createElement("input");
        inputReceiver.type = "text";
        inputReceiver.className = "textField destinatari";
        inputReceiver.maxLength = "32";
        inputReceiver.id = `destinatario${nDestinatari}`;
        inputReceiver.placeholder = "destinatario...";
        document.getElementById("destinatariField").appendChild(inputReceiver);
    }else{
        if(nDestinatari > 1){
            let destinatarioToRemove = document.getElementById(`destinatario${nDestinatari}`);
            destinatarioToRemove.remove();
            nDestinatari--;
        }
    }

    if(nDestinatari > 1){
        titolo.innerHTML = "Destinatari: ";
    }else{
        titolo.innerHTML = "Destinatario: ";
    }  
}

/*
* submit creazione di un nuovo squeal
*/
function createNewSqueal(){

    if(!privateTrue){
        if(usedChar <= actualUser.dayQ){
            canSquealBeSubmitted = true;
        }
    }

    if(canSquealBeSubmitted){ //true-> i caratteri usati non eccedono quelli disponibili

    //salvataggio dati nuovo squeal   
        let bodytype = document.getElementById('chooseSquealFormat').value;
        let body = document.getElementById('squealBody').value;
        let author = actualUser.username;
        let quote = usedChar;
        let destinatarioString = "";
        let destinatari = document.getElementsByClassName('destinatari'); 
        for(let i = 0; i < destinatari.length; i++){
            if(i == 0){
                destinatarioString = destinatari[i].value;
            }else{
                destinatarioString = `${destinatarioString},${destinatari[i].value}`;
            }
        }
        if(privateTrue){ quote = 0; }
        
        let squeal = {
            body: body,
            bodytype: bodytype,
            author: author,
            destinatario: destinatarioString,
            quote: quote
        };
        let url = `http://localhost:8080/api/squeal`;
        fetch(url, {
            method: "POST",
            headers:{
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(squeal)
        })
        .then((response) => {
            if(response.ok){
                return response.json();
            }
            throw new Error("server error");
        })
        .then(data => { 
            if(data == null){
                alert("Errore di autenticazione");
                location.href = '../accesso.html';
            }else{
                console.log(data); 
                alert("Nuovo squeal creato con successo!");
                location.reload();
            }  
        })
        .catch((error) => {   
            alert("Ehi, sembra che il tuo squeal abbia qualcosa che non va.\nNeppure gli avvoltoi sono riusciti a farci qualcosa!\n\nAssicurati che il destinatario esista!");
            location.reload();   
        });
    } else{
        alert("Impossibile completare l'operazione: \ncaratteri disponibili insufficienti.");
    }
}

/*
* submit del cambio password,
* si controlla la password attuale,
* si controlla che la nuova password non sia identica a quella in uso
*/
function passwordChange(){
    
    if (confirm('Confermi il cambio della password?')) {

        let curPassword = document.getElementById('curPwd').value;
        let newPassword = document.getElementById('newPwd').value;
        let errorPwd = document.getElementById('errorPassword').style;
        let errorNewPwd = document.getElementById('errorNewPassword').style;
        if(curPassword != actualUser.password){  
            alert("password errata, non l'avrai mica dimenticata?");    
            errorPwd.visibility = 'visible';
        } else if(curPassword == newPassword){
            alert("scegli una nuova password diversa dalla precedente prego");
            errorNewPwd.visibility = 'visible';
        } else{
            errorPwd.visibility = 'hidden';
            errorNewPwd.visibility = 'hidden'; 
            let sendPassword = {
                password: newPassword
            };

            //richiesta al server
  
            let url = `http://localhost:8080/api/user/password/${actualUser.username}`;
            fetch(url, {
                method: "PUT",
                headers:{
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(sendPassword)
            })
            .then((response) => {
                if(response.ok){
                    console.log('request succeded');
                    return response.json();
                } else {
                    throw new Error("something's wrong with the server")
                }  
            })
            .then(data => {
                if(data == null){
                    alert("cambio password fallito");
                } else {
                    alert('Password aggiornata con successo!');
                    actualUser.password = data.password;
                    cleanPasswordField();

                    console.log(actualUser);
                    location.href = `./profile.html?username=${actualUser.username}&password=${actualUser.password}`;
                }
            })
            .catch((error) => {
                console.log("qualcosa non torna");
            });
        }
       
    }
}

/*
* main
*/
function init(){

    let tempUsername;
    let tempPassword;
    let actualUrl = new URLSearchParams(window.location.search);
    if(actualUrl.get('username') && actualUrl.get('password')){
        tempUsername = actualUrl.get('username');
        tempPassword = {
            password: actualUrl.get('password')
        };
    }

    //get actualUser from the server
        let url = `http://localhost:8080/api/user/${tempUsername}`;
        fetch(url, {
            method: "PUT",
            headers:{
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(tempPassword)
        })
        .then((response) => {
            if(response.ok){
                console.log('request succeded');
                return response.json();
            } 
            throw new Error("something's wrong with the server"); 
        })
        .then(data => {
            if(data == null || data.password !== tempPassword.password || data.blocked == true){
                alert("autenticazione fallita");
                location.href = '../accesso.html';
            } else {
                actualUser = new User(data.username, data.password, data.usertype, data.dayQuote, data.weekQuote, data.monthQuote);
                compileInfo();

                console.log(actualUser);
            }
        })
        .catch((error) => {
            alert("autenticazione fallita, si prega di eseguirla nuovamente");
            location.href = "../accesso.html";
        });

    //se tocchi l'avvoltoio torni alla home
        let homeButton = document.getElementById("logo");
        homeButton.addEventListener("click", () => {location.href=`../home/home.html?username=${actualUser.username}&password=${actualUser.password}`});
        
    //mostra( o nasconde) la password corrente inserita
        const actualPasswordText = document.getElementsByClassName("passwordTextField")[0];
        const actualEye = document.getElementsByClassName('seePassword')[0];
        var actualPasswordVisible = false;
        actualPasswordText.addEventListener('focusin', ()=> actualEye.visibility = 'visible');
        actualEye.addEventListener('click', ()=>{
            if(!actualPasswordVisible){
                actualPasswordText.type = 'text';
                actualPasswordVisible = true;
            } else{
                actualPasswordText.type = 'password';
                actualPasswordVisible = false;
            }
        });

    //mostra( o nasconde) la nuova password inserita
        const newPasswordText = document.getElementsByClassName("passwordTextField")[1];
        const newEye = document.getElementsByClassName('seePassword')[1];
        var newPasswordVisible = false;
        newPasswordText.addEventListener('focusin', ()=> newEye.visibility = 'visible');
        newEye.addEventListener('click', ()=>{
            if(!newPasswordVisible){
                newPasswordText.type = 'text';
                newPasswordVisible = true;
            } else{
                newPasswordText.type = 'password';
                newPasswordVisible = false;
            }
        });

    /* 
    * Gestione degli action-panel disponibili per l'utente,
    * ad ogni azione corrisponde un codice intero                             :
    *  - cambio della password [n = 0],
    *  - creazione di un nuovo squeal [n = 1] 
    */

    //password panel
        let passwordButton = document.getElementById('passwordButton');
        passwordButton.addEventListener("click", ()=>{
            let yes = true;
            let n = 0;
            apriTutto(yes, n);
        }, true);
        passwordButton.addEventListener("submit", passwordChange);


    //show new squeal panel and submit new squeal call
        let newSquealForm = document.getElementById('newSquealForm');
        newSquealForm.addEventListener("click", ()=>{
            let yes = true;
            let n = 1;
            apriTutto(yes, n);
        }, true);
        newSquealForm.addEventListener("submit", createNewSqueal);
    
    //'leggi squeal' panel e bottone per caricare squeal da leggere
        let leggiSquealButton = document.getElementById('leggiNuoviSqueal');
        leggiSquealButton.addEventListener("click", (e)=>{
            e.preventDefault();
            let yes = true;
            let n = 2;
            apriTutto(yes, n);
        }, true);

     //apri compra quota panel e listener per il submit del form
        let compraQuotaButton = document.getElementById('compraQuota');
        compraQuotaButton.addEventListener("click", ()=>{
            let yes = true;
            let n = 3;
            apriTutto(yes, n);
        }, true);
        compraQuotaButton.addEventListener("submit", submitCompraQuota);

    //apri - iscriviti ai canali e Listener per il form
        let iscrivitiCanaliButton = document.getElementById('iscrivitiCanali');
        iscrivitiCanaliButton.addEventListener("click",  ()=>{
            let yes = true;
            n = 4;
            apriTutto(yes, n);
        }, true);
        iscrivitiCanaliButton.addEventListener("submit", submitIscrivitiCanali);

    //apri crea canale
        let creaCanaleButton = document.getElementById('creaCanale');
        creaCanaleButton.addEventListener('click', ()=>{
            let yes = true;
            let n = 5;
            apriTutto(yes, n);
        });
        creaCanaleButton.addEventListener('submit', creaNuovoCanale);

    //apri gestisci i tuoi canali
        let gestisciCanaliButton = document.getElementById('gestisciCanali');
        gestisciCanaliButton.addEventListener("click", ()=>{
            let yes = true;
            let n = 6;
            apriTutto(yes, 6);
        });
        gestisciCanaliButton.addEventListener("submit", submitGestisciCanali);


    //chiudi finestra del cambio password
        if(document.getElementsByClassName('chiudiFinestra')[0]){
            let closeButtonPwd = document.getElementById('chiudiFinestraPwd');
            closeButtonPwd.addEventListener("click", ()=>{
                let no = false;
                let n = 0;
                apriTutto(no, n);
            });
        }
            
    //chiudi finestra del 'crea nuovo squeal'
        if(document.getElementsByClassName('chiudiFinestra')[1]){
            let closeButtonSqueal = document.getElementById('chiudiFinestraSqueal');
            closeButtonSqueal.addEventListener("click", ()=>{
                let no = false;
                let n = 1;
                apriTutto(no, n);
            });
        }

    //chiudi finestra del 'Leggi squeal'
        if(document.getElementsByClassName('chiudiFinestra')[2]){
            let closeButtonLeggi = document.getElementById('chiudiFinestraLeggi');
            closeButtonLeggi.addEventListener("click", ()=>{
                let no = false;
                let n = 2;
                apriTutto(no, n);
            });
        }
    
    //chiudi finestra del 'compra quota'
        if(document.getElementsByClassName('chiudiFinestra')[3]){
            let closeButtonQuota = document.getElementById('chiudiFinestraQuota');
            closeButtonQuota.addEventListener("click", ()=>{
                let no = false;
                let n = 3;
                apriTutto(no, n);
            });
        }

    //chiudi finestra del 'iscriviti canali'
        if(document.getElementsByClassName('chiudiFinestra')[4]){
            let closeButtonCanali = document.getElementById('chiudiFinestraCanali');
            closeButtonCanali.addEventListener("click", ()=>{
                let no = false;
                let n = 4;
                defaultChannels = new Array(); 
                iscrittoChannels = new Array();  
                iscrivitiChannels = new Array(); 
                apriTutto(no, n);
            });
        }

    //chiudi 'crea canale'
        if(document.getElementsByClassName('chiudiFinestra')[5]){
            let closeButtonCreaCanale = document.getElementById('chiudiFinestraCreaCanale');
            closeButtonCreaCanale.addEventListener("click", ()=>{
                let no = false;
                n = 5;
                apriTutto(no, n);
            });
        }

    //chiudi "gestisci i canali"
        if(document.getElementsByClassName('chiudiFinestra')[6]){
            let closeButtonGestisciCanali = document.getElementById('chiudiFinestraGestisciCanali');
            closeButtonGestisciCanali.addEventListener("click", ()=>{
                let no = false;
                n = 6;
                apriTutto(no, n);
            });
        }

    //gestione del logout tramite apposito bottone
        let logoutButton = document.getElementById('logoutButton');
        logoutButton.addEventListener('click', ()=>{
            if(confirm('Vuoi uscire dal tuo account \ne tornare alla pagina iniziale?')) {
                actualUser = new User();
                location.href = "../accesso.html";
            }
        });
}

window.addEventListener("DOMContentLoaded", init);

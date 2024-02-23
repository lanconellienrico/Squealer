
class User{

    constructor(username, password, usertype, notifiche) {
        this.username = username;
        this.password = password;
        this.usertype = usertype;
        this.notifiche = notifiche;
    }
}
var viewMod;                     //tiene conto del tipo di utente, se loggato o meno
var squeals = new Array();        //salva gli squeal da visualizzare
var newMessage = false;          //boolean per la gestione di un nuovo messaggio in arrivo
var toInterrupt = false;         //boolean per l'interruzione delle chiamate al server
var actualUser = new User();     //il nostro uomo oltre il confine, l'utente
var menuShowing = false;         //tiene conto se il menù utente è in mostra o meno
var visualizzati = new Array();  //per gli squeal caricati tiene conto se son stati visti o meno

/*
* submit view di un user logged
*/
function submitReaction(author, sexyData, m){

    let viewed = false;
    let ammiro = false;
    let disgusto = false;
    if(m == 0){ 
        viewed = true;
    } else if(m == 1){
        ammiro = true;
    } else if(m == 2){
        disgusto = true;
    }

    let payload = {
        password: actualUser.password,
        author: author,
        sexyData: sexyData,
        ammiro: ammiro,
        disgusto: disgusto,
        viewed: viewed
    }
    let url = `http://localhost:8080/api/squeal/action/${actualUser.username}`;
    fetch(url, { 
        method: "PUT",
        headers:{
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(payload)
    })
    .then((response) => {
        if(response.ok){
            return response.json();
        } else{
            throw new Error("something's wrong with the server");  
        }
    })
    .then(data => {
        if(data){
            console.log(data);
        } else {
            console.log("failed reaction");
        }
    })
    .catch((error) => {
        console.log("fail reaction");
    });
}

/*
* submit visualizzazione di un vouyer
*/
function submitViewerView(author, sexyData){

    let payload = {
        author: author,
        sexyData: sexyData
    }
    let url = `http://localhost:8080/api/squeal/action`;
    fetch(url, { 
        method: "PUT",
        headers:{
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(payload)
    })
    .then((response) => {
        if(response.ok){
            return response.json();
        } else{
            throw new Error("something's wrong with the server");  
        }
    })
    .then(data => {
        if(data){
            console.log(data);
        } else {
            console.log("failed viewer");
        }
    })
    .catch((error) => {
        console.log("fail viewer");
    });
}

/*
 *  Gestione della reazione su uno squeal:
 *  
 *  m = 0 -> visualizzazione,
 *  m = 1 -> ammiro,
 *  m = 2 -> disgusto
 */
function handleReaction(m, squealId){

    let tempSquealPanel = document.getElementById(squealId);
    let tempAuthor = tempSquealPanel.querySelector('.author').innerHTML;
    let tempSexyData = tempSquealPanel.querySelector('.sexyData').innerHTML;

    if(m == 0){     
        if(!visualizzati[squealId]){

            console.log(visualizzati[squealId]);
            let eye = document.getElementById(`eye${squealId}`);
            eye.style.opacity = '1';
            visualizzati[squealId] = true;

            if(viewMod){
                submitViewerView(tempAuthor, tempSexyData);
            }else{
                submitReaction(tempAuthor, tempSexyData, m);
            }
        }
    }else if(m == 1){  
        submitReaction(tempAuthor, tempSexyData, m);
    }else{                      
        submitReaction(tempAuthor, tempSexyData, m);
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
                    popolaMention(tempChannelMention.innerHTML.substring(1), true);        //richiesta al server [isChannel = true]
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
* Caricamento della vista del body, con gestione differenziata per il testo -> un occhio alle menzioni, o alle img/geo
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
* Vista a schermo degli squeal
*/
function showSquealsToRead(viewMode){

    viewMod = viewMode;

    /*
    * inizializzazione dell'array che tiene conto delle visualizzazioni, 
    *  per l'user non registrato ce n'è una a sessione,
    *  per l'user loggato una assoluta e basta. 
    */
    for(let i = 0; i < squeals.length; i++){
        if(viewMode || squeals[i].impression.length == 0){
            visualizzati[i] = false;
        } else {
            for(let j = 0; j < squeals[i].impression.length; j++){
                if(actualUser.username == squeals[i].impression[j]){
                    visualizzati[i] = true;
                }else{
                    visualizzati[i] = false;
                }
            }
        }
    }

    //display
    let n = 0;    //<-- ad ogni squeal viene assegnato un int
    let container = document.getElementById('squilli');
    let samplePanel = document.getElementById('samplePanel');
    squeals.forEach((squeal) =>{

        //per ogni squeal carico la vista clonando il sample
        let newPanel = samplePanel.cloneNode(true);
        container.appendChild(newPanel);

        newPanel.id = n;
        newPanel.style.display = "block";
        newPanel.querySelector('.author').innerHTML = squeal.author;
        newPanel.querySelector('.sexyData').innerHTML = squeal.sexyData;
 
        //view dei canali
        if(squeal.canale !== ""){
            let arrayChannels = squeal.canale.split(",");
            let stringChannels = '';
            for(let i = 0; i < arrayChannels.length; i++){
                stringChannels = `${stringChannels} §${arrayChannels[i]}`;
            }
            newPanel.querySelector('.channels').innerHTML = stringChannels;
            newPanel.querySelector('.channels').style.display = 'block';
        }

        //caricamento del body
        let tempSquealBody = newPanel.querySelector('.body');
        displayBody(squeal, tempSquealBody, newPanel);

        //gestione bollini pop/unp/controversial
        let bollino = newPanel.querySelector('.valutation');
        if(squeal.controversial){                     
            bollino.title = 'controversial';
            bollino.target = 'controversial';
            bollino.style.opacity = '1';
            bollino.src = '../pics/controversial.png';
        }else if(squeal.unpopular){
            bollino.style.opacity = '1';
        }else if(squeal.popular){
            bollino.title = 'popular';
            bollino.target = 'popular';
            bollino.style.opacity = '1';
            bollino.src = '../pics/smileWhite.png';
        }else{
            bollino.style.opacity = '0';
        }

        //se user logged -> mostra i button per le reactions, attivi se non si ha ancora reagito
        //se viewer -> non li mostra
        let ammiroButton = newPanel.querySelector('.admireButton');
        let disgustoButton = newPanel.querySelector('.disgustButton');
        if(!viewMode && squeal.author!=="Squealer_Gods"){                  /*ADDED + se messaggio automatico della redazione -> non li mostra */
            if(!squeal.ammirati.includes(actualUser.username)){
                ammiroButton.id = `a${n}`;
                ammiroButton.addEventListener('click', (e)=>{
                    e.preventDefault();
                    let m = 1;
                    handleReaction(m, newPanel.id);                
               });
            }
            if(!squeal.disgustati.includes(actualUser.username)){
                disgustoButton.id = `d${n}`;
                disgustoButton.addEventListener('click', (e) =>{
                    e.preventDefault();
                    
                    let m = 2;
                    handleReaction(m, newPanel.id);
                });
            }
        }else{
            ammiroButton.style.display = 'none';
            disgustoButton.style.display = 'none';
            newPanel.querySelector('.reaction').style.display = 'none';
        }

        //listener per le visualizzazioni -> realizzate mediante passaggio del mouse*
        //*se non è un messaggio della redazione
        let eye = newPanel.querySelector('.eye');
        eye.id = `eye${n}`;
        if(squeal.author !== 'Squealer_Gods'){
            if(!viewMode){
                if(!squeal.impression.includes(actualUser.username)){
                    eye.style.opacity = '0';
                    newPanel.addEventListener('mouseover', ()=>{
                        let m = 0;
                        handleReaction(m, newPanel.id);
                    });
                }else{
                    eye.style.opacity = '1';
                }
            }else{
                newPanel.addEventListener('mouseover', ()=>{
                    let m = 0;
                    handleReaction(m, newPanel.id);
                });
            }
        }else{
            eye.style.display = 'none';
        }
        

        n++;
    });
    gestisciMenzioni();
}


/*
* Caricamento degli squeal nella Home, 
* con gestione differenziata tra:
* userRegistrati( viewMode = false) e non( viewMode = true) 
*/
function loadSquealToRead(viewMode){

    if(viewMode){                     //user non registrato -> si caricano solo gli squeal dei CANALI UFFICIALI SQUEALER
        
        //richiesta al server
        let url = `http://localhost:8080/api/squeal/officialChannel`;
        fetch(url, { method: "GET" })
        .then((response) => {
            if(response.ok){
                return response.json();
            } 
            throw new Error("something's wrong with the server")  
        })
        .then(data => {
            if(data){
                console.log(data);
                for(let i = 0; i < data.length; i++){
                    squeals.push(data[i]);
                }
                showSquealsToRead(viewMode);
            } else {
                alert("...no one to cry to...seems so empty here...");
                console.log("Non ci sono squeal da visualizzare");
            }
        })
        .catch((error) => {
            console.log("qualcosa non torna");
        });
    }else{

        //richiesta al server
        let tempPwd = {
            password: actualUser.password
        }
        let url = `http://localhost:8080/api/squeal/${actualUser.username}/home`;
        fetch(url, { 
            method: "PUT",
            headers:{
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(tempPwd)
        })
        .then((response) => {
            if(response.ok){
                return response.json();
            } else{
                throw new Error("something's wrong with the server");  
            }
        })
        .then(data => {
            if(data){
                console.log(data);
                for(let i = 0; i < data.length; i++){
                    squeals.push(data[i]);
                }
                showSquealsToRead(viewMode);
            } else {
                alert("...no one to cry to...seems so empty here...");
                console.log("Non ci sono squeal da visualizzare");
            }
        })
        .catch((error) => {
            console.log("non tutto sempre torna");
        });
    }
}

/*
* richiesta al server per controllare le notifiche( ogni 30s)
*/
function serverAggiornami(url){

    let nuovoMessaggioMenu = document.getElementById('nuovoMessaggio');
    let avvoltoioNotifica = document.getElementById('squilloShape');
    

    let intervallo = setInterval(async () => {
        let tempPwd = {
            password: actualUser.password
        }
        fetch(url, {
            method: "PUT",
            headers:{
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(tempPwd)
        })
        .then((response) => {
            if(response.ok){
                return response.json();
            }
            throw new Error("something's wrong"); 
        })
        .then(data => {
            if(data){
                if(data.notifiche.length > actualUser.notifiche.length){
                    let countNotifiche = data.notifiche.length - actualUser.notifiche.length;
                    if(countNotifiche == 1){
                        alert("L'avvoltoio pulpa: \n 'Hai un nuovo messaggio!'");
                        console.log("One New Squeal 4 U Baby");
                    }else{
                        alert("Gli avvoltoi t'avvertono: \nHai " + countNotifiche + " nuovi messaggi!");
                        console.log(countNotifiche + "New Squeals 4 U Baby");
                    }
                    actualUser.notifiche = data.notifiche;
                    nuovoMessaggioMenu.style.display = "block";
                    avvoltoioNotifica.style.display = "block";
                }
            }else{
                console.log("From the server - We're unable to send you the usual gold, but we're diggin', see ya!");
            }
        })
        .catch((error) => {
            console.log("From the server - we're sorry, we're in bad shape\n and can't perform as usual.\n - Keep it runnin' - Creed Bratton");
        });
    }, 3000);
    
    if (toInterrupt) {
        clearInterval(intervallo); // Stoppa le chiamate se condition=true
    }
}

/*
* mostra e gestisce le funzionalità del menu utente [username - goToProfile - logout]
*/
function showMenu(){

    //username
    let profileMenu = document.getElementById("profile");
    if(!menuShowing){
        profileMenu.style.visibility = "visible";
        menuShowing = true;
    } else {
        profileMenu.style.visibility = "hidden";
        menuShowing = false;
    }

    //profile
    let profileLinkButton = document.getElementById('profileLinkButton');
    profileLinkButton.addEventListener("click", (e) => {
        e.preventDefault();
        location.href = `../profile/profile.html?username=${actualUser.username}&password=${actualUser.password}`
    });

    //logout
    let userExit = document.getElementById('userExitButton');
    userExit.addEventListener("click", (e)=>{
        e.preventDefault();
        if(confirm("Gli avvoltoi pulpano:\n'Vuoi davvero abbandonarci?'")){
            location.href = '../accesso.html';
        }else{
            console.log("Ben fatto! Ci sono altre carogne da spulciare");
        }
    });
}

/*
* gestione della home per un utente non registrato
*/
function viewModeOn(){

    document.getElementById('userShape').style.visibility = 'hidden';

    let exitButton = document.getElementById('viewerExit');
    exitButton.style.display = 'block';
    exitButton.addEventListener('click', ()=>{
        if(confirm("Sicuro di volere abbandonare?")){
            location.href = '../accesso.html';
        }else console.log("hai fatto la scelta giusta :)");
    });
}


/*
* Show moderator button
*/
function moderatorModeON(){

    console.log("SIAMO DEI MODERATORI");
    let moderatorButton = document.getElementById('goToModerator');
    moderatorButton.style.display = 'block';
    moderatorButton.addEventListener("click", ()=>{
        if(confirm("Accetti il tuo destino:\n\nO' demiurgo solitario,\n tu solo dietro le quinte del mondo?")){
            location.href = `../../moderator/menu.html?username=${actualUser.username}&password=${actualUser.password}`;
        }else{
            console.log("Non è certo cosa da tutti, sapersi fare da parte.");
        }
    });
}


function init(){

    //controllo sul tipo di utente, se è solo un viewer o è registrato
    let viewMode;
    let tempUsername;
    let tempPassword;
    let actualUrl = new URLSearchParams(window.location.search);
    if(actualUrl.get('username') && actualUrl.get('password')){
        tempUsername = actualUrl.get('username');
        tempPassword = {
            password: actualUrl.get('password')
        };
        viewMode = false;
    } else if(actualUrl.get('viewer')){
        if (actualUrl.get('viewer') === 'TRUE'){
            viewMode = true;
        }
    } 
    if(!viewMode){

        //se è un utente registrato parte la richiesta al server per ottenere l'utente in questione
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
                return response.json();
            }
            throw new Error("something's wrong"); 
        })
        .then(data => {
            if((data == null) || (data.password!==tempPassword.password) || (data.blocked == true)){
                alert("autenticazione fallita");
                location.href = '../accesso.html';
            } else {
                actualUser = new User(data.username, data.password, data.usertype, data.notifiche);
                console.log(actualUser);

                let userButton = document.getElementById('username');
                userButton.innerHTML = actualUser.username;

                //check per le notifiche mentre si era assenti
                let nuovoMessaggioMenu = document.getElementById('nuovoMessaggio');
                let avvoltoioNotifica = document.getElementById('squilloShape');
                if(data.notifiche.length == 1){
                    nuovoMessaggioMenu.innerHTML = `${data.notifiche.length} NUOVO SQUEAL`;
                    nuovoMessaggioMenu.style.display = 'block';
                    avvoltoioNotifica.style.display = 'block';

                    alert(`C'è uno squeal per te`);
                } else if(data.notifiche.length !=0){
                    nuovoMessaggioMenu.innerHTML = `${data.notifiche.length} NUOVI SQUEAL`;
                    nuovoMessaggioMenu.style.display = 'block';
                    avvoltoioNotifica.style.display = 'block';

                    alert(`Ci sono ${data.notifiche.length} squeal per te`);
                }else{
                    nuovoMessaggioMenu.style.display = 'none';
                    avvoltoioNotifica.style.display = 'none';
                }

                //moderatorMode->On se si è moderatori
                if(data.usertype === 'MODERATOR'){ 
                    moderatorModeON();
                }

                //caricamento squeal
                squeals = new Array();
                loadSquealToRead(viewMode);
            }
        })
        .catch((error) => {
            alert("Autenticazione fallita, qui c'è una poesia per te: \n\na strange and whimsical error has occured,\nuncanny and daunting is the way of the forgotten");
            location.href = "../accesso.html";
        });
    }else {
        viewModeOn();

        //caricamento squeal
        squeals = new Array();
        loadSquealToRead(viewMode);
    }  

    //menu utente
    let userButton = document.getElementById("userShape");
    userButton.addEventListener("click", showMenu);

    //richiesta al server per tenere in aggiornamento le notifiche
    if(!viewMode){
        let url = `http://localhost:8080/api/user/${tempUsername}`;
        serverAggiornami(url);
    }    
}


window.addEventListener("DOMContentLoaded", init); 

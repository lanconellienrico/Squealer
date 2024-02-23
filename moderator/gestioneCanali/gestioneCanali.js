
let username;               //actualUser username
let password;               //actualUser password
let canali = new Array();   //salva i canali caricati dal server
let squeals = new Array();  //salva gli squeal del canale selezionato

/*
* Creazione di un nuovo §CANALE_UFFICIALE 
*/
function createNewChannel(nome, descrizione){
    nome = nome.toUpperCase();
    let official = true;
    let payload = {
        author: username,
        name: nome,
        official: official,
        descrizione: descrizione
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
                alert("Esiste già un canale con quel nome");
                document.getElementById('newTitle').value = '';
                document.getElementById('newDescription').value = '';
            }else{
                throw new Error("server error");
            }
        }
    })
    .then(data => { 
        if(validRequest){   
            console.log(data); 
            alert("§" + nome + " creato con successo!");
            location.reload();
        }
    })
    .catch((error) => {   
        location.href = '../../client/serverError.html';   
    });
}

/*
* Richiesta al server di rimozione di un §CANALE_UFFICIALE
*/
function deleteChannel(name){

    //richiesta al server
    let url = `http://localhost:8080/api/channel/${name}`;
    fetch(url, { method: "DELETE" })
    .then((response) => {
        if(response.ok){
            return response.json();
        }
        throw new Error("server error");
    })
    .then(data => {   
        console.log(data);
        alert(`§${name} è stato spazzato via.`);
        location.reload();
    })
    .catch((error) => {   
        location.href = '../../client/serverError.html';   
    });
}

/*
* Aggiornamento del §CANALE con le modifiche effettuate -> richiesta al server
*/
function updateChannel(name, changeDescription, squilloId){

    let newDescription = false;
    if(changeDescription){
        newDescription = true;
    }
    let author = "";
    let sexyData = "";
    let changeSqueal = false;
    if(squilloId){
        let squeal = document.getElementById(squilloId);
        author = squeal.querySelector('.author').innerHTML;
        sexyData = squeal.querySelector('.sexyData').innerHTML;
        changeSqueal = true;
    }
    let payload = {
        newDescription: newDescription,
        descrizione: changeDescription,
        changeSqueal: changeSqueal,
        author: author,
        sexyData: sexyData
    }

    //richiesta al server
    let url = `http://localhost:8080/api/channel/${name}/update`;
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
        }
        throw new Error("server error");
    })
    .then(data => {   
        console.log(data);
        alert(`§${name} aggiornato con successo!`);
        location.reload();
    })
    .catch((error) => {   
        location.href = '../../client/serverError.html';   
    });
}
/*
* Legge gli input del form di modifica al Canale
*/
function submitModificaCanale(){

    let channelName = document.querySelector('input[name="radioCanali"]:checked').value;    //nome del canale
    let azione = document.querySelector('input[name="scelta"]:checked').value;              //MODIFICA / ELIMININA
    let changeDescriptionField = document.getElementById('changeDescription');
    let changeDescription = "";                                                             //eventuale nuova descrizione
    if(changeDescriptionField.value.length != 0){
        changeDescription = changeDescriptionField.value;
    }          
    let squilloId = "";                                                                     //html#Id dello squeal (se selezionato)
    if(document.querySelector('input[name="squilliButton"]:checked')){
        squilloId = document.querySelector('input[name="squilliButton"]:checked').value; 
    }

    if(azione === 'ELIMINA'){
        deleteChannel(channelName);
    }else if(azione ==='MODIFICA'){
        updateChannel(channelName, changeDescription, squilloId);
    }

}

/*
* Mostra a schermo gli squeal relativi ad un canale 
*/
function showSqueals(){

    if(squeals.length !=0){
        let squealSample = document.getElementById('squealSample');
        let squealContainer = document.getElementById('squealContainer');
        
        for(let i = 0; i < squeals.length; i++){
            let squeal = squealSample.cloneNode(true);
            squealContainer.appendChild(squeal);
            
            squeal.id = `squealSample${i}`;
            squeal.querySelector('.radioSquilli').id = `radioSquilliSample${i}`;
            squeal.querySelector('.radioSquilli').value = squeal.id;
            squeal.querySelector('.innerText').for = `radioSquilliSample${i}`;
            squeal.querySelector('.innerText').innerHTML = squeals[i].body;
            let stringAuthor = "<span class='author'>" + squeals[i].author + "</span>";
            let stringSexyData = "<span class='sexyData'>" + squeals[i].sexyData + "</span>";
            squeal.querySelector('.squealInfo').innerHTML = stringAuthor + stringSexyData;
        }
    }
}


/*
* Carica gli squeal relativi ad un canale
*/
function loadSqueals(nomeCanale){

    //richiesta al server
    let url = `http://localhost:8080/api/channel/${nomeCanale}/squeal`;
    fetch(url, { method: "GET" })
    .then((response) => {
        if(response.ok){
            return response.json();
        }
        throw new Error("server error");
    })
    .then(data => { 
        if(data.length != 0){
            for(let i = 0; i < data.length; i++){
                squeals.push(data[i]);
            }
            showSqueals();
        }  
    })
    .catch((error) => {   
        console.log(error);
        location.href = '../../client/serverError.html';   
    });  

}

/*
* Mostra a schermo i §CANALI_UFFICIALI di squealer
*/
function showChannels(){

    if(canali.length !=0){
        let channelSample = document.getElementById('channelSample');
        let channelContainer = document.getElementById('channelContainer');
        
        for(let i = 0; i < canali.length; i++){
            let channel = channelSample.cloneNode(true);
            channelContainer.appendChild(channel);
            
            channel.id = `channelSample${i}`;
            channel.querySelector('.channelRadio').id = `radioSample${i}`;
            channel.querySelector('.channelRadio').value = canali[i].name;
            channel.querySelector('.nomiCanali').for = `radioSample${i}`;
            channel.querySelector('.nomiCanali').innerHTML = `§${canali[i].name}`;

            //quando il canale viene selezionato, si caricano gli squeal appartenenti
            let radioButton = document.getElementById(`radioSample${i}`);
            radioButton.addEventListener('change', ()=>{
                if(radioButton.checked){
                    squeals = new Array();
                    loadSqueals(canali[i].name);
                }
            });
        }
    }
}

/*
* Carica i §CANALI_UFFICIALI di squealer
*/
function loadChannels(){

    let url = `http://localhost:8080/api/channel`;
    fetch(url, { method: "GET" })
    .then((response) => {
        if(response.ok){
            return response.json();
        }
        throw new Error("server error");
    })
    .then(data => {   
        for(let i = 0; i < data.length; i++){
            if(data[i].official){
                canali.push(data[i]);
            }
        }
        showChannels();
    })
    .catch((error) => {   
        console.log(error);
        location.href = '../../client/serverError.html';   
    });  
}

function init(){

    let actualUrl = new URLSearchParams(window.location.search);
    if(actualUrl.get('username') && actualUrl.get('password')){
        username = actualUrl.get('username');
        password = actualUrl.get('password');
    }else{
        alert("the unknown is always welcome, but not now");
        location.href = "../moderator.html";
    }

    let backToMenuButton = document.getElementById('back');
    backToMenuButton.addEventListener('click', ()=>{
        location.href = `../menu.html?username=${username}&password=${password}`;
    });

    //caricamento §CANALI
    canali = new Array();
    setTimeout(loadChannels, 500);

    //submit -> crea nuovo canale
    let submitNewChannel = document.getElementById('newChannelForm');
    submitNewChannel.addEventListener('submit', ()=>{
        let newChannelName = document.getElementById('newTitle').value;
        let descrizione = document.getElementById('newDescription').value;
        createNewChannel(newChannelName, descrizione);
    });

    //submit -> modifica canale
    let submitModChannel = document.getElementById('canaliPanel');
    submitModChannel.addEventListener('submit', ()=>{
        submitModificaCanale();
    });

}

window.addEventListener("DOMContentLoaded", init);
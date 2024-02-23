let username;
let password;
let users = new Array();     //elenco dei ragazzi e ragazzetti, altresì chiamateli User


/*
* Invio delle modifiche su un utente
*/
function updateUser(userSelectId){

    let quote = 0;     //quota da aggiungere( se > 0)/rimuovere( se < 0)
    let block;         //0 -> lasciato in pace; 1 -> da bloccare; 2 -> da sbloccare
    let blockSelect = document.getElementById('selectBlockType');
    if(blockSelect.value !== 'peace'){
        if(blockSelect.value === 'block'){
            block = 1;
        }else{
            block = 2;
        }
    }else{
        block = 0;
    }
    let newQuote = document.getElementById('newQuote');
    if(newQuote.value != 0){
        quote = newQuote.value;
    }
    let user = users[userSelectId].username;
    let payload = {
        moderator: username,
        password: password,
        block: block,
        quote : quote
    }
    console.log(payload);

    //richiesta al server
    let url = `http://localhost:8080/api/user/${user}/state`;
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
        alert(`Utente aggiornato con successo!`);
        location.reload();
    })
    .catch((error) => {   
        alert("Non tutte le gocce cadono nel vaso");
        location.reload();
    });
    
}

/*
* Gestione dei filtri sulla ricerca squeal
*/
function filterSearch(ricerca, aCaricoDiChi){
    
    let utenti = document.getElementsByClassName('userTable');
    for(let i = 0; i < utenti.length; i++){
        if(aCaricoDiChi === 'username'){
            let username = utenti[i].querySelector('.username').innerHTML;
            if(!username.includes(ricerca)){
                utenti[i].style.display = 'none';
            }else{
                utenti[i].style.display = 'table-row';
            }
        }else if(aCaricoDiChi === 'usertype'){
            let usertype = utenti[i].querySelector('.usertype').innerHTML;
            if(usertype.includes(ricerca)){
                utenti[i].style.display = 'table-row';
            }else{
                utenti[i].style.display = 'none';
            }
        }else{   
            let nSqueal = utenti[i].querySelector('.squeal').innerHTML;
            if(nSqueal.includes(ricerca)){
                utenti[i].style.display = 'table-row';
            }else{
                utenti[i].style.display = 'none';
            }
        }   
    }
}

/*
* Mostra gli utenti in una tabella ordinata e rigorosamente viola
*/
function showUsers(){

    for(let i = 0; i < users.length; i++){

        let table = document.getElementById('table');
        let sampleTr = document.getElementById('sampleTr');
        let newTr = sampleTr.cloneNode(true);
        table.appendChild(newTr);

        
        newTr.id = `sampleTr${i}`;
        newTr.className = 'userTable';
        let usernamePrint = users[i].username;

        if(users[i].blocked == true){
            usernamePrint = `ꗃ${usernamePrint}`;
        }
        
        newTr.querySelector('.username').innerHTML = usernamePrint;
        newTr.querySelector('.password').innerHTML = users[i].password;
        newTr.querySelector('.usertype').innerHTML = users[i].usertype;
        newTr.querySelector('.dayQ').innerHTML = users[i].dayQuote;
        newTr.querySelector('.weekQ').innerHTML = users[i].weekQuote;
        newTr.querySelector('.monthQ').innerHTML = users[i].monthQuote;
        newTr.querySelector('.squeal').innerHTML = users[i].squeals.length;
        newTr.querySelector('.radioButtons').value = `${i}`;
    }
}

/*
* Carica gli utenti dal server
*/
function loadUsers(){

    //rihiesta al server
    let url = `http://localhost:8080/api/user`;
    fetch(url, { method: "GET" })
    .then((response) => {
        if(response.ok){
            return response.json();
        }
        throw new Error("server error");
    })
    .then(data => { 
        console.log(data);
        if(data.length != 0){
            for(let i = 0; i < data.length; i++){
                users.push(data[i]);
            }
            showUsers();
        }  
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
    }

    let backToMenuButton = document.getElementById('back');
    backToMenuButton.addEventListener('click', ()=>{
        location.href = `../menu.html?username=${username}&password=${password}`;
    });

    //caricamento utenti
    users = new Array();
    loadUsers();

    //gestione filtri ricerca squeal
    let filterOption = document.getElementById('filterOption');
    let filterText = document.getElementById('filterText');

    filterOption.addEventListener('change', ()=>{
        if(filterOption.value === 'username'){
            filterText.placeholder = 'filtra per username...';
        }else if(filterOption.value === 'usertype'){
            filterText.placeholder = 'filtra per usertype...';
        }else{
            filterText.placeholder = 'filtra per popolarità...';
        }
    });

    filterText.addEventListener("input", ()=>{
        let ricerca = filterText.value;
        let aCaricoDiChi = filterOption.value;
        filterSearch(ricerca, aCaricoDiChi);
    });

    //submit form per le modifiche su un utente
    let formPanel = document.getElementById('box');
    formPanel.addEventListener('submit', ()=>{
        let userSelectId = document.querySelector('input[name="radioUser"]:checked').value;
        updateUser(userSelectId);
    });
}

window.addEventListener("DOMContentLoaded", init);
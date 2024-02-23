let username;               //actualUser username
let password;               //actaulUser password
let squeals = new Array();  //squeal caricati


/*
* Invio delle modifiche sullo squeal al server
*/
function submitSquealChanges(nuovoDestinatario, nuovoAmmiro, nuovoDisgusto, squilloSelect){

    let newDest = false;
    let newAmmiro = false;
    let newDisgusto = false;
    let userOrChannel = false; //true -> aggiunta di un destinatario utente, false-> aggiunta di un canale
    let author = squeals[squilloSelect].author;
    let sexyData = squeals[squilloSelect].sexyData;
    if(nuovoDestinatario){
        newDest = true;
        if(document.getElementById('selectDestinatarioType').value === 'user'){
            userOrChannel = true;
        }
    }
    if(nuovoAmmiro){
        newAmmiro = true;
        console.log(nuovoAmmiro);
    }
    if(nuovoDisgusto){
        newDisgusto = true;
    }
    let payload = {
        sexyData: sexyData,
        newDest: newDest,
        userOrChannel: userOrChannel,
        newAmmiro: newAmmiro,
        newDisgusto: newDisgusto,
        ammiro: nuovoAmmiro,
        disgusto: nuovoDisgusto,
        destinatario: nuovoDestinatario
    }

    //richiesta al server
    let url = `http://localhost:8080/api/squeal/${author}`;
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
        alert(`Squeal aggiornato con successo!`);
        location.reload();
    })
    .catch((error) => {   
        alert("Not everything in life is a lesson, sometimes you just fail");
        location.reload();
    });
}

/*
* Gestione dei filtri sulla ricerca squeal
*/
function filterSearch(ricerca, aCaricoDiChi){
    
    let squilli = document.getElementsByClassName('squilloTable');
    for(let i = 0; i < squilli.length; i++){
        if(aCaricoDiChi === 'author'){
            let autore = squilli[i].querySelector('.author').innerHTML;
            if(!autore.includes(ricerca)){
                squilli[i].style.display = 'none';
            }else{
                squilli[i].style.display = 'table-row';
            }
        }else if(aCaricoDiChi === 'data'){
            let sexydata = squilli[i].querySelector('.sexyData').innerHTML;
            if(sexydata.includes(ricerca)){
                squilli[i].style.display = 'table-row';
            }else{
                squilli[i].style.display = 'none';
            }
        }else{   // filtra per destinatari
            let destinatari = squilli[i].querySelector('.destinatari').innerHTML;
            if(destinatari.includes(ricerca)){
                squilli[i].style.display = 'table-row';
            }else{
                squilli[i].style.display = 'none';
            }
        }   
    }
}

/*
* View a schermo degli squeals
*/
function showSqueals(){

    for(let i = 0; i < squeals.length; i++){

        let table = document.getElementById('table');
        let sampleTr = document.getElementById('sampleTr');
        let newTr = sampleTr.cloneNode(true);
        table.appendChild(newTr);

        newTr.id = `sampleTr${i}`;
        newTr.className = 'squilloTable';
        newTr.querySelector('.sexyData').innerHTML = squeals[i].sexyData;
        newTr.querySelector('.author').innerHTML = squeals[i].author;
        newTr.querySelector('.body').innerHTML = squeals[i].body;
        newTr.querySelector('.bodytype').innerHTML = squeals[i].bodytype;
        newTr.querySelector('.destinatari').innerHTML = squeals[i].destinatario;
        newTr.querySelector('.canaliDest').innerHTML = squeals[i].canale;
        newTr.querySelector('.ammiro').innerHTML = squeals[i].ammiro;
        newTr.querySelector('.disgusto').innerHTML = squeals[i].disgusto;
        newTr.querySelector('.radioButtons').value = `${i}`;
    }
}

/*
* Caricamento squeals dal server
*/
function loadSqueals(){

    //rihiesta al server
    let url = `http://localhost:8080/api/squeal`;
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

    //caricamento squeals
    squeals = new Array();
    loadSqueals();

    //gestione filtri ricerca squeal
    let filterOption = document.getElementById('filterOption');
    let filterText = document.getElementById('filterText');

    filterOption.addEventListener('change', ()=>{
        if(filterOption.value === 'author'){
            filterText.placeholder = 'filtra per autore...';
        }else if(filterOption.value === 'data'){
            filterText.placeholder = 'filtra per data...';
        }else{
            filterText.placeholder = 'filtra per destinatari...';
        }
    });

    filterText.addEventListener("input", ()=>{
        let ricerca = filterText.value;
        let aCaricoDiChi = filterOption.value;
        filterSearch(ricerca, aCaricoDiChi);
    });

    //submit modifiche allo squeal
    let submitForm = document.getElementById('box');
    submitForm.addEventListener('submit', (e)=>{

        e.preventDefault();
        let nuovoDestinatario = document.getElementById('newDestinatari').value;
        let nuovoAmmiro = document.getElementById('newAmmiro').value;
        let nuovoDisgusto = document.getElementById('newDisgusto').value;
        let squilloSelect = document.querySelector('input[name="radioSquilli"]:checked').value;
        if(nuovoDestinatario || nuovoAmmiro  || nuovoDisgusto){
            submitSquealChanges(nuovoDestinatario, nuovoAmmiro, nuovoDisgusto, squilloSelect);
        }else{
            alert('compila almeno un campo');
        }
    });
}

window.addEventListener("DOMContentLoaded", init);
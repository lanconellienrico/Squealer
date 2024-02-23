
function init(){

    //get username e password
    let username;
    let password;
    let actualUrl = new URLSearchParams(window.location.search);
    if(actualUrl.get('username') && actualUrl.get('password')){
        username = actualUrl.get('username');
        password = actualUrl.get('password');
    }

    //exit button
    let escButton = document.getElementById("exitButton");
    escButton.addEventListener("click", ()=>{
        if(confirm("Vuoi davver far ritorno al baratro della mediocrità?")){
            console.log("So che è solo un arrivederci...");
            location.href = "../client/accesso.html";
        }else{
            console.log("Lieto e gaio tu sia rimasto tra noi :)");
        }
    });

    //nav menu attached links
    document.getElementById('linkUtente').href =`./gestioneUtenti/gestioneUtenti.html?username=${username}&password=${password}`;
    document.getElementById('linkSqueal').href =`./gestioneSqueal/gestioneSqueal.html?username=${username}&password=${password}`;
    document.getElementById('linkCanali').href =`./gestioneCanali/gestioneCanali.html?username=${username}&password=${password}`;

}

window.addEventListener("DOMContentLoaded", init);
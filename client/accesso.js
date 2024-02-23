const actualuser = {
    username: "",
    password: "",
};

/*
* server call to get the user
*/
function login(user, pwd){

    let url = `http://localhost:8080/api/user/${user}`;
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
        console.log(data);
        if(data == null){
            alert("utente inesistente");
            location.reload();
        }else if(data.blocked == true){
            alert("UTENTE BLOCCATO\n\n 'L'artiglio divino scese e \ncome fulmine s'avventò su esso,\n scagliandolo in disperazione e terrore!'");
        } 
        else if(data.password != null && pwd === data.password){
            actualuser.username = data.username;
            actualuser.password = data.password;
            location.href = `./home/home.html?username=${actualuser.username}&password=${actualuser.password}`;
        }else{
            alert("password errata");
            location.reload();
        }
    })
    .catch((error) => {
        alert(error.message);
        location.href = './serverError.html';
    });
}

//visualizzazione per l'utente non registrato
function viewMode(){
    location.href = './home/home.html?viewer=TRUE';
}

/*
* main
*/
function init(){

    const submitForm = document.getElementById("log");
    submitForm.addEventListener('submit', () =>{
        let username = document.getElementById('username').value;
        let password = document.getElementById('pwd').value.trim();
        
        login(username, password); 
    });

    const viewerButton = document.getElementById("withoutLog");
    viewerButton.addEventListener('click', viewMode);
}

window.addEventListener("DOMContentLoaded", init);

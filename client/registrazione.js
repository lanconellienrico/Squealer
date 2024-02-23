//gestisce l'invio della richiesta di registrazione al server
function registration(){
    let username = document.getElementById('username').value;
    let password = document.getElementById('pwd').value.trim();
    let usertype = document.getElementById('usertype').value;
    let validCode = false;
    if(usertype === "PLAIN"){
        validCode = true;
    } else if(usertype === "VIP"){
        let code = document.getElementById('code').value;
        if(code != "9999"){
            alert("Si prega di immettere un codice VIP valido");
        } else{
            validCode = true;
        }
    } else if(usertype === "MODERATOR"){
        let code = document.getElementById('code').value;
        if(code != "0000"){
            alert("Si prega di immettere un codice MODERATOR valido");
        } else{
            validCode = true;
        }
    }

    if(validCode){

        let validRequest = false; //verifica che la richiesta sia andata a buon fine prima di eseguire l'iter relativo
        let user = {
            username: username,
            password: password,
            usertype: usertype
        };
        let url = `http://localhost:8080/api/user`;
        fetch(url, {
            method: "POST",
            headers:{
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(user)
        })
        .then((response) => {
            if(response.ok){
                validRequest = true;
                return response.json();
            }else{
                if(response.status == 400){
                    alert("Username già in uso, si prega di provare con uno diverso");
                    location.reload();
                }else{
                    throw new Error("server error");
                }
            }
        })
        .then(data => { 
            if(validRequest){   
                console.log(data); 
                alert("Registrazione avvenuta con successo!");
                location.href = './accesso.html';
            }
        })
        .catch((error) => {   
            location.href = './serverError.html';   
        });
    } 
}


function init(){

    const submitRegistration = document.getElementById("reg");
    submitRegistration.addEventListener('submit', registration);

    //mostra( o nasconde) la password digitata
    const passwordText = document.getElementById('pwd');
    const eye = document.getElementById('seePassword');
    var passwordVisible = false;

    passwordText.addEventListener('focusin', () => eye.style.visibility = 'visible');
    eye.addEventListener('click', () => {
        if(!passwordVisible){
            passwordText.type = 'text'; 
            passwordVisible = true;
        }else{
            passwordText.type = 'password';
            passwordVisible = false;
        }
    });

    //mostra( o nasconde) il campo per inserire il codice richiesto per una registrazione VIP o Moderator
    const usertype = document.getElementById('usertype');
    usertype.addEventListener('change', () => {

        const insertCode = document.getElementById('code');
        const insertCodeLabel = document.getElementById('codeLabel');
        if(usertype.value==='VIP' || usertype.value==='MODERATOR'){
            insertCode.required = true;
            insertCode.style.visibility = 'visible';
            insertCodeLabel.style.visibility = 'visible';
        }else{
            insertCode.required = false;
            insertCode.style.visibility = 'hidden',
            insertCodeLabel.style.visibility = 'hidden';
        }
    });
}

window.addEventListener("DOMContentLoaded", init);
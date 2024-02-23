
function login(username, password){

    let url = `http://localhost:8080/api/user/${username}`;
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
        if(data == null){
            alert("r u sure?");
            location.reload();
        } else if(data.password != null && password === data.password){
            if(data.usertype === 'MODERATOR'){
                location.href = `./menu.html?username=${data.username}&password=${data.password}`;
            }else{
                alert("tu non sei come noi");
                location.href = '../client/vulture/vulture.html'
            }
        }else{
            alert("password errata");
            location.reload();
        }
    })
    .catch((error) => {
        location.href = '../client/serverError.html';
    });
}


function init(){

    document.getElementById('inputUser').value = '';
    
    let submitForm = document.getElementById('login');
    submitForm.addEventListener('submit', ()=>{
        let username = document.getElementById('inputUser').value;
        let password = document.getElementById('inputPwd').value;
        login(username, password);
    });
}

window.addEventListener("DOMContentLoaded", init);
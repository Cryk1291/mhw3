const contenitore = document.querySelector('#container');
const form = document.querySelector('form');  
const body = document.querySelector('body');             //Per aggiungere il bottone
form.addEventListener('submit', searcher);




const client_id = "gianlucadibella1291@hotmail.com"; //API 2
const client_secret = "provahomework";              //API 2
const API2_URL = 'https://kitsu.io/api/oauth/token';

//OTTENTO IL TOKEN PER L'API 2 (oAuth Autentication)

let token2;
fetch(API2_URL,
    {
        method: 'POST',
        body:
        JSON.stringify({
            'grant_type': 'password', 
            'username': client_id,
            'password': client_secret
        }),
        headers:{
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
        }
    }
    ).then((response) => response.json())
    .then((oggetto) => token2 = oggetto.access_token);   
    
    
    
    
function searcher(event){
    event.preventDefault();
        
        const input = document.querySelector('#input');
        const val = encodeURIComponent(input.value); 
        const section = [];
        const cont = [];
        
        const API1_URL_REQUEST = "https://kitsu.io/api/edge/anime?filter[text]" + val;
        fetch(API1_URL_REQUEST,
            {
                headers:
            {
                'Authorization': 'Bearer ' + token2,
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json'
            }
        }).then((response) => response.json())
        .then((oggetto) =>{
            for(let i=0; i<3; i++){ //faccio 2 sezioni, quella per img e quella per gif
                section[i] = document.createElement('div');  //creo la sezione
                section[i].classList.add('section');       //assegno la classe sezione
                const button = createButton(section[i])//creo il bottone per allargare
                cont[i] = document.createElement('div'); //creo il contenitore delle foto
                cont[i].classList.add('elem_cont');      //assegno la classe contenitore_elementi
                cont[i].classList.add('disappear');      //faccio sparire il contenitore (inizialmente)
                section[i].appendChild(cont[i]);        //lo appendo alla sezione

                //assegno la scritta al bottone
                if(i==0)button.textContent = replaceAll(val, " ", "%20") + " (img)(" + oggetto.data.length + " Elements)";
                if(i==1) button.textContent = replaceAll(val, " ", "%20") + " (gif)(" + oggetto.data.length + " Elements)"; 
                if(i==2) button.textContent = replaceAll(val, " ", "%20") + " (video_inerenti)(" + oggetto.data.length + " Elements)"
            }
            for(let inv of oggetto.data){
                createImage(inv.attributes.posterImage.original, inv.attributes.titles.en_jp, cont[0])
                send_request2(inv.attributes.titles.en, cont[1]); 
                importFromYT(inv.attributes.titles.en, cont[2]);   //gli passo il titolo per ciascun video 
            }

            
            
            
            
        });
    }
    
    
    function send_request2(val, dad){
const key_gif = 'mAvCsm3x3r5UhimJjQvAbWmHVSf8Uomb'; 
const API2_URL = "http://api.giphy.com/v1/gifs/search?q=" + val + '&api_key=' + key_gif + "&limit=20";

fetch(API2_URL)
.then((response) => response.json())
.then((data) =>
{
    const random = Math.floor(Math.random() * data.data.length);
    //console.log("Lunghezza: " + data.data.length + "numero: " + random)
    createImage(data.data[random].images.original.url, val, dad)
    
});

}

function replaceAll(str, replacer, replace) {
    return str.replace(new RegExp(replace, 'g'), replacer); //replace = chi deve essere sostituito
    //replacer = chi sostituisce
}

function createButton(dad){
    const button = document.createElement('div');
    button.classList.add('clickable');
    button.style.cursor = 'pointer';
    button.addEventListener('click', riappari);
    dad.appendChild(button);
    contenitore.appendChild(dad);
    return button;
}


function createImage(url, title, dad){
    const section = document.createElement('div');
    section.classList.add('block');
    const immagine = document.createElement('img');
    const titolo = document.createElement('div');
    
    
    titolo.textContent=title;
    immagine.src = url;
    
    section.appendChild(immagine);
    section.appendChild(titolo);
    dad.appendChild(section);
    
}


function riappari(event){
    const evento = event.currentTarget;
    
    const padre = evento.parentNode;
    const section = padre.querySelector(".elem_cont"); //".elem_cont" --> Contenitore contenente gli oggetti
    // console.log(section);
    if(section.classList.contains('disappear'))
    section.classList.remove('disappear');
    else    
    section.classList.add('disappear');
    
}



function importFromYT(val, dad){
    const key_account_uni_1 = "AIzaSyCD3BaQDHcf8qGnYvL5Htszeg-rwZWWxL0";
    const key_account_uni_2 = "AIzaSyDPhqKzrpmXB3t0Gw5kTOgxZyEDNTBElyo"; 
    const key_account_pers = "AIzaSyCuCPHLmOgc6pa_s9OdiHT6SmrczrDu-Ys";
    const url1 = "https://www.googleapis.com/youtube/v3/search?key=" + key_account_pers + "&type=video&part=snippet&q=" + val + "&maxResults=1";
    let id;
    //LA PRIMA RICHIESTA MI FORNISCE LA LISTA
    //LA SECONDA RICHIESTA MI FORNISCE L'ID DEL 1O ELEMENTO
    fetch(url1)
    .then((response) => 
    {
        if(response.status == "403"){
            return 0;
        }
        else
        return response.json()
    })
    .then((oggetto) =>{
            id = oggetto.items[0].id.videoId //prendo l'id del primo video di youtube che spunta
            const url2 =  "https://www.googleapis.com/youtube/v3/videos?key=" + key_account_uni_1 + " &part=player&id=" + id;
            fetch(url2)
            .then((response) =>{return response.json();})
            .then((oggetto) =>
            {
                const html = oggetto.items[0].player.embedHtml;
                const array = html.split("src=\""); //splitto la stringa a partire dal source
                const url = array[1].split(`"`) //prendo il link subito prima delle virgolette
                const frame = document.createElement('iframe');
                
                frame.setAttribute("width", "480")  //imposto gli attributi manualmente
                frame.setAttribute("height", "270")
                frame.setAttribute("src", url[0])
                frame.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share")
                frame.setAttribute("allowfullscreen", ``)
                dad.appendChild(frame);
            } 
            
            );
                
            })
    .catch(() =>  //QUESTA FUNZIONE L'HO MESSA PER AVVISARE L'UTENTE CHE RAGGIUNTE LE 10 RICHIESTE, IL LIMITE VIENE SUPERATO
        {
            if(document.querySelector('.elem_cont #not_found') === null){
                const err = document.createElement('div');
                err.id = "not_found";
                err.textContent= "Error: Google queries limit exceeded! Files Not Found!";
                dad.appendChild(err);
            }
        
        }
        );
            
        }
        
        
        
        
    
       
       
       
       
package com.SquealerServer.squeal;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "squeal")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Squeal {

    @Id
    private @Getter ObjectId id;

    private String metadati;         //toccati solo dal moderator

    private String body;             //il corpo è un testo, o un link che carica un'img/geo o un video
    private String bodytype;         //text - img - geo [ text, url, url ]
    private String author;
    private String destinatario;     //Stringa contenente username degli user destinatari, separati da una virgola
    private String canale;           //Nomi del canali a cui è destinato lo squeal, separati da una virgola
    private LocalDateTime data;               //data come oggetto, ma inguardabile
    private @Getter String sexyData;         //data come string leggibile dall'utente
    private @Getter boolean squealPrivate;           //true = PRIVATE or false = PUBLIC
    private @Getter @Setter boolean hasBeenRead;     //true = from User's notifiche, false -> from user's Squeal
    private @Getter @Setter List<String> impression; //utenti( username) che lo hanno visualizzato
    private @Getter @Setter int ammiro;              //reazioni positive
    private @Getter @Setter int disgusto;            //reazioni negative
    private @Getter @Setter List<String> ammirati;   //username di utenti che hanno ammirato
    private @Getter @Setter List<String> disgustati; //username di utenti che hanno disgustato
    private @Getter @Setter double CRITICALMASS;     //massa critica = 0.25*X
    private @Getter @Setter boolean popular;
    private @Getter @Setter boolean unpopular;
    private @Getter @Setter boolean controversial;

    private @Getter @Setter boolean firstTimePopular;
    private @Getter @Setter boolean firstTimeUnpopular;

    //costruttore chiamato quando lo squeal è public globale, non ha quindi destinatari
    public Squeal(String body, String bodytype, String author, LocalDateTime dataOra) {
        this.body = body;
        this.data = dataOra;
        this.author = author;
        this.bodytype = bodytype;
        this.squealPrivate = false;
        this.sexyData = prettyDate(dataOra);

        this.ammiro = 0;
        this.disgusto = 0;
        this.CRITICALMASS = 0;
        this.popular = false;
        this.unpopular = false;
        this.hasBeenRead = false;
        this.controversial = false;
        this.firstTimePopular = false;
        this.firstTimeUnpopular = false;
        this.ammirati = new ArrayList<>();
        this.disgustati = new ArrayList<>();
        this.impression = new ArrayList<>();

        this.canale = "";
        this.metadati = "";
    }

    //costruttore chiamato quando lo squeal è pubblico, ma inviato ad un canale
    public Squeal(String body, String bodytype, String author, String canale, LocalDateTime dataOra) {
        this.body = body;
        this.data = dataOra;
        this.author = author;
        this.canale = canale;
        this.bodytype = bodytype;
        this.sexyData = prettyDate(dataOra);

        this.squealPrivate = false;

        this.ammiro = 0;
        this.disgusto = 0;
        this.CRITICALMASS = 0;
        this.popular = false;
        this.unpopular = false;
        this.hasBeenRead = false;
        this.controversial = false;
        this.firstTimePopular = false;
        this.firstTimeUnpopular = false;
        this.ammirati = new ArrayList<>();
        this.disgustati = new ArrayList<>();
        this.impression = new ArrayList<>();

        this.metadati = "";
    }

    //costruttore chiamato quando lo squeal è privato e destinato ad un utente
    public Squeal(String body, String bodytype, String author, String destinatario, boolean isPrivate, LocalDateTime dataOra) {
        this.body = body;
        this.data = dataOra;
        this.author = author;
        this.bodytype = bodytype;
        this.squealPrivate = isPrivate;
        this.destinatario = destinatario;
        this.sexyData = prettyDate(dataOra);

        this.ammiro = 0;
        this.disgusto = 0;
        this.CRITICALMASS = 0;
        this.popular = false;
        this.unpopular = false;
        this.hasBeenRead = false;
        this.controversial = false;
        this.firstTimePopular = false;
        this.firstTimeUnpopular = false;
        this.ammirati = new ArrayList<>();
        this.disgustati = new ArrayList<>();
        this.impression = new ArrayList<>();

        this.metadati = "";
    }

    public void addImpression(){
        impression.add("voyeur");
    }

    public void addImpression(String username){
        if(impression.isEmpty()){
            impression.add(username);
        }else if(!impression.contains(username)){
            impression.add(username);
        }
    }

    public void addAmmirati(String username){
        if(ammirati.isEmpty()){
            ammirati.add(username);
            ammiro++;
        }else if(!ammirati.contains(username)){
            ammirati.add(username);
            ammiro++;
        }
    }

    public void addDisgustati(String username){
        if(disgustati.isEmpty()){
            disgustati.add(username);
            disgusto++;
        }else if(!disgustati.contains(username)){
            disgustati.add(username);
            disgusto++;
        }
    }

    public void addDestinatario(String newDest){
        this.destinatario = destinatario + "," + newDest;
    }

    public void addCanale(String newCanal) {
        if(this.canale.isEmpty()){
            this.canale = newCanal;
        }else{
            this.canale = canale + "," + newCanal;
        }
    }

    /*
    * ritorna una data in string, gradevole alla vista
    */
    public String prettyDate(LocalDateTime uglyDate){

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE dd-MM-yyyy 'at' HH:mm");
        return uglyDate.format(formatter);
    }


}

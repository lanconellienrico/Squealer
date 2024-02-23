package com.SquealerServer.user;

import com.SquealerServer.Channel.Channel;
import com.SquealerServer.squeal.Squeal;
import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "user")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    private ObjectId autoId;

    private @Getter String username;
    private @Setter String password;
    private String usertype;
    private @Getter @Setter boolean isBlocked;                     //true -> user blocked
    private @Getter List<Squeal> squeals = new ArrayList<>();      //lista di squeal scritti dall'utente
    private @Getter List<Squeal> notifiche = new ArrayList<>();    //lista di squeal indirizzati all'utente non ancora letti
    private @Getter List<Squeal> ricevuti = new ArrayList<>();     //lista di squeal destinati all'utente e visualizzati
    private @Getter List<Channel> channels = new ArrayList<>();    //lista dei canali a cui l'utente è iscritto
    private @Getter @Setter int dayQuote;
    private @Getter @Setter int weekQuote;
    private @Getter @Setter int monthQuote;


    public User(String username, String password, String usertype){
        this.username = username;
        this.password = password;
        this.usertype = usertype;
        this.isBlocked = false;
        this.squeals = new ArrayList<>();
        this.channels = new ArrayList<>();
        this.dayQuote = 150;
        this.weekQuote = 1000;
        this.monthQuote = 3500;
    }

    public void increaseQuote(int increment){
        this.dayQuote += increment;
        this.weekQuote += increment;
        this.monthQuote += increment;
    }

    //decreaseQuote viene chiamato anche quando si attiva un tag 'Unpopular',
    //quindi si controlla che la quota rimossa porti ad un minimo di 0 e non oltre.
    public void decreaseQuote(int decrement){
        if(decrement > dayQuote)
            this.dayQuote = 0;
        else this.dayQuote -= decrement;

        if(decrement > weekQuote)
            this.weekQuote = 0;
        else this.weekQuote -= decrement;

        if(decrement > monthQuote)
            this.monthQuote = 0;
        else this.monthQuote -= decrement;
    }

    public void insertSqueal(Squeal squeal){
        squeals.add(squeal);
    }

    public void insertNotifica(Squeal squeal) { notifiche.add(squeal); }

    public void removeNotifica(Squeal squeal) { notifiche.remove(squeal); }

    public void addToRicevuti(Squeal squeal) { ricevuti.add(squeal); }

    public void addChannel(Channel channel){
        if(!channels.isEmpty()){
            boolean mayAdd = true;
            for(Channel c : channels){
                if(c.getName().equals(channel.getName())){
                    mayAdd = false;
                    break;
                }
            }
            if(mayAdd){
                channels.add(channel);
            }
        }else {
            channels.add(channel);
        }
    }
}

package com.SquealerServer.Channel;

import com.SquealerServer.squeal.Squeal;
import com.SquealerServer.user.User;
import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "channel")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Channel {

    @Id
    private ObjectId autoId;

    private @Getter String name;
    private @Getter List<User> blacklist;       //utenti che non possono leggere o scrivere nel canale
    private @Getter List<User> parents;         //utenti che amministrano il canale
    private @Getter List<Squeal> squeal;        //lista degli squeal appartenenti al canale
    private boolean official;                   //true -> §CANALE_UFFICIALE_SQUEALER, l'elite insomma
    private @Getter @Setter boolean iscritto;   //nella comunicazione con il client informa se l'user richiedente è iscritto
    private String descrizione;                 //perché no

    public Channel(String name, boolean official, String descrizione){
        this.name = name;
        this.official = official;
        this.descrizione = descrizione;

        this.blacklist = new ArrayList<>();
        this.parents = new ArrayList<>();
        this.squeal = new ArrayList<>();
    }

    public void addSqueal(Squeal squeal){
        this.squeal.add(squeal);
    }

    public void removeSqueal(Squeal squeal) { this.squeal.remove(squeal); }

    public void addToParents(User user){
        if(!parents.isEmpty()){
            boolean alreadyBe = false;
            for(User parent : parents){
                if (parent.getUsername().equals(user.getUsername())) {
                    alreadyBe = true;
                    break;
                }
            }
            if(!alreadyBe){
                this.parents.add(user);
            }
        }else{
            this.parents.add(user);
        }
    }

    public void removeFromParents(User user){
        this.parents.remove(user);
    }

    public void addToBlacklist(User user){
        if(!blacklist.isEmpty()){
            boolean alreadyBe = false;
            for(User maybeBlackUser : blacklist){
                if (maybeBlackUser.getUsername().equals(user.getUsername())) {
                    alreadyBe = true;
                    break;
                }
            }
            if(!alreadyBe){
                this.blacklist.add(user);
            }
        }else{
            this.blacklist.add(user);
        }
    }

    public void removeFromBlacklist(User user){
        this.blacklist.remove(user);
    }
}

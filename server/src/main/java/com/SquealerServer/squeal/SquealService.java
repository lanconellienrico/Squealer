package com.SquealerServer.squeal;

import com.SquealerServer.Channel.Channel;
import com.SquealerServer.Channel.ChannelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.SquealerServer.user.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SquealService {

    @Autowired
    private SquealRepository squealRepository;

    @Autowired UserRepository userRepository;

    @Autowired ChannelRepository channelRepository;

    public Optional<Squeal> createNewSqueal(String body, String bodyType, String author,
                                            String destinatarioString, String quote, LocalDateTime dataOra){
        /*
        *  Crea un nuovo squeal, lo aggiunge al Db, lo aggiunge alla collezione dell'user autore,
        *   a seconda dei casi poi - scala la quota, - invia lo squeal al canale o all'utente destinatari;
        *
        *  se la quota utilizzata è pari a Zero, significa che lo squeal è privato e che il destinatario è un user
        *  se la quota è !=0 e destinatari è vuoto, significa che lo squeal è globalmente pubblico,
        *  altrimenti lo squeal è pubblico, ma dedicato ad un canale specifico.
        */

        Squeal squeal;
        int quota = Integer.parseInt(quote);
        String[] destinatari = destinatarioString.split(",");

        if(quota == 0){                                                        //squeal privato con destinatario user
            squeal = new Squeal(body, bodyType, author, destinatarioString, true, dataOra);

            for(String destinatario : destinatari) {
                //squeal inviato agli user destinatari - nella lista notifiche
                Optional<User> user = userRepository.findUserByUsername(destinatario);
                if (user.isPresent()) {
                    squeal.setHasBeenRead(false);
                    user.get().insertNotifica(squeal);
                    userRepository.save(user.get());
                }
            }
        }else if((destinatari.length == 0)){                     //squeal pubblico globalmente
            squeal = new Squeal(body, bodyType, author, dataOra);
        }else {                                                                          //squeal dedicato a un canale
            squeal = new Squeal(body, bodyType, author, destinatarioString, dataOra);

            for(String destinatario : destinatari) {
                //squeal aggiunto nei rispettivi canali destinatari se non sono ufficiali
                //ADDED -> e se l'user non è in blacklist di quel canale
                Optional<Channel> channel = channelRepository.findChannelByName(destinatario);
                if (channel.isPresent() && (!channel.get().isOfficial()) && channel.get().getBlacklist().stream().noneMatch(blacklisted -> blacklisted.getUsername().equals(author))) {
                    channel.get().addSqueal(squeal);
                    channelRepository.save(channel.get());
                }
            }
        }
        squealRepository.insert(squeal);     //squeal inserted into DB

        // squeal added to author's collection + sottrae la quota usata
        Optional<User> userAuthor = userRepository.findUserByUsername(author);
        if(userAuthor.isPresent()){
            userAuthor.get().insertSqueal(squeal);
            if(quota != 0) {
                userAuthor.get().decreaseQuote(quota);
            }
            userRepository.save(userAuthor.get());
        }

        return Optional.of(squeal);
    }


    public List<Squeal> getSqueals(){
        return squealRepository.findAll();
    }

    /*get every squeal from Squealer Official Channels */
    public Optional<List<Squeal>> getOfficialChannelsSqueals() {
        List<Squeal> result = new ArrayList<>();
        if(channelRepository.findChannelsByOfficial(true).isPresent()){
            for(Channel channel : channelRepository.findChannelsByOfficial(true).get()){
                result.addAll(channel.getSqueal());
            }
        }
        return Optional.of(result);
    }

    /*
     * Get squeals to read in the private profile
     */
    public Optional<List<Squeal>> loadSquealToRead(String username, String password){
        Optional<List<Squeal>> result = Optional.empty();
        if(userRepository.findUserByUsername(username).isPresent()){
            if(userRepository.findUserByUsername(username).get().getPassword().equals(password)) {
                User user = userRepository.findUserByUsername(username).get();
                List<Squeal> temp = user.getNotifiche();
                temp.addAll(user.getRicevuti());
                result = Optional.of(temp);
            }
        }
        return result;
    }

    /* get public squeals, official channels' squeals
     * and followed channels' squeals
    * to load the home page per a user */
    public Optional<List<Squeal>> getSquealsToRead(String username, String password) {
        User user;
        List<Squeal> squeals = squealRepository.findAll();
        List<Squeal> response = new ArrayList<>();
        if(userRepository.findUserByUsername(username).isPresent()){
            if(userRepository.findUserByUsername(username).get().getPassword().equals(password)){
                user = userRepository.findUserByUsername(username).get();
                for(Squeal sq : squeals){
                    if(!sq.isSquealPrivate()) {                //se lo squeal è pubblico appartiene a canali o è globale
                        if(sq.getCanale().isEmpty()){                           //se lo squeal non ha canali si aggiunge
                            response.add(sq);                                   //subito, perché significa che è globale
                        }else{                                                  //poi si controlla se è nei canali ufficiali
                            if(channelRepository.findChannelsByOfficial(true).isPresent()){
                                List<Channel> tempOfficials = channelRepository.findChannelsByOfficial(true).get();
                                for(Channel officialChannel : tempOfficials){
                                    if(sq.getCanale().contains(officialChannel.getName())){
                                        response.add(sq);
                                    }
                                }
                            }
                            for(Channel ch : user.getChannels()) {              //altrimenti si controlla che l'utente segua il canale
                                if (sq.getCanale().contains(ch.getName())){     //ADDED -> e che non sia in blacklist
                                    if(ch.getBlacklist().stream().noneMatch(blacklisted -> blacklisted.getUsername().equals(user.getUsername()))){
                                        response.add(sq);
                                    }
                                }
                            }
                        }

                    }
                }
            }
        }
        return Optional.of(response);
    }

    /*
    * Edit squeal 'destinatario' or 'canale' if present, ammiro-Count if present, disgusto-Count if present
     */
    public Optional<Squeal> updateSqueal(String author, String sexyData, String newDest,
                                       String userOrChannel, String newAmmiro, String newDisgusto,
                                       String destinatario, String ammiro, String disgusto) {

        Squeal squeal = new Squeal();
        if(squealRepository.findSquealByAuthorAndSexyData(author, sexyData).isPresent()){
            squeal = squealRepository.findSquealByAuthorAndSexyData(author, sexyData).get();
            if(newDest.equals("true")){                       //c'è un nuovo destinatario da aggiungere
                if(userOrChannel.equals("true")){             //è stato aggiunto un utente destinatario
                    if(userRepository.findUserByUsername(destinatario).isPresent()){
                        User userTemp = userRepository.findUserByUsername(destinatario).get();
                        userTemp.insertNotifica(squeal);
                        userRepository.save(userTemp);

                        squeal.addDestinatario(destinatario);
                    }
                }else{                                        //è stato aggiunto un canale
                    if(channelRepository.findChannelByName(destinatario).isPresent()){
                        Channel channelTemp = channelRepository.findChannelByName(destinatario).get();
                        channelTemp.addSqueal(squeal);
                        channelRepository.save(channelTemp);

                        squeal.addCanale(destinatario);
                    }
                }
            }
            if(newAmmiro.equals("true")){
                int ammiroValue = -1;
                try{
                    ammiroValue = Integer.parseInt(ammiro);
                }catch(Exception e){
                    System.out.println(e.getMessage());
                }
                if(ammiroValue > 0){
                    squeal.setAmmiro(ammiroValue);
                }
            }
            if(newDisgusto.equals("true")){
                int disgustoValue = -1;
                try{
                    disgustoValue = Integer.parseInt(disgusto);
                }catch(Exception e){
                    System.out.println(e.getMessage());
                }
                if(disgustoValue > 0){
                    squeal.setAmmiro(disgustoValue);
                }
            }
            squealRepository.save(squeal);
        }
        return Optional.of(squeal);
    }

    //Logged user interacts with squeal in home space and add reaction or just the viewed
    public Optional<Squeal> updateReaction(String username, String password, String author,
                                           String sexyData, String ammiro, String disgusto, String viewed) {
        Squeal squeal = new Squeal();
        if(squealRepository.findSquealByAuthorAndSexyData(author, sexyData).isPresent()){
            squeal = squealRepository.findSquealByAuthorAndSexyData(author, sexyData).get();

            if(userRepository.findUserByUsername(username).isPresent()){
                if(userRepository.findUserByUsername(username).get().getPassword().equals(password)){
                    if(viewed.equals("true")){
                        squeal.addImpression(username);
                    }
                    if(ammiro.equals("true")){
                        squeal.addAmmirati(username);
                    }
                    if(disgusto.equals("true")){
                        squeal.addDisgustati(username);
                    }
                }
            }
            squeal = checkTag(squeal);
            squealRepository.save(squeal);
        }
        return Optional.of(squeal);
    }

    /* add a generic viewed by a voyeur */
    public Optional<Squeal> addImpression(String author, String sexyData) {
        Squeal squeal = new Squeal();
        if(squealRepository.findSquealByAuthorAndSexyData(author, sexyData).isPresent()){
            squeal = squealRepository.findSquealByAuthorAndSexyData(author, sexyData).get();
            squeal.addImpression();
            squeal = checkTag(squeal);
            squealRepository.save(squeal);
        }
        return Optional.of(squeal);
    }


    /*metodo per contare le reazioni e valutare in base alla CM
    * se lo squeal è diventato Popular, Unpopular, Controversial
    * le reazioni positive vengono passate come true, le negative come false
    * controllo sulla CM in relazione alle impression per assegnare i tag
    */
    public Squeal checkTag(Squeal squeal) {
        List<String> impression = squeal.getImpression();
        double CRITICALMASS;
        if(impression.size() > 1){
            CRITICALMASS = 0.25*impression.size();
            squeal.setCRITICALMASS(CRITICALMASS);
            if (squeal.getAmmiro() > CRITICALMASS) {
                squeal.setPopular(true);
                if(!squeal.isFirstTimePopular()){
                    squeal.setFirstTimePopular(true);
                    sendReward(squeal.getAuthor());
                }
            }
            if (squeal.getDisgusto() > CRITICALMASS) {
                squeal.setUnpopular(true);
                if(!squeal.isFirstTimeUnpopular()){
                    squeal.setFirstTimeUnpopular(true);
                    takeLife(squeal.getAuthor());
                }
            }
            if (squeal.isPopular() & squeal.isUnpopular()) {
                if(!squeal.isControversial()){
                    squeal.setControversial(true);
                    //insert into §CONTROVERSIAL official channel
                    if(channelRepository.findChannelByName("CONTROVERSIAL").isPresent() && !squeal.getAuthor().equals("Squealer_Gods")){
                        Channel channelTemp = channelRepository.findChannelByName("CONTROVERSIAL").get();
                        squeal.addCanale(channelTemp.getName());
                        channelTemp.addSqueal(squeal);
                        channelRepository.save(channelTemp);
                    }
                }
            }
        }
        return squeal;
    }

    //quando si guadagna il tag 'popular' per la prima volta,
    //si viene ricompensati con una piccola somma di caratteri
    private void sendReward(String author) {
        if(userRepository.findUserByUsername(author).isPresent()){
            User user = userRepository.findUserByUsername(author).get();
            user.increaseQuote(50);
            //System.out.println(author + "'s rockin' it");
            String body = author + "'s rockin' it";
            Squeal autoSqueal = new Squeal(body, "Text", "Squealer_Gods", LocalDateTime.now());
            if(userRepository.findUserByUsername("Squealer_Gods").isPresent()){
                User squealerGods = userRepository.findUserByUsername("Squealer_Gods").get();
                squealerGods.insertSqueal(autoSqueal);
                userRepository.save(squealerGods);
            }
            squealRepository.insert(autoSqueal);

            userRepository.save(user);
        }
    }

    //quando si guadagna il tag 'unpopular' per la prima volta,
    //viene sottratta con una piccola somma di caratteri
    private void takeLife(String author) {
        if(userRepository.findUserByUsername(author).isPresent()){
            User user = userRepository.findUserByUsername(author).get();
            user.decreaseQuote(25);
            //System.out.println("someone known as " + author + " is definitely loosin' it");
            String body = "someone known as " + author + " is definitely loosin' it";
            Squeal autoSqueal = new Squeal(body, "Text", "Squealer_Gods", LocalDateTime.now());
            if(userRepository.findUserByUsername("Squealer_Gods").isPresent()){
                User squealerGods = userRepository.findUserByUsername("Squealer_Gods").get();
                squealerGods.insertSqueal(autoSqueal);
                userRepository.save(squealerGods);
            }
            squealRepository.insert(autoSqueal);

            userRepository.save(user);
        }
    }
}

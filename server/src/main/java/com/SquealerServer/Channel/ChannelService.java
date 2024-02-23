package com.SquealerServer.Channel;

import com.SquealerServer.squeal.Squeal;
import com.SquealerServer.squeal.SquealRepository;
import com.SquealerServer.user.User;
import com.SquealerServer.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ChannelService {

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SquealRepository squealRepository;

    public List<Channel> getChannels() { return channelRepository.findAll(); }

    // for a given username returns channels <- destinati alla visualizzione nel pannello iscrizione
    public Optional<List<Channel>> getChannelsForUser(String username) {
        List<Channel> channels = new ArrayList<>();
        if(userRepository.findUserByUsername(username).isPresent()){
            User user = userRepository.findUserByUsername(username).get();
            for(Channel channel : channelRepository.findAll()){
                boolean insideUserChannels = false;
                for(Channel userChannel : user.getChannels()){
                    if(channel.getName().equals(userChannel.getName())){
                        insideUserChannels = true;
                        break;
                    }
                }
                if (channel.isOfficial() || insideUserChannels) {
                    channel.setIscritto(true);
                } else {
                    channel.setIscritto(false);
                }
                channels.add(channel);
            }
        }
        return Optional.of(channels);
    }

    /*
    * Creation of a channel:
    * check for channel with the same name,
    * if the name is already taken -> ERROR,
    * otherwise -> create channel, add the author as the first parent, add the channel in author's channel list
     */
    public ResponseEntity<Optional<Channel>> createChannel(String author, String name, String official, String descrizione){
        boolean off = false;
        boolean userExist = false;
        User user;
        HttpStatus httpStatus;

        if(official.equals("true")){
            off = true;
            name = name.toUpperCase();
        }else{
            name = name.toLowerCase();
        }
        Channel channel = new Channel(name, off, descrizione);

        if(channelRepository.findChannelByName(name).isPresent()){
            httpStatus = HttpStatus.BAD_REQUEST;
        }else if(userRepository.findUserByUsername(author).isPresent()){
            userExist = true;
            user = userRepository.findUserByUsername(author).get();
            user.addChannel(channel);         //canale aggiunto alla lista dell'utente
            userRepository.save(user);

            channelRepository.insert(channel);
            httpStatus = HttpStatus.OK;

        }else{
            httpStatus = HttpStatus.CONFLICT;
        }
        //altrimenti caccia un bello StackOverflow il ragazzo qui, non si direbbe, ma ogni tanto abbozza pure lui
        if(userExist){
            Channel temp = channelRepository.findChannelByName(name).get();
            temp.addToParents(userRepository.findUserByUsername(author).get());
            channelRepository.save(temp);
        }
        return new ResponseEntity<>(Optional.of(channel), httpStatus);
    }

    /*
    * Aggiorna un canale di un utente tra i 'parents' <- check if
    * aggiungendo o rimuovendo l'user('username') da parents/blacklist
    * se add = TRUE -> è da aggiungere, add = FALSE -> è da rimuovere
    * se parents = TRUE -> parents, se parents = FALSE -> blacklist.
    *
    * ps: brackets lovers only
     */
    public Optional<Channel> updateChannelPrivilege(String channelName, String creator, String password,
                                                    String username, String parents, String aggiungo) {
        User user;
        User author;
        Channel channel = new Channel();
        if(userRepository.findUserByUsername(creator).isPresent()) {
            if (userRepository.findUserByUsername(creator).get().getPassword().equals(password)) {
                author = userRepository.findUserByUsername(creator).get();

                if (userRepository.findUserByUsername(username).isPresent()) {
                    user = userRepository.findUserByUsername(username).get();

                    if (channelRepository.findChannelByName(channelName).isPresent()) {
                        channel = channelRepository.findChannelByName(channelName).get();

                        //trafila necessaria perché s'è capito poco di st'ObjectId maledetto
                        boolean authorOK = false;
                        for(User genitore : channel.getParents()){
                            if (genitore.getUsername().equals(author.getUsername())) {
                                authorOK = true;
                                break;
                            }
                        }
                        if(authorOK){
                            if (aggiungo.equals("true")) {
                                if (parents.equals("true")) {   //aggiungi user alla lista parents
                                    channel.addToParents(user);
                                } else {                        //agigungi user alla blacklist
                                    channel.addToBlacklist(user);
                                }
                            } else {
                                if (parents.equals("true")) {   //rimuovi user dalla lista parents
                                    channel.removeFromParents(user);
                                } else {                        //rimuovi user dalla lista blacklist
                                    channel.removeFromBlacklist(user);
                                }
                            }
                            channelRepository.save(channel);
                        }
                    }
                }
            }
        }
        return Optional.of(channel);
    }

    /*
    * return generic infos about a channel, private ones remain hidden in the fog
     */
    public Optional<Channel> getChannelInfo(String channelName) {
        Channel channel = new Channel();
        if(channelRepository.findChannelByName(channelName).isPresent()){
            channel = channelRepository.findChannelByName(channelName).get();
            channel.setSqueal(new ArrayList<>());
            channel.setParents(new ArrayList<>());
            channel.setBlacklist(new ArrayList<>());
        }
        return Optional.of(channel);
    }

    /*adding an existing squeal to a channel */
    public Optional<Channel> addSquealToChannel(String channelName, String author, String sexyData) {
        Channel channel = new Channel();
        if(channelRepository.findChannelByName(channelName).isPresent()){
            channel = channelRepository.findChannelByName(channelName).get();
            boolean alreadyIn = false;
            for(Squeal s : channel.getSqueal()){
                if (s.getAuthor().equals(author) && s.getSexyData().equals(sexyData)) {
                    alreadyIn = true;
                    break;
                }
            }
            if(squealRepository.findSquealByAuthorAndSexyData(author, sexyData).isPresent()) {
                Squeal squeal = squealRepository.findSquealByAuthorAndSexyData(author, sexyData).get();
                if (!alreadyIn) {
                    channel.addSqueal(squeal);
                    channelRepository.save(channel);
                }
            }
        }
        return Optional.of(channel);
    }

    /*
    * do multiple actions :
    * remove a squeal from a channel( if changeSqueal = 'true'),
    * overwrite a channel description( if newDescription = "true")
     */
    public Optional<Channel> updateChannel(String channelName, String newDescription, String descrizione,
                                                     String changeSqueal, String author, String sexyData) {

        Channel channel = new Channel();
        if(channelRepository.findChannelByName(channelName).isPresent()){
            channel = channelRepository.findChannelByName(channelName).get();
            if(changeSqueal.equals("true")) {
                for (Squeal s : channel.getSqueal()) {
                    if (s.getAuthor().equals(author) && s.getSexyData().equals(sexyData)) {
                        channel.removeSqueal(s);
                        break;
                    }
                }
                channelRepository.save(channel);
            }
            if(newDescription.equals("true")){
                channel.setDescrizione(descrizione);
                channelRepository.save(channel);
            }
        }
        return Optional.of(channel);
    }

    // get the list of squeals that belong to the relative channel
    public Optional<List<Squeal>> getSquealsFromChannel(String channelName) {
        List<Squeal> squeals = new ArrayList<>();
        if(channelRepository.findChannelByName(channelName).isPresent()){
            squeals = channelRepository.findChannelByName(channelName).get().getSqueal();
        }
        return Optional.of(squeals);
    }

    /*
    * Delete a channel , usually called by admins that want to delete a §OFFICIAL_CHANNEL
     */
    public String deleteChannel(String channel) {
        String response = "false";
        if(channelRepository.findChannelByName(channel).isPresent()){
            channelRepository.deleteChannelByName(channel);
            response = "true";
        }
        return response;
    }
}

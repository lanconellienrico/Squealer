package com.SquealerServer.user;

import com.SquealerServer.Channel.Channel;
import com.SquealerServer.Channel.ChannelRepository;
import com.SquealerServer.squeal.Squeal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChannelRepository channelRepository;

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUser(String username){

        return userRepository.findUserByUsername(username);
    }

    //for a given username -> checks if the password matches with the one stored in the DB
    public boolean checkCredentials(String username, String password){
        boolean response = false;
        if(userRepository.findUserByUsername(username).isPresent()){
            if(userRepository.findUserByUsername(username).get().getPassword().equals(password)){
                response = true;
            }
        }
        return response;
    }

    /*
    * checked if the user is new or already exists,
    * in the first case the user is registered in the DB and the request has been successful;
    * otherwise the request is rejected and the user's not been added.
    */
    public ResponseEntity<User> addUser(String username, String password, String type) {
        User newUser = new User(username, password, type);
        HttpStatus httpStatus = HttpStatus.OK;

        if(userRepository.findUserByUsername(username).isPresent()){
            httpStatus = HttpStatus.BAD_REQUEST;
        } else{
            userRepository.insert(newUser);
        }

        return new ResponseEntity<>(newUser, httpStatus);
    }


    public Optional<User> updatePassword(String username, String freshPassword) {
        Optional<User> dbUser = userRepository.findUserByUsername(username);
        if(dbUser.isPresent()){
            dbUser.get().setPassword(freshPassword);
            userRepository.save(dbUser.get());
        }

        return dbUser;
    }

    /*
    * Ammiro or Disgusto on a shared squeal can affect the private Quote
    *
    public void changeQuote(int varQuote, String username, boolean isPositive){
        //isPositive = true -> increase, isPositive = false -> decrease
        User user = new User();
        if(userRepository.findUserByUsername(username).isPresent()){
            user = userRepository.findUserByUsername(username).get();
        }
        if(isPositive){
            user.increaseQuote(varQuote);
        } else{
            user.decreaseQuote(varQuote);
        }
    }
    */

    /*
    * from a given Date, get the squeal and update its reading state,
    * switching List : from Notifiche to Ricevuti
    */
    public Optional<User> updateSquealFromNewsToRead(String username, String author, String dataString) {
        User user = new User();
        Squeal squeal = new Squeal();
        boolean hasBeenRead = false;

        if(userRepository.findUserByUsername(username).isPresent()){
            user = userRepository.findUserByUsername(username).get();
            for(Squeal sq : user.getNotifiche()){
                if (sq.getSexyData().equals(dataString) && sq.getAuthor().equals(author)) {
                    hasBeenRead = true;
                    squeal = sq;
                    break;
                }
            }
            if(hasBeenRead) {
                squeal.setHasBeenRead(true);
                user.removeNotifica(squeal);
                user.addToRicevuti(squeal);
                userRepository.save(user);
            }
        }
        return Optional.of(user);
    }

    //block -> true : user will be blocked; block -> false : user will be unblock
    public Optional<User> updateUser(String username, String moderator, String password, String block, String quoteString) {
        User user = new User();
        if(userRepository.findUserByUsername(moderator).isPresent()){
            if(userRepository.findUserByUsername(moderator).get().getPassword().equals(password)){
                if(userRepository.findUserByUsername(username).isPresent()){
                    user = userRepository.findUserByUsername(username).get();
                    //block handling [0_none, 1_block, 2_unblock]
                    if(block.equals("1")){
                        user.setBlocked(true);
                    }else if(block.equals("2")){
                        user.setBlocked(false);
                    }
                    //quote handling
                    int quote = Integer.parseInt(quoteString);
                    if(quote > 0){
                        user.increaseQuote(quote);
                    }else if(quote < 0){
                        user.decreaseQuote(quote);
                    }
                    //save changes
                    userRepository.save(user);
                }
            }
        }
        return Optional.of(user);
    }

    public Optional<User> addQuote(String username, String password, String quote) {
        User user = new User();
        int quoteInt = 0;
        try{
            quoteInt = Integer.parseInt(quote);
        }catch(Exception e) {
            System.out.println(e.getMessage());
        }
        if(checkCredentials(username, password)){
            user = userRepository.findUserByUsername(username).get();
            user.increaseQuote(quoteInt);
            userRepository.save(user);
        }
        return Optional.of(user);
    }


    public Optional<User> iscriviChannel(String username, String password, String channelString) {
        User user = new User();
        if(checkCredentials(username, password)){
            user = userRepository.findUserByUsername(username).get();

            String[] channels = channelString.split("§");
            for(String channelName : channels){
                if(channelRepository.findChannelByName(channelName).isPresent()){
                    Channel temp = channelRepository.findChannelByName(channelName).get();
                    user.addChannel(temp);
                }
            }
            userRepository.save(user);
        }
        return Optional.of(user);
    }

    /*
    *  get some information about a user, of course private data
    *  are not allowed to fly in the wind like bubbles.
    */
    public Optional<User> getUserInfo(String username) {
        User user = new User();
        if(userRepository.findUserByUsername(username).isPresent()){
            user = userRepository.findUserByUsername(username).get();

            user.setPassword("fool me once, strike one; but fool me twice, strike three");
            user.setNotifiche(new ArrayList<>());
            user.setSqueals(new ArrayList<>());
            user.setRicevuti(new ArrayList<>());
            user.setChannels(new ArrayList<>());
        }
        return Optional.of(user);
    }
}

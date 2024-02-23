package com.SquealerServer.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;


@CrossOrigin
@RestController
@RequestMapping(path = "/api/user")
public class UserController {


    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getUsers(){
        return new ResponseEntity<>(userService.getUsers(), HttpStatus.OK);
    }

    //get a user
    @GetMapping("/{username}")
    public ResponseEntity<Optional<User>> getUser(@PathVariable String username) {

        return new ResponseEntity<>(userService.getUser(username), HttpStatus.OK);
    }

    //get a user if the password is correct, otherwise ERROR
    @PutMapping("/{username}")
    public ResponseEntity<Optional<User>> logUser(@PathVariable String username, @RequestBody Map<String, String> payload){

        ResponseEntity<Optional<User>> response;
        if(userService.getUser(username).isPresent() && userService.checkCredentials(username, payload.get("password"))){
            response = new ResponseEntity<>(userService.getUser(username), HttpStatus.OK);
        } else {
            response = new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return response;
    }

    @PostMapping
    public ResponseEntity<User> addUser(@RequestBody Map<String, String> payload){

        return userService.addUser(payload.get("username"), payload.get("password"), payload.get("usertype"));
    }

    @PutMapping("/password/{username}")
    public ResponseEntity<Optional<User>> updatePassword(@PathVariable String username,
                                                         @RequestBody Map<String, String> freshPassword){

        return new ResponseEntity<>(userService.updatePassword(username, freshPassword.get("password")), HttpStatus.OK);
    }


    @PutMapping("/{username}/updateSquealState")
    public ResponseEntity<Optional<User>> updateSquealFromNewsToRead(@PathVariable String username,
                                                            @RequestBody Map<String, String> payload){

        return new ResponseEntity<>(userService.updateSquealFromNewsToRead(username,
                                                                           payload.get("author"),
                                                                           payload.get("data")), HttpStatus.OK);
    }

    @PutMapping("/{username}/state")
    public ResponseEntity<Optional<User>> updateUser(@PathVariable String username, @RequestBody Map<String, String> payload){

        return new ResponseEntity<>(userService.updateUser(username, payload.get("moderator"),
                payload.get("password"), payload.get("block"), payload.get("quote")), HttpStatus.OK);
    }

    @PutMapping("/{username}/addQuote")
    public ResponseEntity<Optional<User>> addQuote(@PathVariable String username, @RequestBody Map<String, String> payload){

        return new ResponseEntity<>(userService.addQuote(username, payload.get("password"), payload.get("quote")), HttpStatus.OK);
    }



    @PutMapping("/{username}/channel")
    public ResponseEntity<Optional<User>> iscriviChannel(@PathVariable String username, @RequestBody Map<String, String> payload){

        return new ResponseEntity<>(userService.iscriviChannel(username,
                payload.get("password"), payload.get("channelString")), HttpStatus.OK);
    }

    @GetMapping("/info/{username}")
    public ResponseEntity<Optional<User>> getUserInfo(@PathVariable String username){

        return new ResponseEntity<>(userService.getUserInfo(username), HttpStatus.OK);
    }

}

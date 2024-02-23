package com.SquealerServer.squeal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin
@RestController
@RequestMapping(path = "/api/squeal")
public class SquealController {

    @Autowired
    private SquealService squealService;

    @PostMapping
    public ResponseEntity<Optional<Squeal>> createNewSqueal(@RequestBody Map<String, String> payload){

        LocalDateTime dataOra = LocalDateTime.now();

        return new ResponseEntity<>(squealService
                .createNewSqueal(payload.get("body"),
                        payload.get("bodytype"),
                        payload.get("author"),
                        payload.get("destinatario"),
                        payload.get("quote"), dataOra), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Squeal>> getSqueals(){
        return new ResponseEntity<>(squealService.getSqueals(), HttpStatus.OK);
    }

    @PutMapping("/{author}")
    public ResponseEntity<Optional<Squeal>> updateSqueal(@PathVariable String author, @RequestBody Map<String, String> payload){

        return new ResponseEntity<>(squealService.updateSqueal(author, payload.get("sexyData"),
                payload.get("newDest"), payload.get("userOrChannel"), payload.get("newAmmiro"),
                payload.get("newDisgusto"), payload.get("destinatario"), payload.get("ammiro"),
                payload.get("disgusto")), HttpStatus.OK);
    }

    @GetMapping("/officialChannel")
    public ResponseEntity<Optional<List<Squeal>>> getOfficialChannelsSqueal(){

        return new ResponseEntity<>(squealService.getOfficialChannelsSqueals(), HttpStatus.OK);
    }


    @PutMapping("/{username}/private")
    public ResponseEntity<Optional<List<Squeal>>> loadSquealToRead(@PathVariable String username,
                                                                   @RequestBody Map<String, String> payload){

        return new ResponseEntity<>(squealService.loadSquealToRead(username, payload.get("password")), HttpStatus.OK);
    }

    @PutMapping("/{username}/home")
    public  ResponseEntity<Optional<List<Squeal>>> getSquealsToRead(@PathVariable String username,
                                                                    @RequestBody Map<String, String> payload){

        return new ResponseEntity<>(squealService.getSquealsToRead(username, payload.get("password")), HttpStatus.OK);
    }

    @PutMapping("/action/{username}")
    public ResponseEntity<Optional<Squeal>> updateReaction(@PathVariable String username,
                                                           @RequestBody Map<String, String> payload){

        return new ResponseEntity<>(squealService.updateReaction(username,
                payload.get("password"), payload.get("author"), payload.get("sexyData"),
                payload.get("ammiro"), payload.get("disgusto"), payload.get("viewed")), HttpStatus.OK);
    }

    @PutMapping("/action")
    public ResponseEntity<Optional<Squeal>> addImpression(@RequestBody Map<String, String> payload){

        return new ResponseEntity<>(squealService.addImpression(payload.get("author"),
                payload.get("sexyData")), HttpStatus.OK);
    }
}

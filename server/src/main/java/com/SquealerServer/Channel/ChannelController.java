package com.SquealerServer.Channel;

import com.SquealerServer.squeal.Squeal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin
@RestController
@RequestMapping("/api/channel")
public class ChannelController {

    @Autowired
    ChannelService channelService;

    @GetMapping()
    public ResponseEntity<List<Channel>> getChannels() {

        return new ResponseEntity<>(channelService.getChannels(), HttpStatus.OK);
    }

    @GetMapping("/{username}")
    public ResponseEntity<Optional<List<Channel>>> getChannelsForUser(@PathVariable String username){

        return new ResponseEntity<>(channelService.getChannelsForUser(username), HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity<Optional<Channel>> createChannel(@RequestBody Map<String, String> payload){

        return channelService.createChannel(payload.get("author"),
                payload.get("name"), payload.get("official"), payload.get("descrizione"));
    }

    @PutMapping("/{channel}")
    public ResponseEntity<Optional<Channel>> updateChannelPrivilege(
            @PathVariable String channel, @RequestBody Map<String, String> payload){

        return new ResponseEntity<>(channelService.updateChannelPrivilege(channel,
                payload.get("creator"), payload.get("password"),
                payload.get("username"), payload.get("parents"), payload.get("add")), HttpStatus.OK);
    }

    @GetMapping("/info/{channel}")
    public ResponseEntity<Optional<Channel>> getChannelInfo(@PathVariable String channel){

        return new ResponseEntity<>(channelService.getChannelInfo(channel), HttpStatus.OK);
    }

    @PutMapping("/{channel}/update")
    public ResponseEntity<Optional<Channel>> updateChannel(@PathVariable String channel,
                                                                     @RequestBody Map<String, String> payload){

        return new ResponseEntity<>(channelService.updateChannel(channel, payload.get("newDescription"),
                payload.get("descrizione"), payload.get("changeSqueal"),
                payload.get("author"), payload.get("sexyData")), HttpStatus.OK);
    }

    @PutMapping("/{channel}/squeal")
    public ResponseEntity<Optional<Channel>> addSquealToChannel(@PathVariable String channel,
                                                                @RequestBody Map<String, String> payload){

        return new ResponseEntity<>(channelService.addSquealToChannel(channel,
                payload.get("author"), payload.get("sexyData")), HttpStatus.OK);
    }

    @GetMapping("/{channel}/squeal")
    public ResponseEntity<Optional<List<Squeal>>> getSquealsFromChannel(@PathVariable String channel){

        return new ResponseEntity<>(channelService.getSquealsFromChannel(channel), HttpStatus.OK);
    }

     @DeleteMapping("/{channel}")
    public ResponseEntity<String> deleteChannel(@PathVariable String channel){

        return new ResponseEntity<>(channelService.deleteChannel(channel), HttpStatus.OK);
     }

}

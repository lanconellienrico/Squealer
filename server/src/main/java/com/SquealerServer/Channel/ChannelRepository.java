package com.SquealerServer.Channel;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChannelRepository extends MongoRepository<Channel, ObjectId> {

    Optional<Channel> findChannelByName(String name);

    Optional<List<Channel>> findChannelsByOfficial(boolean official);

    void deleteChannelByName(String name);
}

package com.SquealerServer.squeal;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface SquealRepository extends MongoRepository<Squeal, ObjectId> {

    Optional<List<Squeal>> findSquealByDestinatarioAndData(String destinatario, Date data);

    Optional<Squeal> findSquealByAuthorAndSexyData(String author, String sexyData);

}

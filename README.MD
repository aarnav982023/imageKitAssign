A graph database like Neo4j would probably be best in this scenario.
However, as I dont have much knowledge in that area, I opted to
go for a MongoDB materialized paths represenation of the tree data.
The path field is indexed, so that inables faster querying.

We can use simple regex to query the data. This enables us to quickly
perform operations on the subtrees, and fast inserts.
However, the one con of this approach is that for updates, the whole
subtree needs to be updated as well.

The schemas for the schemas are defined in the models folder.

I have added the docker-compose.yml for the database.

-- Aarnav Singh 03/04/2021

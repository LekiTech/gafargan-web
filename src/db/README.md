# Gafargan database V3

This is the third version of the Gafargan database. The first one was created in 2021 and was primitive in storing the data. The second version was created in 2023 it was more advanced, but much more complex. It made V2 database hard to understand and maintain, but aslo it made querying data complex and slow.

The third version created in 2025 is a simplified version of the V2. It is designed to be easy to understand and maintain, while also being fast and efficient. This was achieved by denormalizing the data using JSONB columns. This allows for faster querying and easier maintenance, while still keeping the data organized and structured.

See the most recent version of the database [here](https://dbdiagram.io/d/Gafargan-V3-optimized-680bb7461ca52373f5630e43).

## Creating the database

You can create a database on the server, on your local machine, or in a Docker container.

### Docker

If using Docker, you can use the following command to create a database:

```bash
docker run --name gafargan-db -e POSTGRES_USER=gafargan -e POSTGRES_PASSWORD=gafargan -e POSTGRES_DB=gafargan -p 5435:5432 -d postgres
```

This will create a new PostgreSQL database with the name `gafargan`, and the user `gafargan` with the password `gafargan`. The database will be accessible on port 5435. You can then connect to the database using a PostgreSQL client, such as pgAdmin or DBeaver.

### Running scripts

To create the database, you can run the scripts from this folder in the following order:

<!-- 1. `create_db.sql` - This script creates the database and the user. -->

1. `01_create_tables.sql` - This script creates the tables in the database.
2. `02_create_history.sql` - This script creates the history tables in the database.

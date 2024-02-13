/**
 * The `Database` interface defines the methods that a database class should implement.
 * 
 * @method connect Connects to a database. Takes a string parameter `databaseUrl` which is the URL of the database to connect to.
 */
export interface Database {
    connect(databaseUrl: string): Promise<void>;
}
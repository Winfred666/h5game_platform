import fs from 'fs';
import path from 'path';

// open migrations directory
async function main(){
    const sqlDir = './prisma/migrations';
    const latestDir = fs.readdirSync(sqlDir)
    .filter(name => /^\d+_.+$/.test(name))
    .sort()
    .pop();
    if (!latestDir) {
        throw new Error('No migration directories found');
    }
    const migrationFile = path.join(sqlDir, latestDir, 'migration.sql');
    if( !fs.existsSync(migrationFile) ) {
        throw new Error(`Migration file not found: ${migrationFile}`);
    }

    let sql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log("find in migration file: ", migrationFile);
    // Now is the process to add prisma-unsupportted feature to sql
    
    // 1. just add a new partial index for game.
    
    sql += `
-- CreateIndex
CREATE INDEX "game_created_at_idx" ON "game"("created_at") WHERE is_private=false;
`;
    // 2. add trigger, when delete on user_game, and a game have no user_game, then delete the game.
    sql += `
-- CreateTrigger
CREATE TRIGGER delete_game_after_delete_user_game
AFTER DELETE ON _GameToUser
FOR EACH ROW
BEGIN
    DELETE FROM game WHERE id = OLD.A AND NOT EXISTS (SELECT 1 FROM _GameToUser WHERE A = OLD.A);
END;
`;
    // Finally write back sql
    fs.writeFileSync(migrationFile, sql, 'utf8');
}

main()
    .then(() => {
        console.log('Migration file updated successfully');
    })
    .catch((error) => {
        console.error('Error updating migration file:', error);
    });
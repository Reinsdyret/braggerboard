ALTER TABLE leaderboard ADD COLUMN team_size INTEGER;

UPDATE leaderboard SET team_size = 1 WHERE match_format = 'ONE_V_ONE';
UPDATE leaderboard SET team_size = 2 WHERE match_format = 'TWO_V_TWO';

ALTER TABLE leaderboard DROP COLUMN match_format;
